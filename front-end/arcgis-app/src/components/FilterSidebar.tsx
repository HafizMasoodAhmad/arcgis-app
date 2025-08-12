import { useState, type RefObject } from 'react';
import { Filter, type FilterRef } from '@/components/Filter';
import Separator from '@/components/Separator';
import SidebarPopup from '@/components/SidebarPopup';
import { useApp } from "@/context/AppContext";

import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-basemap-gallery";

type FilterSidebarProps = {
    isSidebarOpen: boolean;
    mapContainerRef: RefObject<HTMLArcgisMapElement>;
    filterRef: RefObject<FilterRef>;
    onOpenProjects: () => void;
    onOpenCharts: () => void;
};

function FilterSidebar(props: FilterSidebarProps) {
    const { scenario } = useApp();

    const { isSidebarOpen, mapContainerRef, filterRef, onOpenProjects, onOpenCharts } = props;

    const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
    const [isBaseMapGalleryOpen, setIsBaseMapGalleryOpen] = useState<boolean>(false);

    return (
        <div className={`filter-sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="d-flex flex-column overflow-hidden h-100">
                {/* Content of the sidebar */}
                <div className="filter-sidebar-content d-flex flex-column gap-2 overflow-auto h-100">
                    <div className="d-flex align-items-center gap-2 ps-2 mt-3">
                        <i className="fa-solid fa-filter text-white"></i>
                        <h6 className="text-white pb-0 mb-0">Filters</h6>
                    </div>
                    <section>
                        <Filter ref={filterRef} />  
                    </section>

                    <Separator className="mb-5" />

                    {(scenario && scenario != "") && (
                        <section>
                            {/* Button to toggle the table widget */}
                            <button
                                className="btn w-100 d-flex justify-content-between"
                                style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)' }}
                                title="Mostrar/Ocultar Tabla"
                                onClick={onOpenCharts}
                            >
                                <span className="text-white">Table widget</span>
                                <i className="fa-solid fa-table pt-1"></i>
                            </button>

                            {/* Button to show the project information */}
                            <button
                                className="btn w-100 mt-2 d-flex justify-content-between"
                                style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)' }}
                                title="Información del proyecto"
                                onClick={onOpenProjects}
                            >
                                <span className="text-white">Project information</span>
                                <i className="fa-solid fa-project-diagram pt-1"></i>
                            </button>

                            <Separator className="mt-2 mb-2" />
                        </section>
                    )}

                    <section>
                        {/* Button to toggle the legend of the map */}
                        <button
                            className="btn w-100 d-flex justify-content-between"
                            style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)' }}
                            title="Mostrar/Ocultar Leyenda"
                            onClick={() => {
                                setIsLegendOpen((prev) => !prev);
                            }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                <i className="fa-solid fa-list pt-1"></i>
                                <span className="text-white">Legend</span>
                            </div>
                        </button>

                        {/* Button to toggle the base map gallery */}
                        <button
                            className="btn w-100 d-flex justify-content-between"
                            style={{ backgroundColor: 'var(--primary-700)', color: 'var(--primary-100)' }}
                            title="Mostrar/Ocultar BaseMap Gallery"
                            onClick={() => {
                                setIsBaseMapGalleryOpen((prev) => !prev);
                            }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                <i className="fa-solid fa-layer-group pt-1"></i>
                                <span className="text-white">BaseMap Gallery</span>
                            </div>
                        </button>
                    </section>
                </div>

                {/* Footer of the sidebar */}
                <div className="filter-sidebar-footer"> 
                    <span>© Pennsylvania Department of Transportation 2025</span>
                </div>

                {/* Popup over sidebar */}
                <SidebarPopup title="Legend" open={isLegendOpen} onClose={() => setIsLegendOpen(false)}>
                    <arcgis-legend
                        referenceElement={mapContainerRef.current}
                        className="w-100 h-100"
                    ></arcgis-legend>
                </SidebarPopup>

                <SidebarPopup title="BaseMap Gallery" open={isBaseMapGalleryOpen} onClose={() => setIsBaseMapGalleryOpen(false)}>
                    <arcgis-basemap-gallery
                        referenceElement={mapContainerRef.current}
                        className="w-100 h-100"
                    ></arcgis-basemap-gallery>
                </SidebarPopup>
            </div>
        </div>
    );
}

export default FilterSidebar;


