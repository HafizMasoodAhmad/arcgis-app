import React from "react";

type Field = {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
};

interface DynamicFormProps {
  fields: Field[];
  onChange: (id: string, value: string) => void;
  values: Record<string, string>;
  formClassName?: string;
  fieldWrapperClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onChange,
  values,
  formClassName,
  fieldWrapperClassName,
  labelClassName,
  inputClassName,
}) => {
  return (
    <form className={formClassName}>
      {fields.map((field) => (
        <div className={fieldWrapperClassName || "mb-3"} key={field.id}>
          <label htmlFor={field.id} className={labelClassName || "form-label"}>
            {field.label}
          </label>
          <input
            type={field.type || "text"}
            className={inputClassName || "form-control"}
            id={field.id}
            placeholder={field.placeholder || ""}
            value={values[field.id] || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        </div>
      ))}
    </form>
  );
};

export default DynamicForm;
