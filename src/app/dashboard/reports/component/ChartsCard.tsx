import React from "react";
import ReactECharts from "echarts-for-react";
import { chartType } from "./data";

export default function ChartsCard({
  data,
  formData,
}: {
  data: any;
  formData: any;
}) {
  const xAxisField = formData.xaxis; // X-axis selection (could be dynamic)
  const yAxisFields = formData.yaxis;

  function getKeyByValue(object: any, value: any) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  const chartTypeKey = getKeyByValue(chartType, formData.chartType);
  // Extract X data
  const xData = data.map((item: any) => item[xAxisField]);

  // Prepare Y data for each selected field
  const yData = yAxisFields.map((field: any) => ({
    name: field, // Ensure this matches the legend name
    data: data.map((item: any) => item[field]),
    type: chartTypeKey, // Default to "line" if chartType is undefined
    smooth: true, // Smooth curve for the line chart
  }));

  // ECharts configuration with dataZoom for scrolling
  const option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: yAxisFields, // Must match series names
    },
    xAxis: {
      type: "category",
      data: xData,
      name: xAxisField,
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontWeight: 600,
        color: "#444444",
      },
    },
    yAxis: {
      type: "value",
    },
    series: yData, // Use the prepared yData array
    dataZoom: [
      {
        type: "inside", // Allows for zooming inside the chart area
        start: 95, // Start at the first data point
        end: 100, // Initial zoom to show all data points
      },
      {
        type: "slider", // Adds a slider for user to scroll
        show: true,
        start: 0, // Initial position of the slider
        end: 10, // Only show 10 data points initially
      },
    ],
  };

  return (
    <div className="w-full flex items-center justify-center">
      <ReactECharts
        option={option}
        style={{
          width: "100%",
          height: "400px", // Set a height for the chart
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </div>
  );
}
