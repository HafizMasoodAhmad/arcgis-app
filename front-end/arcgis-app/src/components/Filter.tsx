import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { MultiSelect } from "@/components/MultiSelect";
import { STORAGE_KEYS } from "@/utils/storage";
import { EVENTS } from "@/utils/events";

interface FilterProps {}

export interface FilterRef {
    resetScenario: () => void;
    changeScenarioByImport: (userId: string, scenarioId: string) => void;
    fillSelectById: (selectName: string, optionsValues: { value: string, label: string }[]) => void;
}

interface Options {
    year: { value: string, label: string }[];
    asset_type: { value: string, label: string }[];
    treatment: { value: string, label: string }[];
    route: { value: string, label: string }[];
}

export const Filter = forwardRef<FilterRef, FilterProps>(({ }, ref ) => { 
    const { toggleLoading, toggleLoadingScenario, changeFilterValues, getFeatureLayer, getSelectedScenario, getSelectedUser, changeSelectedScenario, changeSelectedUser, getTreatmentsFromDB, getUniqueUsersFromDB, getScenariosFromDB, getProjectsFromDB, loadTreatments } = useApp();
    
    const formRef = useRef<HTMLFormElement>(null);
    const userRef = useRef<HTMLSelectElement>(null);
    const scenarioRef = useRef<HTMLSelectElement>(null);

    const [options, setOptions] = useState<Options>({
        year: [],
        asset_type: [],
        treatment: [],
        route: []
    });

    const [selectedValues, setSelectedValues] = useState<{year: string[]; asset_type: string[]; treatment: string[]; route: string[]}>({
        year: [], asset_type: [], treatment: [], route: []
    });
    
    useEffect(() => {
        // No reset handler in filters area
    }, [])

    useImperativeHandle(ref, () => ({
        resetScenario,
        changeScenarioByImport,
        fillSelectById,
        // Forzar reset total desde afuera
        hardResetAllFilters: async () => {
            await resetFilter(true);
        }
    }) as any);

    const changeScenarioByImport = (userId: string, scenarioId: string) => {
        resetScenario();
        
        changeUser(userId);
        changeScenario(scenarioId);
        
        const selectUser = userRef.current as HTMLSelectElement;
        selectUser.value = userId;

        const selectScenario = scenarioRef.current as HTMLSelectElement;
        selectScenario.value = scenarioId;
    }

    const resetScenario = () => {
        // Fill the select options
        let usersDB = getUniqueUsersFromDB();
        let users = usersDB.map(user => ({ value: user, label: user }));

        const selectUser = userRef.current as HTMLSelectElement;
        fillSelectOptions(selectUser, 'Select User', users);

        const selectedUser = getSelectedUser();

        if(selectedUser) {
            // Validate if the selected user is in the list
            if(!users.some(u => u.value === selectedUser)) {
                changeSelectedUser("");
            }

            selectUser.value = selectedUser;
        }

        // Fill the select options
        let scenariosDB = getScenariosFromDB(usersDB[0]);
        let scenarios  = scenariosDB.map(s => ({ value: s.ScenId, label: s.Name }));
        const selectScenario = scenarioRef.current as HTMLSelectElement;
        fillSelectOptions(selectScenario, 'Select Scenario', scenarios);

        const selectedScenario = getSelectedScenario();

        if(selectedScenario) {
            // Validate if the selected scenario is in the list
            if(!scenarios.some(s => `${s.value}` === selectedScenario)) {
                changeSelectedScenario("");
            }

            selectScenario.value = selectedScenario;
        }
    }

    const fillSelectById = (selectName: string, optionsValues: { value: string, label: string }[]) => {
        setOptions({
            ...options,
            [selectName]: optionsValues
        });
    }

    const resetFilter = async(forceFullReset?: boolean) => {
        toggleLoading(true);

        let featureLayer = getFeatureLayer();
    
        const current = await featureLayer.queryFeatures();
    
        await featureLayer.applyEdits({ deleteFeatures: current.features});

        setOptions({
            year: [],
            asset_type: [],
            treatment: [],
            route: []
        });
        setSelectedValues({ year: [], asset_type: [], treatment: [], route: [] });
    
        const scenarioSelect = scenarioRef.current as HTMLSelectElement;
        if(scenarioSelect) {
            scenarioSelect.value = "";
        }
        changeSelectedScenario("");

        // También limpiar usuario si es un reset total
        if (forceFullReset) {
            const userSelect = userRef.current as HTMLSelectElement;
            if (userSelect) userSelect.value = "";
            changeSelectedUser("");
            // Vaciar las opciones de User y Scenario para que queden como los demás filtros
            fillSelectOptions(userSelect, 'Select User', []);
            fillSelectOptions(scenarioSelect, 'Select Scenario', []);
        }
    
        toggleLoading(false);

        // Quitar definitionExpression si existía y notificar cambio
        try {
            featureLayer.definitionExpression = null as any;
            featureLayer.refresh?.();
        } catch {}
        window.dispatchEvent(new CustomEvent(EVENTS.filterUpdated, { detail: {} }));
    }

    const fillSelectOptions = (select: HTMLSelectElement | any, emptyText: string, options: { value: string, label: string }[]) => {
        if (!select) return;

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
    

    const changeUser = (userId: string) => {
        changeSelectedUser(userId);

        // Fill the select options
        let scenariosDB = getScenariosFromDB(userId);
        let scenarios  = scenariosDB.map((s: any) => ({ value: s.ScenId, label: s.Name }));
        const selectScenario = scenarioRef.current as HTMLSelectElement;
        fillSelectOptions(selectScenario, 'Select Scenario', scenarios);
    }

    const changeScenario = async (scenarioId: string) => {
        if(scenarioId === "") {
            resetFilter();
            return;
        }

        toggleLoadingScenario(true);

        changeSelectedScenario(scenarioId);

        let scenarioRelations = {
            Projects: getProjectsFromDB(scenarioId),
            Treatments: getTreatmentsFromDB(scenarioId)
        }

        await loadTreatments(scenarioRelations);

        const yearSet = new Set(), routeSet = new Set(), assetTypeSet = new Set(), treatmentSet = new Set();
        
        for (const t of scenarioRelations.Treatments || []) {
            if (t.Year) yearSet.add(String(t.Year));
            if (t.Rte) routeSet.add(String(t.Rte));
            if (t.TreatType) assetTypeSet.add(String(t.TreatType));
            if (t.Treatment) treatmentSet.add(String(t.Treatment));      
        }

        setOptions({
            year: [...yearSet].sort().map((y: any) => ({ value: y, label: y })),
            asset_type: [...assetTypeSet].sort().map((a: any) => ({ value: a, label: a })),
            treatment: [...treatmentSet].sort().map((t: any) => ({ value: t, label: t })),
            route: [...routeSet].sort().map((r: any) => ({ value: r, label: r }))
        });

        toggleLoadingScenario(false);

        // Notificar a otros componentes (Projects, Charts) que deben recargar datos
        window.dispatchEvent(new CustomEvent('filter-updated', { detail: {} }));

        // Restaurar filtros persistidos para este escenario (si existen)
        try {
            const savedRaw = localStorage.getItem(`${STORAGE_KEYS.filtersPrefix}${scenarioId}`);
            if (savedRaw) {
                const saved = JSON.parse(savedRaw) as {route?: string[]; year?: string[]; asset_type?: string[]; treatment?: string[]};
                const routeSel = Array.isArray(saved.route) ? saved.route : [];
                const yearSel = Array.isArray(saved.year) ? saved.year : [];
                const assetSel = Array.isArray(saved.asset_type) ? saved.asset_type : [];
                const treatSel = Array.isArray(saved.treatment) ? saved.treatment : [];
                setSelectedValues({ year: yearSel, asset_type: assetSel, treatment: treatSel, route: routeSel });

                const whereClauses: string[] = [];
                if (routeSel.length > 0) whereClauses.push(`Route IN (${routeSel.join(',')})`);
                if (yearSel.length > 0) whereClauses.push(`Year IN (${yearSel.join(',')})`);
                if (assetSel.length > 0) whereClauses.push(`AssetType IN ('${assetSel.join("','")}')`);
                if (treatSel.length > 0) whereClauses.push(`Treatment IN ('${treatSel.join("','")}')`);

                const featureLayer = getFeatureLayer();
                featureLayer.definitionExpression = whereClauses.join(' AND ');
                featureLayer.refresh?.();

                changeFilterValues({ route: routeSel, year: yearSel, assetType: assetSel, treatment: treatSel });

                const useCostBasedSymbology = whereClauses.length > 0;
                window.dispatchEvent(new CustomEvent(EVENTS.symbologyUpdate, { detail: { useCostBasedSymbology } }));
                window.dispatchEvent(new CustomEvent(EVENTS.filterUpdated, { detail: {} }));
            }
        } catch {}
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        applyFilter(e.currentTarget);
    }

    const transformValues = (value: FormDataEntryValue | null) => {
        if(value === null || value === undefined || value === "") return [];

        return value.toString().split(',');
    }

    const applyFilter = (form: HTMLFormElement) => {
        
        const formData = new FormData(form);

        const whereClauses = [];

        // const selectedUser = formData.get('user_id');
        const selectedRoutes = transformValues(formData.get('route'));
        const selectedProjectYears = transformValues(formData.get('year'));
        const selectedAssetType = transformValues(formData.get('asset_type'));
        const selectedTreatment = transformValues(formData.get('treatment'));      

        let newFilterValues: any = {}
        
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

        if(selectedTreatment && selectedTreatment.length > 0) {
            const vals = selectedTreatment;
            whereClauses.push(`Treatment IN ('${vals.join("','")}')`);

            newFilterValues.treatment = selectedTreatment;
        }

        changeFilterValues(newFilterValues);
        // Actualizar selección local y persistir por escenario
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
        } catch {}
        
        const featureLayer = getFeatureLayer();

        const definition = whereClauses.join(' AND ');
        featureLayer.definitionExpression = definition;
        console.log("📌 Applied definitionExpression:", definition);
        featureLayer.refresh?.();

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

        const filteredTreatIds = matched.map(t => t.TreatId ?? t.TreatmentId ?? t.TreatmentID);
        const filteredProjIds = [...new Set(matched.map(t => t.ProjId ?? t.ProjectID))];

        console.log("🔍 Matched treatments:", matched.length);
        console.log("🔍 Filtered Project IDs:", filteredProjIds);
        console.log("🔍 Filtered Treatment IDs:", filteredTreatIds);
        
        window.dispatchEvent(new CustomEvent(EVENTS.filterUpdated, {
            detail: { filteredProjIds, filteredTreatIds }
        }));
    }

    const onChange = () => {
        applyFilter(formRef.current as HTMLFormElement);
    }

    return (
        <div className="filters d-flex flex-column gap-2 w-100">
            <select 
                ref={userRef}
                className="form-select w-100" 
                name="user_id" 
                id="user_id" 
                data-filter="user" 
                onChange={(e)=>{changeUser(e.target.value)}} 
                style={{borderColor: "var(--primary-400)", backgroundColor: "var(--primary-800)", color: "var(--white)"}}>
                <option value="">Select User</option>
            </select>
            <select 
                ref={scenarioRef}
                className="form-select w-100"
                name="scenario_id"
                id="scenario_id"
                data-filter="scenario"
                onChange={(e)=>{changeScenario(e.target.value)}}
                style={{borderColor: "var(--primary-400)", backgroundColor: "var(--primary-800)", color: "var(--white)"}}>
                <option value="">Select Scenario</option>
            </select>

            <form className="d-flex flex-column gap-2" onSubmit={onSubmit} ref={formRef}>
                {/* Dependent filters */}
                <MultiSelect className="w-100" options={options.year} selectedValues={selectedValues.year} onChange={onChange} name="year" id="year" placeholder="Select Year"/>
                <MultiSelect className="w-100" options={options.asset_type} selectedValues={selectedValues.asset_type} onChange={onChange} name="asset_type" id="asset_type" placeholder="Select Asset Type"/>
                <MultiSelect className="w-100" options={options.treatment} selectedValues={selectedValues.treatment} onChange={onChange} name="treatment" id="treatment" placeholder="Select Treatment"/>
                <MultiSelect className="w-100" options={options.route} selectedValues={selectedValues.route} onChange={onChange} name="route" id="route" placeholder="Select Route"/>
            </form>
        </div>
    )
})