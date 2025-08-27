import React, { useEffect } from "react";
import style from "./Treatmentlist.module.css";
import ToggleButton from "../ToggleButton/ToggleButton";

type Option = { label: string; value: string };

interface TreatmentListProps {
  data:any [];
  onClose: () => void;
}

const TogglePill: React.FC<
  {
    label: string;
    active?: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ label, active, ...rest }) => (
  <button
    className={`${style["pill-btn"]} ${
      active ? style["pill-btn--active"] : ""
    }`}
    {...rest}
  >
    {label}
  </button>
);

const SmallSelect: React.FC<
  {
    placeholder: string;
    options?: Option[];
  } & React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ placeholder, options = [], ...rest }) => (
  <select className={style["field-select"]} {...rest}>
    <option value="" disabled selected hidden>
      {placeholder}
    </option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

export const Treatmentlist: React.FC<TreatmentListProps> = ({
  data,
  onClose,
}) => {
  const [isCommitted, setIsCommitted] = React.useState(false);

  const years: Option[] = Array.from({ length: 11 }).map((_, i) => {
    const y = 2020 + i;
    return { label: String(y), value: String(y) };
  });

  const counties: Option[] = [
    { label: "All Counties", value: "" },
    { label: "County A", value: "A" },
    { label: "County B", value: "B" },
  ];

  useEffect(() => {
    if (data) {
      console.log("Treatmentlist received data 👉", data);
    }
  }, [data]);

  return (
    <div className={style["tp-container"]}>
      <div className={style["tp-toolbar"]}>
        <div className={style["tp-toolbar-row"]}>
          <TogglePill label="Bridge"/>
          <TogglePill label="Substructure Rehab" />

          <ToggleButton
            checked={isCommitted}
            onChange={setIsCommitted}
            label="IS COMMITTED"
          />

          <SmallSelect
            placeholder="District 11"
            defaultValue="11"
            options={[{ label: "District 11", value: "11" }]}
          />

          <SmallSelect placeholder="Select Preferred Years" options={years} />

          <SmallSelect
            placeholder="Priority Order"
            options={[{ label: "High to Low", value: "hl" }]}
          />

          <SmallSelect placeholder="County" options={counties} />

          <SmallSelect placeholder="Minimum Year" options={years} />

          <SmallSelect placeholder="Maximum Year" options={years} />

          <button
            className={style["tp-close-btn"]}
            onClick={onClose}
            title="Close"
          >
            ✖
          </button>
        </div>

        <div className={style["tp-toolbar-row"]}>
          <TogglePill label="Cost" />
          <TogglePill label="Benefit" />
          <TogglePill label="Sections" />

          <SmallSelect
            placeholder="Select Treatment Type"
            options={[{ label: "Type A", value: "A" }]}
          />

          <TogglePill label="Risk" />
          <TogglePill label="Interstate" />
          <TogglePill label="Indirect Cost Design" />
          <TogglePill label="Indirect Cost Row" />
          <TogglePill label="Direction" />
          <TogglePill label="Indirection Cost Utilities" />
        </div>

        <div className={style["tp-actions"]}>
          <button className={style["tp-action-btn"]}>Edit</button>
          <button className={style["tp-action-btn"]}>Save</button>
          <button className={style["tp-action-btn"]}>Delete</button>
        </div>
      </div>

      <div className={style["tp-table"]}>
        <div className={style["tp-table-inner"]}>
          <div className={style["tp-table-head"]}>
            {[
              "Asset Type",
              "District",
              "County",
              "Direction",
              "Total Cost",
              "Direction Cost",
              "Indirect Cost Design",
              "Indirect Cost Row",
              "Indirect Cost Utilities",
              "Indirect Cost Utilities",
            ].map((h) => (
              <div key={h} className={style["tp-th"]}>
                {h}
              </div>
            ))}
          </div>

          <div className={style["tp-table-body"]}>
           {data.length > 0 ? (
    data.map((row, i) => (
      <div key={i} className={style["tp-tr"]}>
        <div className={style["tp-td"]}>{row.AssetType?row.AssetType:"-"}</div>
        <div className={style["tp-td"]}>{row.DistrictNo?row.DistrictNo:"-"}</div>
        <div className={style["tp-td"]}>{row.CountyCode?row.CountyCode:"-"}</div>
        <div className={style["tp-td"]}>{row.Direction?row.Direction:"-"}</div>
        <div className={style["tp-td"]}>{row.TotalCost?row.TotalCost:"-"}</div>
        <div className={style["tp-td"]}>{row.DirectCost?row.DirectCost:"-"}</div>
        <div className={style["tp-td"]}>{row.DesignCost?row.DesignCost:"-"}</div>
        <div className={style["tp-td"]}>{row.ROWCost?row.ROWCost:"-"}</div>
        <div className={style["tp-td"]}>{row.UtilCost?row.UtilCost:"-"}</div>
        <div className={style["tp-td"]}>{row.OtherCost?row.OtherCost:"-"}</div>
      </div>
    ))
  ) : (
    <div className={style["tp-tr"]}>
      <div className={style["tp-td"]} style={{ gridColumn: "1 / -1", textAlign: "center" }}>
        No data available
      </div>
    </div>
  )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Treatmentlist;
