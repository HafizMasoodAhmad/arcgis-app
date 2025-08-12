import { r as reactExports, j as jsxRuntimeExports, s, y, T, d as d$1, i as initSqlJs, u as use, a as init, b as install, c as install$1, e as install$2, f as install$3, g as install$4, h as install$5, k as s$1, C as C$1, l as f, X as Xe, m as a, n as clientExports } from "./assets/vendor-DuNXxl0p.js";
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
  const loadDataFromFile = async (file) => {
    const fileContent = await file.text();
    const jsonData = JSON.parse(fileContent);
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
use(
  [install, install$1, install$2, install$3, install$4, install$5]
);
const Charts = () => {
  const { getTreatmentsFiltered, getFilterValues, getSelectedScenario } = useApp();
  const totalCostRef = reactExports.useRef(null);
  const treatmentBreakdownRef = reactExports.useRef(null);
  const chartsRef = reactExports.useRef(null);
  const totalCostGraph = reactExports.useRef(null);
  const treatmentBreakdownGraph = reactExports.useRef(null);
  reactExports.useLayoutEffect(() => {
    let filterValues = getFilterValues();
    let scenarioId = getSelectedScenario();
    const treatments = getTreatmentsFiltered(scenarioId, filterValues);
    let totalCostByYear = {};
    let treatmentBreakdownByYear = {};
    treatments.forEach((treatment) => {
      if (!totalCostByYear[treatment.Year]) {
        totalCostByYear[treatment.Year] = 0;
      }
      totalCostByYear[treatment.Year] += treatment.Cost;
      if (!treatmentBreakdownByYear[treatment.TreatType]) {
        treatmentBreakdownByYear[treatment.TreatType] = 0;
      }
      treatmentBreakdownByYear[treatment.TreatType] += 1;
    });
    initOptionsTotalCost(totalCostByYear);
    initOptionsTreatmentBreakdown(treatmentBreakdownByYear);
    const ro = new ResizeObserver(() => {
      if (totalCostGraph.current) {
        totalCostGraph.current.resize();
      }
      if (treatmentBreakdownGraph.current) {
        treatmentBreakdownGraph.current.resize();
      }
    });
    if (chartsRef.current) {
      ro.observe(chartsRef.current);
    }
  }, []);
  const initOptionsTotalCost = (totalCostByYear) => {
    let years = Object.keys(totalCostByYear);
    let totalCosts = Object.values(totalCostByYear);
    let option = {
      backgroundColor: "transparent",
      title: {
        text: "Total Cost by Year"
      },
      xAxis: {
        type: "category",
        data: years
      },
      yAxis: {
        type: "value"
      },
      legend: {
        show: true,
        data: ["Total Cost"]
      },
      series: [
        {
          name: "Total Cost",
          data: totalCosts,
          type: "bar"
        }
      ]
    };
    totalCostGraph.current = init(totalCostRef.current, "dark");
    totalCostGraph.current.setOption(option);
  };
  const initOptionsTreatmentBreakdown = (treatmentBreakdownByYear) => {
    let treatmentTypes = Object.keys(treatmentBreakdownByYear);
    let treatmentCounts = Object.values(treatmentBreakdownByYear);
    let option = {
      backgroundColor: "transparent",
      title: {
        text: "Treatment Breakdown"
      },
      xAxis: {
        type: "category",
        data: treatmentTypes
      },
      yAxis: {
        type: "value"
      },
      color: ["#66B88F"],
      legend: {
        show: true,
        data: ["Treatment Breakdown"]
      },
      series: [
        {
          name: "Treatment Breakdown",
          data: treatmentCounts,
          type: "bar"
        }
      ]
    };
    treatmentBreakdownGraph.current = init(treatmentBreakdownRef.current, "dark");
    treatmentBreakdownGraph.current.setOption(option);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-100 h-100 d-flex flex-column", ref: chartsRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-100 h-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-100 h-100", ref: totalCostRef, id: "totalCost" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-100 h-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-100 h-100", ref: treatmentBreakdownRef, id: "treatmentBreakdown" }) })
  ] });
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
const Separator = ({ className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-100 ${className ? className : ""}`, style: { borderBottom: "1px solid var(--primary-400)" } });
};
const Filter = reactExports.forwardRef(({ onReset }, ref) => {
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
  reactExports.useEffect(() => {
    var _a;
    (_a = formRef.current) == null ? void 0 : _a.addEventListener("reset", () => {
      resetFilter();
      onReset && onReset();
    });
  }, []);
  reactExports.useImperativeHandle(ref, () => ({
    resetScenario,
    changeScenarioByImport,
    fillSelectById
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
  const resetFilter = async () => {
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
    const scenarioSelect = scenarioRef.current;
    if (scenarioSelect) {
      scenarioSelect.value = "";
    }
    changeSelectedScenario("");
    toggleLoading(false);
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
    const featureLayer = getFeatureLayer();
    const definition = whereClauses.join(" AND ");
    featureLayer.definitionExpression = definition;
    console.log("📌 Applied definitionExpression:", definition);
    (_a = featureLayer.refresh) == null ? void 0 : _a.call(featureLayer);
    const useCostBasedSymbology = whereClauses.length > 0;
    window.dispatchEvent(new CustomEvent("symbologyUpdate", {
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
    window.dispatchEvent(new CustomEvent("filter-updated", {
      detail: { filteredProjIds, filteredTreatIds }
    }));
  };
  const onChange = () => {
    applyFilter(formRef.current);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "filters d-flex flex-column gap-2 w-100", children: [
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
        className: "form-select w-100",
        name: "scenario_id",
        id: "scenario_id",
        "data-filter": "scenario",
        onChange: (e) => {
          changeScenario(e.target.value);
        },
        style: { borderColor: "var(--primary-400)", backgroundColor: "var(--primary-800)", color: "var(--white)" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select Scenario" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "d-flex flex-column gap-2", onSubmit, ref: formRef, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect, { className: "w-100", options: options.year, onChange, name: "year", id: "year", placeholder: "Select Year" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect, { className: "w-100", options: options.asset_type, onChange, name: "asset_type", id: "asset_type", placeholder: "Select Asset Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect, { className: "w-100", options: options.treatment, onChange, name: "treatment", id: "treatment", placeholder: "Select Treatment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MultiSelect, { className: "w-100", options: options.route, onChange, name: "route", id: "route", placeholder: "Select Route" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "reset",
          className: "btn btn-primary",
          onClick: () => {
            resetFilter();
          },
          children: [
            "Clear all filters",
            /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-broom pt-1 ms-2" })
          ]
        }
      )
    ] })
  ] });
});
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
  const { isSidebarOpen, mapContainerRef, filterRef, onOpenProjects, onOpenCharts } = props;
  const [isLegendOpen, setIsLegendOpen] = reactExports.useState(false);
  const [isBaseMapGalleryOpen, setIsBaseMapGalleryOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `filter-sidebar ${isSidebarOpen ? "open" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex flex-column overflow-hidden h-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "filter-sidebar-content d-flex flex-column gap-2 overflow-auto h-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex align-items-center gap-2 ps-2 mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-filter text-white" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h6", { className: "text-white pb-0 mb-0", children: "Filters" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { ref: filterRef }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mb-5" }),
      scenario && scenario != "" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "btn w-100 d-flex justify-content-between",
            style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)" },
            title: "Mostrar/Ocultar Tabla",
            onClick: onOpenCharts,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: "Table widget" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-table pt-1" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "btn w-100 mt-2 d-flex justify-content-between",
            style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)" },
            title: "Información del proyecto",
            onClick: onOpenProjects,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: "Project information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-project-diagram pt-1" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mt-2 mb-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn w-100 d-flex justify-content-between",
            style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)" },
            title: "Mostrar/Ocultar Leyenda",
            onClick: () => {
              setIsLegendOpen((prev) => !prev);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex align-items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-list pt-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: "Legend" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn w-100 d-flex justify-content-between",
            style: { backgroundColor: "var(--primary-700)", color: "var(--primary-100)" },
            title: "Mostrar/Ocultar BaseMap Gallery",
            onClick: () => {
              setIsBaseMapGalleryOpen((prev) => !prev);
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "d-flex align-items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-layer-group pt-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white", children: "BaseMap Gallery" })
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "filter-sidebar-footer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "© Pennsylvania Department of Transportation 2025" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarPopup, { title: "Legend", open: isLegendOpen, onClose: () => setIsLegendOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "arcgis-legend",
      {
        referenceElement: mapContainerRef.current,
        className: "w-100 h-100"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarPopup, { title: "BaseMap Gallery", open: isBaseMapGalleryOpen, onClose: () => setIsBaseMapGalleryOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "arcgis-basemap-gallery",
      {
        referenceElement: mapContainerRef.current,
        className: "w-100 h-100"
      }
    ) })
  ] }) });
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
s$1.portalUrl = "https://pennshare.maps.arcgis.com";
function App() {
  const { isLoading, isLoadingScenario, changeMapView, changeFeatureLayer, toggleLoading, toggleLoadingScenario, createSqlLiteDB, loadDataFromFile } = useApp();
  const [isOpenProjects, setIsOpenProjects] = reactExports.useState(false);
  const [isOpenCharts, setIsOpenCharts] = reactExports.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = reactExports.useState(true);
  const [isOpenRightPanel, setIsOpenRightPanel] = reactExports.useState(false);
  const mapContainerRef = reactExports.useRef(null);
  const filterRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    let modalProjects = document.getElementById("projectInfoModal");
    modalProjects == null ? void 0 : modalProjects.addEventListener("hidden.bs.modal", () => {
      setIsOpenProjects(false);
    });
    let modalCharts = document.getElementById("graphicChartModal");
    modalCharts == null ? void 0 : modalCharts.addEventListener("hidden.bs.modal", () => {
      setIsOpenCharts(false);
    });
    initMap();
    createSqlLiteDB();
  }, []);
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
        { name: "OtherCost", type: "double" }
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
  };
  const getRenderer = (useCostBasedSymbology) => {
    if (useCostBasedSymbology) {
      return {
        type: "class-breaks",
        field: "DirectCost",
        classBreakInfos: [
          { minValue: 0, maxValue: 1e5, symbol: { type: "simple-line", color: [34, 139, 34], width: 3 }, label: "< 100k" },
          { minValue: 100001, maxValue: 5e5, symbol: { type: "simple-line", color: [144, 238, 144], width: 3 }, label: "100k - 500k" },
          { minValue: 500001, maxValue: 1e6, symbol: { type: "simple-line", color: [255, 255, 0], width: 3 }, label: "500k - 1M" },
          { minValue: 1000001, maxValue: 2e6, symbol: { type: "simple-line", color: [255, 165, 0], width: 3 }, label: "1M - 2M" },
          { minValue: 2000001, maxValue: 5e6, symbol: { type: "simple-line", color: [255, 69, 0], width: 3 }, label: "2M - 5M" },
          { minValue: 5000001, maxValue: Infinity, symbol: { type: "simple-line", color: [178, 34, 34], width: 3 }, label: "> 5M" }
        ]
      };
    } else {
      const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
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
        const colorIndex = idx % blues.length;
        return { value: yr, symbol: { type: "simple-line", color: blues[colorIndex], width: 3 }, label: `${yr}` };
      });
      return {
        type: "unique-value",
        field: "Year",
        uniqueValueInfos,
        defaultSymbol: { type: "simple-line", color: [128, 128, 128], width: 2 }
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
        await ((_c = filterRef.current) == null ? void 0 : _c.changeScenarioByImport(scenario.LastRunBy, scenario.ScenId));
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-100 h-100 position-relative", children: [
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(Loading, {}),
    isLoadingScenario && /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScenario, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-100 h-100 d-flex flex-column overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-100 h-100 position-relative", children: [
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `map-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`, children: [
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
              isOpenCharts && /* @__PURE__ */ jsxRuntimeExports.jsx(Charts, {})
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("arcgis-map", { ref: mapContainerRef, basemap: "gray", padding: { left: isOpenRightPanel ? 520 : 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("arcgis-home", { position: "top-right" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "position-absolute bottom-0 end-0 p-2 pb-4 d-flex flex-col gap-2 w-100 justify-content-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ButtonWidget, { title: "Import scenario", onClick: importScenario, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("i", { className: "fa-solid fa-file-import me-2" }),
          "Import scenario"
        ] }) })
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
