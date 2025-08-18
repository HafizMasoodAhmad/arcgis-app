export interface ScenarioDto {
  ScenId: number;
  Name?: string;
  LibraryName?: string;
  LibraryId?: string;
  LastRunBy: string;
  LastRunTime?: string;
  Notes?: string;
}

export interface ProjectDto {
  ProjId: number;
  ScenarioId?: number;
  UserId?: string;
  UserNotes?: string;
  SchemaId?: number | null;
  ProjType?: number | null;
  Year?: number | null;
  NBridges?: number | null;
  NPave?: number | null;
  Cost?: number | null;
}

export interface TreatmentDto {
  TreatId?: number;
  ProjId: number;
  TreatmentId?: string;
  ProjType?: number | null;
  Treatment?: string;
  TreatType?: string;
  Dist?: number | null;
  Cnty?: number | null;
  Rte?: number | null;
  Dir?: number | null;
  FromSection?: number | null;
  ToSection?: number | null;
  BRKEY?: string;
  BRIDGE_ID?: number | null;
  Owner?: string;
  COUNTY?: string;
  ['MPO/RPO']?: string;
  Year?: number | null;
  Cost?: number | null;
  Benefit?: number | null;
  PreferredYear?: number | null;
  MinYear?: number | null;
  MaxYear?: number | null;
  PriorityOrder?: number | null;
  IsCommitted?: boolean;
  Risk?: number | null;
  IndirectCostDesign?: number | null;
  IndirectCostOther?: number | null;
  IndirectCostROW?: number | null;
  IndirectCostUtilities?: number | null;
  ['B/C']?: number | null;
  MPMSID?: string;
}


