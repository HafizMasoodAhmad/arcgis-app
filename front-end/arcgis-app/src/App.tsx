import { useEffect, useRef, useState } from 'react'

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

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
import { Charts } from "@/components/Charts";
import RightPanel from "@/components/RightPanel";

import '@/App.css'
import FilterSidebar from "@/components/FilterSidebar";
import { LoadingScenario } from "./components/LoadingScenario";

function App() {
    const { isLoading, isLoadingScenario, changeMapView, changeFeatureLayer, toggleLoading, toggleLoadingScenario, createSqlLiteDB, loadDataFromFile, loadDataFromJson } = useApp();

    const [isOpenProjects, setIsOpenProjects] = useState<boolean>(false);
    const [isOpenCharts, setIsOpenCharts] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isOpenRightPanel, setIsOpenRightPanel] = useState<boolean>(false);    

    const mapContainerRef = useRef<HTMLArcgisMapElement>(null);
    const filterRef = useRef<FilterRef>(null);
    const highlightHandleRef = useRef<any>(null);

    const formatCurrencyNoDecimals = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    const calcTotalCost = (attrs: any, edits: any): number => {
        const numericVal = (fieldName: string, fallback: number) => {
            const raw = edits?.[fieldName] ?? attrs?.[fieldName] ?? fallback;
            return typeof raw === 'number' ? raw : parseFloat(raw) || 0;
        };
        const direct = numericVal('DirectCost', 0);
        const design = numericVal('DesignCost', 0);
        const row = numericVal('ROWCost', 0);
        const util = numericVal('UtilCost', 0);
        const other = numericVal('OtherCost', 0);
        return direct + design + row + util + other;
    };

    const getAssetTypeLabel = (type: string): string => {
        if (!type) return '';
        if (type === 'P') return 'Pavement';
        if (type === 'B') return 'Bridge';
        if (type === 'C') return 'Combined';
        return type;
    };

    const buildProjectPopupContent = (_projId: number | string, features: any[]): string => {
        if (!features?.length) return '<div>No data</div>';
        const f = features[0];
        const projectId = f.attributes?.ProjectID || '';
        const projectRoute = f.attributes?.Route || '';
        const projectYear = f.attributes?.Year || '';
        const projectCost = features.reduce((sum: number, g: any) => sum + calcTotalCost(g.attributes || {}, {}), 0);

        const out: string[] = [];
        out.push('<div style="font-family: sans-serif; padding:8px;">');
        out.push(`<p><b>MPMS ID:</b> ${projectId}</p>`);
        out.push(`<p><b>Route:</b> ${projectRoute}</p>`);
        out.push(`<p><b>Year:</b> ${projectYear}</p>`);
        out.push(`<p><b>Cost:</b> ${formatCurrencyNoDecimals(projectCost)}</p>`);
        out.push('<h4 style="margin-top:20px;">Treatments</h4>');
        out.push('<table style="border-collapse: collapse; width: 100%;">');
        out.push('<thead><tr>');
        out.push('<th style="border:1px solid #ccc; padding:6px;">Type</th>');
        out.push('<th style="border:1px solid #ccc; padding:6px;">Section</th>');
        out.push('<th style="border:1px solid #ccc; padding:6px;">Treatment</th>');
        out.push('<th style="border:1px solid #ccc; padding:6px;">Total Cost</th>');
        out.push('</tr></thead><tbody>');
        features.forEach((g: any) => {
            const attr = g.attributes || {};
            const spelledType = getAssetTypeLabel(attr.TreatmentType || attr.AssetType || '');
            const sectionStr = `${attr.SectionFrom ?? ''}-${attr.SectionTo ?? ''}`;
            const totalCost = calcTotalCost(attr, {});
            out.push('<tr>');
            out.push(`<td style="border:1px solid #ccc; padding:4px;">${spelledType}</td>`);
            out.push(`<td style="border:1px solid #ccc; padding:4px;">${sectionStr}</td>`);
            out.push(`<td style="border:1px solid #ccc; padding:4px;">${attr.Treatment || ''}</td>`);
            out.push(`<td style="border:1px solid #ccc; padding:4px;">${formatCurrencyNoDecimals(totalCost)}</td>`);
            out.push('</tr>');
        });
        out.push('</tbody></table>');
        out.push('</div>');
        return out.join('');
    };

    const setupPopupSelection = (view: any, featureLayer: any) => {
        if (!view) return;
        view.popup.autoOpenEnabled = false;
        view.on('click', async (event: any) => {
            try {
                if (highlightHandleRef.current) {
                    highlightHandleRef.current.remove?.();
                    highlightHandleRef.current = null;
                }
                const response = await view.hitTest(event);
                if (!response?.results?.length) {
                    view.popup.close();
                    return;
                }
                const clickedFeature = response.results.find((r: any) => r.graphic?.layer === featureLayer)?.graphic;
                if (!clickedFeature) {
                    view.popup.close();
                    return;
                }
                let projId = clickedFeature.attributes?.ProjId ||
                              clickedFeature.attributes?.ProjectID ||
                              clickedFeature.attributes?.SchemaId ||
                              clickedFeature.attributes?.SystemID;
                if (!projId) {
                    view.popup.close();
                    return;
                }
                const layerView = await view.whenLayerView(featureLayer);
                const query = featureLayer.createQuery();
                query.where = `ProjectID = ${projId}`;
                query.outFields = ['*'];
                query.returnGeometry = true;
                const queryResult = await featureLayer.queryFeatures(query);
                if (!queryResult?.features?.length) {
                    view.popup.close();
                    return;
                }
                highlightHandleRef.current = layerView.highlight(queryResult.features);
                const popupContent = buildProjectPopupContent(projId, queryResult.features);
                view.popup.open({
                    title: 'Project Information',
                    content: popupContent,
                    location: event.mapPoint
                });
            } catch (err) {
                console.error('Error handling segment click:', err);
                view.popup.close();
            }
        });
    };

    useEffect(() => { 
        let modalProjects = document.getElementById('projectInfoModal')

        modalProjects?.addEventListener('hidden.bs.modal', () => {
            setIsOpenProjects(false);
        });
        
        let modalCharts = document.getElementById('graphicChartModal')

        modalCharts?.addEventListener('hidden.bs.modal', () => {
            setIsOpenCharts(false);
        });
        
        (async () => {
            try {
                await initMap();
                // Asegurar que SQLite esté listo antes de cualquier carga
                await createSqlLiteDB();
                const pending = sessionStorage.getItem(STORAGE_KEYS.scenarioPending);
                const raw = sessionStorage.getItem(STORAGE_KEYS.scenarioRawJson);
                if (pending === '1' && raw) {
                    toggleLoading(true);
                    const scenario = await loadDataFromJson(raw);
                    await filterRef.current?.changeScenarioByImport(scenario.LastRunBy, scenario.ScenId);
                    // Limpiar storage tras uso
                    sessionStorage.removeItem(STORAGE_KEYS.scenarioRawJson);
                }
            } finally {
                toggleLoading(false);
                sessionStorage.removeItem(STORAGE_KEYS.scenarioPending);
            }
        })();
    }, []);

    const initMap = async () => {
        let viewElement = mapContainerRef.current;     
        if(!viewElement) return;     
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
                wkid: 102100
            }
        }

        const portal = new Portal();
        const source = new PortalBasemapsSource({
            portal
        });
        const gallery = document.querySelector("arcgis-basemap-gallery")!;
        gallery.source = source; 

        changeMapView(view);

        // Create new feature layer from the scenario data
        const featureLayer = new FeatureLayer({
            title: 'Scenario Treatments',
            id: 'ScenarioTreatmentsLayer',
            visible: true,
            objectIdField: 'OBJECTID',
            geometryType: 'polyline',
            spatialReference: { wkid: 102100 },
            fields: [
                { name: 'OBJECTID', type: 'oid' },
                { name: 'ProjectID', type: 'integer' },
                { name: 'SystemID', type: 'integer' },
                { name: 'DistrictNo', type: 'integer' },
                { name: 'CountyCode', type: 'integer' },
                { name: 'TreatmentID', type: 'string' },
                { name: 'AssetType', type: 'string' },
                { name: 'Route', type: 'integer' },
                { name: 'SectionFrom', type: 'integer' },
                { name: 'SectionTo', type: 'integer' },
                { name: 'BridgeID', type: 'string' },
                { name: 'TreatmentType', type: 'string' },
                { name: 'Treatment', type: 'string' },
                { name: 'Year', type: 'integer' },
                { name: 'DirectCost', type: 'double' },
                { name: 'DesignCost', type: 'double' },
                { name: 'ROWCost', type: 'double' },
                { name: 'UtilCost', type: 'double' },
                { name: 'OtherCost', type: 'double' }
            ]
        });
        
        featureLayer.source = [];
        featureLayer.outFields = ['*'];
        featureLayer.popupEnabled = false;  // We'll use our custom popup
        featureLayer.elevationInfo = { mode: 'on-the-ground' };
        featureLayer.renderer = getRenderer(false) as any;

        changeFeatureLayer(featureLayer);

        view?.map?.add(featureLayer);

        window.addEventListener('symbologyUpdate', (event: any)=>{
            const { useCostBasedSymbology } = event.detail;
            
            featureLayer.renderer = getRenderer(useCostBasedSymbology) as any;
        });

        // Setup custom popup behavior on map click (replicates Experience Builder widget)
        setupPopupSelection(view, featureLayer);
    }

    const getRenderer = (useCostBasedSymbology: boolean) => {     
        if (useCostBasedSymbology) {
            return {
                type: 'class-breaks',
                field: 'DirectCost',
                classBreakInfos: [
                    { minValue: 0, maxValue: 100000, symbol: { type: 'simple-line', color: [34, 139, 34], width: 3 }, label: '< 100k' },
                    { minValue: 100001, maxValue: 500000, symbol: { type: 'simple-line', color: [144, 238, 144], width: 3 }, label: '100k - 500k' },
                    { minValue: 500001, maxValue: 1000000, symbol: { type: 'simple-line', color: [255, 255, 0], width: 3 }, label: '500k - 1M' },
                    { minValue: 1000001, maxValue: 2000000, symbol: { type: 'simple-line', color: [255, 165, 0], width: 3 }, label: '1M - 2M' },
                    { minValue: 2000001, maxValue: 5000000, symbol: { type: 'simple-line', color: [255, 69, 0], width: 3 }, label: '2M - 5M' },
                    { minValue: 5000001, maxValue: Infinity, symbol: { type: 'simple-line', color: [178, 34, 34], width: 3 }, label: '> 5M' }
                ]
            };
        } else {
            const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
            const blues = [
                [222, 235, 247],
                [198, 219, 239],
                [158, 202, 225],
                [107, 174, 214],
                [66, 146, 198],
                [33, 113, 181],
                [8, 81, 156],
                [8, 48, 107],
                [3, 19, 43]
            ];
            const uniqueValueInfos = years.map((yr, idx) => {
                const colorIndex = idx % blues.length;
                return { value: yr, symbol: { type: 'simple-line', color: blues[colorIndex], width: 3 }, label: `${yr}` };
            });
    
            return {
                type: 'unique-value',
                field: 'Year',
                uniqueValueInfos,
                defaultSymbol: { type: 'simple-line', color: [128, 128, 128], width: 2 }
            };
        }
    }

    const importScenario = () => {
        // Open the window to import the json file
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';  
        //fileInput.onchange = handleFileChange;
        fileInput.addEventListener('change', async (event: any) => {
            toggleLoading(true);
            document.body.removeChild(fileInput);
    
            const file = event.target?.files?.[0];

            if (file) {
                let scenario =await loadDataFromFile(file);

                await filterRef.current?.changeScenarioByImport(scenario.LastRunBy, scenario.ScenId);              
            }

            toggleLoading(false);
        });
        document.body.appendChild(fileInput);
        fileInput.click();
    }

    const openProjects = () => {
        setIsOpenRightPanel(true);
        setIsOpenCharts(false);
        setIsOpenProjects(true);
    }   

    const openCharts = () => {
        setIsOpenRightPanel(true);
        setIsOpenProjects(false);
        setIsOpenCharts(true);
    }

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    return (
        <div className="w-100 h-100 position-relative">
            {
                isLoading && <Loading />
            }

            {
                isLoadingScenario && <LoadingScenario />
            }
            
            <div className="w-100 h-100 d-flex flex-column overflow-hidden">
                {/* Map and sidebar container */}
                <div className="w-100 h-100 position-relative">
                    {/* Sidebar */}
                    <FilterSidebar 
                        isSidebarOpen={isSidebarOpen}
                        mapContainerRef={mapContainerRef}
                        filterRef={filterRef}
                        onOpenProjects={openProjects}
                        onOpenCharts={openCharts}
                    />

                    {/* Map wrapper shifts when sidebar open */}
                    <div className={`map-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                        {/* Right panel to show Project Information to the right of sidebar */}
                        <RightPanel 
                            title={isOpenProjects ? 'Project Information' : 'Charts'}
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

                            {
                                isOpenCharts &&
                                <Charts />
                            }
                        </RightPanel>
                        <arcgis-map ref={mapContainerRef} basemap="gray" padding={{left: isOpenRightPanel ? 520 : 0}}>
                            <arcgis-home position="top-right"></arcgis-home>
                        </arcgis-map>

                        {/* Floating right-side widgets */}
                        <div className="position-absolute bottom-0 end-0 p-2 pb-4 d-flex flex-col gap-2 w-100 justify-content-end">
                            <ButtonWidget title="Import scenario" onClick={importScenario}>
                                <i className="fa-solid fa-file-import me-2"></i>
                                Import scenario
                            </ButtonWidget>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
