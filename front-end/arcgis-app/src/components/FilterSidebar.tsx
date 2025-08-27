import { useState, type RefObject } from "react";
import { Filter, type FilterRef } from "@/components/Filter";
import Separator from "@/components/Separator";
import SidebarPopup from "@/components/SidebarPopup";
import { useApp } from "@/context/AppContext";
import { STORAGE_KEYS } from "@/utils/storage";
import calendarIcon from "@/assets/calender.svg";
import folderIcon from "@/assets/folder.svg";
import projectLineIcon from "@/assets/project-line.svg";
import wrenchIcon from "@/assets/wrench.svg";

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

  const {
    isSidebarOpen,
    mapContainerRef,
    filterRef,
    onOpenProjects,
    onOpenCharts,
  } = props;

  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
  const [isBaseMapGalleryOpen, setIsBaseMapGalleryOpen] =
    useState<boolean>(false);
  const [isCondensed, setIsCondensed] = useState<boolean>(false);

  return (
    <div
      className={`filter-sidebar ${isSidebarOpen ? "open" : ""} ${
        isCondensed ? "condensed" : ""
      }`}
    >
      <div className="d-flex flex-column overflow-hidden h-100">
        {/* Header */}
        <div className="filter-sidebar-header d-flex align-items-center justify-content-between px-3 py-2">
          <div className="d-flex align-items-center gap-2">
            <div
              className="hamburger"
              role="button"
              aria-label="Toggle condensed"
              onClick={() => setIsCondensed((prev) => !prev)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Content of the sidebar */}
        <div className="filter-sidebar-content d-flex flex-column gap-2 overflow-auto">
          {/* Condensed vertical menu */}
          {isCondensed ? (
            <nav className="condensed-menu d-flex flex-column align-items-center gap-4 mt-4">
              <button
                className="icon-stack d-flex flex-column align-items-center"
                title="Select Scenario"
                onClick={() => setIsCondensed(false)}
              >
                <img src={folderIcon} alt="scenario" />
                <span>SELECT <br/> SCENARIO</span>
              </button>
              <button
                className="icon-stack d-flex flex-column"
                title="Year"
                onClick={() => setIsCondensed(false)}
              >
                <img src={calendarIcon} alt="year" />
                <span>YEAR</span>
              </button>
              <button
                className="icon-stack"
                title="Projects Type(s)"
                onClick={() => setIsCondensed(false)}
              >
                <img src={projectLineIcon} alt="projects" />
                <span>PROJECTS TYPE(S)</span>
              </button>
              <button
                className="icon-stack"
                title="Treatment(s)"
                onClick={() => setIsCondensed(false)}
              >
                <img src={wrenchIcon} alt="treatment" />
                <span>TREATMENT(S)</span>
              </button>
            </nav>
          ) : (
            <>
              <section>
                <Filter ref={filterRef} />
              </section>
            </>
          )}

          <Separator className="mb-5" />

          {scenario && scenario != "" && (
            <section>
              {/* Button to toggle the table widget */}
              {/* <button
                className="btn w-100 d-flex justify-content-between"
                style={{
                  backgroundColor: "var(--primary-700)",
                  color: "var(--primary-100)",
                }}
                title="Mostrar/Ocultar Tabla"
                onClick={onOpenCharts}
              >
                <span className="text-white">Table widget</span>
                <i className="fa-solid fa-table pt-1"></i>
              </button> */}

              {/* Button to show the project information */}
              {/* <button
                className="btn w-100 mt-2 d-flex justify-content-between"
                style={{
                  backgroundColor: "var(--primary-700)",
                  color: "var(--primary-100)",
                }}
                title="Información del proyecto"
                onClick={onOpenProjects}
              >
                <span className="text-white">Project information</span>
                <i className="fa-solid fa-project-diagram pt-1"></i>
              </button> */}

              <Separator className="mt-2 mb-2" />

              {/* Reset filtros persistidos */}
              <button
                className="btn w-100 d-flex justify-content-between"
                style={{
                  backgroundColor: "var(--primary-700)",
                  color: "var(--primary-100)",
                }}
                title="Resetear filtros del escenario"
                onClick={() => {
                  const ok = window.confirm(
                    "Esto limpiará todos los filtros, incluyendo User y Scenario. ¿Desea continuar?"
                  );
                  if (!ok) return;
                  try {
                    localStorage.removeItem(
                      `${STORAGE_KEYS.filtersPrefix}${scenario}`
                    );
                    // Limpiar también UI y definitionExpression
                    (filterRef.current as any)?.hardResetAllFilters?.();
                  } catch {}
                }}
              >
                <span className="text-white">Clear all filters</span>
                <i className="fa-solid fa-rotate-left pt-1"></i>
              </button>
            </section>
          )}

          {/* <section>
            {/* Button to toggle the legend of the map */}
          {/*  <button
              className="btn w-100 d-flex justify-content-between"
              style={{
                backgroundColor: "var(--primary-700)",
                color: "var(--primary-100)",
              }}
              title="Mostrar/Ocultar Leyenda"
              onClick={() => {
                setIsLegendOpen((prev) => !prev);
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-list pt-1"></i>
                <span className="text-white">Legend</span>
              </div>
            </button>*/}

            {/* Button to toggle the base map gallery */}
           {/* <button
              className="btn w-100 d-flex justify-content-between"
              style={{
                backgroundColor: "var(--primary-700)",
                color: "var(--primary-100)",
              }}
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
          </section> */}
        </div>

        {/* Footer of the sidebar */}
        {/* <div className="filter-sidebar-footer">
          <span>© Pennsylvania Department of Transportation 2025</span>
        </div> */}

        {/* Popup over sidebar */}
        <SidebarPopup
          title="Legend"
          open={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
        >
          <arcgis-legend
            referenceElement={mapContainerRef.current}
            className="w-100 h-100"
          ></arcgis-legend>
        </SidebarPopup>

        <SidebarPopup
          title="BaseMap Gallery"
          open={isBaseMapGalleryOpen}
          onClose={() => setIsBaseMapGalleryOpen(false)}
        >
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
