import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { MultiSelect } from "@/components/MultiSelect";
import Separator from "./Separator";

interface FilterProps {
    onReset?: () => void;
}

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

export const Filter = forwardRef<FilterRef, FilterProps>(({ onReset }, ref ) => { 
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
    
    useEffect(() => {
        formRef.current?.addEventListener('reset', () => {            
            resetFilter();
            onReset && onReset();
        });
    }, [])

    useImperativeHandle(ref, () => ({
        resetScenario,
        changeScenarioByImport,
        fillSelectById
    }));

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

    const resetFilter = async() => {
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
    
        const scenarioSelect = scenarioRef.current as HTMLSelectElement;
        if(scenarioSelect) {
            scenarioSelect.value = "";
        }
    
        changeSelectedScenario("");
    
        toggleLoading(false);
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
        
        const featureLayer = getFeatureLayer();

        const definition = whereClauses.join(' AND ');
        featureLayer.definitionExpression = definition;
        console.log("📌 Applied definitionExpression:", definition);
        featureLayer.refresh?.();

        const useCostBasedSymbology = whereClauses.length > 0;

        window.dispatchEvent(new CustomEvent('symbologyUpdate', {
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
        
        window.dispatchEvent(new CustomEvent('filter-updated', {
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
                <MultiSelect className="w-100" options={options.year} onChange={onChange} name="year" id="year" placeholder="Select Year"/>
                <MultiSelect className="w-100" options={options.asset_type} onChange={onChange} name="asset_type" id="asset_type" placeholder="Select Asset Type"/>
                <MultiSelect className="w-100" options={options.treatment} onChange={onChange} name="treatment" id="treatment" placeholder="Select Treatment"/>
                <MultiSelect className="w-100" options={options.route} onChange={onChange} name="route" id="route" placeholder="Select Route"/>


                <button
                    type="reset"
                    className="btn btn-primary"
                    onClick={() => {
                        resetFilter();
                    }}
                >
                    Clear all filters
                    <i className="fa-solid fa-broom pt-1 ms-2"></i>
                </button>
            </form>
        </div>
    )
})