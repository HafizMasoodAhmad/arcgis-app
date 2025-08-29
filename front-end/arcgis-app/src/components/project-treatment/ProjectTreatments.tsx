import React, { useState } from "react";
import addTreatmentIcon from "@/assets/addTreatment.svg"; // adjust alias if needed
import minusIcon from "@/assets/minus.svg";
import style from "./projectTreatment.module.css";
import Treatmentlist from "../project-treatment-list/Treatmentlist";

export default function ProjectTreatments() {
  const [showTreatmentList, setShowTreatmentList] = useState(false);

  return (
    <div style={{ background: "#C8D8E8", zIndex:1000}}>
      <div
        className={`${style["project-treatments-bar"]} d-flex align-items-center justify-content-between px-3`}
      >
        <span
          className="text-uppercase"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontStyle: "normal", // Bold is handled by fontWeight
            fontSize: "20px",
            lineHeight: "100%",
            letterSpacing: "0",
            color: "#15346A",
          }}
        >
          Project Treatments
        </span>

        <div className={style["project-treatments-action"]}>
          <button
            className={`${style["project-treatments-icon-btn"]}`}
            aria-haspopup="dialog"
            aria-expanded={showTreatmentList}
            onClick={() => setShowTreatmentList((prev) => !prev)}
            title={showTreatmentList ? "Hide Treatments" : "Show Treatments"}
          >
            <img
              src={showTreatmentList ? minusIcon : addTreatmentIcon}
              alt={showTreatmentList ? "Hide Treatments" : "Show Treatments"}
              className={`${style["project-treatments-icon"]}`}
            />
          </button>
        </div>
      </div>

      {showTreatmentList && <Treatmentlist />}
    </div>
  );
}
