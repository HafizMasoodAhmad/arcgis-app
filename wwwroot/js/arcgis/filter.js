var mapView;
var state = {
    useCostBasedSymbology: false
}
var featureLayer;

// Selected values
var selectedUser = null;
var selectedScenario = null;
 
async function initMap() { 
    const [WebMap] = await $arcgis.import(["@arcgis/core/WebMap.js"]);
    const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");    

    let webmapId = "523189e0fde048c990df702553fb73e5";
    const viewElement = document.querySelector("arcgis-map");

    const map = new WebMap({
        portalItem: {
            id: webmapId,
        },
    });

    viewElement.map = map;
    await viewElement.viewOnReady();

    mapView = viewElement;

    // Create new feature layer from the scenario data
    featureLayer = new FeatureLayer({
        title: 'Scenario Treatments',
        id: 'ScenarioTreatmentsLayer',
        visible: true,
        objectIdField: 'OBJECTID',
        geometryType: 'polyline',
        spatialReference: { wkid: 102100 },
        fields: [
            { name: 'OBJECTID', type: 'oid' },
            { name: 'ProjectID', type: 'integer' },
            { name: 'SystemID', type: 'integer' },
            { name: 'DistrictNo', type: 'integer' },
            { name: 'CountyCode', type: 'integer' },
            { name: 'TreatmentID', type: 'string' },
            { name: 'AssetType', type: 'string' },
            { name: 'Route', type: 'integer' },
            { name: 'SectionFrom', type: 'integer' },
            { name: 'SectionTo', type: 'integer' },
            { name: 'BridgeID', type: 'string' },
            { name: 'TreatmentType', type: 'string' },
            { name: 'Treatment', type: 'string' },
            { name: 'Year', type: 'integer' },
            { name: 'DirectCost', type: 'double' },
            { name: 'DesignCost', type: 'double' },
            { name: 'ROWCost', type: 'double' },
            { name: 'UtilCost', type: 'double' },
            { name: 'OtherCost', type: 'double' }
        ]
    });
    
    featureLayer.source = [];
    featureLayer.outFields = ['*'];
    featureLayer.popupEnabled = false;  // We'll use our custom popup
    featureLayer.elevationInfo = { mode: 'on-the-ground' };
    featureLayer.renderer = getRenderer();

    mapView.map.add(featureLayer);

    window.addEventListener('symbologyUpdate', handleSymbologyUpdate);
    // window.addEventListener('filter-updated', handleFilterUpdated);

    const form = document.getElementById('filterForm');
    form.addEventListener('reset', () => {
        resetFilter();
    });
    
    createSqlLiteDB();
}

async function resetFilter() {
    toggleLoadingOverlay(true);

    const featureLayer = mapView.map.findLayerById('ScenarioTreatmentsLayer');

    const current = await featureLayer.queryFeatures();

    await featureLayer.applyEdits({ deleteFeatures: current.features});
    
    fillSelectOptions(document.querySelector('select[name="year"]'), 'Select Year', []);
    fillSelectOptions(document.querySelector('select[name="asset_type"]'), 'Select Asset Type', []);
    fillSelectOptions(document.querySelector('select[name="treatment"]'), 'Select Treatment', []);
    fillSelectOptions(document.querySelector('select[name="route"]'), 'Select Route', []);

    const scenarioSelect = document.getElementById('scenario_id');
    scenarioSelect.value = "";

    selectedScenario = null;

    toggleLoadingOverlay(false);
}

function handleSymbologyUpdate(event) {
    const { useCostBasedSymbology } = event.detail;
    featureLayer.renderer = getRenderer(useCostBasedSymbology);
}

function getRenderer() {
    if (state.useCostBasedSymbology) {
        return {
            type: 'class-breaks',
            field: 'DirectCost',
            classBreakInfos: [
                { minValue: 0, maxValue: 100000, symbol: { type: 'simple-line', color: [34, 139, 34], width: 3 }, label: '< 100k' },
                { minValue: 100001, maxValue: 500000, symbol: { type: 'simple-line', color: [144, 238, 144], width: 3 }, label: '100k - 500k' },
                { minValue: 500001, maxValue: 1000000, symbol: { type: 'simple-line', color: [255, 255, 0], width: 3 }, label: '500k - 1M' },
                { minValue: 1000001, maxValue: 2000000, symbol: { type: 'simple-line', color: [255, 165, 0], width: 3 }, label: '1M - 2M' },
                { minValue: 2000001, maxValue: 5000000, symbol: { type: 'simple-line', color: [255, 69, 0], width: 3 }, label: '2M - 5M' },
                { minValue: 5000001, maxValue: Infinity, symbol: { type: 'simple-line', color: [178, 34, 34], width: 3 }, label: '> 5M' }
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
            return { value: yr, symbol: { type: 'simple-line', color: blues[colorIndex], width: 3 }, label: `${yr}` };
        });

        return {
            type: 'unique-value',
            field: 'Year',
            uniqueValueInfos,
            defaultSymbol: { type: 'simple-line', color: [128, 128, 128], width: 2 }
        };
    }
}

function toggleLoadingOverlay(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.toggle('d-none', !show);
}

async function importScenario() {
    // Open the window to import the json file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';  
    //fileInput.onchange = handleFileChange;
    fileInput.addEventListener('change', async (event) => {
        toggleLoadingOverlay(true);
        document.body.removeChild(fileInput);

        const file = event.target.files[0];
        if (file) {
            await loadDataFromFile(file);      
            
            // Fill the select options
            let usersDB = getUniqueUsersFromDB();
            let users = usersDB.map(user => ({ value: user, label: user }));
    
            const selectUser = document.querySelector('select[name="user_id"]');
            fillSelectOptions(selectUser, 'Select User', users);

            if(selectedUser) {
                // Validate if the selected user is in the list
                if(!users.some(u => u.value === selectedUser)) {
                    selectedUser = "";
                }

                selectUser.value = selectedUser;
            }
    
            // Fill the select options
            let scenariosDB = getScenariosFromDB(usersDB[0].LastRunBy);
            let scenarios  = scenariosDB.map(s => ({ value: s.ScenId, label: s.Name }));
            const selectScenario = document.querySelector('select[name="scenario_id"]');
            fillSelectOptions(selectScenario, 'Select Scenario', scenarios);

            if(selectedScenario) {
                // Validate if the selected scenario is in the list
                if(!scenarios.some(s => `${s.value}` === selectedScenario)) {
                    selectedScenario = "";
                }

                selectScenario.value = selectedScenario;
            }
        }

        toggleLoadingOverlay(false);
    });
    document.body.appendChild(fileInput);
    fileInput.click();

}


async function changeUser(userId){
    toggleLoadingOverlay(true);
    selectedUser = userId;

    // Fill the select options
    let scenariosDB = getScenariosFromDB(userId);
    let scenarios  = scenariosDB.map(s => ({ value: s.ScenId, label: s.Name }));
    const selectScenario = document.querySelector('select[name="scenario_id"]');
    fillSelectOptions(selectScenario, 'Select Scenario', scenarios);
    
    toggleLoadingOverlay(false);
}

async function changeScenario(scenarioId) {

    if(scenarioId === "") {
        resetFilter();
        return;
    }

    toggleLoadingOverlay(true);

    selectedScenario = scenarioId;

    let scenarioRelations = {
        Projects: getProjectsFromDB(scenarioId),
        Treatments: getTreatmentsFromDB(scenarioId)
    }

    await _loadTreatments(mapView, scenarioRelations);

    const yearSet = new Set(), routeSet = new Set(), assetTypeSet = new Set(), treatmentSet = new Set();
    
    for (const t of scenarioRelations.Treatments || []) {
        if (t.Year) yearSet.add(String(t.Year));
        if (t.Rte) routeSet.add(String(t.Rte));
        if (t.TreatType) assetTypeSet.add(String(t.TreatType));
        if (t.Treatment) treatmentSet.add(String(t.Treatment));      
    }

    // Fill select options
    const selectYear = document.querySelector('select[name="year"]');
    const selectAssetType = document.querySelector('select[name="asset_type"]');
    const selectTreatment = document.querySelector('select[name="treatment"]');
    const selectRoute = document.querySelector('select[name="route"]');  
    

    fillSelectOptions(selectYear, 'Select Year', [...yearSet].sort().map(y => ({ value: y, label: y })));
    fillSelectOptions(selectAssetType, 'Select Asset Type', [...assetTypeSet].sort().map(a => ({ value: a, label: a })));
    fillSelectOptions(selectTreatment, 'Select Treatment', [...treatmentSet].sort().map(t => ({ value: t, label: t })));
    fillSelectOptions(selectRoute, 'Select Route', [...routeSet].sort().map(r => ({ value: r, label: r })));

    toggleLoadingOverlay(false);
}


function fillSelectOptions(select, emptyText, options) {
    select.innerHTML = '';

    // add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = emptyText;
    select.appendChild(emptyOption);

    options.forEach(optionItem => {
        const option = document.createElement('option');
        option.value = optionItem.value;
        option.textContent = optionItem.label;
        select.appendChild(option); 
    });
}

function isEmpty(value) {
    return value === null || value === undefined || value === '';
}

async function applyFilter(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const whereClauses = [];

    // const selectedUser = formData.get('user_id');
    const selectedRoutes = formData.get('route');
    const selectedProjectYears = formData.get('year');
    const selectedAssetType = formData.get('asset_type');
    const selectedTreatment = formData.get('treatment');
    
    if (!isEmpty(selectedRoutes)) {
      const vals = [selectedRoutes];
      whereClauses.push(`Route IN (${vals})`);
    }
    if (!isEmpty(selectedProjectYears)) {
        const vals = [selectedProjectYears];
        whereClauses.push(`Year IN (${vals})`);
    }

    if (!isEmpty(selectedAssetType)) {
      const vals = [selectedAssetType];
      whereClauses.push(`AssetType IN ('${vals.join("','")}')`);
    }

    if(!isEmpty(selectedTreatment)) {
        const vals = [selectedTreatment];
        whereClauses.push(`Treatment IN ('${vals.join("','")}')`);
    }

    /* if (!isEmpty(selectedTreatment)) {
      const vals = [selectedTreatment];
      whereClauses.push(`Treatment IN (${vals})`);
    } */

    const definition = whereClauses.join(' AND ');
    featureLayer.definitionExpression = definition;
    console.log("📌 Applied definitionExpression:", definition);
    featureLayer.refresh?.();

    const useCostBasedSymbology = whereClauses.length > 0;

    window.dispatchEvent(new CustomEvent('symbologyUpdate', {
      detail: { useCostBasedSymbology }
    }));

    const Treatments = getTreatmentsFromDB(selectedScenario);

    const matched = Treatments.filter((t) => {
      const yearOk = selectedProjectYears === t.Year;
      const routeOk = selectedRoutes === t.Rte || t.Route;
      const assetTypeOk = selectedAssetType === t.AssetType;
      const treatmentOk = selectedTreatment === t.Treatment;

      return yearOk && assetTypeOk && treatmentOk && routeOk;
    });

    const filteredTreatIds = matched.map(t => t.TreatId ?? t.TreatmentId ?? t.TreatmentID);
    const filteredProjIds = [...new Set(matched.map(t => t.ProjId ?? t.ProjectID))];

    console.log("🔍 Matched treatments:", matched.length);
    console.log("🔍 Filtered Project IDs:", filteredProjIds);
    console.log("🔍 Filtered Treatment IDs:", filteredTreatIds);
    window.dispatchEvent(new CustomEvent('filter-updated', {
      detail: { filteredProjIds, filteredTreatIds }
    }));
}

const handleFilterUpdated = (evt) => {
//   const { filteredProjIds, filteredTreatIds } = evt.detail;
//   const newProjects = scenarioSelected.Projects.filter(p => filteredProjIds.includes(p.ProjId ?? p.ProjectID));
//   setFilteredProjects(newProjects);
//   setFilteredTreatIds(filteredTreatIds);
}