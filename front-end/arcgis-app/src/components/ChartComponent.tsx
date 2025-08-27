import { useLayoutEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';


echarts.use([
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  BarChart, 
  LineChart, 
  PieChart, 
  CanvasRenderer, 
  LegendComponent
]);

interface ChartComponentProps {
  title: string;
  data: any;
  type: 'bar' | 'line' | 'pie';
  height?: string;
  width?: string;
}

export const ChartComponent = ({ 
  title, 
  data, 
  type, 
  height = '100%', 
  width = '100%' 
}: ChartComponentProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  const createChartOptions = () => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const baseOptions = {
      backgroundColor: 'transparent',
      title: {
        text: title,
        textStyle: {
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        textStyle: {
          color: '#ffffff'
        }
      },
      legend: {
        show: false,
        textStyle: {
          color: '#ffffff'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    };

    if (type === 'bar') {
      return {
        ...baseOptions,
        xAxis: {
          type: 'category',
          data: keys,
          axisLabel: {
            color: '#ffffff'
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#ffffff'
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        series: [
          {
            name: title,
            data: values,
            type: 'bar',
            itemStyle: {
              color: '#ffffff'
            },
            emphasis: {
              itemStyle: {
                color: '#ffffff'
              }
            }
          }
        ]
      };
    }

    if (type === 'line') {
      return {
        ...baseOptions,
        xAxis: {
          type: 'category',
          data: keys,
          axisLabel: {
            color: '#ffffff'
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#ffffff'
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          }
        },
        series: [
          {
            name: title,
            data: values,
            type: 'line',
            itemStyle: {
              color: '#ffffff'
            },
            lineStyle: {
              color: '#ffffff'
            },
            emphasis: {
              itemStyle: {
                color: '#ffffff'
              }
            }
          }
        ]
      };
    }

    if (type === 'pie') {
      return {
        ...baseOptions,
        series: [
          {
            name: title,
            type: 'pie',
            radius: '50%',
            data: keys.map((key, index) => ({
              name: key,
              value: values[index]
            })),
            itemStyle: {
              color: '#ffffff'
            },
            label: {
              color: '#ffffff'
            },
            emphasis: {
              itemStyle: {
                color: '#ffffff'
              }
            }
          }
        ]
      };
    }

    return baseOptions;
  };

  useLayoutEffect(() => {
    if (chartRef.current && data) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      chartInstance.current = echarts.init(chartRef.current, "dark");
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

  return (
    <div 
      ref={chartRef} 
      style={{ 
        width, 
        height, 
        zIndex: 1000, 
        position: 'relative' 
      }}
    />
  );
};
