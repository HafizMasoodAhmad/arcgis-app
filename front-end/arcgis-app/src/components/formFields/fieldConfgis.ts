import type { Field } from "@/types/formFieldsTypes";


export const projectInformationFields: Field[] = [
  { id: "assetType", label: "Asset Type", type: "text" },
  { id: "treatment", label: "Treatment", type: "text" },
  { id: "treatmentType", label: "Treatment Type", type: "text" },
  { id: "priority", label: "Priority", type: "text" },
  { id: "isCommitted", label: "Is Committed", type: "boolean" },
];

export const locationInformationFields: Field[] = [
  { id: "district", label: "District", type: "text" },
  { id: "county", label: "County", type: "text" },
  { id: "route", label: "Route", type: "text" },
  { id: "section", label: "Section", type: "text" },
  { id: "interstate", label: "Interstate", type: "text" },
  { id: "direction", label: "Direction", type: "text" },
];

export const timeFields: Field[] = [
  { id: "preferredYear", label: "Preferred Year", type: "number" },
  { id: "maximumYear", label: "Maximum Year", type: "number" },
  { id: "minimumYear", label: "Minimum Year", type: "number" },
];

export const costFields: Field[] = [
  { id: "totalCost", label: "Total Cost", type: "number" },
  { id: "constructionCost", label: "Construction Cost", type: "number" },
  { id: "indirectCostRow", label: "Indirect Cost Row", type: "number" },
  { id: "indirectCostUtilities", label: "Indirect Cost Utilities", type: "number" },
  { id: "indirectCostDesign", label: "Indirect Cost Design", type: "number" },
  { id: "indirectCostOther", label: "Indirect Cost Other", type: "number" },
];
