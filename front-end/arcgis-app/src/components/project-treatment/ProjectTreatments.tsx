import React from "react";
import addTreatmentIcon from "@/assets/addTreatment.svg"; // adjust alias if needed
import style from "./projectTreatment.module.css";

export default function ProjectTreatments() {
  return (
    <div
      className={`${style["project-treatments-bar"]} d-flex align-items-center justify-content-between px-3`}
    >
      <span className="text-white text-uppercase small">
        Project Treatments
      </span>

      <div className={style["project-treatments-action"]}>
        <button
          className={`${style["project-treatments-icon-btn"]}`}
          aria-haspopup="dialog"
        >
          <img
            src={addTreatmentIcon}
            alt="Project Treatments Icon"
            className={`${style["project-treatments-icon"]}`}
          />
        </button>
      </div>
    </div>
  );
}
