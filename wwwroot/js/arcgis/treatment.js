async function _loadTreatments(view, scenario) {
	const Graphic = await $arcgis.import("@arcgis/core/Graphic.js");
	const Polyline = await $arcgis.import("@arcgis/core/geometry/Polyline.js");
	const geometryEngine = await $arcgis.import("@arcgis/core/geometry/geometryEngine.js");
	const query = await $arcgis.import("@arcgis/core/rest/query");
	
	try {
		const featureLayer = view.map.findLayerById('ScenarioTreatmentsLayer');

		const { Projects, Treatments } = scenario;
		
		if (!Projects || !Treatments) {
			console.warn('Scenario lacks Projects or Treatments array');
			return;
		}

		let graphics = [];
		let objectIdCounter = 1;
		let geometriesToProject = [];		
		let chunkSize = 500; // Amount of treatments pulled per API call
		let allFeatures = [];  // Mapping treatments to features in a large chunked set of features   
		

		const treatmentMetadata = [];  

		for (let i = 0; i < Treatments.length; i+= chunkSize) {
			const chunk = Treatments.slice(i, i + chunkSize);
			const clauses = [];

			for(const t of chunk){
				const projId = t.ProjId || t.ProjectID;
				const foundProject = Projects.find((p) => (p.ProjId || p.ProjectID) === projId);
				if (!foundProject) {
					console.warn(`No matching project for Treatment ${t.TreatmentId || t.TreatmentID}, ProjId=${projId}`);
					continue;
				}
				if (!(foundProject.ProjId || foundProject.ProjectID) || !(foundProject.SchemaId || foundProject.SystemID)) {
					console.warn(`Skipping project due to missing identifiers:`, foundProject);
					continue;
				}
				const countyVal = t.Cnty ?? foundProject.County;
				const routeVal = t.Rte ?? t.Route;
				if (!countyVal || !routeVal) {
					console.warn(`Skipping treatment ${t.TreatmentId || t.TreatmentID} due to missing county/route`, { countyVal, routeVal, t });
					continue;
				}
				const fromSec = t.FromSection || t.SectionFrom;
				const toSec = t.ToSection || t.SectionTo;
				if (fromSec == null || toSec == null) {
					console.warn(`Missing section info for treatment ${t.TreatmentId || t.TreatmentID}`, t);
					continue;
				}

				const countyValStr = countyVal.toString().padStart(2, '0');
				const routeValStr = routeVal.toString().padStart(4, '0');
				const fromSecStr = fromSec.toString().padStart(4, '0');
				const toSecStr = toSec.toString().padStart(4, '0');
				
				clauses.push(`(
					CTY_CODE='${countyValStr}'
					AND ST_RT_NO='${routeValStr}'
					AND SEG_NO >= '${fromSecStr}'
					AND SEG_NO <= '${toSecStr}'
				)`);
				
				treatmentMetadata.push({
					treatment: t,
					project: foundProject,
					county: countyValStr,
					route: routeValStr,
					fromSec: fromSecStr,
					toSec: toSecStr
				});
			}

			const combinedWhereClause = clauses.join(' OR ');
			const params = {
				where: combinedWhereClause,
				returnGeometry: true,
				outFields: ['ST_RT_NO','CTY_CODE','DISTRICT_NO','SEG_NO','DISTRICT_NO'],
				outSR: view.spatialReference.wkid
			};

			const maxRecords = 2000;
			let offset = 0;
			let hasMore = true;

			while (hasMore) {
				const { features, exceededTransferLimit } = await query.executeQueryJSON(
					'https://gis.penndot.gov/arcgis/rest/services/opendata/roadwaysegments/MapServer/0', 
					{
						...params,
						resultOffset: offset.toString(),
						resultRecordCount: maxRecords.toString()
					});

				console.log(`➡️ Pulled ${features?.length ?? 0} features at offset ${offset}`);
				allFeatures.push(...(features ?? []));
				
				if (exceededTransferLimit) {
					offset += maxRecords;
				} else {
					hasMore = false;
				}
			}

			for(const feature of allFeatures){
				const f = feature.attributes;
				const featureCounty = f.CTY_CODE?.toString().padStart(2, '0');
				const featureRoute = f.ST_RT_NO?.toString().padStart(4, '0');
				const featureSeg = f.SEG_NO?.toString().padStart(4, '0');

				const match = treatmentMetadata.find(meta =>
					meta.county === featureCounty &&
					meta.route === featureRoute &&
					meta.fromSec <= featureSeg &&
					meta.toSec >= featureSeg
				);

				if (!match) {
					console.warn('❌ Could not match feature to a treatment:', feature.attributes);
					continue;
				}

				geometriesToProject.push({
					geometry: new Polyline(feature.geometry),
					treatment: match.treatment,
					project: match.project
				});
			}
		}
		if (!geometriesToProject.length) {
			console.warn('No valid geometries found for projection.');
			return;
		}

		const grouped = {};

		geometriesToProject.forEach((g) => {
			const t = g.treatment;
			const projKey = t.ProjId ?? t.ProjectID;
			const treatKey = t.TreatId ?? t.TreatmentId ?? t.TreatmentID;
			const groupKey = `${projKey}_${treatKey}`;
			grouped[groupKey] = grouped[groupKey] || [];
			grouped[groupKey].push(g.geometry);
		});

		for (const key in grouped) {
			const [projIDStr, treatIDStr] = key.split('_');
			const projID = parseInt(projIDStr, 10);
			const found = geometriesToProject.find((g) => {
				const rowProjId = g.treatment.ProjId ?? g.treatment.ProjectID;
				const rowTreatId = g.treatment.TreatId ?? g.treatment.TreatmentId ?? g.treatment.TreatmentID;
				return rowProjId === projID && String(rowTreatId) === treatIDStr;
			});
			if (!found) continue;
			const unioned = geometryEngine.union(grouped[key]);
			const t = found.treatment;
			const p = found.project;
			if (!p || !t) {
				console.warn(`Skipping Treatment ${t?.TreatmentId || t?.TreatmentID} due to missing data`);
				continue;
			}

			const atts = {
				OBJECTID: objectIdCounter++,
				ProjectID: p.ProjId ?? p.ProjectID,
				SystemID: p.SchemaId ?? p.SystemID,
				DistrictNo: t.Dist ?? t.DISTRICT_NO,
				CountyCode: t.Cnty,
				CountyName: t.County,
				TreatmentID: t.TreatId ?? t.TreatmentId ?? t.TreatmentID,
				AssetType: t.TreatType ?? t.AssetType,
				Route: t.Rte ?? t.Route,
				SectionFrom: t.FromSection ?? t.SectionFrom,
				SectionTo: t.ToSection ?? t.SectionTo,
				BridgeID: t.BRIDGE_ID ?? t.BridgeID ?? '',
				TreatmentType: t.TreatType ?? t.TreatmentType,
				Treatment: t.Treatment,
				Year: t.Year,
				DirectCost: t.Cost ?? t.DirectCost ?? 0,
				DesignCost: t.DesignCost ?? 0,
				ROWCost: t.ROWCost ?? 0,
				UtilCost: t.UtilCost ?? 0,
				OtherCost: t.OtherCost ?? 0
			};
			//console.log('Adding graphic with attributes:', atts);
			graphics.push(
				new Graphic({
					geometry: unioned,
					attributes: atts
				})
			);
		}
		const validGraphics = graphics.filter(
			(g) => g.geometry && g.attributes && g.attributes.ProjectID
		);
		if (!validGraphics.length) {
			console.error('No valid graphics to add to FeatureLayer!');
			return;
		}

		if(featureLayer.source?.length > 0){
			featureLayer.source.removeAll();
		}

		if(featureLayer.definitionExpression){
			featureLayer.definitionExpression = null;
		}

		const current = await featureLayer.queryFeatures();

		await featureLayer.applyEdits({ deleteFeatures: current.features, addFeatures: validGraphics });
		featureLayer.refresh();

		if (validGraphics.length > 0) {
			let fullExtent = validGraphics[0].geometry.extent.clone();
			validGraphics.forEach((g) => {
				fullExtent = fullExtent.union(g.geometry.extent);
			});
			const bufferFactor = 0.3;
			const expandedExtent = fullExtent.expand(1 + bufferFactor);
			view.goTo({ target: expandedExtent });
		}


	} catch (err) {
		console.error('Error loading data:', err);
	}
}