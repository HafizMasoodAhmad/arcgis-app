export type Field = {
  id: string;
  label: string;
  type: "text" | "number" | "boolean"; // extend later with "select" | "checkbox" etc.
  placeholder?: string;
};
