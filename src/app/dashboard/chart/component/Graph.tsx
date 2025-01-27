"use client";
import React from "react";
import ChartsCard from "../../reports/component/ChartsCard";

function Graph({ queryResult, report }: { queryResult: any; report: any }) {
  const formData = {
    ...report,
    chartType: report.chart_type,
    yaxis: report.y_axis_field.split(",").map((field: string) => field.trim()), // Split and trim each field
    xaxis: report.x_axis_field,
  };

  return (
    <>
      <ChartsCard data={queryResult} formData={formData} />
    </>
  );
}

export default Graph;
