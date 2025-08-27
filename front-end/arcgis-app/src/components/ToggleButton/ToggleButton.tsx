import React from "react";
import style from "./ToggleButton.module.css"

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

const ToggleButton: React.FC<ToggleProps> = ({ checked, onChange, label }) => (
  <label className={style["tp-switch"]}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className={style["tp-switch-input"]}
    />
    <span className={style["tp-switch-slider"]} />
    {label && <span className={style["tp-switch-label"]}>{label}</span>}
  </label>
);

export default ToggleButton;
