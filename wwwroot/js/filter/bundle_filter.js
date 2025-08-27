import { r as reactExports, j as jsxRuntimeExports, s, y, T, d as d$1, i as initSqlJs, u as use, a as init, b as install, c as install$1, e as install$2, f as install$3, g as install$4, h as install$5, k as install$6, l as install$7, m as s$1, C as C$1, n as f, X as Xe, _ as _$1, o as a, p as clientExports } from "./assets/vendor-CrINrUnp.js";
const AuthContext = reactExports.createContext(void 0);
const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isLoadingScenario, setIsLoadingScenario] = reactExports.useState(false);
  const [scenario, setScenario] = reactExports.useState(null);
  const dbObject = reactExports.useRef(null);
  const mapView = reactExports.useRef(null);
  const selectedScenario = reactExports.useRef(null);
  const selectedUser = reactExports.useRef(null);
  const filterValues = reactExports.useRef(null);
  const featureLayer = reactExports.useRef(null);
  const toggleLoading = (isLoading2) => {
    setIsLoading(isLoading2);
  };
  const toggleLoadingScenario = (isLoading2) => {
    setIsLoadingScenario(isLoading2);
  };
  const changeMapView = (view) => {
    mapView.current = view;
  };
  const changeFeatureLayer = (layer) => {
    featureLayer.current = layer;
  };
  const changeFilterValues = (values) => {
    filterValues.current = values;
  };
  const changeSelectedScenario = (scenarioId) => {
    setScenario(scenarioId);
    selectedScenario.current = scenarioId;
  };
  const changeSelectedUser = (userId) => {
    selectedUser.current = userId;
  };
  const getFilterValues = () => {
    return filterValues.current;
  };
  const getSelectedScenario = () => {
    return selectedScenario.current;
  };
  const getSelectedUser = () => {
    return selectedUser.current;
  };
  const getMapView = () => {
    return mapView.current;
  };
  const getFeatureLayer = () => {
    return featureLayer.current;
  };
  const createSqlLiteDB = async () => {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });
    dbObject.current = new SQL.Database();
    const db = dbObject.current;
    db.run(`
            CREATE TABLE IF NOT EXISTS Scenario (
                ScenId INTEGER PRIMARY KEY,
                Name TEXT,
                LibraryName TEXT,
                LibraryId TEXT,
                LastRunBy TEXT,
                LastRunTime TEXT,
                Notes TEXT
            )
        `);
    db.run(`
            CREATE TABLE IF NOT EXISTS Project (
                ProjId INTEGER PRIMARY KEY AUTOINCREMENT,
                ScenarioId INTEGER,
                UserId TEXT,
                UserNotes TEXT,
                SchemaId INTEGER,
                ProjType INTEGER,
                Year INTEGER,
                NBridges INTEGER,
                NPave INTEGER,
                Cost REAL,
                FOREIGN KEY (ScenarioId) REFERENCES Scenario(ScenId)
            )
        `);
    db.run(`
            CREATE TABLE IF NOT EXISTS Treatment (
                TreatId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                ProjId INTEGER NOT NULL,
                TreatmentId TEXT,
                ProjType INTEGER,
                Treatment TEXT,
                TreatType TEXT,
                Dist INTEGER,
                Cnty INTEGER,
                Rte INTEGER,
                Dir INTEGER,
                FromSection INTEGER,
                ToSection INTEGER,
                BRKEY TEXT,
                BRIDGE_ID INTEGER,
                Owner TEXT,
                COUNTY TEXT,
                MPO_RPO TEXT,
                Year INTEGER,
                Cost REAL,
                Benefit REAL,
                PreferredYear INTEGER,
                MinYear INTEGER,
                MaxYear INTEGER,
                PriorityOrder INTEGER,
                IsCommitted BOOLEAN,
                Risk REAL,
                IndirectCostDesign REAL,
                IndirectCostOther REAL,
                IndirectCostROW REAL,
                IndirectCostUtilities REAL,
                B_C REAL,
                MPMSID TEXT,
                FOREIGN KEY (ProjId) REFERENCES Project(ProjId)
            )
        `);
  };
  const loadDataFromJson = async (rawJson) => {
    const jsonData = JSON.parse(rawJson);
    const scenario2 = jsonData.Scenario;
    const projects = jsonData.Projects;
    const treatments = jsonData.Treatments;
    let projectsId = {};
    const db = dbObject.current;
    const [{ values }] = db.exec(`SELECT COUNT(*) FROM Scenario WHERE ScenId = ?`, [scenario2.ScenId]);
    if (values[0][0] > 0) {
      db.run(`
                DELETE FROM Treatment WHERE ProjId IN (SELECT ProjId FROM Project WHERE ScenarioId = ?)
            `, [scenario2.ScenId]);
      db.run(`
                DELETE FROM Project WHERE ScenarioId = ?
            `, [scenario2.ScenId]);
      db.run(`
                DELETE FROM Scenario WHERE ScenId = ?
            `, [scenario2.ScenId]);
    }
    db.run(`
            INSERT INTO Scenario (ScenId, Name, LibraryName, LibraryId, LastRunBy, LastRunTime, Notes) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [scenario2.ScenId, scenario2.Name, scenario2.LibraryName, scenario2.LibraryId, scenario2.LastRunBy, scenario2.LastRunTime, scenario2.Notes]);
    for (const project of projects) {
      db.run(`
                INSERT INTO Project (ScenarioId, UserId, UserNotes, SchemaId, ProjType, Year, NBridges, NPave, Cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [scenario2.ScenId, project.UserId || null, project.UserNotes || null, project.SchemaId || null, project.ProjType || null, project.Year || null, project.NBridges || null, project.NPave || null, project.Cost || null]);
      const [{ values: values2 }] = db.exec("SELECT last_insert_rowid();");
      projectsId[project.ProjId] = values2[0][0];
    }
    for (const treatment of treatments) {
      const projectId = projectsId[treatment.ProjId];
      db.run(`
                INSERT INTO Treatment (ProjId, TreatmentId, ProjType, Treatment, TreatType, Dist, Cnty, Rte, Dir, FromSection, ToSection, BRKEY, BRIDGE_ID, Owner, COUNTY, MPO_RPO, Year, Cost, Benefit, PreferredYear, MinYear, MaxYear, PriorityOrder, IsCommitted, Risk, IndirectCostDesign, IndirectCostOther, IndirectCostROW, IndirectCostUtilities, B_C, MPMSID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [projectId, treatment.TreatmentId || null, treatment.ProjType || null, treatment.Treatment || null, treatment.TreatType || null, treatment.Dist || null, treatment.Cnty || null, treatment.Rte || null, treatment.Dir || null, treatment.FromSection || null, treatment.ToSection || null, treatment.BRKEY || null, treatment.BRIDGE_ID || null, treatment.Owner || null, treatment.COUNTY || null, treatment["MPO/RPO"] || null, treatment.Year || null, treatment.Cost || null, treatment.Benefit || null, treatment.PreferredYear || null, treatment.MinYear || null, treatment.MaxYear || null, treatment.PriorityOrder || null, treatment.IsCommitted || null, treatment.Risk || null, treatment.IndirectCostDesign || null, treatment.IndirectCostOther || null, treatment.IndirectCostROW || null, treatment.IndirectCostUtilities || null, treatment["B/C"] || null, treatment.MPMSID || null]);
    }
    return scenario2;
  };
  const loadDataFromFile = async (file) => {
    const fileContent = await file.text();
    return await loadDataFromJson(fileContent);
  };
  const getScenariosFromDB = (userId) => {
    try {
      const db = dbObject.current;
      const [{ values }] = db.exec(`
                SELECT * FROM Scenario WHERE LastRunBy = ?
            `, [userId]);
      const scenarios = values.map((scenario2) => ({
        ScenId: scenario2[0],
        Name: scenario2[1],
        LibraryName: scenario2[2],
        LibraryId: scenario2[3],
        LastRunBy: scenario2[4],
        LastRunTime: scenario2[5],
        Notes: scenario2[6]
      }));
      return scenarios;
    } catch (error) {
      return [];
    }
  };
  const getProjectsFromDB = (scenarioId) => {
    try {
      const db = dbObject.current;
      const [{ values }] = db.exec(`
                SELECT * FROM Project WHERE ScenarioId = ?
            `, [scenarioId]);
      const projects = values.map((project) => ({
        ProjId: project[0],
        ScenarioId: project[1],
        UserId: project[2],
        UserNotes: project[3],
        SchemaId: project[4],
        ProjType: project[5],
        Year: project[6],
        NBridges: project[7],
        NPave: project[8],
        Cost: project[9]
      }));
      return projects;
    } catch (error) {
      return [];
    }
  };
  const getTreatmentsFromDB = (scenarioId) => {
    try {
      const db = dbObject.current;
      const [{ values }] = db.exec(`
                SELECT * FROM Treatment WHERE ProjId IN (SELECT ProjId FROM Project WHERE ScenarioId = ?)
            `, [scenarioId]);
      const treatments = values.map((treatment) => ({
        TreatId: treatment[0],
        ProjId: treatment[1],
        TreatmentId: treatment[2],
        ProjType: treatment[3],
        Treatment: treatment[4],
        TreatType: treatment[5],
        Dist: treatment[6],
        Cnty: treatment[7],
        Rte: treatment[8],
        Dir: treatment[9],
        FromSection: treatment[10],
        ToSection: treatment[11],
        BRKEY: treatment[12],
        BRIDGE_ID: treatment[13],
        Owner: treatment[14],
        COUNTY: treatment[15],
        MPO_RPO: treatment[16],
        Year: treatment[17],
        Cost: treatment[18],
        Benefit: treatment[19],
        PreferredYear: treatment[20],
        MinYear: treatment[21],
        MaxYear: treatment[22],
        PriorityOrder: treatment[23],
        IsCommitted: treatment[24],
        Risk: treatment[25],
        IndirectCostDesign: treatment[26],
        IndirectCostOther: treatment[27],
        IndirectCostROW: treatment[28],
        IndirectCostUtilities: treatment[29],
        B_C: treatment[30],
        MPMSID: treatment[31]
      }));
      return treatments;
    } catch (error) {
      return [];
    }
  };
  const getUniqueUsersFromDB = () => {
    try {
      const db = dbObject.current;
      const [{ values }] = db.exec(`
                SELECT DISTINCT LastRunBy FROM Scenario
            `);
      return values.map((user) => user[0]);
    } catch (error) {
      return [];
    }
  };
  const getTreatmentsPerProjectFromDB = (projectId) => {
    try {
      const db = dbObject.current;
      const [{ values }] = db.exec(`
                SELECT * FROM Treatment WHERE ProjId = ?
            `, [projectId]);
      return values.map((treatment) => ({
        TreatId: treatment[0],
        ProjId: treatment[1]
      }));
    } catch (error) {
      return [];
    }
  };
  const getProjectsFiltered = (scenarioId, filterValues2) => {
    if (!filterValues2) {
      return getProjectsFromDB(scenarioId);
    }
    const { route, year, assetType, treatment } = filterValues2;
    try {
      const db = dbObject.current;
      if (!db) return [];
      const hasValidFilters = route && route !== "" || year && year !== "" || treatment && treatment !== "" || assetType && assetType !== "";
      if (!hasValidFilters) {
        return getProjectsFromDB(scenarioId);
      }
      let queryWhere = [];
      let params = [];
      if (route && route.length > 0) {
        const placeholders = route.map(() => "?").join(",");
        queryWhere.push(`Rte IN (${placeholders})`);
        params = params.concat(route);
      }
      if (year && year.length > 0) {
        const placeholders = year.map(() => "?").join(",");
        queryWhere.push(`Year IN (${placeholders})`);
        params = params.concat(year);
      }
      if (treatment && treatment.length > 0) {
        const placeholders = treatment.map(() => "?").join(",");
        queryWhere.push(`Treatment IN (${placeholders})`);
        params = params.concat(treatment);
      }
      if (assetType && assetType.length > 0) {
        const placeholders = assetType.map(() => "?").join(",");
        queryWhere.push(`TreatType IN (${placeholders})`);
        params = params.concat(assetType);
      }
      let query2 = `
                SELECT p.ProjId, p.ScenarioId, p.UserId, p.UserNotes, p.SchemaId, p.ProjType, p.Year, p.NBridges, p.NPave, p.Cost
                FROM Project p
                WHERE p.ScenarioId = ? AND EXISTS (
                    SELECT 1 FROM Treatment t 
                    WHERE t.ProjId = p.ProjId
                    ${queryWhere.length > 0 ? ` AND ${queryWhere.join(" AND ")}` : ""}
                )
            `;
      const result = db.exec(query2, [scenarioId, ...params]);
      if (!result || result.length === 0) return [];
      const { values } = result[0];
      return values.map((row) => ({
        ProjId: row[0],
        ScenarioId: row[1],
        UserId: row[2],
        UserNotes: row[3],
        SchemaId: row[4],
        ProjType: row[5],
        Year: row[6],
        NBridges: row[7],
        NPave: row[8],
        Cost: row[9]
      }));
    } catch (error) {
      console.error("Error en getProjectsFiltered:", error);
      return [];
    }
  };
  const getTreatmentsFiltered = (scenarioId, filterValues2) => {
    if (!filterValues2) {
      return getTreatmentsFromDB(scenarioId);
    }
    const { route, year, assetType, treatment } = filterValues2;
    try {
      const db = dbObject.current;
      if (!db) return [];
      const hasValidFilters = route && route !== "" || year && year !== "" || treatment && treatment !== "" || assetType && assetType !== "";
      if (!hasValidFilters) {
        return getTreatmentsFromDB(scenarioId);
      }
      let queryWhere = [];
      let params = [];
      if (route && route.length > 0) {
        const placeholders = route.map(() => "?").join(",");
        queryWhere.push(`Rte IN (${placeholders})`);
        params = params.concat(route);
      }
      if (year && year.length > 0) {
        const placeholders = year.map(() => "?").join(",");
        queryWhere.push(`Year IN (${placeholders})`);
        params = params.concat(year);
      }
      if (treatment && treatment.length > 0) {
        const placeholders = treatment.map(() => "?").join(",");
        queryWhere.push(`Treatment IN (${placeholders})`);
        params = params.concat(treatment);
      }
      if (assetType && assetType.length > 0) {
        const placeholders = assetType.map(() => "?").join(",");
        queryWhere.push(`TreatType IN (${placeholders})`);
        params = params.concat(assetType);
      }
      const [{ values }] = db.exec(`
                SELECT * FROM Treatment WHERE ProjId IN (SELECT ProjId FROM Project WHERE ScenarioId = ?) ${queryWhere.length > 0 ? ` AND ${queryWhere.join(" AND ")}` : ""}
            `, [scenarioId, ...params]);
      return values.map((treatment2) => ({
        TreatId: treatment2[0],
        ProjId: treatment2[1],
        TreatmentId: treatment2[2],
        ProjType: treatment2[3],
        Treatment: treatment2[4],
        TreatType: treatment2[5],
        Dist: treatment2[6],
        Cnty: treatment2[7],
        Rte: treatment2[8],
        Dir: treatment2[9],
        FromSection: treatment2[10],
        ToSection: treatment2[11],
        BRKEY: treatment2[12],
        BRIDGE_ID: treatment2[13],
        Owner: treatment2[14],
        COUNTY: treatment2[15],
        MPO_RPO: treatment2[16],
        Year: treatment2[17],
        Cost: treatment2[18],
        Benefit: treatment2[19],
        PreferredYear: treatment2[20],
        MinYear: treatment2[21],
        MaxYear: treatment2[22],
        PriorityOrder: treatment2[23],
        IsCommitted: treatment2[24],
        Risk: treatment2[25],
        IndirectCostDesign: treatment2[26],
        IndirectCostOther: treatment2[27],
        IndirectCostROW: treatment2[28],
        IndirectCostUtilities: treatment2[29],
        B_C: treatment2[30],
        MPMSID: treatment2[31]
      }));
    } catch (error) {
      console.error("Error in getTreatmentsFiltered:", error);
      return [];
    }
  };
  const loadTreatments = async (scenario2) => {
    var _a, _b, _c, _d;
    try {
      const view = getMapView();
      const featureLayer2 = view.map.findLayerById("ScenarioTreatmentsLayer");
      const { Projects: Projects2, Treatments } = scenario2;
      if (!Projects2 || !Treatments) {
        console.warn("Scenario lacks Projects or Treatments array");
        return;
      }
      let graphics = [];
      let objectIdCounter = 1;
      let geometriesToProject = [];
      let chunkSize = 500;
      let allFeatures = [];
      const treatmentMetadata = [];
      for (let i = 0; i < Treatments.length; i += chunkSize) {
        const chunk = Treatments.slice(i, i + chunkSize);
        const clauses = [];
        for (const t of chunk) {
          const projId = t.ProjId || t.ProjectID;
          const foundProject = Projects2.find((p) => (p.ProjId || p.ProjectID) === projId);
          if (!foundProject) {
            console.warn(`No matching project for Treatment ${t.TreatmentId || t.TreatmentID}, ProjId=${projId}`);
            continue;
          }
          if (!(foundProject.ProjId || foundProject.ProjectID) || !(foundProject.SchemaId || foundProject.SystemID)) {
            console.warn(`Skipping project due to missing identifiers:`, foundProject);
            continue;
          }
          const countyVal = t.Cnty ?? foundProject.County;
          const routeVal = t.Rte ?? t.Route;
          if (!countyVal || !routeVal) {
            console.warn(`Skipping treatment ${t.TreatmentId || t.TreatmentID} due to missing county/route`, { countyVal, routeVal, t });
            continue;
          }
          const fromSec = t.FromSection || t.SectionFrom;
          const toSec = t.ToSection || t.SectionTo;
          if (fromSec == null || toSec == null) {
            console.warn(`Missing section info for treatment ${t.TreatmentId || t.TreatmentID}`, t);
            continue;
          }
          const countyValStr = countyVal.toString().padStart(2, "0");
          const routeValStr = routeVal.toString().padStart(4, "0");
          const fromSecStr = fromSec.toString().padStart(4, "0");
          const toSecStr = toSec.toString().padStart(4, "0");
          clauses.push(`(
                        CTY_CODE='${countyValStr}'
                        AND ST_RT_NO='${routeValStr}'
                        AND SEG_NO >= '${fromSecStr}'
                        AND SEG_NO <= '${toSecStr}'
                    )`);
          treatmentMetadata.push({
            treatment: t,
            project: foundProject,
            county: countyValStr,
            route: routeValStr,
            fromSec: fromSecStr,
            toSec: toSecStr
          });
        }
        const combinedWhereClause = clauses.join(" OR ");
        const params = {
          where: combinedWhereClause,
          returnGeometry: true,
          outFields: ["ST_RT_NO", "CTY_CODE", "DISTRICT_NO", "SEG_NO", "DISTRICT_NO"],
          outSR: view.spatialReference.wkid
        };
        const maxRecords = 2e3;
        let offset = 0;
        let hasMore = true;
        while (hasMore) {
          const { features, exceededTransferLimit } = await s(
            "https://gis.penndot.gov/arcgis/rest/services/opendata/roadwaysegments/MapServer/0",
            {
              ...params,
              resultOffset: offset.toString(),
              resultRecordCount: maxRecords.toString()
            }
          );
          console.log(`➡️ Pulled ${(features == null ? void 0 : features.length) ?? 0} features at offset ${offset}`);
          allFeatures.push(...features ?? []);
          if (exceededTransferLimit) {
            offset += maxRecords;
          } else {
            hasMore = false;
          }
        }
        for (const feature of allFeatures) {
          const f2 = feature.attributes;
          const featureCounty = (_a = f2.CTY_CODE) == null ? void 0 : _a.toString().padStart(2, "0");
          const featureRoute = (_b = f2.ST_RT_NO) == null ? void 0 : _b.toString().padStart(4, "0");
          const featureSeg = (_c = f2.SEG_NO) == null ? void 0 : _c.toString().padStart(4, "0");
          const match = treatmentMetadata.find(
            (meta) => meta.county === featureCounty && meta.route === featureRoute && meta.fromSec <= featureSeg && meta.toSec >= featureSeg
          );
          if (!match) {
            console.warn("❌ Could not match feature to a treatment:", feature.attributes);
            continue;
          }
          geometriesToProject.push({
            geometry: new y(feature.geometry),
            treatment: match.treatment,
            project: match.project
          });
        }
      }
      if (!geometriesToProject.length) {
        console.warn("No valid geometries found for projection.");
        return;
      }
      const grouped = {};
      geometriesToProject.forEach((g) => {
        const t = g.treatment;
        const projKey = t.ProjId ?? t.ProjectID;
        const treatKey = t.TreatId ?? t.TreatmentId ?? t.TreatmentID;
        const groupKey = `${projKey}_${treatKey}`;
        grouped[groupKey] = grouped[groupKey] || [];
        grouped[groupKey].push(g.geometry);
      });
      for (const key in grouped) {
        const [projIDStr, treatIDStr] = key.split("_");
        const projID = parseInt(projIDStr, 10);
        const found = geometriesToProject.find((g) => {
          const rowProjId = g.treatment.ProjId ?? g.treatment.ProjectID;
          const rowTreatId = g.treatment.TreatId ?? g.treatment.TreatmentId ?? g.treatment.TreatmentID;
          return rowProjId === projID && String(rowTreatId) === treatIDStr;
        });
        if (!found) continue;
        const unioned = T(grouped[key]);
        const t = found.treatment;
        const p = found.project;
        if (!p || !t) {
          console.warn(`Skipping Treatment ${(t == null ? void 0 : t.TreatmentId) || (t == null ? void 0 : t.TreatmentID)} due to missing data`);
          continue;
        }
        const atts = {
          OBJECTID: objectIdCounter++,
          ProjectID: p.ProjId ?? p.ProjectID,
          SystemID: p.SchemaId ?? p.SystemID,
          DistrictNo: t.Dist ?? t.DISTRICT_NO,
          CountyCode: t.Cnty,
          CountyName: t.County,
          TreatmentID: t.TreatId ?? t.TreatmentId ?? t.TreatmentID,
          AssetType: t.TreatType ?? t.AssetType,
          Route: t.Rte ?? t.Route,
          SectionFrom: t.FromSection ?? t.SectionFrom,
          SectionTo: t.ToSection ?? t.SectionTo,
          BridgeID: t.BRIDGE_ID ?? t.BridgeID ?? "",
          TreatmentType: t.TreatType ?? t.TreatmentType,
          Treatment: t.Treatment,
          Year: t.Year,
          DirectCost: t.Cost ?? t.DirectCost ?? 0,
          DesignCost: t.DesignCost ?? 0,
          ROWCost: t.ROWCost ?? 0,
          UtilCost: t.UtilCost ?? 0,
          OtherCost: t.OtherCost ?? 0
        };
        graphics.push(
          new d$1({
            geometry: unioned,
            attributes: atts
          })
        );
      }
      const validGraphics = graphics.filter(
        (g) => g.geometry && g.attributes && g.attributes.ProjectID
      );
      if (!validGraphics.length) {
        console.error("No valid graphics to add to FeatureLayer!");
        return;
      }
      if (((_d = featureLayer2.source) == null ? void 0 : _d.length) > 0) {
        featureLayer2.source.removeAll();
      }
      if (featureLayer2.definitionExpression) {
        featureLayer2.definitionExpression = null;
      }
      const current = await featureLayer2.queryFeatures();
      await featureLayer2.applyEdits({ deleteFeatures: current.features, addFeatures: validGraphics });
      featureLayer2.refresh();
      if (validGraphics.length > 0) {
        let result = await featureLayer2.queryExtent();
        const expandedExtent = result.extent.expand(1.2);
        view.goTo({ target: expandedExtent });
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };
  const value = {
    isLoading,
    isLoadingScenario,
    scenario,
    getFilterValues,
    getSelectedScenario,
    getSelectedUser,
    getMapView,
    getFeatureLayer,
    getProjectsFiltered,
    changeFilterValues,
    changeSelectedScenario,
    changeSelectedUser,
    changeFeatureLayer,
    changeMapView,
    toggleLoading,
    toggleLoadingScenario,
    createSqlLiteDB,
    loadDataFromFile,
    loadDataFromJson,
    getScenariosFromDB,
    getProjectsFromDB,
    getTreatmentsFromDB,
    getUniqueUsersFromDB,
    getTreatmentsPerProjectFromDB,
    getTreatmentsFiltered,
    loadTreatments
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthContext.Provider, { value, children });
};
const useApp = () => {
  const context = reactExports.useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
const Loading = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "loading-overlay", className: "loading-overlay w-100 h-100 position-absolute", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading-spinner" }) });
};
const STORAGE_KEYS = {
  filtersPrefix: "pdot:filters:",
  scenarioRawJson: "pdot:scenario:rawJson",
  scenarioPending: "pdot:scenario:pendingImport"
};
const Projects = () => {
  const { getProjectsFiltered, getTreatmentsPerProjectFromDB, getFilterValues, getSelectedScenario } = useApp();
  const [allProjects, setAllProjects] = reactExports.useState([]);
  const [filteredProjects, setFilteredProjects] = reactExports.useState([]);
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const projectsPerPage = 20;
  const labelStyle = { color: "var(--primary-100)" };
  reactExports.useEffect(() => {
    loadProjects();
    const handler = () => loadProjects();
    window.addEventListener("filter-updated", handler);
    return () => window.removeEventListener("filter-updated", handler);
  }, []);
  const loadProjects = () => {
    let filterValues = getFilterValues();
    let scenarioId = getSelectedScenario();
    const projects = getProjectsFiltered(scenarioId, filterValues);
    setAllProjects(projects);
    setFilteredProjects(projects);
    setCurrentPage(1);
    setSearchTerm("");
  };
  const getCurrentProjects = () => {
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  };
  const getTotalPages = () => {
    return Math.ceil(filteredProjects.length / projectsPerPage);
  };
  const changePage = (page) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1);
    if (!searchValue.trim()) {
      setFilteredProjects(allProjects);
      return;
    }
    const filtered = allProjects.filter(
      (project) => project.SchemaId.toString().toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredProjects(filtered);
  };
  const generatePageNumbers = (currentPage2, totalPages) => {
    const maxVisiblePages = 5;
    let pageNumbers = [];
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage2;
        pageNumbers.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: `page-item ${i === currentPage2 ? "active" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "page-link",
              style: {
                backgroundColor: isActive ? "var(--theme-secondary)" : "var(--primary-700)",
                color: isActive ? "var(--white)" : "var(--primary-100)",
                borderColor: isActive ? "var(--theme-secondary)" : "var(--primary-400)",
                fontWeight: isActive ? 700 : 400
              },
              onClick: () => changePage(i),
              children: i
            }
          ) }, i)
        );
      }
    } else {
      let startPage = Math.max(1, currentPage2 - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      if (startPage > 1) {
        pageNumbers.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "page-item", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "page-link", style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" }, onClick: () => changePage(1), children: "1" }) }, "first")
        );
        pageNumbers.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "page-item disabled", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "page-link", style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" }, children: "..." }) }, "ellipsis1")
        );
      }
      for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage2;
        pageNumbers.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: `page-item ${i === currentPage2 ? "active" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "page-link",
              style: {
                backgroundColor: isActive ? "var(--theme-secondary)" : "var(--primary-700)",
                color: isActive ? "var(--white)" : "var(--primary-100)",
                borderColor: isActive ? "var(--theme-secondary)" : "var(--primary-400)",
                fontWeight: isActive ? 700 : 400
              },
              onClick: () => changePage(i),
              children: i
            }
          ) }, i)
        );
      }
      if (endPage < totalPages) {
        pageNumbers.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "page-item disabled", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "page-link", style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" }, children: "..." }) }, "ellipsis2")
        );
        pageNumbers.push(
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "page-item", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "page-link", style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" }, onClick: () => changePage(totalPages), children: totalPages }) }, "last")
        );
      }
    }
    return pageNumbers;
  };
  const renderTreatmentCard = (treatment) => {
    var _a, _b, _c, _d, _e, _f, _g;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "treatment-card mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card border-0 shadow-sm", style: { backgroundColor: "rgba(8, 24, 56, 0.8)", color: "var(--primary-100)", border: "1px solid var(--primary-400)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-header", style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderBottom: "1px solid var(--primary-400)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h6", { className: "mb-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-tools me-2" }),
          "Treatment: ",
          treatment.Treatment
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "badge", style: { backgroundColor: "var(--primary-400)", color: "var(--white)" }, children: treatment.TreatType })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-body", style: { color: "var(--primary-100)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row g-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Project ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: treatment.ProjId })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Asset Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: treatment.ProjType })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "County" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: treatment.Cnty })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Route" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: treatment.Rte })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Section" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-value", children: [
            treatment.FromSection,
            "-",
            treatment.ToSection || ""
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "BRKEY" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: treatment.BRKEY })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "MPMS ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: treatment.MPMSID })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Preferred Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: treatment.PreferredYear })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Min Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: treatment.MinYear })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Max Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: treatment.MaxYear })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Benefit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-value text-success fw-bold", children: [
            "$",
            parseFloat(((_a = treatment.Benefit) == null ? void 0 : _a.toString()) || "0").toLocaleString()
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Direct Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-value text-danger fw-bold", children: [
            "$",
            parseFloat(((_b = treatment.Cost) == null ? void 0 : _b.toString()) || "0").toLocaleString()
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Total Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-value text-primary fw-bold", children: [
            "$",
            parseFloat(((_c = treatment.Cost) == null ? void 0 : _c.toString()) || "0").toLocaleString()
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "my-3", style: { borderTop: "1px solid var(--primary-400)" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h6", { className: "mb-3", style: { color: "var(--primary-100)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-calculator me-2" }),
            "Indirect Costs"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row g-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Design" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-value", children: [
                "$",
                parseFloat(((_d = treatment.IndirectCostDesign) == null ? void 0 : _d.toString()) || "0").toLocaleString()
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "ROW" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-value", children: [
                "$",
                parseFloat(((_e = treatment.IndirectCostROW) == null ? void 0 : _e.toString()) || "0").toLocaleString()
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Utilities" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-value", children: [
                "$",
                parseFloat(((_f = treatment.IndirectCostUtilities) == null ? void 0 : _f.toString()) || "0").toLocaleString()
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6 col-lg-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Other" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-value", children: [
                "$",
                parseFloat(((_g = treatment.IndirectCostOther) == null ? void 0 : _g.toString()) || "0").toLocaleString()
              ] })
            ] }) })
          ] })
        ] })
      ] }) })
    ] }) }, treatment.TreatId);
  };
  const renderProjectCard = (project) => {
    var _a;
    const treatments = getTreatmentsPerProjectFromDB(project.ProjId.toString());
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "project-card mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card border-0 shadow-sm", style: { backgroundColor: "rgba(8, 24, 56, 0.8)", color: "var(--primary-100)", border: "1px solid var(--primary-400)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-header", style: { backgroundColor: "var(--primary-800)", color: "var(--primary-100)", borderBottom: "1px solid var(--primary-400)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h5", { className: "mb-0 text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-project-diagram me-2" }),
          "Project: ",
          project.SchemaId
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "badge", style: { backgroundColor: "var(--primary-400)", color: "var(--white)" }, children: [
          "District ",
          project.ProjType
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-body", style: { color: "var(--primary-100)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row g-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "project-section", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h6", { className: "mb-3", style: { color: "var(--primary-100)" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-info-circle me-2" }),
              "Project Identification"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row g-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Schema ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: project.SchemaId })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "District" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: project.ProjType })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "County" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: project.ProjType })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Route" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: project.ProjType })
              ] }) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "project-section", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h6", { className: "mb-3", style: { color: "var(--primary-100)" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-edit me-2" }),
              "Project Description"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row g-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "User ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: project.UserId })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Year" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "info-value", children: project.Year })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "form-label fw-bold small", style: labelStyle, children: "Project Cost" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "info-value text-danger fw-bold", children: [
                  "$",
                  parseFloat(((_a = project.Cost) == null ? void 0 : _a.toString()) || "0").toLocaleString()
                ] })
              ] }) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "project-section", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h6", { className: "mb-3", style: { color: "var(--primary-100)" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-sticky-note me-2" }),
              "Notes"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "notes-container", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                className: "form-control",
                rows: 4,
                placeholder: "Enter notes here...",
                style: { resize: "vertical", backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" },
                defaultValue: project.UserNotes || ""
              }
            ) })
          ] }) })
        ] }),
        treatments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "treatments-section", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h5", { className: "mb-3", style: { color: "var(--primary-100)" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-list-alt me-2" }),
            "Treatments (",
            treatments.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "treatments-container", children: treatments.map((treatment) => renderTreatmentCard(treatment)) })
        ] }) }) })
      ] })
    ] }) }, project.ProjId);
  };
  const renderPaginationControls = () => {
    const totalPages = getTotalPages();
    const startIndex = (currentPage - 1) * projectsPerPage + 1;
    const endIndex = Math.min(currentPage * projectsPerPage, filteredProjects.length);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-100 d-flex flex-column gap-2 align-items-center mt-3 p-3", style: { backgroundColor: "var(--primary-800)", borderTop: "1px solid var(--primary-400)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "12px", color: "var(--primary-100)" }, children: [
        "Showing ",
        startIndex,
        " to ",
        endIndex,
        " of ",
        filteredProjects.length,
        " projects",
        searchTerm && ` (filtered from ${allProjects.length} total)`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "d-flex justify-content-between align-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "d-flex align-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { "aria-label": "Project pagination", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "pagination pagination-sm mb-0", style: { "--bs-pagination-active-bg": "var(--theme-secondary)", "--bs-pagination-active-border-color": "var(--theme-secondary)" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: `page-item ${currentPage === 1 ? "disabled" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "page-link",
            style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" },
            onClick: () => changePage(1),
            disabled: currentPage === 1,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-angle-double-left" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: `page-item ${currentPage === 1 ? "disabled" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "page-link",
            style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" },
            onClick: () => changePage(currentPage - 1),
            disabled: currentPage === 1,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-angle-left" })
          }
        ) }),
        generatePageNumbers(currentPage, totalPages),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: `page-item ${currentPage === totalPages ? "disabled" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "page-link",
            style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" },
            onClick: () => changePage(currentPage + 1),
            disabled: currentPage === totalPages,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-angle-right" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: `page-item ${currentPage === totalPages ? "disabled" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "page-link",
            style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" },
            onClick: () => changePage(totalPages),
            disabled: currentPage === totalPages,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-angle-double-right" })
          }
        ) })
      ] }) }) }) })
    ] });
  };
  if (!getSelectedScenario()) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "alert alert-warning", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-exclamation-triangle me-2" }),
      "Please select a scenario first"
    ] });
  }
  const currentProjects = getCurrentProjects();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "projects-container d-flex flex-column gap-2 overflow-hidden h-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "search-container p-3", style: { backgroundColor: "var(--primary-800)", color: "var(--primary-100)", borderBottom: "1px solid var(--primary-400)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row g-2 align-items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "input-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "input-group-text", style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-search" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            className: "form-control search-input",
            placeholder: "Search by Schema ID...",
            value: searchTerm,
            onChange: (e) => handleSearch(e.target.value),
            style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)", borderColor: "var(--primary-400)" }
          }
        ),
        searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn btn-outline-primary",
            type: "button",
            onClick: () => handleSearch(""),
            title: "Clear search",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-times" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex justify-content-end align-items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "small me-2", style: { color: "var(--primary-100)" }, children: [
          filteredProjects.length,
          " of ",
          allProjects.length,
          " projects"
        ] }),
        searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn btn-sm btn-outline-primary",
            onClick: () => handleSearch(""),
            children: "Clear Filter"
          }
        )
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "project-info-body h-100 overflow-auto", style: { color: "var(--primary-100)" }, children: currentProjects.length > 0 ? currentProjects.map((project) => renderProjectCard(project)) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fas fa-search fa-3x mb-3", style: { color: "var(--primary-100)" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { style: { color: "var(--primary-100)" }, children: "No projects found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "var(--primary-100)" }, children: searchTerm ? `No projects match "${searchTerm}"` : "No projects available" }),
      searchTerm && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "btn btn-outline-primary",
          onClick: () => handleSearch(""),
          children: "Clear Search"
        }
      )
    ] }) }),
    filteredProjects.length > 0 && renderPaginationControls()
  ] });
};
const ButtonWidget = ({ title, className, disabled, onClick, children, selected }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      className: `px-4 btn ${selected ? "btn-secondary" : "btn-primary"} ${className ? className : ""}`,
      disabled: disabled == true ? disabled : false,
      title,
      onClick,
      style: { width: "auto", height: "40px", padding: "5px", boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)" },
      children
    }
  );
};
use([
  install,
  install$1,
  install$2,
  install$3,
  install$4,
  install$5,
  install$6,
  install$7
]);
const ChartComponent = ({
  title,
  data,
  type,
  height = "100%",
  width = "100%"
}) => {
  const chartRef = reactExports.useRef(null);
  const chartInstance = reactExports.useRef(null);
  const createChartOptions = () => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const baseOptions = {
      backgroundColor: "transparent",
      title: {
        text: title,
        textStyle: {
          color: "#ffffff",
          fontSize: 14,
          fontWeight: "normal"
        }
      },
      tooltip: {
        trigger: "axis",
        textStyle: {
          color: "#ffffff"
        }
      },
      legend: {
        show: false,
        textStyle: {
          color: "#ffffff"
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      }
    };
    if (type === "bar") {
      return {
        ...baseOptions,
        xAxis: {
          type: "category",
          data: keys,
          axisLabel: {
            color: "#ffffff"
          },
          axisLine: {
            lineStyle: {
              color: "#ffffff"
            }
          }
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#ffffff"
          },
          axisLine: {
            lineStyle: {
              color: "#ffffff"
            }
          }
        },
        series: [
          {
            name: title,
            data: values,
            type: "bar",
            itemStyle: {
              color: "#ffffff"
            },
            emphasis: {
              itemStyle: {
                color: "#ffffff"
              }
            }
          }
        ]
      };
    }
    if (type === "line") {
      return {
        ...baseOptions,
        xAxis: {
          type: "category",
          data: keys,
          axisLabel: {
            color: "#ffffff"
          },
          axisLine: {
            lineStyle: {
              color: "#ffffff"
            }
          }
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#ffffff"
          },
          axisLine: {
            lineStyle: {
              color: "#ffffff"
            }
          }
        },
        series: [
          {
            name: title,
            data: values,
            type: "line",
            itemStyle: {
              color: "#ffffff"
            },
            lineStyle: {
              color: "#ffffff"
            },
            emphasis: {
              itemStyle: {
                color: "#ffffff"
              }
            }
          }
        ]
      };
    }
    if (type === "pie") {
      return {
        ...baseOptions,
        series: [
          {
            name: title,
            type: "pie",
            radius: "50%",
            data: keys.map((key, index) => ({
              name: key,
              value: values[index]
            })),
            itemStyle: {
              color: "#ffffff"
            },
            label: {
              color: "#ffffff"
            },
            emphasis: {
              itemStyle: {
                color: "#ffffff"
              }
            }
          }
        ]
      };
    }
    return baseOptions;
  };
  reactExports.useLayoutEffect(() => {
    if (chartRef.current && data) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = init(chartRef.current, "dark");
      const options = createChartOptions();
      chartInstance.current.setOption(options);
      const resizeObserver = new ResizeObserver(() => {
        if (chartInstance.current) {
          chartInstance.current.resize();
        }
      });
      resizeObserver.observe(chartRef.current);
      return () => {
        resizeObserver.disconnect();
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, [data, type, title]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: chartRef,
      style: {
        width,
        height,
        zIndex: 1e3,
        position: "relative"
      }
    }
  );
};
function RightPanel(props) {
  const { title, open, onClose, width = 520, children } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `position-absolute top-0 start-0 h-100 ${open ? "open" : "closed"}`,
      style: {
        width,
        zIndex: 700,
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        backgroundColor: "rgba(8, 24, 56, 0.8)",
        backdropFilter: "blur(10px)"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex flex-column h-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "d-flex justify-content-between align-items-center p-1",
            style: {
              backgroundColor: "var(--primary-800)",
              color: "var(--primary-100)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h6", { className: "mt-0 mb-0 p-2", children: title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn btn-sm btn-primary me-2", onClick: onClose, style: { border: "none", backgroundColor: "var(--primary-800)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-xmark" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto h-100 p-2", children })
      ] })
    }
  );
}
const editIcon = "data:image/svg+xml,%3csvg%20width='17'%20height='17'%20viewBox='0%200%2017%2017'%20fill='%23fff'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3crect%20width='17'%20height='17'%20fill='url(%23pattern0_36_154)'/%3e%3cdefs%3e%3cpattern%20id='pattern0_36_154'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_36_154'%20transform='scale(0.015625)'/%3e%3c/pattern%3e%3cimage%20id='image0_36_154'%20width='64'%20height='64'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,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'/%3e%3c/defs%3e%3c/svg%3e";
const greenMarkerSvg = "data:image/svg+xml,%3csvg%20width='24'%20height='39'%20viewBox='0%200%2024%2039'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3crect%20width='24'%20height='39'%20fill='url(%23pattern0_38_41)'/%3e%3cdefs%3e%3cpattern%20id='pattern0_38_41'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_38_41'%20transform='matrix(0.0153846%200%200%200.00946746%200%20-0.00650888)'/%3e%3c/pattern%3e%3cimage%20id='image0_38_41'%20width='65'%20height='107'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABrCAMAAAAfHh8nAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGlQTFRFB3da6enp////JohvZKqYRZmD4O7qoszBwd3Wg7ut9PT0NpF5VaKO7/b1/v7+0ebg+vr60OXgF4Bkg7usdLOiksO37+/v8fHx8Pf19/f36urq7OzssdTL8PDw8/Pzk8S37e3t9fX1////8VEJ7gAAACN0Uk5T/////////////////////////////////////////////wBmKYOWAAADVklEQVR42qyY6WKrIBCFMaxRaaOJabO1vb7/Q96KoKMCDtr514hfz8h2ZkgbDa2U0vEhJPSgahgnLjhrqjRCdaFkHvRSoQmyIP4oJIogKQkHlauEqiDxKKo44UzW4xwhaD4dy8tjF+X8Zx0iVPALFMf3wxjv3zA7WvkJVT2OYfB1C2Hj47ryEQCAiYMvBPMhBoIYAFQdQqGGPGsxJ+ghz/LTjX875fn1es3z05v76bMcvpOeEQaBF/f67ZWNcb05yHFIdUp4ut+lfT+/Z9O455Yh3dAnJOh6quD0yJbxOE1V1BoQXA5lPybP/PHVPy4neRiCcLPQf8SPLBQf/ed0MyIGgpOgVgAOoaAIAiSwaAowEQZEELAhzUo8ZfEwn1OAbdoRKJTwWCE83oAI2hMqC3xfz6GL3Gwz+05lCBe7TI2E+yrhbkTYTXAxBPvHsXtwy9bj1g38tv/WEGASLwThB6bREdzkmiQyTJg03BL6JdidwjFTCSbUnp3yl3AGWyJHEXKwOc4j4YgnfIEd2hE4IHygCFdA4DPCdTfhtYlQ7voO5Wwu/m2ai2bXemj+ZE3u3xd/sDf3nw/PHWfU0xA02XxOEt2ftHzzWc3tWd1svi+a2Y2TfGcNN46bz+R7sxjuzYbg7u78MMnBJDG9u9P8A7y729EsWg9zQHiYPglLGH8dfNRh4qNeSx/VndPABQHDOvVyr5CX65fT6MQY9LwYPzmaubmXQ3rahZcbPATSVzvvAAmLwiLm7SdlhiMIXy0SqC/AYoDOvCRpUS68/TORoJb1BU0CUE+F0iQRGg9B1wmAWvvqLJZAYN5KTSQQhL9a5GgAD9SbKn0q5zUvTZ7KOUEiCTJcueMmtI7U/mcU4RwhoFZVrWP9B5a2mjwEkbaafF0UliphQRCpEpa9IJ6woP0ElbCgA/0onibBQ1BpEnxdNZ4kwUeQ2D0V7uxR3LaO9QZTJPj7kzRBgp8gEyQEeqQULyFAkHgJoU4vRUsIESRaQrDbTLESggSJlRDueFOkhDBBIiWECTMRNL1vPxMhNxBa6CCLdgtBRY8mDAEcVrzdRlAYCVHCIIK3WwkKISFOsGa7bLcThPemTCGYq5y1ewhiVcIaob10TYpdBE31TkIr1gb8F2AAycuA0WML7kwAAAAASUVORK5CYII='/%3e%3c/defs%3e%3c/svg%3e";
const redMarkerSvg = "data:image/svg+xml,%3csvg%20width='24'%20height='39'%20viewBox='0%200%2024%2039'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3crect%20width='24'%20height='39'%20fill='url(%23pattern0_38_42)'/%3e%3cdefs%3e%3cpattern%20id='pattern0_38_42'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_38_42'%20transform='matrix(0.0153846%200%200%200.00946746%200%20-0.00650888)'/%3e%3c/pattern%3e%3cimage%20id='image0_38_42'%20width='65'%20height='107'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABrCAMAAAAfHh8nAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHJQTFRFyTcz6enp////5JuZ0FBN3YKA12lm9PT067Sy011Z+Obl2nZz8c3M/PLy9drZ/v7++vr6zERA9dnZ56el7+/v8fHx7Ozs4Y+N9/f36urq8s3M/PPy+Obm8PDw7sC/8/Pz4Y+M56im67Sz7e3t9fX1////mvWTXwAAACZ0Uk5T/////////////////////////////////////////////////wCneoG8AAADXUlEQVR42qyY22KkIAyGcQTEA+2o0zm1M9121/d/xa0IGhEwaHPVKn7zBwIkIV3QZFVVMjyE+F40LePEGGdtE0doLpTYRi8NmiBy4rZcoAiCEr9RsUpochK2vAkTUrJuaYAg+XwsL9PeSvux9BEaOAN5+nKY7OULekcbN6GppzEMfq4hbHpdNy4CALCPg8s+mAsxEooRQO8Hn91HP+vCJsjRz/LdjH89ZtnpdMqy46t59F6O8yQtwijwj/n8+kgmO10NZFxvNic8zfNv/X12S+Z2yzTj2wx9QoKs5wqO52Rp5+NcRS0BwfhQDmOyxG2fw+ty5ociFGYVhkl8S3z2NkynWZFiJBgJ9xWAQdyhCAIksKAL0BEGRBCwIVUkHpOwqen8ANu0J1Ao4bxCOL8CEXQgNBr4su5Db5naZvqbRhEuOkyVhNsq4aZE6E1wUQT9T9q/uCbrdu0HfumfVQToxANB+Avd6AmV/ls5kWBMuaG/qn4IQh9+mKUEC6rPTvFDSMGWyFCEDGyOdCKkeMIn2KE9gQPCG4pwAgRuEU67CY9NhHLXPJTWWvzbtBbtrnhofyUm9++LX9ib+8+H544z6qkIkmw+J4kcTlq++azm+qxuN98XrXXjRN9Z441j1jP63szHe7MluLs7O8x8UE7M7+64/AHe3d2ULOoc5oDIYQYnNEEQW8VPgMM98ljmUf05DbIgkLDOc7mHL5cbwmnKxBjMeTH55JTM2bkcMqdd5HJjDoHMq03uAAmLwiKU28/KDEMoXLWIp74AwQAz85LEWbnI7Z+RhGpZX9AoAHVUKG0UoXUQZB0BqKWrzmIRBOas1IoIQuGuFjkawD31ZhW/lHbNS6OX0iYIJEH4K3fcgtaB2j9FEdIAARVVtQz1H1hcNDkIRVw0ubooLFbCglDESlj2gnhEQLsJVURAe/pRPE6Cg1DFSXB11XiUBBdBYPeUv7NHcds61BuMkeDuT9IICW6CiJDg6ZFSvAQPQeAl+Dq9FC3BRxBoCd5uM8VK8BIEVoK/402REvwEgZTgJ1giaHzf3hIhNhA6mEHm3RZCFTyaMARwWPFuG6HCSAgSRhG820qoEBLCBJ1sl912QuG8KWMI6ipn3R5CsSphjdBd+ibFLoKkciehK9YG/BdgAN/SoLCifGSBAAAAAElFTkSuQmCC'/%3e%3c/defs%3e%3c/svg%3e";
function ProjectPopup(props) {
  const { open, onClose, width = 400, children, projectData } = props;
  const [activeTab, setActiveTab] = reactExports.useState("projects");
  const [showInformation, setShowInformation] = reactExports.useState(true);
  const [showIdentification, setShowIdentification] = reactExports.useState(false);
  const [showDescription, setShowDescription] = reactExports.useState(false);
  const popupRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (open) {
      setShowInformation(true);
      setShowIdentification(true);
      setShowDescription(true);
      setActiveTab("projects");
    }
  }, [open]);
  const formatCurrencyNoDecimals = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };
  const renderIdentificationContent = () => {
    var _a;
    if (!projectData) return null;
    const { projectId, projectRoute, projectYear, projectCost, features } = projectData;
    const firstFeature = ((_a = features == null ? void 0 : features[0]) == null ? void 0 : _a.attributes) || {};
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontFamily: "sans-serif" }, className: "mt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-6 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-white", children: "PROJECT ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", style: { color: "#D9D9D9" }, children: projectId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-6 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-white", children: "ROUTE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1", style: { color: "#D9D9D9" }, children: projectRoute })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-6 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-white", children: "YEAR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1", style: { color: "#D9D9D9" }, children: projectYear })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-6 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-white", children: "PROJECT COST" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1", style: { color: "#D9D9D9" }, children: formatCurrencyNoDecimals(projectCost) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-12 mb-3", children: renderTreatmentContent() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-12 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-white", children: "NOTES" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "border text-black p-2 rounded",
              style: { backgroundColor: "#D9D9D9", height: "115px" },
              children: firstFeature.Notes || "N/A"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white  d-flex justify-content-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "btn d-flex  align-items-center gap-2",
          style: {
            background: "#03193eff",
            color: "#fff"
          },
          onClick: () => console.log("Save Button clicked"),
          children: [
            " ",
            "SAVE"
          ]
        }
      ) })
    ] });
  };
  const renderTreatmentContent = () => {
    var _a;
    if (!projectData) return null;
    const { features } = projectData;
    const firstFeature = ((_a = features == null ? void 0 : features[0]) == null ? void 0 : _a.attributes) || {};
    const treatmentList = [firstFeature];
    const handleEditTreatment = () => {
      console.log("Edit treatment clicked:");
    };
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h4",
        {
          style: {
            color: "#fff",
            fontWeight: "normal",
            marginBottom: "10px",
            display: "inline-block"
          },
          children: "TREATMENTS"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "table",
        {
          className: "table table-bordered table-striped",
          style: {
            "--bs-table-bg": "#15346A",
            "--bs-table-color": "#fff",
            "--bs-border-color": "#fff",
            "--bs-table-striped-color": "#fff",
            "--bs-table-hover-color": "#fff"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Section" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Treatment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Total Cost" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: treatmentList.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.TreatmentType }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
                item.SectionFrom,
                " - ",
                item.SectionTo
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: item.Treatment }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
                " ",
                formatCurrencyNoDecimals(item.TotalCost)
              ] })
            ] }, index)) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-white  d-flex justify-content-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          className: "btn d-flex  align-items-center gap-2",
          style: {
            background: "#03193eff",
            color: "#fff"
          },
          onClick: () => handleEditTreatment(),
          children: [
            " ",
            "EDIT TREATMENT",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: editIcon,
                alt: "edit",
                style: { width: "18px", height: "18px" }
              }
            )
          ]
        }
      ) })
    ] });
  };
  const renderProjectsTab = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex justify-content-between align-items-center mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "d-flex align-items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: "#start",
            className: "d-flex align-items-center text-decoration-underline",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: greenMarkerSvg,
                  alt: "Start",
                  style: { width: "18px", height: "18px" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-decoration-underline ms-1", children: "Start" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "d-flex align-items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: "#end",
            className: "d-flex align-items-center text-decoration-underline",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: redMarkerSvg,
                  alt: "End",
                  style: { width: "18px", height: "18px" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-decoration-underline me-1", children: "End" })
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h4",
          {
            className: "mb-2",
            style: {
              color: "#fff",
              fontWeight: "normal",
              paddingBottom: "2px",
              display: "inline-block",
              marginLeft: "15px"
            },
            children: "PROJECT INFORMATION"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ms-3", children: renderIdentificationContent() })
      ] }) })
    ] });
  };
  const renderChartsTab = () => {
    const { getTreatmentsFromDB, getSelectedScenario } = useApp();
    const computeData = () => {
      let scenarioId = getSelectedScenario();
      let treatments = getTreatmentsFromDB(scenarioId);
      let totalCostByYear = {};
      let treatmentBreakdownByYear = {};
      let costByTreatmentType = {};
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
        costByTreatmentType
      };
    };
    const chartData = computeData();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h6",
        {
          className: "mb-3",
          style: {
            color: "#679CE8",
            fontWeight: "normal",
            borderBottom: "1px solid #679CE8",
            paddingBottom: "2px",
            display: "inline-block"
          },
          children: "CHARTS"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-white d-flex flex-column gap-3",
          style: { height: "calc(100vh - 300px)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "33%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChartComponent,
              {
                title: "Total Cost by Year",
                data: chartData.totalCostByYear,
                type: "bar",
                height: "100%"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "33%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChartComponent,
              {
                title: "Treatment Count by Type",
                data: chartData.treatmentBreakdownByYear,
                type: "bar",
                height: "100%"
              }
            ) })
          ]
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: popupRef,
      className: `position-absolute top-0 end-0 ${open ? "open" : "closed"}`,
      style: {
        width,
        height: "77vh",
        zIndex: 800,
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        backgroundColor: "#15346A",
        backdropFilter: "blur(10px)",
        transition: "opacity 0.2s ease-in-out",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex flex-column h-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex justify-content-between align-items-center p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: `btn btn-link text-decoration-none px-3 py-2 ${activeTab === "projects" ? "" : ""}`,
                style: {
                  color: activeTab === "projects" ? "#679CE8" : "#fff",
                  borderBottom: activeTab === "projects" ? "2px solid #679CE8 " : "transparent",
                  backgroundColor: "transparent"
                },
                onClick: () => setActiveTab("projects"),
                children: "PROJECTS"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                className: `btn btn-link text-decoration-none px-3 py-2 ${activeTab === "charts" ? "" : ""}`,
                style: {
                  color: activeTab === "charts" ? "#679CE8" : "#fff",
                  borderBottom: activeTab === "charts" ? "2px solid #679CE8 " : "transparent",
                  backgroundColor: "transparent"
                },
                onClick: () => setActiveTab("charts"),
                children: "CHARTS"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "btn btn-link text-decoration-none p-0",
              style: { color: "#fff", fontSize: "1.2rem" },
              onClick: onClose,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-xmark" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto h-100 p-3", style: { color: "#fff" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: { transition: "opacity 0.2s ease-in-out" },
            children: activeTab === "projects" ? renderProjectsTab() : renderChartsTab()
          },
          activeTab
        ) })
      ] })
    }
  );
}
const MultiSelect = ({
  id,
  name,
  options,
  selectedValues = [],
  placeholder = "Select options...",
  className = "",
  onChange
}) => {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [selected, setSelected] = reactExports.useState(selectedValues);
  const prevSelectedValuesRef = reactExports.useRef(selectedValues);
  const isInternalChangeRef = reactExports.useRef(false);
  const formRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (name) {
      const input = document.querySelector(`input[name="${name}"]`);
      if (input) {
        formRef.current = input.closest("form");
      }
    }
  }, [name]);
  reactExports.useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handleFormReset = () => {
      isInternalChangeRef.current = true;
      setSelected([]);
    };
    form.addEventListener("reset", handleFormReset);
    return () => {
      form.removeEventListener("reset", handleFormReset);
    };
  }, []);
  reactExports.useEffect(() => {
    const prevValues = prevSelectedValuesRef.current;
    const currentValues = selectedValues || [];
    const hasChanged = prevValues.length !== currentValues.length || prevValues.some((val, index) => val !== currentValues[index]);
    if (hasChanged) {
      setSelected([...currentValues]);
      prevSelectedValuesRef.current = [...currentValues];
    }
  }, [selectedValues]);
  reactExports.useEffect(() => {
    if (isInternalChangeRef.current) {
      onChange(selected);
      isInternalChangeRef.current = false;
    }
  }, [selected, onChange]);
  const handleOptionClick = (value) => {
    const newSelected = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
    isInternalChangeRef.current = true;
    setSelected(newSelected);
  };
  const handleRemoveOption = (value, e) => {
    e.stopPropagation();
    const newSelected = selected.filter((item) => item !== value);
    isInternalChangeRef.current = true;
    setSelected(newSelected);
  };
  const handleClearAll = (e) => {
    e.stopPropagation();
    isInternalChangeRef.current = true;
    setSelected([]);
    closeDropdown();
  };
  const getSelectedLabels = () => {
    return selected.map(
      (value) => {
        var _a;
        return ((_a = options.find((option) => option.value === value)) == null ? void 0 : _a.label) || value;
      }
    );
  };
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const closeDropdown = () => {
    setIsOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "multi-select-container", children: [
    name && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "hidden",
        name,
        value: selected.join(","),
        id
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `multi-select-input ${className}`,
        onClick: toggleDropdown,
        children: selected.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "multi-select-placeholder", children: placeholder }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: getSelectedLabels().map((label, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "multi-select-chip",
            children: [
              label,
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: (e) => handleRemoveOption(selected[index], e),
                  className: "remove-btn",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-xmark" })
                }
              )
            ]
          },
          index
        )) })
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "multi-select-dropdown", children: [
      selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "multi-select-clear", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleClearAll,
          className: "multi-select-clear-button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-xmark" }),
            " Unselect all (",
            selected.length,
            ")"
          ]
        }
      ) }),
      options.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => handleOptionClick(option.value),
          className: `multi-select-option ${selected.includes(option.value) ? "is-selected" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: selected.includes(option.value),
                readOnly: true
              }
            ),
            option.label
          ]
        },
        option.value
      ))
    ] }),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "multi-select-overlay", onClick: closeDropdown })
  ] });
};
const EVENTS = {
  filterUpdated: "filter-updated",
  symbologyUpdate: "symbologyUpdate"
};
const calendarIcon = "data:image/svg+xml,%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3crect%20width='24'%20height='24'%20fill='url(%23pattern0_50_7)'/%3e%3cdefs%3e%3cpattern%20id='pattern0_50_7'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_50_7'%20transform='scale(0.015625)'/%3e%3c/pattern%3e%3cimage%20id='image0_50_7'%20width='64'%20height='64'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,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'/%3e%3c/defs%3e%3c/svg%3e";
const folderIcon = "data:image/svg+xml,%3csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3crect%20width='24'%20height='24'%20fill='url(%23pattern0_50_15)'/%3e%3cdefs%3e%3cpattern%20id='pattern0_50_15'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_50_15'%20transform='scale(0.015625)'/%3e%3c/pattern%3e%3cimage%20id='image0_50_15'%20width='64'%20height='64'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFCklEQVR4AeyavW4UMRSFvfwIhEACCSEKJIjEA0BBRUFS8A50JA+AlAIqiiQ1SNBRJql4BaiSiBcIoqFASqigoEAiQgiKcL6JvdrxZjNje3Y9O9rVPesZr3/uPWNf37H3lKnxOTw8nBe2hNyyJwW+CY9qqF2rSCUB6mxeLW0JpErMvjEmF24ZY64Lb6TXitJkqSRAPTwWkI3e0WdOSRZIiWcCcllfq02QUIcA9+TX1Glu+WEVeG3TZBLqEMCw29dTZ9jbfrMnP6XBnIAkkVCHADppHewDSSYhmgDNvxfCRiBWm2SyCRKiCJDRl2TIUwEHGYInqtOopJJQh4ANabwt9EWd/tLNXQEHGYL7qtO4SB/8U9R0qCRAjS8BX2vl7Qo7gfjst9PUvfSIIqGSgKYUbKgdjKSpRU3DdWFlEPqB6eiWyGX9VhkxVhKgRujkuRrPLnrKTEWmJEvzohTCqfpYVj5CsPSKi5NQSYAq4+xco7o9EhHzSTgIxIej2vHfImFJtZnvpKPgIsY/Knui1CFgVAM0/ls/hoA6qpImIoHAjNB8FF6qB6YLI0WXoyWaAClxT7gWiIejVcnzSzQBedRN79Vv4UQCNL9xNGdV6bQwbXIehWUDexkjp8KxBKhSsfmhBtaFc8JFYdrkqlWYvQw2Ulg2h4gYIgDjVZHoTolhyflrjMHRKZkqca/O2IBDZDTzQEtGlAiQ8RTCeLys/FuPZQYC/pVqTcdNseL0ej0iWZZNYgimAzb2LSgRoNybAgJrpF3CpjXmgU2LxCfAzZGd4tdufTENhizyCRgq0PWMGQFtecI4YIGliiWYZSsJsuuGYNQm7bGFznY6WSVkHwFSkFfbQ2nFEoWHZhXCF6XijNpEaI83xrfc+MhKgIznyWA4erHysOxy5tBr6qOGFwQI+K4UKQV12QiQ8RiOYnjnBRnMes3bHfco2gjU7rbAmcaubbA0FbIQIOMJTxnuGIvhBClWv7El723L+UaADGe+YzzzkmiT4T4J47HdjQA3Fcgzo0bAHSmLR95TqQvCFd0neWXVd44O4xmWhKdqeuJSiwD20hiieGJI4nWY6xTg5JjzDHkc00Qsr+oE4wbLuPkBS017ZAxfk0OCiME+s177BNy22rxDUQEnZbO6mfgEOCs/uouupz4BX6zBzmPa2+4mPgEH3TX1eMt8Ao4v1eHcGQEdfri1TJuNgFo0eYUU1t4SODVmsyE1RE6tjw6E7USpnqbVt7EjgBcawlriejrOCXQgbEenaou9EsEE6MnTGQbzFsfbnALGfCJ7eKlCF0YlZCirvgQTMND0pszOHipbHSAA1Up7/mRUIYYAd3hS1fYkf/8a21kMAbF9tbJe5wgIZXlGQChjXSufMgI64QxjCHAnx+zwct7O+lvAHx2KGYr8cafqlz9IKgmXGAJY+1l3CYaIvtg5LiBDOekptNB16TdlFmXGlBIAsc0evN8YTIANPNgwJRSmQ8hwcKNDdhr+kODyx5miw6r0IiKk3yAEE0Dr6gy22eFlp5djLQcMpYhRGY65XP44U3Tg6KvoN/QrioDQTtpcfkZAm5/OJHSbjYBJsNzmPvwR4Jax4PfqNhtpdXM2EcfYLDN0PM4yRoF+lNcvOcUXCsrYxSJuwQriE9ICpRGgtRvjCSz6UZ4qp25a5q7v/peAwcQM2Mh1gRIB5IgEggrO791ogIzWQjpX6aYihodKMEZqBj//AQAA///Wt1LBAAAABklEQVQDAAH546eJKtIwAAAAAElFTkSuQmCC'/%3e%3c/defs%3e%3c/svg%3e";
const projectLineIcon = "data:image/svg+xml,%3csvg%20width='23'%20height='23'%20viewBox='0%200%2023%2023'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3crect%20width='23'%20height='23'%20fill='url(%23pattern0_50_24)'/%3e%3cdefs%3e%3cpattern%20id='pattern0_50_24'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_50_24'%20transform='scale(0.015625)'/%3e%3c/pattern%3e%3cimage%20id='image0_50_24'%20width='64'%20height='64'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA8BJREFUeNrsm71uGkEQxzlAUHJFChcGIuUBHAkDlizZhamTgt4u3LvwA1DwACmujyXTUzg1KbCEZGEa94mUg4YixUGBJYuzs+ucozPmjv2YmUUi29jIwjv/397szOzcWqVSKZXY4JFMbPjYeABpE5N2Op33uVyuYVnWJ/756enp22QyadZqtV/UtliUe0BI+PGyvzMQLWoQJABWCTcJAhWArHATIFAA6AqnBAEKAFo4BQgQANjCMUFoAYDw8WcjDO4RSgCgNzeTm6UUAGxDTYAQAkBtGOV8sQBMx3GK+ZcCWLcEBtOeNwD6/f6XZDJ5pjCP9/j42JpOpw5W5qYLgtnnVCqV80gATHyDiW8oCHdGo5FTr9c9ijyg3W7b+Xz+LFgoWxJCk0FoLgUwGAx+sh/FdRUOBMLd3d39EHUgUpTwqy573FumxPPB5+Y2cFskvlaMPBFi/+hKOH5a1mfbtn/c3t5ecN80cajC5+Y2cFskFu4qEsD9/T33DakV5RsSJYgF4bKboRdojI4COhsMZumqGQEi96vIRGhdQGAJF06FTYHAFi5dDFGBoBKuXA5jgaAWrn0gAgWC/25CeCyA6+vrnVQqZbOQ4a56ZHVBKA6wLPQVAC6mUCh8Z6uxI+u7RCCkhN/c3JywhTwL9Ljsu5fhOuANAJ5g6HZtkEBIC0+n041lqb3v++fVatWJKoZ+rzKaGASY8JD9d+VyuaQMgAiElPBer3eYzWYvRIs5Vg2mpV2ACIS08EwmwyPIoUwxxJ6AuvAmSAQCXfjLPLPZ7Ojg4OAuNgyK+BIEiK2trWfQ4/H4Dll4pF2xiRAFCJGhKbzL7DiNskMoEzQFQlf4w8NDc39/vwuWCmuAoPJxYeFatQAWCErh2sUQJAgTwmOPxLa3t4+ZMTYz0t3b27vEBMEEuIphV0j4S7SJKuxeAeA1uW3bg4VExZ3P500REEFjBbUqlBG+mG/wJGg4HJ6G3W8xE2zHHDELgcCqCnWEh8eqztBcwBZSEFDCw/aHO0M6rTFUELxqY8LPAYX/23cYgHdLASg2R6FBYIONLoYCCErtcYUVOwk/bfz7vu87yK7lep53FI4G4C9IyMZlPpdImqwpXL4zRA2CWrhUJmgKhEZeAd8ZCoH4ip2yUhVdyrUAVu5OKRykGIICYUI4CAAIEIm/L2TY1MJBAQCBID9qAweACQLrzRPUKzMQILCvzZBcmlJsYJBcnCK9NicCgvrqnGXi7nAAgretP/LQxwuh4MVLh/rypPX/8vSGj40H8EeAAQCggkAeUgMLeAAAAABJRU5ErkJggg=='/%3e%3c/defs%3e%3c/svg%3e";
const wrenchIcon = "data:image/svg+xml,%3csvg%20width='26'%20height='26'%20viewBox='0%200%2026%2026'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3crect%20width='26'%20height='26'%20fill='url(%23pattern0_53_27)'/%3e%3cdefs%3e%3cpattern%20id='pattern0_53_27'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_53_27'%20transform='scale(0.015625)'/%3e%3c/pattern%3e%3cimage%20id='image0_53_27'%20width='64'%20height='64'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,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'/%3e%3c/defs%3e%3c/svg%3e";
const arrowDown = "data:image/svg+xml,%3csvg%20width='23'%20height='18'%20viewBox='0%200%2023%2018'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20filter='url(%23filter0_d_73_2)'%3e%3cpath%20d='M5%200.550003L12.2626%209'%20stroke='%23707070'/%3e%3cpath%20d='M12.1899%209L18%200.550003'%20stroke='%23707070'/%3e%3c/g%3e%3cdefs%3e%3cfilter%20id='filter0_d_73_2'%20x='0.62085'%20y='0.224091'%20width='21.7911'%20height='17.1018'%20filterUnits='userSpaceOnUse'%20color-interpolation-filters='sRGB'%3e%3cfeFlood%20flood-opacity='0'%20result='BackgroundImageFix'/%3e%3cfeColorMatrix%20in='SourceAlpha'%20type='matrix'%20values='0%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%20127%200'%20result='hardAlpha'/%3e%3cfeOffset%20dy='4'/%3e%3cfeGaussianBlur%20stdDeviation='2'/%3e%3cfeComposite%20in2='hardAlpha'%20operator='out'/%3e%3cfeColorMatrix%20type='matrix'%20values='0%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200%200.25%200'/%3e%3cfeBlend%20mode='normal'%20in2='BackgroundImageFix'%20result='effect1_dropShadow_73_2'/%3e%3cfeBlend%20mode='normal'%20in='SourceGraphic'%20in2='effect1_dropShadow_73_2'%20result='shape'/%3e%3c/filter%3e%3c/defs%3e%3c/svg%3e";
const Filter = reactExports.forwardRef(({}, ref) => {
  const { toggleLoading, toggleLoadingScenario, changeFilterValues, getFeatureLayer, getSelectedScenario, getSelectedUser, changeSelectedScenario, changeSelectedUser, getTreatmentsFromDB, getUniqueUsersFromDB, getScenariosFromDB, getProjectsFromDB, loadTreatments } = useApp();
  const formRef = reactExports.useRef(null);
  const userRef = reactExports.useRef(null);
  const scenarioRef = reactExports.useRef(null);
  const [options, setOptions] = reactExports.useState({
    year: [],
    asset_type: [],
    treatment: [],
    route: []
  });
  const [selectedValues, setSelectedValues] = reactExports.useState({
    year: [],
    asset_type: [],
    treatment: [],
    route: []
  });
  const [openSections, setOpenSections] = reactExports.useState(
    { scenario: false, year: false, asset: false, treatment: false, route: false }
  );
  reactExports.useEffect(() => {
  }, []);
  reactExports.useImperativeHandle(ref, () => ({
    resetScenario,
    changeScenarioByImport,
    fillSelectById,
    // Forzar reset total desde afuera
    hardResetAllFilters: async () => {
      await resetFilter(true);
    }
  }));
  const changeScenarioByImport = (userId, scenarioId) => {
    resetScenario();
    changeUser(userId);
    changeScenario(scenarioId);
    const selectUser = userRef.current;
    selectUser.value = userId;
    const selectScenario = scenarioRef.current;
    selectScenario.value = scenarioId;
  };
  const resetScenario = () => {
    let usersDB = getUniqueUsersFromDB();
    let users = usersDB.map((user) => ({ value: user, label: user }));
    const selectUser = userRef.current;
    fillSelectOptions(selectUser, "Select User", users);
    const selectedUser = getSelectedUser();
    if (selectedUser) {
      if (!users.some((u) => u.value === selectedUser)) {
        changeSelectedUser("");
      }
      selectUser.value = selectedUser;
    }
    let scenariosDB = getScenariosFromDB(usersDB[0]);
    let scenarios = scenariosDB.map((s2) => ({ value: s2.ScenId, label: s2.Name }));
    const selectScenario = scenarioRef.current;
    fillSelectOptions(selectScenario, "Select Scenario", scenarios);
    const selectedScenario = getSelectedScenario();
    if (selectedScenario) {
      if (!scenarios.some((s2) => `${s2.value}` === selectedScenario)) {
        changeSelectedScenario("");
      }
      selectScenario.value = selectedScenario;
    }
  };
  const fillSelectById = (selectName, optionsValues) => {
    setOptions({
      ...options,
      [selectName]: optionsValues
    });
  };
  const resetFilter = async (forceFullReset) => {
    var _a;
    toggleLoading(true);
    let featureLayer = getFeatureLayer();
    const current = await featureLayer.queryFeatures();
    await featureLayer.applyEdits({ deleteFeatures: current.features });
    setOptions({
      year: [],
      asset_type: [],
      treatment: [],
      route: []
    });
    setSelectedValues({ year: [], asset_type: [], treatment: [], route: [] });
    const scenarioSelect = scenarioRef.current;
    if (scenarioSelect) {
      scenarioSelect.value = "";
    }
    changeSelectedScenario("");
    if (forceFullReset) {
      const userSelect = userRef.current;
      if (userSelect) userSelect.value = "";
      changeSelectedUser("");
      fillSelectOptions(userSelect, "Select User", []);
      fillSelectOptions(scenarioSelect, "Select Scenario", []);
    }
    toggleLoading(false);
    try {
      featureLayer.definitionExpression = null;
      (_a = featureLayer.refresh) == null ? void 0 : _a.call(featureLayer);
    } catch {
    }
    window.dispatchEvent(new CustomEvent(EVENTS.filterUpdated, { detail: {} }));
  };
  const fillSelectOptions = (select, emptyText, options2) => {
    if (!select) return;
    select.innerHTML = "";
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = emptyText;
    select.appendChild(emptyOption);
    options2.forEach((optionItem) => {
      const option = document.createElement("option");
      option.value = optionItem.value;
      option.textContent = optionItem.label;
      select.appendChild(option);
    });
  };
  const changeUser = (userId) => {
    changeSelectedUser(userId);
    let scenariosDB = getScenariosFromDB(userId);
    let scenarios = scenariosDB.map((s2) => ({ value: s2.ScenId, label: s2.Name }));
    const selectScenario = scenarioRef.current;
    fillSelectOptions(selectScenario, "Select Scenario", scenarios);
  };
  const changeScenario = async (scenarioId) => {
    var _a;
    if (scenarioId === "") {
      resetFilter();
      return;
    }
    toggleLoadingScenario(true);
    changeSelectedScenario(scenarioId);
    let scenarioRelations = {
      Projects: getProjectsFromDB(scenarioId),
      Treatments: getTreatmentsFromDB(scenarioId)
    };
    await loadTreatments(scenarioRelations);
    const yearSet = /* @__PURE__ */ new Set(), routeSet = /* @__PURE__ */ new Set(), assetTypeSet = /* @__PURE__ */ new Set(), treatmentSet = /* @__PURE__ */ new Set();
    for (const t of scenarioRelations.Treatments || []) {
      if (t.Year) yearSet.add(String(t.Year));
      if (t.Rte) routeSet.add(String(t.Rte));
      if (t.TreatType) assetTypeSet.add(String(t.TreatType));
      if (t.Treatment) treatmentSet.add(String(t.Treatment));
    }
    setOptions({
      year: [...yearSet].sort().map((y2) => ({ value: y2, label: y2 })),
      asset_type: [...assetTypeSet].sort().map((a2) => ({ value: a2, label: a2 })),
      treatment: [...treatmentSet].sort().map((t) => ({ value: t, label: t })),
      route: [...routeSet].sort().map((r) => ({ value: r, label: r }))
    });
    toggleLoadingScenario(false);
    window.dispatchEvent(new CustomEvent("filter-updated", { detail: {} }));
    try {
      const savedRaw = localStorage.getItem(`${STORAGE_KEYS.filtersPrefix}${scenarioId}`);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        const routeSel = Array.isArray(saved.route) ? saved.route : [];
        const yearSel = Array.isArray(saved.year) ? saved.year : [];
        const assetSel = Array.isArray(saved.asset_type) ? saved.asset_type : [];
        const treatSel = Array.isArray(saved.treatment) ? saved.treatment : [];
        setSelectedValues({ year: yearSel, asset_type: assetSel, treatment: treatSel, route: routeSel });
        const whereClauses = [];
        if (routeSel.length > 0) whereClauses.push(`Route IN (${routeSel.join(",")})`);
        if (yearSel.length > 0) whereClauses.push(`Year IN (${yearSel.join(",")})`);
        if (assetSel.length > 0) whereClauses.push(`AssetType IN ('${assetSel.join("','")}')`);
        if (treatSel.length > 0) whereClauses.push(`Treatment IN ('${treatSel.join("','")}')`);
        const featureLayer = getFeatureLayer();
        featureLayer.definitionExpression = whereClauses.join(" AND ");
        (_a = featureLayer.refresh) == null ? void 0 : _a.call(featureLayer);
        changeFilterValues({ route: routeSel, year: yearSel, assetType: assetSel, treatment: treatSel });
        const useCostBasedSymbology = whereClauses.length > 0;
        window.dispatchEvent(new CustomEvent(EVENTS.symbologyUpdate, { detail: { useCostBasedSymbology } }));
        window.dispatchEvent(new CustomEvent(EVENTS.filterUpdated, { detail: {} }));
      }
    } catch {
    }
  };
  const onSubmit = (e) => {
    e.preventDefault();
    applyFilter(e.currentTarget);
  };
  const transformValues = (value) => {
    if (value === null || value === void 0 || value === "") return [];
    return value.toString().split(",");
  };
  const applyFilter = (form) => {
    var _a;
    const formData = new FormData(form);
    const whereClauses = [];
    const selectedRoutes = transformValues(formData.get("route"));
    const selectedProjectYears = transformValues(formData.get("year"));
    const selectedAssetType = transformValues(formData.get("asset_type"));
    const selectedTreatment = transformValues(formData.get("treatment"));
    let newFilterValues = {};
    if (selectedRoutes && selectedRoutes.length > 0) {
      const vals = selectedRoutes;
      whereClauses.push(`Route IN (${vals})`);
      newFilterValues.route = selectedRoutes;
    }
    if (selectedProjectYears && selectedProjectYears.length > 0) {
      const vals = selectedProjectYears;
      whereClauses.push(`Year IN (${vals})`);
      newFilterValues.year = selectedProjectYears;
    }
    if (selectedAssetType && selectedAssetType.length > 0) {
      const vals = selectedAssetType;
      whereClauses.push(`AssetType IN ('${vals.join("','")}')`);
      newFilterValues.assetType = selectedAssetType;
    }
    if (selectedTreatment && selectedTreatment.length > 0) {
      const vals = selectedTreatment;
      whereClauses.push(`Treatment IN ('${vals.join("','")}')`);
      newFilterValues.treatment = selectedTreatment;
    }
    changeFilterValues(newFilterValues);
    setSelectedValues({
      year: selectedProjectYears,
      asset_type: selectedAssetType,
      treatment: selectedTreatment,
      route: selectedRoutes
    });
    try {
      const scen = getSelectedScenario();
      localStorage.setItem(`${STORAGE_KEYS.filtersPrefix}${scen}`, JSON.stringify({
        route: selectedRoutes,
        year: selectedProjectYears,
        asset_type: selectedAssetType,
        treatment: selectedTreatment
      }));
    } catch {
    }
    const featureLayer = getFeatureLayer();
    const definition = whereClauses.join(" AND ");
    featureLayer.definitionExpression = definition;
    console.log("📌 Applied definitionExpression:", definition);
    (_a = featureLayer.refresh) == null ? void 0 : _a.call(featureLayer);
    console.log("featureLayer.source========", featureLayer.source);
    const useCostBasedSymbology = whereClauses.length > 0;
    window.dispatchEvent(new CustomEvent(EVENTS.symbologyUpdate, {
      detail: { useCostBasedSymbology }
    }));
    const selectedScenario = getSelectedScenario();
    const Treatments = getTreatmentsFromDB(selectedScenario);
    const matched = Treatments.filter((t) => {
      const yearOk = selectedProjectYears === t.Year;
      const routeOk = selectedRoutes === t.Rte || t.Route;
      const assetTypeOk = selectedAssetType === t.AssetType;
      const treatmentOk = selectedTreatment === t.Treatment;
      return yearOk && assetTypeOk && treatmentOk && routeOk;
    });
    const filteredTreatIds = matched.map((t) => t.TreatId ?? t.TreatmentId ?? t.TreatmentID);
    const filteredProjIds = [...new Set(matched.map((t) => t.ProjId ?? t.ProjectID))];
    console.log("🔍 Matched treatments:", matched.length);
    console.log("🔍 Filtered Project IDs:", filteredProjIds);
    console.log("🔍 Filtered Treatment IDs:", filteredTreatIds);
    window.dispatchEvent(new CustomEvent(EVENTS.filterUpdated, {
      detail: { filteredProjIds, filteredTreatIds }
    }));
  };
  const onChange = () => {
    applyFilter(formRef.current);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "filters d-flex flex-column gap-4 w-100 mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `section-toggle ${openSections.scenario ? "is-open" : ""}`, onClick: () => setOpenSections((prev) => ({ ...prev, scenario: !prev.scenario })), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "filter-icon", src: folderIcon, alt: "scenario" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SELECT SCENARIO" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: arrowDown, alt: "Arrow Down", className: "arrow-down-icon" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-content", style: { display: openSections.scenario ? "block" : "none" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          ref: userRef,
          className: "form-select w-100",
          name: "user_id",
          id: "user_id",
          "data-filter": "user",
          onChange: (e) => {
            changeUser(e.target.value);
          },
          style: { borderColor: "var(--primary-400)", backgroundColor: "var(--primary-800)", color: "var(--white)" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select User" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          ref: scenarioRef,
          className: "form-select w-100 mt-2",
          name: "scenario_id",
          id: "scenario_id",
          "data-filter": "scenario",
          onChange: (e) => {
            changeScenario(e.target.value);
          },
          style: { borderColor: "var(--primary-400)", backgroundColor: "var(--primary-800)", color: "var(--white)" },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select Scenario" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "d-flex flex-column gap-4", onSubmit, ref: formRef, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `section-toggle ${openSections.year ? "is-open" : ""}`, onClick: () => setOpenSections((prev) => ({ ...prev, year: !prev.year })), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "filter-icon", src: calendarIcon, alt: "year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "YEAR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: arrowDown, alt: "Arrow Down", className: "arrow-down-icon" })
      ] }),
      openSections.year && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-content", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect, { className: "w-100", options: options.year, selectedValues: selectedValues.year, onChange, name: "year", id: "year", placeholder: "Select Year" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `section-toggle ${openSections.asset ? "is-open" : ""}`, onClick: () => setOpenSections((prev) => ({ ...prev, asset: !prev.asset })), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "filter-icon", src: projectLineIcon, alt: "asset" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "PROJECTS TYPE(S)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: arrowDown, alt: "Arrow Down", className: "arrow-down-icon" })
      ] }),
      openSections.asset && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "section-content", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect, { className: "w-100", options: options.asset_type, selectedValues: selectedValues.asset_type, onChange, name: "asset_type", id: "asset_type", placeholder: "Select Asset Type" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: `section-toggle ${openSections.treatment ? "is-open" : ""}`, onClick: () => setOpenSections((prev) => ({ ...prev, treatment: !prev.treatment })), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "filter-icon", src: wrenchIcon, alt: "treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "TREATMENT(S)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: arrowDown, alt: "Arrow Down", className: "arrow-down-icon" })
      ] }),
      openSections.treatment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "section-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect, { className: "w-100", options: options.treatment, selectedValues: selectedValues.treatment, onChange, name: "treatment", id: "treatment", placeholder: "Select Treatment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect, { className: "w-100 mt-2", options: options.route, selectedValues: selectedValues.route, onChange, name: "route", id: "route", placeholder: "Select Route" })
      ] })
    ] })
  ] });
});
const Separator = ({ className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-100 ${className ? className : ""}`, style: { borderBottom: "1px solid var(--primary-400)" } });
};
const SidebarPopup = ({ title, open, children, onClose }) => {
  reactExports.useEffect(() => {
    console.log("open", open);
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `position-absolute bottom-0 end-0 p-2 d-flex flex-col gap-2 w-100 h-100 ${open ? "open" : "closed"}`,
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(10px)",
        zIndex: 1e3
      },
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-100 h-50 position-absolute bottom-0 end-0",
          onClick: (e) => e.stopPropagation(),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "d-flex flex-column h-100",
              style: { borderTop: "2px solid var(--primary-500)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "d-flex justify-content-between align-items-center w-100",
                    style: { backgroundColor: "var(--primary-800)", color: "var(--primary-100)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h6", { className: "mt-0 mb-0 p-2", children: title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn btn-sm btn-primary", onClick: onClose, style: { border: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-xmark" }) })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto h-100", children })
              ]
            }
          )
        }
      )
    }
  );
};
function FilterSidebar(props) {
  const { scenario } = useApp();
  const {
    isSidebarOpen,
    mapContainerRef,
    filterRef,
    onOpenProjects,
    onOpenCharts
  } = props;
  const [isLegendOpen, setIsLegendOpen] = reactExports.useState(false);
  const [isBaseMapGalleryOpen, setIsBaseMapGalleryOpen] = reactExports.useState(false);
  const [isCondensed, setIsCondensed] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `filter-sidebar ${isSidebarOpen ? "open" : ""} ${isCondensed ? "condensed" : ""}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex flex-column overflow-hidden h-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "filter-sidebar-header d-flex align-items-center justify-content-between px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "d-flex align-items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "hamburger",
            role: "button",
            "aria-label": "Toggle condensed",
            onClick: () => setIsCondensed((prev) => !prev),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", {})
            ]
          }
        ) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "filter-sidebar-content d-flex flex-column gap-2 overflow-auto", children: [
          isCondensed ? /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "condensed-menu d-flex flex-column align-items-center gap-4 mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "icon-stack d-flex flex-column align-items-center",
                title: "Select Scenario",
                onClick: () => setIsCondensed(false),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: folderIcon, alt: "scenario" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "SELECT ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    " SCENARIO"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "icon-stack d-flex flex-column",
                title: "Year",
                onClick: () => setIsCondensed(false),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: calendarIcon, alt: "year" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "YEAR" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "icon-stack",
                title: "Projects Type(s)",
                onClick: () => setIsCondensed(false),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: projectLineIcon, alt: "projects" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "PROJECTS TYPE(S)" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "icon-stack",
                title: "Treatment(s)",
                onClick: () => setIsCondensed(false),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: wrenchIcon, alt: "treatment" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "TREATMENT(S)" })
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { ref: filterRef }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mb-5" }),
          scenario && scenario != "" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mt-2 mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "btn w-100 d-flex justify-content-between",
                style: {
                  backgroundColor: "var(--primary-700)",
                  color: "var(--primary-100)"
                },
                title: "Resetear filtros del escenario",
                onClick: () => {
                  var _a, _b;
                  const ok = window.confirm(
                    "Esto limpiará todos los filtros, incluyendo User y Scenario. ¿Desea continuar?"
                  );
                  if (!ok) return;
                  try {
                    localStorage.removeItem(
                      `${STORAGE_KEYS.filtersPrefix}${scenario}`
                    );
                    (_b = (_a = filterRef.current) == null ? void 0 : _a.hardResetAllFilters) == null ? void 0 : _b.call(_a);
                  } catch {
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: "Clear all filters" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-rotate-left pt-1" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SidebarPopup,
          {
            title: "Legend",
            open: isLegendOpen,
            onClose: () => setIsLegendOpen(false),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "arcgis-legend",
              {
                referenceElement: mapContainerRef.current,
                className: "w-100 h-100"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SidebarPopup,
          {
            title: "BaseMap Gallery",
            open: isBaseMapGalleryOpen,
            onClose: () => setIsBaseMapGalleryOpen(false),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "arcgis-basemap-gallery",
              {
                referenceElement: mapContainerRef.current,
                className: "w-100 h-100"
              }
            )
          }
        )
      ] })
    }
  );
}
const LoadingScenario = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "loading-overlay", className: "loading-overlay w-100 h-100 position-absolute", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "d-flex flex-column align-items-center justify-content-center gap-2 p-4",
      style: { backgroundColor: "var(--primary-800)", width: "300px", height: "150px" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h6", { className: "text-white", children: "LOADING SCENARIO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress w-100", style: { backgroundColor: "transparent" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "progress-bar progress-bar-striped progress-bar-animated w-100",
            style: { borderRadius: "510px" },
            role: "progressbar"
          }
        ) })
      ]
    }
  ) });
};
const addTreatmentIcon = "data:image/svg+xml,%3csvg%20width='28'%20height='28'%20viewBox='0%200%2028%2028'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3crect%20width='28'%20height='28'%20fill='url(%23pattern0_6_37)'/%3e%3cdefs%3e%3cpattern%20id='pattern0_6_37'%20patternContentUnits='objectBoundingBox'%20width='1'%20height='1'%3e%3cuse%20xlink:href='%23image0_6_37'%20transform='scale(0.015625)'/%3e%3c/pattern%3e%3cimage%20id='image0_6_37'%20width='64'%20height='64'%20preserveAspectRatio='none'%20xlink:href='data:image/png;base64,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'/%3e%3c/defs%3e%3c/svg%3e";
const style = {
  "project-treatments-bar": "_project-treatments-bar_10vl6_3",
  "project-treatments-action": "_project-treatments-action_10vl6_23",
  "project-treatments-icon-btn": "_project-treatments-icon-btn_10vl6_33",
  "project-treatments-icon": "_project-treatments-icon_10vl6_33"
};
function ProjectTreatments() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `${style["project-treatments-bar"]} d-flex align-items-center justify-content-between px-3`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-uppercase small", children: "Project Treatments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: style["project-treatments-action"], children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `${style["project-treatments-icon-btn"]}`,
            "aria-haspopup": "dialog",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: addTreatmentIcon,
                alt: "Project Treatments Icon",
                className: `${style["project-treatments-icon"]}`
              }
            )
          }
        ) })
      ]
    }
  );
}
s$1.portalUrl = "https://pennshare.maps.arcgis.com";
function App() {
  const {
    isLoading,
    isLoadingScenario,
    changeMapView,
    changeFeatureLayer,
    toggleLoading,
    toggleLoadingScenario,
    createSqlLiteDB,
    loadDataFromFile,
    loadDataFromJson
  } = useApp();
  const [isOpenProjects, setIsOpenProjects] = reactExports.useState(false);
  const [isOpenCharts, setIsOpenCharts] = reactExports.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = reactExports.useState(true);
  const [isOpenRightPanel, setIsOpenRightPanel] = reactExports.useState(false);
  const [isProjectPopupOpen, setIsProjectPopupOpen] = reactExports.useState(false);
  const [projectPopupData, setProjectPopupData] = reactExports.useState(null);
  const [isTreatmentListOpen, setIsTreatmentListOpen] = reactExports.useState(false);
  const [selectedFeature, setSelectedFeature] = reactExports.useState(null);
  const mapContainerRef = reactExports.useRef(null);
  const filterRef = reactExports.useRef(null);
  const highlightHandleRef = reactExports.useRef(null);
  const markerGraphicsRef = reactExports.useRef([]);
  const formatCurrencyNoDecimals = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };
  const calcTotalCost = (attrs, edits) => {
    const numericVal = (fieldName, fallback) => {
      const raw = (edits == null ? void 0 : edits[fieldName]) ?? (attrs == null ? void 0 : attrs[fieldName]) ?? fallback;
      return typeof raw === "number" ? raw : parseFloat(raw) || 0;
    };
    const direct = numericVal("DirectCost", 0);
    const design = numericVal("DesignCost", 0);
    const row = numericVal("ROWCost", 0);
    const util = numericVal("UtilCost", 0);
    const other = numericVal("OtherCost", 0);
    return direct + design + row + util + other;
  };
  const getAssetTypeLabel = (type) => {
    if (!type) return "";
    if (type === "P") return "Pavement";
    if (type === "B") return "Bridge";
    if (type === "C") return "Combined";
    return type;
  };
  const createMarkerGraphics = (features) => {
    const markers = [];
    features.forEach((feature) => {
      if (feature.geometry && feature.geometry.paths && feature.geometry.paths.length > 0) {
        const path = feature.geometry.paths[0];
        if (path.length > 0) {
          const startPoint = new _$1({
            x: path[0][0],
            y: path[0][1],
            spatialReference: feature.geometry.spatialReference
          });
          const startMarker = new d$1({
            geometry: startPoint,
            symbol: {
              type: "picture-marker",
              url: greenMarkerSvg,
              width: 20,
              height: 30,
              yoffset: 17
            }
          });
          markers.push(startMarker);
          const endPoint = new _$1({
            x: path[path.length - 1][0],
            y: path[path.length - 1][1],
            spatialReference: feature.geometry.spatialReference
          });
          const endMarker = new d$1({
            geometry: endPoint,
            symbol: {
              type: "picture-marker",
              url: redMarkerSvg,
              width: 20,
              height: 30,
              yoffset: 17
            }
          });
          markers.push(endMarker);
        }
      }
    });
    return markers;
  };
  const removeMarkerGraphics = (view) => {
    if (markerGraphicsRef.current.length > 0) {
      markerGraphicsRef.current.forEach((marker) => {
        view.graphics.remove(marker);
      });
      markerGraphicsRef.current = [];
    }
  };
  const computeChartData = () => {
    const { getTreatmentsFiltered, getFilterValues, getSelectedScenario } = useApp();
    let filterValues = getFilterValues();
    let scenarioId = getSelectedScenario();
    const treatments = getTreatmentsFiltered(scenarioId, filterValues);
    let totalCostByYear = {};
    let treatmentBreakdownByYear = {};
    let costByTreatmentType = {};
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
      costByTreatmentType
    };
  };
  const buildProjectPopupData = (_projId, features) => {
    var _a, _b, _c;
    if (!(features == null ? void 0 : features.length)) return null;
    const f2 = features[0];
    const projectId = ((_a = f2.attributes) == null ? void 0 : _a.ProjectID) || "";
    const projectRoute = ((_b = f2.attributes) == null ? void 0 : _b.Route) || "";
    const projectYear = ((_c = f2.attributes) == null ? void 0 : _c.Year) || "";
    const projectCost = features.reduce(
      (sum, g) => sum + calcTotalCost(g.attributes || {}, {}),
      0
    );
    const treatments = features.map((g, _) => {
      const attr = g.attributes || {};
      const spelledType = getAssetTypeLabel(
        attr.TreatmentType || attr.AssetType || ""
      );
      const sectionStr = `${attr.SectionFrom ?? ""}-${attr.SectionTo ?? ""}`;
      const totalCost = calcTotalCost(attr, {});
      return {
        type: spelledType,
        section: sectionStr,
        treatment: attr.Treatment || "",
        totalCost,
        attributes: attr
      };
    });
    return {
      projectId,
      projectRoute,
      projectYear,
      projectCost,
      treatments,
      features
    };
  };
  const setupPopupSelection = (view, featureLayer) => {
    if (!view) return;
    view.popup.autoOpenEnabled = false;
    view.on("click", async (event) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      try {
        if (highlightHandleRef.current) {
          (_b = (_a = highlightHandleRef.current).remove) == null ? void 0 : _b.call(_a);
          highlightHandleRef.current = null;
        }
        removeMarkerGraphics(view);
        const response = await view.hitTest(event);
        if (!((_c = response == null ? void 0 : response.results) == null ? void 0 : _c.length)) {
          view.popup.close();
          setIsProjectPopupOpen(false);
          setProjectPopupData(null);
          setIsTreatmentListOpen(false);
          setSelectedFeature(null);
          removeMarkerGraphics(view);
          return;
        }
        const clickedFeature = (_d = response.results.find(
          (r) => {
            var _a2;
            return ((_a2 = r.graphic) == null ? void 0 : _a2.layer) === featureLayer;
          }
        )) == null ? void 0 : _d.graphic;
        if (!clickedFeature) {
          view.popup.close();
          setIsProjectPopupOpen(false);
          setProjectPopupData(null);
          setIsTreatmentListOpen(false);
          setSelectedFeature(null);
          removeMarkerGraphics(view);
          return;
        }
        let projId = ((_e = clickedFeature.attributes) == null ? void 0 : _e.ProjId) || ((_f = clickedFeature.attributes) == null ? void 0 : _f.ProjectID) || ((_g = clickedFeature.attributes) == null ? void 0 : _g.SchemaId) || ((_h = clickedFeature.attributes) == null ? void 0 : _h.SystemID);
        if (!projId) {
          view.popup.close();
          setIsProjectPopupOpen(false);
          setProjectPopupData(null);
          setIsTreatmentListOpen(false);
          setSelectedFeature(null);
          removeMarkerGraphics(view);
          return;
        }
        const layerView = await view.whenLayerView(featureLayer);
        const query = featureLayer.createQuery();
        query.where = `ProjectID = ${projId}`;
        query.outFields = ["*"];
        query.returnGeometry = true;
        const queryResult = await featureLayer.queryFeatures(query);
        if (!((_i = queryResult == null ? void 0 : queryResult.features) == null ? void 0 : _i.length)) {
          view.popup.close();
          setIsProjectPopupOpen(false);
          setProjectPopupData(null);
          setIsTreatmentListOpen(false);
          setSelectedFeature(null);
          removeMarkerGraphics(view);
          return;
        }
        highlightHandleRef.current = layerView.highlight(queryResult.features);
        const markers = createMarkerGraphics(queryResult.features);
        markers.forEach((marker, _) => {
          view.graphics.add(marker);
        });
        markerGraphicsRef.current = markers;
        const attrs = queryResult.features[0].attributes;
        console.log("queryResult.features[0]", queryResult.features);
        console.log("feature attribute", attrs);
        if (!attrs.TotalCost) {
          attrs.TotalCost = calcTotalCost(attrs, {});
        }
        const attrsArray = [attrs];
        setSelectedFeature(attrsArray);
        setIsTreatmentListOpen(true);
        const popupData = buildProjectPopupData(projId, queryResult.features);
        setProjectPopupData(popupData);
        setIsProjectPopupOpen(true);
        view.popup.close();
      } catch (err) {
        console.error("Error handling segment click:", err);
        view.popup.close();
      }
    });
  };
  reactExports.useEffect(() => {
    let modalProjects = document.getElementById("projectInfoModal");
    modalProjects == null ? void 0 : modalProjects.addEventListener("hidden.bs.modal", () => {
      setIsOpenProjects(false);
    });
    let modalCharts = document.getElementById("graphicChartModal");
    modalCharts == null ? void 0 : modalCharts.addEventListener("hidden.bs.modal", () => {
      setIsOpenCharts(false);
    });
    (async () => {
      var _a;
      try {
        await initMap();
        await createSqlLiteDB();
        const pending = sessionStorage.getItem(STORAGE_KEYS.scenarioPending);
        const raw = sessionStorage.getItem(STORAGE_KEYS.scenarioRawJson);
        if (pending === "1" && raw) {
          toggleLoading(true);
          const scenario = await loadDataFromJson(raw);
          await ((_a = filterRef.current) == null ? void 0 : _a.changeScenarioByImport(
            scenario.LastRunBy,
            scenario.ScenId
          ));
          sessionStorage.removeItem(STORAGE_KEYS.scenarioRawJson);
        }
      } finally {
        toggleLoading(false);
        sessionStorage.removeItem(STORAGE_KEYS.scenarioPending);
      }
    })();
  }, []);
  reactExports.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--filter-sidebar-height-condensed",
      isTreatmentListOpen ? "54vh" : "65vh"
    );
  }, [isTreatmentListOpen]);
  const initMap = async () => {
    var _a;
    let viewElement = mapContainerRef.current;
    if (!viewElement) return;
    await viewElement.viewOnReady();
    const view = viewElement.view;
    view.extent = {
      xmax: -7981825454310255e-9,
      xmin: -9230500748376561e-9,
      ymax: 5382301238801554e-9,
      ymin: 4609981505008338e-9,
      spatialReference: {
        wkid: 102100
      }
    };
    const portal = new C$1();
    const source = new f({
      portal
    });
    const gallery = document.querySelector("arcgis-basemap-gallery");
    gallery.source = source;
    setTimeout(() => {
      console.log("gallery.source:", gallery.source);
      console.log("Basemaps:", gallery.source.basemaps);
    }, 1e3);
    changeMapView(view);
    const featureLayer = new Xe({
      title: "Scenario Treatments",
      id: "ScenarioTreatmentsLayer",
      visible: true,
      objectIdField: "OBJECTID",
      geometryType: "polyline",
      spatialReference: { wkid: 102100 },
      fields: [
        { name: "OBJECTID", type: "oid" },
        { name: "ProjectID", type: "integer" },
        { name: "SystemID", type: "integer" },
        { name: "DistrictNo", type: "integer" },
        { name: "CountyCode", type: "integer" },
        { name: "TreatmentID", type: "string" },
        { name: "AssetType", type: "string" },
        { name: "Route", type: "integer" },
        { name: "SectionFrom", type: "integer" },
        { name: "SectionTo", type: "integer" },
        { name: "BridgeID", type: "string" },
        { name: "TreatmentType", type: "string" },
        { name: "Treatment", type: "string" },
        { name: "Year", type: "integer" },
        { name: "DirectCost", type: "double" },
        { name: "DesignCost", type: "double" },
        { name: "ROWCost", type: "double" },
        { name: "UtilCost", type: "double" },
        { name: "OtherCost", type: "double" },
        { name: "IndirectCostDesign", type: "double" },
        { name: "IndirectCostOther", type: "double" },
        { name: "IndirectCostROW", type: "double" },
        { name: "IndirectCostUtilities", type: "double" },
        { name: "Direction", type: "string" },
        { name: "TotalCost", type: "double" }
      ]
    });
    featureLayer.source = [];
    featureLayer.outFields = ["*"];
    featureLayer.popupEnabled = false;
    featureLayer.elevationInfo = { mode: "on-the-ground" };
    featureLayer.renderer = getRenderer(false);
    changeFeatureLayer(featureLayer);
    (_a = view == null ? void 0 : view.map) == null ? void 0 : _a.add(featureLayer);
    window.addEventListener("symbologyUpdate", (event) => {
      const { useCostBasedSymbology } = event.detail;
      featureLayer.renderer = getRenderer(useCostBasedSymbology);
    });
    setupPopupSelection(view, featureLayer);
  };
  const getRenderer = (useCostBasedSymbology) => {
    if (useCostBasedSymbology) {
      return {
        type: "class-breaks",
        field: "DirectCost",
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 1e5,
            symbol: { type: "simple-line", color: [34, 139, 34], width: 3 },
            label: "< 100k"
          },
          {
            minValue: 100001,
            maxValue: 5e5,
            symbol: { type: "simple-line", color: [144, 238, 144], width: 3 },
            label: "100k - 500k"
          },
          {
            minValue: 500001,
            maxValue: 1e6,
            symbol: { type: "simple-line", color: [255, 255, 0], width: 3 },
            label: "500k - 1M"
          },
          {
            minValue: 1000001,
            maxValue: 2e6,
            symbol: { type: "simple-line", color: [255, 165, 0], width: 3 },
            label: "1M - 2M"
          },
          {
            minValue: 2000001,
            maxValue: 5e6,
            symbol: { type: "simple-line", color: [255, 69, 0], width: 3 },
            label: "2M - 5M"
          },
          {
            minValue: 5000001,
            maxValue: Infinity,
            symbol: { type: "simple-line", color: [178, 34, 34], width: 3 },
            label: "> 5M"
          }
        ],
        highlightOptions: {
          color: [255, 0, 0],
          haloOpacity: 0.9,
          fillOpacity: 0.2
        }
      };
    } else {
      const years = [
        2023,
        2024,
        2025,
        2026,
        2027,
        2028,
        2029,
        2030,
        2031,
        2032,
        2033,
        2034,
        2035
      ];
      const blues = [
        [222, 235, 247],
        [198, 219, 239],
        [158, 202, 225],
        [107, 174, 214],
        [66, 146, 198],
        [33, 113, 181],
        [8, 81, 156],
        [8, 48, 107],
        [3, 19, 43]
      ];
      const uniqueValueInfos = years.map((yr, idx) => {
        const color_ = idx % blues.length;
        return {
          value: yr,
          symbol: { type: "simple-line", color: blues[color_], width: 3 },
          label: `${yr}`
        };
      });
      return {
        type: "unique-value",
        field: "Year",
        uniqueValueInfos,
        defaultSymbol: {
          type: "simple-line",
          color: [128, 128, 128],
          width: 2
        },
        highlightOptions: {
          color: [255, 0, 0],
          haloOpacity: 0.9,
          fillOpacity: 0.2
        }
      };
    }
  };
  const importScenario = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";
    fileInput.addEventListener("change", async (event) => {
      var _a, _b, _c;
      toggleLoading(true);
      document.body.removeChild(fileInput);
      const file = (_b = (_a = event.target) == null ? void 0 : _a.files) == null ? void 0 : _b[0];
      if (file) {
        let scenario = await loadDataFromFile(file);
        await ((_c = filterRef.current) == null ? void 0 : _c.changeScenarioByImport(
          scenario.LastRunBy,
          scenario.ScenId
        ));
      }
      toggleLoading(false);
    });
    document.body.appendChild(fileInput);
    fileInput.click();
  };
  const openProjects = () => {
    setIsOpenRightPanel(true);
    setIsOpenCharts(false);
    setIsOpenProjects(true);
  };
  const openCharts = () => {
    setIsOpenRightPanel(true);
    setIsOpenProjects(false);
    setIsOpenCharts(true);
  };
  const renderProjectPopupContent = () => {
    if (!projectPopupData) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "No data available" });
    const { projectId, projectRoute, projectYear, projectCost, treatments } = projectPopupData;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontFamily: "sans-serif" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "MPMS ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border text-black p-2", children: projectId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2", children: [
        "Route: ",
        projectRoute
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2", children: [
        "Year: ",
        projectYear
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2", children: [
        "Cost:",
        formatCurrencyNoDecimals(projectCost)
      ] })
    ] }) });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-100 h-100 position-relative", children: [
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, {}),
    isLoadingScenario && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScenario, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-100 h-100 d-flex flex-column overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "map-container position-relative w-100 h-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FilterSidebar,
        {
          isSidebarOpen,
          mapContainerRef,
          filterRef,
          onOpenProjects: openProjects,
          onOpenCharts: openCharts
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "map-wrapper", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          RightPanel,
          {
            title: isOpenProjects ? "Project Information" : "Charts",
            open: isOpenRightPanel,
            onClose: () => setIsOpenRightPanel(false),
            children: [
              isOpenProjects && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex flex-column gap-2 h-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-grow-1 overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Projects, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-top d-flex justify-content-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn btn-primary", children: "Save changes" }) })
              ] }),
              isOpenCharts && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex flex-column gap-3 p-3 h-100", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-100 h-33", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ChartComponent,
                  {
                    title: "Total Cost by Year",
                    data: computeChartData().totalCostByYear,
                    type: "bar",
                    height: "100%"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-100 h-33", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ChartComponent,
                  {
                    title: "Treatment Count by Type",
                    data: computeChartData().treatmentBreakdownByYear,
                    type: "bar",
                    height: "100%"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-100 h-33", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ChartComponent,
                  {
                    title: "Cost by Treatment Type",
                    data: computeChartData().costByTreatmentType,
                    type: "pie",
                    height: "100%"
                  }
                ) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "arcgis-map",
          {
            ref: mapContainerRef,
            basemap: "gray",
            padding: {
              left: isOpenRightPanel ? 520 : 0,
              right: isProjectPopupOpen ? 450 : 0
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("arcgis-home", { position: "top-right" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "position-absolute end-0 w-100 d-flex justify-content-end p-2 pb-4",
            style: { bottom: "75px" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonWidget, { title: "Import scenario", onClick: importScenario, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-file-import me-2" }),
              "Import scenario"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "position-absolute bottom-0 end-0 w-100 project-treatment", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectTreatments, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProjectPopup,
          {
            open: isProjectPopupOpen,
            onClose: () => {
              var _a, _b, _c;
              setIsProjectPopupOpen(false);
              setProjectPopupData(null);
              setIsTreatmentListOpen(false);
              setSelectedFeature(null);
              if (highlightHandleRef.current) {
                (_b = (_a = highlightHandleRef.current).remove) == null ? void 0 : _b.call(_a);
                highlightHandleRef.current = null;
              }
              if ((_c = mapContainerRef.current) == null ? void 0 : _c.view) {
                removeMarkerGraphics(mapContainerRef.current.view);
              }
            },
            width: 450,
            projectData: projectPopupData,
            children: renderProjectPopupContent()
          },
          (projectPopupData == null ? void 0 : projectPopupData.projectId) || "no-project"
        )
      ] })
    ] }) })
  ] });
}
a(window, {
  resourcesUrl: "https://js.arcgis.com/map-components/4.33/assets"
});
clientExports.createRoot(document.getElementById("react-filter")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(AppProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
