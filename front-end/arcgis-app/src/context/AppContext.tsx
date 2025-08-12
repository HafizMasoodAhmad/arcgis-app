import React, { createContext, useContext, useState, useRef } from 'react';
import initSqlJs from 'sql.js';

import Graphic from "@arcgis/core/Graphic";
import Polyline from "@arcgis/core/geometry/Polyline";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import * as query from "@arcgis/core/rest/query";

const AuthContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: React.ReactNode;
}

export interface AppContextType {
    isLoading: boolean;
    isLoadingScenario: boolean;
    scenario: any;
    getFilterValues: () => any;
    getSelectedScenario: () => any;
    getSelectedUser: () => any;
    getMapView: () => any;
    getFeatureLayer: () => any;
    getProjectsFiltered: (scenarioId: string, filterValues: any) => any[];
    changeFilterValues: (values: any) => void;
    changeFeatureLayer: (layer: any) => void;
    changeMapView: (view: any) => void;
    toggleLoading: (isLoading: boolean) => void;
    toggleLoadingScenario: (isLoading: boolean) => void;
    createSqlLiteDB: () => void,
    loadDataFromFile: (file: File) => Promise<any>,
    getScenariosFromDB: (userId: string) => any[],
    getProjectsFromDB: (scenarioId: string) => any[],
    getTreatmentsFromDB: (scenarioId: string) => any[],
    getUniqueUsersFromDB: () => any[],
    getTreatmentsFiltered: (scenarioId: string, filterValues: any) => any[],
    getTreatmentsPerProjectFromDB: (projectId: string) => any[],
    loadTreatments: (scenario: any) => Promise<void>;
    changeSelectedScenario: (scenarioId: string) => void;
    changeSelectedUser: (userId: string) => void;
}

export const AppProvider = ({children}: AppProviderProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingScenario, setIsLoadingScenario] = useState<boolean>(false);

   
    const [scenario, setScenario] = useState<any>(null);

    const dbObject = useRef<any>(null);
    const mapView = useRef<any>(null);
    const selectedScenario = useRef<any>(null);
    const selectedUser = useRef<any>(null);
    const filterValues = useRef<any>(null);
    const featureLayer = useRef<any>(null);

    const toggleLoading = (isLoading: boolean) => {
        setIsLoading(isLoading);
    }

    const toggleLoadingScenario = (isLoading: boolean) => {
        setIsLoadingScenario(isLoading);
    }

    const changeMapView = (view: any) => {
        mapView.current = view;
    }

    const changeFeatureLayer = (layer: any) => {
        featureLayer.current = layer;
    }

    const changeFilterValues = (values: any) => {
        filterValues.current = values;
    }

    const changeSelectedScenario = (scenarioId: string) => {
        setScenario(scenarioId);
        selectedScenario.current = scenarioId;
    }
    
    const changeSelectedUser = (userId: string) => {
        selectedUser.current = userId;
    }

    const getFilterValues = () => {
        return filterValues.current;
    }

    const getSelectedScenario = () => {
        return selectedScenario.current;
    }

    const getSelectedUser = () => {
        return selectedUser.current;
    }

    const getMapView = () => {
        return mapView.current;
    }

    const getFeatureLayer = () => {
        return featureLayer.current;
    }

    const createSqlLiteDB = async () => {   
        const SQL = await initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
        });
        
        dbObject.current = new SQL.Database();
        
        const db = dbObject.current;
    
        db.run (`
            CREATE TABLE IF NOT EXISTS Scenario (
                ScenId INTEGER PRIMARY KEY,
                Name TEXT,
                LibraryName TEXT,
                LibraryId TEXT,
                LastRunBy TEXT,
                LastRunTime TEXT,
                Notes TEXT
            )
        `);
    
        db.run(`
            CREATE TABLE IF NOT EXISTS Project (
                ProjId INTEGER PRIMARY KEY AUTOINCREMENT,
                ScenarioId INTEGER,
                UserId TEXT,
                UserNotes TEXT,
                SchemaId INTEGER,
                ProjType INTEGER,
                Year INTEGER,
                NBridges INTEGER,
                NPave INTEGER,
                Cost REAL,
                FOREIGN KEY (ScenarioId) REFERENCES Scenario(ScenId)
            )
        `);
    
        db.run(`
            CREATE TABLE IF NOT EXISTS Treatment (
                TreatId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                ProjId INTEGER NOT NULL,
                TreatmentId TEXT,
                ProjType INTEGER,
                Treatment TEXT,
                TreatType TEXT,
                Dist INTEGER,
                Cnty INTEGER,
                Rte INTEGER,
                Dir INTEGER,
                FromSection INTEGER,
                ToSection INTEGER,
                BRKEY TEXT,
                BRIDGE_ID INTEGER,
                Owner TEXT,
                COUNTY TEXT,
                MPO_RPO TEXT,
                Year INTEGER,
                Cost REAL,
                Benefit REAL,
                PreferredYear INTEGER,
                MinYear INTEGER,
                MaxYear INTEGER,
                PriorityOrder INTEGER,
                IsCommitted BOOLEAN,
                Risk REAL,
                IndirectCostDesign REAL,
                IndirectCostOther REAL,
                IndirectCostROW REAL,
                IndirectCostUtilities REAL,
                B_C REAL,
                MPMSID TEXT,
                FOREIGN KEY (ProjId) REFERENCES Project(ProjId)
            )
        `);
    }

    const loadDataFromFile = async (file: File) => {
        // Convert file to json
        const fileContent = await file.text();
        const jsonData = JSON.parse(fileContent);
    
        const scenario = jsonData.Scenario;
        const projects = jsonData.Projects;
        const treatments = jsonData.Treatments;
    
        let projectsId: any = {};

        const db = dbObject.current;

        const [{ values }] = db.exec(`SELECT COUNT(*) FROM Scenario WHERE ScenId = ?`, [scenario.ScenId]);

        if(values[0][0] > 0) {
            db.run(`
                DELETE FROM Treatment WHERE ProjId IN (SELECT ProjId FROM Project WHERE ScenarioId = ?)
            `, [scenario.ScenId]);
            db.run(`
                DELETE FROM Project WHERE ScenarioId = ?
            `, [scenario.ScenId]);
            db.run(`
                DELETE FROM Scenario WHERE ScenId = ?
            `, [scenario.ScenId]);
        }

        // Insert data into database
        db.run(`
            INSERT INTO Scenario (ScenId, Name, LibraryName, LibraryId, LastRunBy, LastRunTime, Notes) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [scenario.ScenId, scenario.Name, scenario.LibraryName, scenario.LibraryId, scenario.LastRunBy, scenario.LastRunTime, scenario.Notes]);
    
    
        for (const project of projects) {        
            db.run(`
                INSERT INTO Project (ScenarioId, UserId, UserNotes, SchemaId, ProjType, Year, NBridges, NPave, Cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [scenario.ScenId, project.UserId || null, project.UserNotes || null, project.SchemaId || null, project.ProjType || null, project.Year || null, project.NBridges || null, project.NPave || null, project.Cost || null]);
                
            const [{ values }] = db.exec("SELECT last_insert_rowid();");
            projectsId[project.ProjId] = values[0][0];
        }
    
        for(const treatment of treatments) {
            const projectId = projectsId[treatment.ProjId];
    
            db.run(`
                INSERT INTO Treatment (ProjId, TreatmentId, ProjType, Treatment, TreatType, Dist, Cnty, Rte, Dir, FromSection, ToSection, BRKEY, BRIDGE_ID, Owner, COUNTY, MPO_RPO, Year, Cost, Benefit, PreferredYear, MinYear, MaxYear, PriorityOrder, IsCommitted, Risk, IndirectCostDesign, IndirectCostOther, IndirectCostROW, IndirectCostUtilities, B_C, MPMSID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [projectId, treatment.TreatmentId || null, treatment.ProjType || null, treatment.Treatment || null, treatment.TreatType || null, treatment.Dist || null, treatment.Cnty || null, treatment.Rte || null, treatment.Dir || null, treatment.FromSection || null, treatment.ToSection || null, treatment.BRKEY || null, treatment.BRIDGE_ID || null, treatment.Owner || null, treatment.COUNTY || null, treatment["MPO/RPO"] || null, treatment.Year || null, treatment.Cost || null, treatment.Benefit || null, treatment.PreferredYear || null, treatment.MinYear || null, treatment.MaxYear || null, treatment.PriorityOrder || null, treatment.IsCommitted || null, treatment.Risk || null, treatment.IndirectCostDesign || null, treatment.IndirectCostOther || null, treatment.IndirectCostROW || null, treatment.IndirectCostUtilities || null, treatment["B/C"] || null, treatment.MPMSID || null]);
        }

        return scenario;
    }
    
    const getScenariosFromDB = (userId: string) => {
        try {
            const db = dbObject.current;
            
            const [{ values }] = db.exec(`
                SELECT * FROM Scenario WHERE LastRunBy = ?
            `, [userId]);
    
            // Convert result to json
            const scenarios = values.map((scenario: any) => ({
                ScenId: scenario[0],
                Name: scenario[1],
                LibraryName: scenario[2],
                LibraryId: scenario[3],
                LastRunBy: scenario[4],
                LastRunTime: scenario[5],
                Notes: scenario[6]
            }));
    
            return scenarios;
        } catch (error) {
            return [];
        }
    }
    
    const getProjectsFromDB = (scenarioId: string) => {
        try {
            const db = dbObject.current;
            
            const [{ values }] = db.exec(`
                SELECT * FROM Project WHERE ScenarioId = ?
            `, [scenarioId]);
    
            // Convert result to json
            const projects = values.map((project: any) => ({
                ProjId: project[0],
                ScenarioId: project[1],
                UserId: project[2],
                UserNotes: project[3],
                SchemaId: project[4],
                ProjType: project[5],
                Year: project[6],
                NBridges: project[7],
                NPave: project[8],
                Cost: project[9]
            }));
    
            return projects;
        } catch (error) {
            return [];
        }
    }
    
    const getTreatmentsFromDB = (scenarioId: string) => {
        try {
            const db = dbObject.current;
            
            const [{ values }] = db.exec(`
                SELECT * FROM Treatment WHERE ProjId IN (SELECT ProjId FROM Project WHERE ScenarioId = ?)
            `, [scenarioId]);
    
            // Convert result to json
            const treatments = values.map((treatment: any) => ({
                TreatId: treatment[0],
                ProjId: treatment[1],
                TreatmentId: treatment[2],
                ProjType: treatment[3],
                Treatment: treatment[4],
                TreatType: treatment[5],
                Dist: treatment[6],
                Cnty: treatment[7],
                Rte: treatment[8],
                Dir: treatment[9],
                FromSection: treatment[10],
                ToSection: treatment[11],
                BRKEY: treatment[12],
                BRIDGE_ID: treatment[13],
                Owner: treatment[14],
                COUNTY: treatment[15],
                MPO_RPO: treatment[16],
                Year: treatment[17],
                Cost: treatment[18],
                Benefit: treatment[19],
                PreferredYear: treatment[20],
                MinYear: treatment[21],
                MaxYear: treatment[22],
                PriorityOrder: treatment[23],
                IsCommitted: treatment[24],
                Risk: treatment[25],
                IndirectCostDesign: treatment[26],
                IndirectCostOther: treatment[27],
                IndirectCostROW: treatment[28],
                IndirectCostUtilities: treatment[29],
                B_C: treatment[30],
                MPMSID: treatment[31]
            }));
    
            return treatments;
        } catch (error) {
            return [];
        }
    }
    
    const getUniqueUsersFromDB = () => {
        try{
            const db = dbObject.current;
            
            const [{ values }] = db.exec(`
                SELECT DISTINCT LastRunBy FROM Scenario
            `);
        
            return values.map((user: any) => user[0]);
        } catch (error) {
            return [];
        }
    }
    
    const getTreatmentsPerProjectFromDB = (projectId: string) => {
        try{
            const db = dbObject.current;
            
            const [{ values }] = db.exec(`
                SELECT * FROM Treatment WHERE ProjId = ?
            `, [projectId]);
        
            return values.map((treatment: any) => ({
                TreatId: treatment[0],
                ProjId: treatment[1],
            }));
        } catch (error) {
            return [];
        }
    }

    const getProjectsFiltered = (scenarioId: string, filterValues: any) => {

        if(!filterValues) {
            return getProjectsFromDB(scenarioId);
        }

        const { route, year, assetType, treatment } = filterValues;
        
        // Esta función obtiene los proyectos que tienen al menos un tratamiento que coincide con los filtros dados (route, year, treatment)
        try {
            const db = dbObject.current;
            if (!db) return [];

            // Verificamos si hay filtros válidos para aplicar
            const hasValidFilters = (route && route !== '') || (year && year !== '') || (treatment && treatment !== '') || (assetType && assetType !== '');
            
            if (!hasValidFilters) {
                // Si no hay filtros, retornamos todos los proyectos
                return getProjectsFromDB(scenarioId);
            }

            let queryWhere = [];
            let params: any[] = [];

            // Solo aplicamos filtros si están definidos y no son vacíos
            if (route && route.length > 0) {
                const placeholders = route.map(() => '?').join(',');
                queryWhere.push(`Rte IN (${placeholders})`);
                params = params.concat(route);
            }
            if (year && year.length > 0) {
                const placeholders = year.map(() => '?').join(',');
                queryWhere.push(`Year IN (${placeholders})`);
                params = params.concat(year);
            }
            if (treatment && treatment.length > 0) {
                const placeholders = treatment.map(() => '?').join(',');
                queryWhere.push(`Treatment IN (${placeholders})`);
                params = params.concat(treatment);
            }
            if (assetType && assetType.length > 0) {
                const placeholders = assetType.map(() => '?').join(',');
                queryWhere.push(`TreatType IN (${placeholders})`);
                params = params.concat(assetType);
            }

            // Construimos la consulta SQL usando EXISTS para verificar que hay al menos un tratamiento que cumple con los filtros
            let query = `
                SELECT p.ProjId, p.ScenarioId, p.UserId, p.UserNotes, p.SchemaId, p.ProjType, p.Year, p.NBridges, p.NPave, p.Cost
                FROM Project p
                WHERE p.ScenarioId = ? AND EXISTS (
                    SELECT 1 FROM Treatment t 
                    WHERE t.ProjId = p.ProjId
                    ${queryWhere.length > 0 ? ` AND ${queryWhere.join(' AND ')}` : ''}
                )
            `;

            // Ejecutamos la consulta
            const result = db.exec(query, [scenarioId, ...params]);

            if (!result || result.length === 0) return [];

            // Mapeamos los resultados a objetos de proyecto
            const { values } = result[0];
            return values.map((row: any) => ({
                ProjId: row[0],
                ScenarioId: row[1],
                UserId: row[2],
                UserNotes: row[3],
                SchemaId: row[4],
                ProjType: row[5],
                Year: row[6],
                NBridges: row[7],
                NPave: row[8],
                Cost: row[9]
            }));
        } catch (error) {
            // En caso de error, devolvemos un array vacío
            console.error('Error en getProjectsFiltered:', error);
            return [];
        }
    }

    const getTreatmentsFiltered = (scenarioId: string, filterValues: any) => {

        if(!filterValues) {
            return getTreatmentsFromDB(scenarioId);
        }

        const { route, year, assetType, treatment } = filterValues;
        
        try{
            const db = dbObject.current;
            if (!db) return [];

            // Verificamos si hay filtros válidos para aplicar
            const hasValidFilters = (route && route !== '') || (year && year !== '') || (treatment && treatment !== '') || (assetType && assetType !== '');

            if (!hasValidFilters) {
                // Si no hay filtros, retornamos todos los proyectos
                return getTreatmentsFromDB(scenarioId);
            }

            let queryWhere = [];
            let params: any[] = [];

            // Solo aplicamos filtros si están definidos y no son vacíos
            if (route && route.length > 0) {
                const placeholders = route.map(() => '?').join(',');
                queryWhere.push(`Rte IN (${placeholders})`);
                params = params.concat(route);
            }
            if (year && year.length > 0) {
                const placeholders = year.map(() => '?').join(',');
                queryWhere.push(`Year IN (${placeholders})`);
                params = params.concat(year);
            }
            if (treatment && treatment.length > 0) {
                const placeholders = treatment.map(() => '?').join(',');
                queryWhere.push(`Treatment IN (${placeholders})`);
                params = params.concat(treatment);
            }
            if (assetType && assetType.length > 0) {
                const placeholders = assetType.map(() => '?').join(',');
                queryWhere.push(`TreatType IN (${placeholders})`);
                params = params.concat(assetType);
            }

            const [{ values }] = db.exec(`
                SELECT * FROM Treatment WHERE ProjId IN (SELECT ProjId FROM Project WHERE ScenarioId = ?) ${queryWhere.length > 0 ? ` AND ${queryWhere.join(' AND ')}` : ''}
            `, [scenarioId, ...params]);
            
            return values.map((treatment: any) => ({
                TreatId: treatment[0],
                ProjId: treatment[1],
                TreatmentId: treatment[2],
                ProjType: treatment[3],
                Treatment: treatment[4],
                TreatType: treatment[5],
                Dist: treatment[6],
                Cnty: treatment[7],
                Rte: treatment[8],
                Dir: treatment[9],
                FromSection: treatment[10],
                ToSection: treatment[11],
                BRKEY: treatment[12],
                BRIDGE_ID: treatment[13],
                Owner: treatment[14],
                COUNTY: treatment[15],
                MPO_RPO: treatment[16],
                Year: treatment[17],
                Cost: treatment[18],
                Benefit: treatment[19],
                PreferredYear: treatment[20],
                MinYear: treatment[21],
                MaxYear: treatment[22],
                PriorityOrder: treatment[23],
                IsCommitted: treatment[24],
                Risk: treatment[25],
                IndirectCostDesign: treatment[26],
                IndirectCostOther: treatment[27],
                IndirectCostROW: treatment[28],
                IndirectCostUtilities: treatment[29],
                B_C: treatment[30],
                MPMSID: treatment[31]
            }));

        } catch (error) {
            console.error('Error in getTreatmentsFiltered:', error);
            return [];
        }
    }

    const loadTreatments = async (scenario: any) => {
        try {
            const view = getMapView();
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
                    const foundProject = Projects.find((p: any) => (p.ProjId || p.ProjectID) === projId);
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
                        } as any);
    
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
    
            const grouped: any = {};
    
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
                let result = await featureLayer.queryExtent();
                const expandedExtent = result.extent.expand(1.2);
                view.goTo({ target: expandedExtent });
            }
        } catch (err) {
            console.error('Error loading data:', err);
        }
    }

    const value: AppContextType = {
        isLoading,
        isLoadingScenario,
        scenario,
        getFilterValues,
        getSelectedScenario,
        getSelectedUser,
        getMapView,
        getFeatureLayer,
        getProjectsFiltered,
        changeFilterValues,
        changeSelectedScenario,
        changeSelectedUser,
        changeFeatureLayer,
        changeMapView,
        toggleLoading,
        toggleLoadingScenario,
        createSqlLiteDB,
        loadDataFromFile,
        getScenariosFromDB,
        getProjectsFromDB,
        getTreatmentsFromDB,
        getUniqueUsersFromDB,
        getTreatmentsPerProjectFromDB,
        getTreatmentsFiltered,
        loadTreatments
    }

    return (
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      );
    
}

export const useApp = (): AppContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };