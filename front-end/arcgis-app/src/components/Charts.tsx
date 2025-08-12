import { useLayoutEffect, useRef } from 'react';

// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';

// Import charts, all with Chart suffix
import {
  BarChart
} from 'echarts/charts';

// import components, all suffixed with Component
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';

// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {
  CanvasRenderer,
} from 'echarts/renderers';
import { useApp } from "@/context/AppContext";

// Register the required components
echarts.use(
  [TitleComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer, LegendComponent]
);

export const Charts = () => {
    const { getTreatmentsFiltered, getFilterValues, getSelectedScenario } = useApp();
    
    const totalCostRef = useRef<HTMLDivElement>(null);
    const treatmentBreakdownRef = useRef<HTMLDivElement>(null);

    const chartsRef = useRef<HTMLDivElement>(null);
    const totalCostGraph = useRef<any>(null);
    const treatmentBreakdownGraph = useRef<any>(null);

    const computeAndRender = () => {
        let filterValues = getFilterValues();
        let scenarioId = getSelectedScenario();
        const treatments = getTreatmentsFiltered(scenarioId, filterValues);

        // Total costo por año
        let totalCostByYear: any = {};
        let treatmentBreakdownByYear: any = {};

        treatments.forEach(treatment => {
            if(!totalCostByYear[treatment.Year]) {
                totalCostByYear[treatment.Year] = 0;
            }
            totalCostByYear[treatment.Year] += treatment.Cost;

            if(!treatmentBreakdownByYear[treatment.TreatType]) {
                treatmentBreakdownByYear[treatment.TreatType] = 0;
            }
            treatmentBreakdownByYear[treatment.TreatType] += 1;
        });

        initOptionsTotalCost(totalCostByYear);
        initOptionsTreatmentBreakdown(treatmentBreakdownByYear);

        const ro = new ResizeObserver(() => {
            if(totalCostGraph.current) {
                totalCostGraph.current.resize();
            }
            if(treatmentBreakdownGraph.current) {
                treatmentBreakdownGraph.current.resize();
            }
        });

        if(chartsRef.current) {
            ro.observe(chartsRef.current);
        }
    }

    useLayoutEffect(() => {
        computeAndRender();
        const handler = () => computeAndRender();
        window.addEventListener('filter-updated', handler as any);
        return () => window.removeEventListener('filter-updated', handler as any);
    }, []);

    const initOptionsTotalCost = (totalCostByYear: any) => {
        let years = Object.keys(totalCostByYear);
        let totalCosts = Object.values(totalCostByYear);

        let option = {
            backgroundColor: 'transparent',
            title: {
                text: 'Total Cost by Year'
            },
            xAxis: {
                type: 'category',
                data: years
            },
                yAxis: {
                type: 'value'
            },
            legend: {
                show: true,
                data: ['Total Cost']
            },
            series: [
                {
                    name: "Total Cost",
                    data: totalCosts,
                    type: 'bar'
                }
            ]
        }

        totalCostGraph.current = echarts.init(totalCostRef.current, "dark");
        totalCostGraph.current.setOption(option);
    }

    const initOptionsTreatmentBreakdown = (treatmentBreakdownByYear: any) => {
        let treatmentTypes = Object.keys(treatmentBreakdownByYear);
        let treatmentCounts = Object.values(treatmentBreakdownByYear);

        let option = {
            backgroundColor: 'transparent',
            title: {
                text: 'Treatment Breakdown'
            },
            xAxis: {
                type: 'category',
                data: treatmentTypes
            },
            yAxis: {
                type: 'value'
            },
            color: ['#66B88F'],
            legend: {
                show: true,
                data: ['Treatment Breakdown']
            },
            series: [
                {
                    name: "Treatment Breakdown",
                    data: treatmentCounts,
                    type: 'bar'
                }
            ]
        }

        treatmentBreakdownGraph.current = echarts.init(treatmentBreakdownRef.current, "dark");
        treatmentBreakdownGraph.current.setOption(option);
    }

    return (
        <div className="w-100 h-100 d-flex flex-column" ref={chartsRef}>
            <div className="w-100 h-50">
                <div className="w-100 h-100" ref={totalCostRef} id="totalCost"></div>
            </div>
            <div className="w-100 h-50">
                <div className="w-100 h-100" ref={treatmentBreakdownRef} id="treatmentBreakdown"></div>                
            </div>
        </div>
    )
}