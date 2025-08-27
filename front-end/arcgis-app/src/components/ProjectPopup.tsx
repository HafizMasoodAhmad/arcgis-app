import { type ReactNode, useEffect, useRef, useState } from "react";
import { ChartComponent } from "./ChartComponent";
import { useApp } from "@/context/AppContext";
import editIcon from "@/assets/edit.svg";
import startMarker from "@/assets/greenMarker.svg";
import endMarker from "@/assets/redMarker.svg";

type ProjectPopupProps = {
  open: boolean;
  width?: number;
  children: ReactNode;
  onClose: () => void;
  projectData?: any;
  getMapView: () => any;
};

function ProjectPopup(props: ProjectPopupProps) {
  const {
    open,
    onClose,
    width = 400,
    children,
    projectData,
    getMapView,
  } = props;
  const [activeTab, setActiveTab] = useState<"projects" | "charts">("projects");
  const [showInformation, setShowInformation] = useState<boolean>(true);
  const [showIdentification, setShowIdentification] = useState<boolean>(false);
  const [showDescription, setShowDescription] = useState<boolean>(false);

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setShowInformation(true);
      setShowIdentification(true);
      setShowDescription(true);
      setActiveTab("projects");
    }
  }, [open]);

  const formatCurrencyNoDecimals = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const renderIdentificationContent = () => {
    if (!projectData) return null;

    const { projectId, projectRoute, projectYear, projectCost, features } =
      projectData;
    const firstFeature = features?.[0]?.attributes || {};

    return (
      <div style={{ fontFamily: "sans-serif" }} className="mt-3">
        <div className="mb-1">
          <div className="row">
            <div className="col-6 mb-3">
              <p className="mb-1 text-white">PROJECT ID</p>
              <p className="mt-1" style={{ color: "#D9D9D9" }}>
                {projectId}
              </p>
            </div>
            <div className="col-6 mb-3">
              <p className="mb-1 text-white">ROUTE</p>
              <p className="mb-1" style={{ color: "#D9D9D9" }}>
                {projectRoute}
              </p>
            </div>

            <div className="col-6 mb-3">
              <p className="mb-1 text-white">YEAR</p>
              <p className="mb-1" style={{ color: "#D9D9D9" }}>
                {projectYear}
              </p>
            </div>

            <div className="col-6 mb-3">
              <p className="mb-1 text-white">PROJECT COST</p>
              <p className="mb-1" style={{ color: "#D9D9D9" }}>
                {formatCurrencyNoDecimals(projectCost)}
              </p>
            </div>

            <div className="col-12 mb-3">{renderTreatmentContent()}</div>

            <div className="col-12 mb-3">
              <p className="mb-1 text-white">NOTES</p>
              <div
                className="border text-black p-2 rounded"
                style={{ backgroundColor: "#D9D9D9", height: "115px" }}
              >
                {firstFeature.Notes || "N/A"}
              </div>
            </div>
          </div>
        </div>
        {/* Save button*/}
        <div className="text-white  d-flex justify-content-end">
          <button
            className="btn d-flex  align-items-center gap-2"
            style={{
              background: "#03193eff",
              color: "#fff",
            }}
            onClick={() => {}}
          >
            {" "}
            SAVE
          </button>
        </div>
      </div>
    );
  };

  const renderTreatmentContent = () => {
    if (!projectData) return null;

    const { features } = projectData;
    const firstFeature = features?.[0]?.attributes || {};
    const treatmentList = [firstFeature];

    const handleEditTreatment = () => {
      // Handle edit treatment logic
    };

    return (
      <div>
        <h4
          style={{
            color: "#fff",
            fontWeight: "normal",
            marginBottom: "10px",
            display: "inline-block",
          }}
        >
          TREATMENTS
        </h4>
        <table
          className="table table-bordered table-striped"
          style={
            {
              "--bs-table-bg": "#15346A",
              "--bs-table-color": "#fff",
              "--bs-border-color": "#fff",
              "--bs-table-striped-color": "#fff",
              "--bs-table-hover-color": "#fff",
            } as React.CSSProperties
          }
        >
          <thead>
            <tr>
              <th>Type</th>
              <th>Section</th>
              <th>Treatment</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {treatmentList.map((item, index) => (
              <tr key={index}>
                <td>{item.TreatmentType}</td>
                <td>
                  {item.SectionFrom} - {item.SectionTo}
                </td>
                <td>{item.Treatment}</td>
                <td> {formatCurrencyNoDecimals(item.TotalCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Edit button below table */}
        <div className="mt-2 text-white  d-flex justify-content-end">
          <button
            className="btn d-flex  align-items-center gap-2"
            style={{
              background: "#03193eff",
              color: "#fff",
            }}
            onClick={() => handleEditTreatment()}
          >
            {" "}
            EDIT TREATMENT
            <img
              src={editIcon} // 👈 path to your SVG in public/assets
              alt="edit"
              style={{ width: "18px", height: "18px" }}
            />
          </button>
        </div>
      </div>
    );
  };

  const renderProjectsTab = () => {
    const handleStartClick = (e: React.MouseEvent) => {
      e.preventDefault();
      // No functionality - just visual button
    };

    const handleEndClick = (e: React.MouseEvent) => {
      e.preventDefault();
      // No functionality - just visual button
    };

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <a
              href="#start"
              className="d-flex align-items-center text-decoration-underline"
              onClick={handleStartClick}
              style={{ cursor: "pointer" }}
            >
              <img
                src={startMarker}
                alt="Start"
                style={{ width: "30px", height: "30px" }}
              />
              <span
                style={{ fontSize: "18px" }}
                className="text-white text-decoration-underline ms-1"
              >
                START
              </span>
            </a>
          </div>

          <div className="d-flex align-items-center gap-2">
            <a
              href="#end"
              className="d-flex align-items-center text-decoration-underline"
              onClick={handleEndClick}
              style={{ cursor: "pointer" }}
            >
              <img
                src={endMarker}
                alt="End"
                style={{ width: "30px", height: "30px" }}
              />
              <span
                style={{ fontSize: "18px" }}
                className="text-white text-decoration-underline me-1"
              >
                END
              </span>
            </a>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-4">
            <h4
              className="mb-2"
              style={{
                color: "#fff",
                fontWeight: "normal",
                paddingBottom: "2px",
                display: "inline-block",
                marginLeft: "15px",
              }}
            >
              PROJECT INFORMATION
            </h4>
            <div className="ms-3">{renderIdentificationContent()}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderChartsTab = () => {
    const { getTreatmentsFromDB, getSelectedScenario } = useApp();

    const computeData = () => {
      let scenarioId = getSelectedScenario();
      let treatments = getTreatmentsFromDB(scenarioId);

      let totalCostByYear: any = {};
      let treatmentBreakdownByYear: any = {};
      let costByTreatmentType: any = {};

      treatments.forEach((treatment) => {
        if (!totalCostByYear[treatment.Year]) {
          totalCostByYear[treatment.Year] = 0;
        }
        totalCostByYear[treatment.Year] += treatment.Cost;

        if (!treatmentBreakdownByYear[treatment.TreatType]) {
          treatmentBreakdownByYear[treatment.TreatType] = 0;
        }
        treatmentBreakdownByYear[treatment.TreatType] += 1;

        if (!costByTreatmentType[treatment.TreatType]) {
          costByTreatmentType[treatment.TreatType] = 0;
        }
        costByTreatmentType[treatment.TreatType] += treatment.Cost;
      });

      return {
        totalCostByYear,
        treatmentBreakdownByYear,
        costByTreatmentType,
      };
    };

    const chartData = computeData();

    return (
      <div>
        <h6
          className="mb-3"
          style={{
            color: "#679CE8",
            fontWeight: "normal",
            borderBottom: "1px solid #679CE8",
            paddingBottom: "2px",
            display: "inline-block",
          }}
        >
          CHARTS
        </h6>

        <div
          className="text-white d-flex flex-column gap-3"
          style={{ height: "calc(100vh - 300px)" }}
        >
          <div style={{ height: "33%" }}>
            <ChartComponent
              title="Total Cost by Year"
              data={chartData.totalCostByYear}
              type="bar"
              height="100%"
            />
          </div>
          <div style={{ height: "33%" }}>
            <ChartComponent
              title="Treatment Count by Type"
              data={chartData.treatmentBreakdownByYear}
              type="bar"
              height="100%"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={popupRef}
      className={`position-absolute top-0 end-0 ${open ? "open" : "closed"}`}
      style={{
        width,
        height: "77vh",
        zIndex: 800,
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        backgroundColor: "#15346A",
        backdropFilter: "blur(10px)",
        transition: "opacity 0.2s ease-in-out",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div className="d-flex flex-column h-100">
        <div className="d-flex justify-content-between align-items-center p-3">
          <div className="d-flex">
            <button
              className={`btn btn-link text-decoration-none px-3 py-2 ${
                activeTab === "projects" ? "" : ""
              }`}
              style={{
                color: activeTab === "projects" ? "#679CE8" : "#fff",
                borderBottom:
                  activeTab === "projects"
                    ? "2px solid #679CE8 "
                    : "transparent",
                backgroundColor: "transparent",
              }}
              onClick={() => setActiveTab("projects")}
            >
              PROJECTS
            </button>
            <button
              className={`btn btn-link text-decoration-none px-3 py-2 ${
                activeTab === "charts" ? "" : ""
              }`}
              style={{
                color: activeTab === "charts" ? "#679CE8" : "#fff",
                borderBottom:
                  activeTab === "charts" ? "2px solid #679CE8 " : "transparent",
                backgroundColor: "transparent",
              }}
              onClick={() => setActiveTab("charts")}
            >
              CHARTS
            </button>
          </div>

          <button
            className="btn btn-link text-decoration-none p-0"
            style={{ color: "#fff", fontSize: "1.2rem" }}
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="overflow-auto h-100 p-3" style={{ color: "#fff" }}>
          <div
            key={activeTab}
            style={{ transition: "opacity 0.2s ease-in-out" }}
          >
            {activeTab === "projects" ? renderProjectsTab() : renderChartsTab()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectPopup;
