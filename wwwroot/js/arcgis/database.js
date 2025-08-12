var db = null;

const createSqlLiteDB = async () => {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`
    });

    db = new SQL.Database();

    db.run (`
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
}

const loadDataFromFile = async (file) => {
    // Convert file to json
    const fileContent = await file.text();
    const jsonData = JSON.parse(fileContent);

    const scenario = jsonData.Scenario;
    const projects = jsonData.Projects;
    const treatments = jsonData.Treatments;

    const projectId = {};

    // Insert data into database
    db.run(`
        INSERT INTO Scenario (ScenId, Name, LibraryName, LibraryId, LastRunBy, LastRunTime, Notes) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [scenario.ScenId, scenario.Name, scenario.LibraryName, scenario.LibraryId, scenario.LastRunBy, scenario.LastRunTime, scenario.Notes]);


    for (const project of projects) {        
        db.run(`
            INSERT INTO Project (ScenarioId, UserId, UserNotes, SchemaId, ProjType, Year, NBridges, NPave, Cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [scenario.ScenId, project.UserId || null, project.UserNotes || null, project.SchemaId || null, project.ProjType || null, project.Year || null, project.NBridges || null, project.NPave || null, project.Cost || null]);
            
        const [{ values }] = db.exec("SELECT last_insert_rowid();");
        projectId[project.ProjId] = values[0][0];
    }

    for(const treatment of treatments) {
        const projectId = projectId[treatment.ProjId];

        db.run(`
            INSERT INTO Treatment (ProjId, TreatmentId, ProjType, Treatment, TreatType, Dist, Cnty, Rte, Dir, FromSection, ToSection, BRKEY, BRIDGE_ID, Owner, COUNTY, MPO_RPO, Year, Cost, Benefit, PreferredYear, MinYear, MaxYear, PriorityOrder, IsCommitted, Risk, IndirectCostDesign, IndirectCostOther, IndirectCostROW, IndirectCostUtilities, B_C, MPMSID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [projectId, treatment.TreatmentId || null, treatment.ProjType || null, treatment.Treatment || null, treatment.TreatType || null, treatment.Dist || null, treatment.Cnty || null, treatment.Rte || null, treatment.Dir || null, treatment.FromSection || null, treatment.ToSection || null, treatment.BRKEY || null, treatment.BRIDGE_ID || null, treatment.Owner || null, treatment.COUNTY || null, treatment["MPO/RPO"] || null, treatment.Year || null, treatment.Cost || null, treatment.Benefit || null, treatment.PreferredYear || null, treatment.MinYear || null, treatment.MaxYear || null, treatment.PriorityOrder || null, treatment.IsCommitted || null, treatment.Risk || null, treatment.IndirectCostDesign || null, treatment.IndirectCostOther || null, treatment.IndirectCostROW || null, treatment.IndirectCostUtilities || null, treatment["B/C"] || null, treatment.MPMSID || null]);
    }
}

const getScenariosFromDB = (userId) => {
    try {
        const [{ values }] = db.exec(`
            SELECT * FROM Scenario WHERE LastRunBy = ?
        `, [userId]);

        // Convert result to json
        const scenarios = values.map(scenario => ({
            ScenId: scenario[0],
            Name: scenario[1],
            LibraryName: scenario[2],
            LibraryId: scenario[3],
            LastRunBy: scenario[4],
            LastRunTime: scenario[5],
            Notes: scenario[6]
        }));

        return scenarios;
    } catch (error) {
        return [];
    }
}

const getProjectsFromDB = (scenarioId) => {
    try {
        const [{ values }] = db.exec(`
            SELECT * FROM Project WHERE ScenarioId = ?
        `, [scenarioId]);

        // Convert result to json
        const projects = values.map(project => ({
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
}

const getTreatmentsFromDB = (scenarioId) => {
    try {
        const [{ values }] = db.exec(`
            SELECT * FROM Treatment WHERE ProjId IN (SELECT ProjId FROM Project WHERE ScenarioId = ?)
        `, [scenarioId]);

        // Convert result to json
        const treatments = values.map(treatment => ({
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
}

const getUniqueUsersFromDB = () => {
    try{
        const [{ values }] = db.exec(`
            SELECT DISTINCT LastRunBy FROM Scenario
        `);
    
        return values.map(user => user[0]);
    } catch (error) {
        return [];
    }
}

const getTreatmentsPerProjectFromDB = (projectId) => {
    try{
        const [{ values }] = db.exec(`
            SELECT * FROM Treatment WHERE ProjId = ?
        `, [projectId]);
    
        return values.map(treatment => ({
            TreatId: treatment[0],
            ProjId: treatment[1],
        }));
    } catch (error) {
        return [];
    }
}