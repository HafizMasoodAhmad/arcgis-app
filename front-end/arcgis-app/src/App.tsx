import { useEffect, useRef, useState } from "react";

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";

import esriConfig from "@arcgis/core/config";
import Portal from "@arcgis/core/portal/Portal";
import PortalBasemapsSource from "@arcgis/core/widgets/BasemapGallery/support/PortalBasemapsSource";

import "@arcgis/map-components/components/arcgis-home";
import "@arcgis/map-components/components/arcgis-basemap-gallery";
import "@arcgis/map-components/components/arcgis-expand";

esriConfig.portalUrl = "https://pennshare.maps.arcgis.com";

import { Loading } from "@/components/Loading";
import { STORAGE_KEYS } from "@/utils/storage";
import { useApp } from "@/context/AppContext";
import type { FilterRef } from "@/components/Filter";
import { Projects } from "@/components/Projects";
import { ButtonWidget } from "@/components/ButtonWidget";
import { ChartComponent } from "@/components/ChartComponent";
import RightPanel from "@/components/RightPanel";
import ProjectPopup from "@/components/ProjectPopup";

import "@/App.css";
import FilterSidebar from "@/components/FilterSidebar";
import { LoadingScenario } from "./components/LoadingScenario";
import ProjectTreatments from "./components/project-treatment/ProjectTreatments";
import Treatmentlist from "./components/project-treatment-list/Treatmentlist";


import greenMarkerSvg from "@/assets/greenMarker.svg";
import redMarkerSvg from "@/assets/redMarker.svg";

function App() {
  const {
    isLoading,
    isLoadingScenario,
    changeMapView,
    changeFeatureLayer,
    toggleLoading,
    toggleLoadingScenario,
    createSqlLiteDB,
    loadDataFromFile,
    loadDataFromJson,
  } = useApp();

  const [isOpenProjects, setIsOpenProjects] = useState<boolean>(false);
  const [isOpenCharts, setIsOpenCharts] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isOpenRightPanel, setIsOpenRightPanel] = useState<boolean>(false);
  const [isProjectPopupOpen, setIsProjectPopupOpen] = useState<boolean>(false);
  const [projectPopupData, setProjectPopupData] = useState<any>(null);
  const [isTreatmentListOpen, setIsTreatmentListOpen] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

  const mapContainerRef = useRef<HTMLArcgisMapElement>(null);
  const filterRef = useRef<FilterRef>(null);
  const highlightHandleRef = useRef<any>(null);
  const markerGraphicsRef = useRef<Graphic[]>([]);

  const formatCurrencyNoDecimals = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const calcTotalCost = (attrs: any, edits: any): number => {
    const numericVal = (fieldName: string, fallback: number) => {
      const raw = edits?.[fieldName] ?? attrs?.[fieldName] ?? fallback;
      return typeof raw === "number" ? raw : parseFloat(raw) || 0;
    };
    const direct = numericVal("DirectCost", 0);
    const design = numericVal("DesignCost", 0);
    const row = numericVal("ROWCost", 0);
    const util = numericVal("UtilCost", 0);
    const other = numericVal("OtherCost", 0);
    return direct + design + row + util + other;
  };

  const getAssetTypeLabel = (type: string): string => {
    if (!type) return "";
    if (type === "P") return "Pavement";
    if (type === "B") return "Bridge";
    if (type === "C") return "Combined";
    return type;
  };

  const createMarkerGraphics = (features: any[]): Graphic[] => {
    const markers: Graphic[] = [];
    
    // Create markers for start and end points
    features.forEach((feature) => {
      if (feature.geometry && feature.geometry.paths && feature.geometry.paths.length > 0) {
        const path = feature.geometry.paths[0];

        if (path.length > 0) {
          // Create start marker (green)
          const startPoint = new Point({
            x: path[0][0],
            y: path[0][1],
            spatialReference: feature.geometry.spatialReference
          });

          const startMarker = new Graphic({
            geometry: startPoint,
            symbol: {
              type: "picture-marker",
              url: greenMarkerSvg,
              width: 20,
              height: 30,
              yoffset: 17
            }
          });

          markers.push(startMarker);

          // Create end marker (red)
          const endPoint = new Point({
            x: path[path.length - 1][0],
            y: path[path.length - 1][1],
            spatialReference: feature.geometry.spatialReference
          });

          const endMarker = new Graphic({
            geometry: endPoint,
            symbol: {
              type: "picture-marker",
              url: redMarkerSvg,
              width: 20,
              height: 30,
              yoffset: 17
            }
          });

          markers.push(endMarker);
        }
      }
    });
    
    return markers;
  };

  const removeMarkerGraphics = (view: any) => {
    if (markerGraphicsRef.current.length > 0) {
      markerGraphicsRef.current.forEach(marker => {
        view.graphics.remove(marker);
      });
      markerGraphicsRef.current = [];
    }
  };

  const computeChartData = () => {
    const { getTreatmentsFiltered, getFilterValues, getSelectedScenario } = useApp();
    
    let filterValues = getFilterValues();
    let scenarioId = getSelectedScenario();
    const treatments = getTreatmentsFiltered(scenarioId, filterValues);

    
    let totalCostByYear: any = {};
    let treatmentBreakdownByYear: any = {};
    let costByTreatmentType: any = {};

    treatments.forEach(treatment => {
      if(!totalCostByYear[treatment.Year]) {
        totalCostByYear[treatment.Year] = 0;
      }
      totalCostByYear[treatment.Year] += treatment.Cost;

      if(!treatmentBreakdownByYear[treatment.TreatType]) {
        treatmentBreakdownByYear[treatment.TreatType] = 0;
      }
      treatmentBreakdownByYear[treatment.TreatType] += 1;

      if(!costByTreatmentType[treatment.TreatType]) {
        costByTreatmentType[treatment.TreatType] = 0;
      }
      costByTreatmentType[treatment.TreatType] += treatment.Cost;
    });

    return {
      totalCostByYear,
      treatmentBreakdownByYear,
      costByTreatmentType
    };
  };

  const buildProjectPopupData = (
    _projId: number | string,
    features: any[]
  ): any => {
    if (!features?.length) return null;

    
    

    const f = features[0];
    const projectId = f.attributes?.ProjectID || "";
    const projectRoute = f.attributes?.Route || "";
    const projectYear = f.attributes?.Year || "";
    const projectCost = features.reduce(
      (sum: number, g: any) => sum + calcTotalCost(g.attributes || {}, {}),
      0
    );



    const treatments = features.map((g: any) => {
      const attr = g.attributes || {};
      const spelledType = getAssetTypeLabel(
        attr.TreatmentType || attr.AssetType || ""
      );
      const sectionStr = `${attr.SectionFrom ?? ""}-${attr.SectionTo ?? ""}`;
      const totalCost = calcTotalCost(attr, {});



      return {
        type: spelledType,
        section: sectionStr,
        treatment: attr.Treatment || "",
        totalCost,
        attributes: attr
      };
    });

    return {
      projectId,
      projectRoute,
      projectYear,
      projectCost,
      treatments,
      features
    };
  };

  const setupPopupSelection = (view: any, featureLayer: any) => {
    if (!view) return;
    view.popup.autoOpenEnabled = false;
    view.on("click", async (event: any) => {
      try {
        if (highlightHandleRef.current) {
          highlightHandleRef.current.remove?.();
          highlightHandleRef.current = null;
        }

        removeMarkerGraphics(view);
        const response = await view.hitTest(event);
        if (!response?.results?.length) {
          view.popup.close();

          setIsProjectPopupOpen(false);
          setProjectPopupData(null);
          setIsTreatmentListOpen(false);
          setSelectedFeature(null);
          removeMarkerGraphics(view);
          return;
        }
        const clickedFeature = response.results.find(
          (r: any) => r.graphic?.layer === featureLayer
        )?.graphic;
        if (!clickedFeature) {
          view.popup.close();
          setIsProjectPopupOpen(false);
          setProjectPopupData(null);
          setIsTreatmentListOpen(false);
          setSelectedFeature(null);
          removeMarkerGraphics(view);
          return;
        }
        let projId =
          clickedFeature.attributes?.ProjId ||
          clickedFeature.attributes?.ProjectID ||
          clickedFeature.attributes?.SchemaId ||
          clickedFeature.attributes?.SystemID;
        if (!projId) {
          view.popup.close();
          setIsProjectPopupOpen(false);
          setProjectPopupData(null);
          setIsTreatmentListOpen(false);
          setSelectedFeature(null);
          removeMarkerGraphics(view);
          return;
        }
        const layerView = await view.whenLayerView(featureLayer);
        const query = featureLayer.createQuery();
        query.where = `ProjectID = ${projId}`;
        query.outFields = ["*"];
        query.returnGeometry = true;
        const queryResult = await featureLayer.queryFeatures(query);
        if (!queryResult?.features?.length) {
          view.popup.close();
          setIsProjectPopupOpen(false);
          setProjectPopupData(null);
          setIsTreatmentListOpen(false);
          setSelectedFeature(null);
          removeMarkerGraphics(view);
          return;
        }

        
        highlightHandleRef.current = layerView.highlight(queryResult.features);

        // Zoom to the selected polyline using Polyline geometry
        try {
          // Create a polyline from the selected features
          const paths = queryResult.features
            .map(feature => feature.geometry?.paths)
            .filter(paths => paths && paths.length > 0)
            .flat();
          
          if (paths.length > 0) {
            const polyline = new Polyline({
              paths: paths,
              spatialReference: queryResult.features[0].geometry.spatialReference
            });
            
            await view.goTo({
              target: polyline,
            });
          }
        } catch (error) {
          console.error("Error zooming to selected line:", error);
        }

        const markers = createMarkerGraphics(queryResult.features);

        markers.forEach((marker) => {
          view.graphics.add(marker);
        });

        markerGraphicsRef.current = markers;

        // Set selected feature for treatment list
        const attrs = queryResult.features[0].attributes;
        // Calculate TotalCost if not present
        if (!attrs.TotalCost) {
          attrs.TotalCost = calcTotalCost(attrs, {});
        }
        const attrsArray = [attrs];
        setSelectedFeature(attrsArray);
        console.log("attrsArray",attrs)
        setIsTreatmentListOpen(true);

        const popupData = buildProjectPopupData(
          projId,
          queryResult.features
        );

        setProjectPopupData(popupData);
        setIsProjectPopupOpen(true);

        view.popup.close();
      } catch (err) {
        console.error("Error handling segment click:", err);
        view.popup.close();
      }
    });
  };

  useEffect(() => {
    let modalProjects = document.getElementById("projectInfoModal");

    modalProjects?.addEventListener("hidden.bs.modal", () => {
      setIsOpenProjects(false);
    });

    let modalCharts = document.getElementById("graphicChartModal");

    modalCharts?.addEventListener("hidden.bs.modal", () => {
      setIsOpenCharts(false);
    });

    (async () => {
      try {
        await initMap();

        await createSqlLiteDB();
        const pending = sessionStorage.getItem(STORAGE_KEYS.scenarioPending);
        const raw = sessionStorage.getItem(STORAGE_KEYS.scenarioRawJson);
        if (pending === "1" && raw) {
          toggleLoading(true);
          
          const scenario = await loadDataFromJson(raw);

          await filterRef.current?.changeScenarioByImport(
            scenario.LastRunBy,
            scenario.ScenId
          );

          sessionStorage.removeItem(STORAGE_KEYS.scenarioRawJson);
        }
      } finally {
        toggleLoading(false);
        sessionStorage.removeItem(STORAGE_KEYS.scenarioPending);
      }
    })();
  }, []);

  // Effect to adjust filter sidebar height when treatment list is open
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--filter-sidebar-height-condensed",
      isTreatmentListOpen ? "54vh" : "65vh"
    );
  }, [isTreatmentListOpen]);

  const initMap = async () => {
    let viewElement = mapContainerRef.current;
    if (!viewElement) return;
    await viewElement.viewOnReady();

    /* let webmapId = "523189e0fde048c990df702553fb73e5";
        const map = new WebMap({
            portalItem: {
                id: webmapId,
            },
        });

        viewElement.map = map; */
    const view = viewElement.view;

    view.extent = {
      xmax: -7981825.454310255,
      xmin: -9230500.748376561,
      ymax: 5382301.238801554,
      ymin: 4609981.505008338,
      spatialReference: {
        wkid: 102100,
      },
    };

    const portal = new Portal();
    const source = new PortalBasemapsSource({
      portal,
    });
    const gallery = document.querySelector("arcgis-basemap-gallery")!;
    gallery.source = source;

    changeMapView(view);


    const featureLayer = new FeatureLayer({
      title: "Scenario Treatments",
      id: "ScenarioTreatmentsLayer",
      visible: true,
      objectIdField: "OBJECTID",
      geometryType: "polyline",
      spatialReference: { wkid: 102100 },
      fields: [
        { name: "OBJECTID", type: "oid" },
        { name: "ProjectID", type: "integer" },
        { name: "SystemID", type: "integer" },
        { name: "DistrictNo", type: "integer" },
        { name: "CountyCode", type: "integer" },
        { name: "TreatmentID", type: "string" },
        { name: "AssetType", type: "string" },
        { name: "Route", type: "integer" },
        { name: "SectionFrom", type: "integer" },
        { name: "SectionTo", type: "integer" },
        { name: "BridgeID", type: "string" },
        { name: "TreatmentType", type: "string" },
        { name: "Treatment", type: "string" },
        { name: "Year", type: "integer" },
        { name: "DirectCost", type: "double" },
        { name: "DesignCost", type: "double" },
        { name: "ROWCost", type: "double" },
        { name: "UtilCost", type: "double" },
        { name: "OtherCost", type: "double" },
        { name: "IndirectCostDesign", type: "double" },
        { name: "IndirectCostOther", type: "double" },
        { name: "IndirectCostROW", type: "double" },
        { name: "IndirectCostUtilities", type: "double" },
        { name: "Direction", type: "string" },
        { name: "TotalCost", type: "double" },
      ],
    });

    featureLayer.source = [];
    featureLayer.outFields = ["*"];
          featureLayer.popupEnabled = false;
    featureLayer.elevationInfo = { mode: "on-the-ground" };
    featureLayer.renderer = getRenderer(false) as any;



    changeFeatureLayer(featureLayer);

    view?.map?.add(featureLayer);

    // Add event listener for symbology updates
    window.addEventListener("symbologyUpdate", (event: any) => {
      const { useCostBasedSymbology } = event.detail;
      featureLayer.renderer = getRenderer(useCostBasedSymbology) as any;
    });

    setupPopupSelection(view, featureLayer);
  };

  const getRenderer = (useCostBasedSymbology: boolean) => {
    if (useCostBasedSymbology) {
      return {
        type: "class-breaks",
        field: "DirectCost",
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 100000,
            symbol: { type: "simple-line", color: [34, 139, 34], width: 3 },
            label: "< 100k",
          },
          {
            minValue: 100001,
            maxValue: 500000,
            symbol: { type: "simple-line", color: [144, 238, 144], width: 3 },
            label: "100k - 500k",
          },
          {
            minValue: 500001,
            maxValue: 1000000,
            symbol: { type: "simple-line", color: [255, 255, 0], width: 3 },
            label: "500k - 1M",
          },
          {
            minValue: 1000001,
            maxValue: 2000000,
            symbol: { type: "simple-line", color: [255, 165, 0], width: 3 },
            label: "1M - 2M",
          },
          {
            minValue: 2000001,
            maxValue: 5000000,
            symbol: { type: "simple-line", color: [255, 69, 0], width: 3 },
            label: "2M - 5M",
          },
          {
            minValue: 5000001,
            maxValue: Infinity,
            symbol: { type: "simple-line", color: [178, 34, 34], width: 3 },
            label: "> 5M",
          },
        ],
        highlightOptions: {
          color: [204, 169, 173],
          haloOpacity: 0.9,
          fillOpacity: 0.2
        }
      };
    } else {
      const years = [
        2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034,
        2035,
      ];
      const blues = [
        [222, 235, 247],
        [198, 219, 239],
        [158, 202, 225],
        [107, 174, 214],
        [66, 146, 198],
        [33, 113, 181],
        [8, 81, 156],
        [8, 48, 107],
        [3, 19, 43],
      ];
      const uniqueValueInfos = years.map((yr, idx) => {
        const colorIndex = idx % blues.length;
        return {
          value: yr,
          symbol: { type: "simple-line", color: blues[colorIndex], width: 3 },
          label: `${yr}`,
        };
      });

      return {
        type: "unique-value",
        field: "Year",
        uniqueValueInfos,
        defaultSymbol: {
          type: "simple-line",
          color: [128, 128, 128],
          width: 2,
        },
        highlightOptions: {
          color: [255, 0, 0],
          haloOpacity: 0.9,
          fillOpacity: 0.2
        }
      };
    }
  };

  const importScenario = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", async (event: any) => {
      toggleLoading(true);
      document.body.removeChild(fileInput);

      const file = event.target?.files?.[0];

      if (file) {


        let scenario = await loadDataFromFile(file);



        await filterRef.current?.changeScenarioByImport(
          scenario.LastRunBy,
          scenario.ScenId
        );
      }

      toggleLoading(false);
    });
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  const openProjects = () => {
    setIsOpenRightPanel(true);
    setIsOpenCharts(false);
    setIsOpenProjects(true);
  };

  const openCharts = () => {
    setIsOpenRightPanel(true);
    setIsOpenProjects(false);
    setIsOpenCharts(true);
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const renderProjectPopupContent = () => {
    if (!projectPopupData) return <div>No data available</div>;

    const { projectId, projectRoute, projectYear, projectCost, treatments } = projectPopupData;

    return (
      <div style={{ fontFamily: 'sans-serif' }}>
        <div className="mb-3">

          <div className="">
            <p>MPMS ID</p>
            <div className="bg-white border text-black p-2">
              {projectId}
            </div>
          </div>
          <p className="mb-2">Route: {projectRoute}</p>
          <p className="mb-2">Year: {projectYear}</p>
          <p className="mb-2">Cost:{formatCurrencyNoDecimals(projectCost)}</p>
        </div>


      </div>
    );
  };

  return (
    <div className="w-100 h-100 position-relative">
      {isLoading && <Loading />}
      {isLoadingScenario && <LoadingScenario />}

      <div className="w-100 h-100 d-flex flex-column overflow-hidden">
        {/* Map and sidebar container */}
        <div className="map-container position-relative w-100 h-100">
          {/* Sidebar OVER the map */}
          <FilterSidebar
            isSidebarOpen={isSidebarOpen}
            mapContainerRef={mapContainerRef}
            filterRef={filterRef}
            onOpenProjects={openProjects}
            onOpenCharts={openCharts}
          />

          {/* Map wrapper stays always full */}
          <div className="map-wrapper">
            {/* Right panel */}
            <RightPanel
              title={isOpenProjects ? "Project Information" : "Charts"}
              open={isOpenRightPanel}
              onClose={() => setIsOpenRightPanel(false)}
            >
              {isOpenProjects && (
                <div className="d-flex flex-column gap-2 h-100">
                  <div className="flex-grow-1 overflow-auto">
                    <Projects />
                  </div>
                  <div className="pt-2 border-top d-flex justify-content-end">
                    <button className="btn btn-primary">Save changes</button>
                  </div>
                </div>
              )}
              {isOpenCharts && (
                <div className="d-flex flex-column gap-3 p-3 h-100">
                  <div className="w-100 h-33">
                    <ChartComponent
                      title="Total Cost by Year"
                      data={computeChartData().totalCostByYear}
                      type="bar"
                      height="100%"
                    />
                  </div>
                  <div className="w-100 h-33">
                    <ChartComponent
                      title="Treatment Count by Type"
                      data={computeChartData().treatmentBreakdownByYear}
                      type="bar"
                      height="100%"
                    />
                  </div>
                  <div className="w-100 h-33">
                    <ChartComponent
                      title="Cost by Treatment Type"
                      data={computeChartData().costByTreatmentType}
                      type="pie"
                      height="100%"
                    />
                  </div>
                </div>
              )}
            </RightPanel>

            <arcgis-map
              ref={mapContainerRef}
              basemap="gray"
              padding={{
                left: isOpenRightPanel ? 520 : 0,
                right: isProjectPopupOpen ? 450 : 0
              }}
            >
              <arcgis-home position="top-right"></arcgis-home>
            </arcgis-map>

            <div className="position-absolute bottom-0 end-0 w-100">
              <div className="d-flex justify-content-end p-2 pb-4">
                <ButtonWidget title="Import scenario" onClick={importScenario}>
                  <i className="fa-solid fa-file-import me-2"></i>
                  Import scenario
                </ButtonWidget>
              </div>
              {/* {isTreatmentListOpen && selectedFeature && (
                <div className="mb-2">
                  <Treatmentlist
                    data={selectedFeature}
                    onClose={() => {
                      setIsTreatmentListOpen(false);
                      setSelectedFeature(null);
                      
                      // Remove highlighting and markers when closing treatment list
                      if (highlightHandleRef.current) {
                        highlightHandleRef.current.remove?.();
                        highlightHandleRef.current = null;
                      }
                      
                      if (mapContainerRef.current?.view) {
                        removeMarkerGraphics(mapContainerRef.current.view);
                      }
                    }}
                  />
                </div>
              )} */}
              <ProjectTreatments />
            </div>

            {/* Custom Project Popup */}
            <ProjectPopup
              key={projectPopupData?.projectId || 'no-project'}
              open={isProjectPopupOpen}
              onClose={() => {
                setIsProjectPopupOpen(false);
                setProjectPopupData(null);
                setIsTreatmentListOpen(false);
                setSelectedFeature(null);
        
                if (highlightHandleRef.current) {
                  highlightHandleRef.current.remove?.();
                  highlightHandleRef.current = null;
                }
        
                if (mapContainerRef.current?.view) {
                  removeMarkerGraphics(mapContainerRef.current.view);
                }
              }}
              width={450}
              projectData={projectPopupData}
              getMapView={() => mapContainerRef.current?.view || null}
            >
              {renderProjectPopupContent()}
            </ProjectPopup>
          </div>
        </div>
      </div>
    </div>
  );

}

export default App;
