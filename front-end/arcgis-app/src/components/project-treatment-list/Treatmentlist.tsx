import React, { useEffect, useState } from "react";
import style from "./Treatmentlist.module.css";
import ToggleButton from "../ToggleButton/ToggleButton";
import DynamicForm from "@/components/DynamicForm";
import editIcon from "@/assets/edit.svg";
import {
  costFields,
  locationInformationFields,
  projectInformationFields,
  timeFields,
} from "../formFields/fieldConfgis";
const headers = [
  "Asset Type",
  "District",
  "County",
  "Direction",
  "Total Cost",
  "Direction Cost",
  "Indirect Cost Design",
  "Indirect Cost Row",
  "Indirect Cost Utilities",
  "Other Cost",
];
const data = [
  {
    OBJECTID: 33,
    ProjectID: 33,
    SystemID: 1310006,
    DistrictNo: 6,
    CountyCode: 9,
    TreatmentID: "33",
    AssetType: "B",
    Route: 309,
    SectionFrom: 210,
    SectionTo: 210,
    BridgeID: "9030902100000",
    TreatmentType: "B",
    Treatment: "General Preservation",
    Year: 2031,
    DirectCost: 89769,
    DesignCost: 0,
    ROWCost: 0,
    UtilCost: 0,
    OtherCost: 0,
    IndirectCostDesign: null,
    IndirectCostOther: null,
    IndirectCostROW: null,
    IndirectCostUtilities: null,
    Direction: null,
    TotalCost: 89769,
  },
  {
    OBJECTID: 33,
    ProjectID: 33,
    SystemID: 1310006,
    DistrictNo: 6,
    CountyCode: 9,
    TreatmentID: "33",
    AssetType: "B",
    Route: 309,
    SectionFrom: 210,
    SectionTo: 210,
    BridgeID: "9030902100000",
    TreatmentType: "B",
    Treatment: "General Preservation",
    Year: 2031,
    DirectCost: 89769,
    DesignCost: 0,
    ROWCost: 0,
    UtilCost: 0,
    OtherCost: 0,
    IndirectCostDesign: null,
    IndirectCostOther: null,
    IndirectCostROW: null,
    IndirectCostUtilities: null,
    Direction: null,
    TotalCost: 89769,
  },
  {
    OBJECTID: 33,
    ProjectID: 33,
    SystemID: 1310006,
    DistrictNo: 6,
    CountyCode: 9,
    TreatmentID: "33",
    AssetType: "B",
    Route: 309,
    SectionFrom: 210,
    SectionTo: 210,
    BridgeID: "9030902100000",
    TreatmentType: "B",
    Treatment: "General Preservation",
    Year: 2031,
    DirectCost: 89769,
    DesignCost: 0,
    ROWCost: 0,
    UtilCost: 0,
    OtherCost: 0,
    IndirectCostDesign: null,
    IndirectCostOther: null,
    IndirectCostROW: null,
    IndirectCostUtilities: null,
    Direction: null,
    TotalCost: 89769,
  },
  {
    OBJECTID: 33,
    ProjectID: 33,
    SystemID: 1310006,
    DistrictNo: 6,
    CountyCode: 9,
    TreatmentID: "33",
    AssetType: "B",
    Route: 309,
    SectionFrom: 210,
    SectionTo: 210,
    BridgeID: "9030902100000",
    TreatmentType: "B",
    Treatment: "General Preservation",
    Year: 2031,
    DirectCost: 89769,
    DesignCost: 0,
    ROWCost: 0,
    UtilCost: 0,
    OtherCost: 0,
    IndirectCostDesign: null,
    IndirectCostOther: null,
    IndirectCostROW: null,
    IndirectCostUtilities: null,
    Direction: null,
    TotalCost: 89769,
  },
];

type Option = { label: string; value: string };

interface TreatmentListProps {}

export const Treatmentlist: React.FC<TreatmentListProps> = () => {
  const [isCommitted, setIsCommitted] = React.useState(false);
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (data) {
      console.log("Treatmentlist received data 👉", data);
    }
  });

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleEditTreatment = () => {
    // Handle edit treatment logic
  };

  const handleAddTreatment = () => {
    // Handle edit treatment logic
  };
  const deleteTreatment = () => {
    // Handle edit treatment logic
  };

  const handleChange = (id: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className={style["tp-container"]}>
      <div className={style["tp-toolbar"]}>
        <div className={style["tp-actions"]}>
          <div className="d-flex align-items-center">
            {" "}
            {/* Add button table */}{" "}
            <button
              className="btn d-flex align-items-center gap-2"
              style={{
                background: "#03193eff",
                color: "#fff",
              }}
              onClick={() => handleAddTreatment()}
            >
              ADD TREATMENTS
            </button>
            {/* Edit button table */}
            <div className="text-white  d-flex justify-content-end">
              <button
                className="btn d-flex  align-items-center gap-2"
                style={{
                  background: "#03193eff",
                  color: "#fff",
                  marginLeft: "10px",
                }}
                onClick={() => handleEditTreatment()}
              >
                {" "}
                EDIT TREATMENT
                <img src={editIcon} style={{ width: "18px", height: "18px" }} />
              </button>
            </div>{" "}
            {/* Delete */}
            <button
              className="btn d-flex align-items-center gap-2"
              style={{
                background: "#03193eff",
                color: "#fff",
                marginLeft: "10px",
              }}
              onClick={() => deleteTreatment()}
            >
              DELETE
            </button>
          </div>
          {/* close button removed; parent action button toggles panel */}
        </div>
      </div>

      {/* Table view */}

      <div style={{ margin: "0 10px" }}>
        <div className={style["tp-table-scroll"]}>
          <table
            className={`table table-bordered mb-0 ${style["tp-table-sticky"]}`}
          >
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(i)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows([...selectedRows, i]);
                          } else {
                            setSelectedRows(
                              selectedRows.filter((id) => id !== i)
                            );
                          }
                        }}
                      />

                      {row.AssetType || "-"}
                    </td>
                    <td>{row.DistrictNo || "-"}</td>
                    <td>{row.CountyCode || "-"}</td>
                    <td>{row.Direction || "-"}</td>
                    <td>{row.TotalCost || "-"}</td>
                    <td>{row.DirectCost || "-"}</td>
                    <td>{row.DesignCost || "-"}</td>
                    <td>{row.ROWCost || "-"}</td>
                    <td>{row.UtilCost || "-"}</td>
                    <td>{row.OtherCost || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form view */}
      <div style={{paddingTop :"20px", paddingBottom:"20px", maxHeight:"450px", overflow:"auto"}}>
        <div className={style["tp-forms-row"]}>
          {/* Project Information */}
          <div
            className={`${style["tp-form-card"]} ${style["tp-form-card--lg"]}`}
          >
            <div className={style["tp-form-title"]}>Project Information</div>
            <DynamicForm
              fields={projectInformationFields}
              values={formValues}
              onChange={handleChange}
              formClassName={style["tp-form-grid"]}
              fieldWrapperClassName={style["tp-form-field"]}
              labelClassName={style["tp-form-label"]}
              inputClassName={style["tp-form-input"]}
            />
            <label className={style["tl-toggle-row"]}>
              <span className={style["tl-toggle"]}>
                <input
                  type="checkbox"
                  className={style["tl-toggle-input"]}
                  checked={isCommitted}
                  onChange={(e) => setIsCommitted(e.target.checked)}
                />
                <span className={style["tl-toggle-slider"]}></span>
              </span>
              <span className={style["tl-toggle-text"]}>IS COMMITTED</span>
            </label>
          </div>

          {/* Location Information */}
          <div
            className={`${style["tp-form-card"]} ${style["tp-form-card--lg"]}`}
          >
            <div className={style["tp-form-title"]}>Location Information</div>
            <DynamicForm
              fields={locationInformationFields}
              values={formValues}
              onChange={handleChange}
              formClassName={style["tp-form-grid"]}
              fieldWrapperClassName={style["tp-form-field"]}
              labelClassName={style["tp-form-label"]}
              inputClassName={style["tp-form-input"]}
            />
          </div>

          {/* Timing */}
          <div
            className={`${style["tp-form-card"]} ${style["tp-form-card--sm"]}`}
          >
            <div className={style["tp-form-title"]}>Timing</div>
            <DynamicForm
              fields={timeFields}
              values={formValues}
              onChange={handleChange}
              formClassName={style["tp-form-grid--column"]}
              fieldWrapperClassName={style["tp-form-field"]}
              labelClassName={style["tp-form-label"]}
              inputClassName={style["tp-form-input"]}
            />
          </div>

          {/* Cost */}
          <div
            className={`${style["tp-form-card"]} ${style["tp-form-card--lg"]}`}
          >
            <div className={style["tp-form-title"]}>Cost</div>
            <DynamicForm
              fields={costFields}
              values={formValues}
              onChange={handleChange}
              formClassName={style["tp-form-grid"]}
              fieldWrapperClassName={style["tp-form-field"]}
              labelClassName={style["tp-form-label"]}
              inputClassName={style["tp-form-input"]}
            />
          </div>
        </div>
        {/* button code */}
        <div className="d-flex gap-2 flex-row justify-content-end" style={{marginRight:"30px"}}>
          <button
            className="btn d-flex align-items-center gap-2"
            style={{
              background: "#03193eff",
              color: "#fff",
              marginLeft: "10px",
            }}
            onClick={() => deleteTreatment()}
          >
            UPDATE
          </button>{" "}
          <button
            className="btn d-flex align-items-center gap-2"
            style={{
              background: "#03193eff",
              color: "#fff",
              marginLeft: "10px",
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Treatmentlist;
