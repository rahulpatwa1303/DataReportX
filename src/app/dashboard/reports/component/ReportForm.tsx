"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import { chartType } from "./data";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

function ReportForm({
  formData,
  handleChange,
  handleSelectChange,
  errors,
  connections,
  queryExecutionResult,
  handleDropDownChange,
}: ReportFormProps) {

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Report Name */}
        <div>
          <Label
            htmlFor="reportName"
            className="block text-sm font-medium text-gray-700"
          >
            Report Name
          </Label>
          <Input
            id="reportName"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter report name"
            className={`mt-1 block w-full ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Connections */}
        <div>
          <Label
            htmlFor="connectionId"
            className="block text-sm font-medium text-gray-700"
          >
            Connections
          </Label>
          <Select
            onValueChange={(id) => handleSelectChange(id, "connection")}
            value={formData.connectionName}
          >
            <SelectTrigger
              className={`w-full mt-1 ${
                errors.connectionId && "border-red-500"
              }`}
            >
              <SelectValue placeholder="Select a connection" />
            </SelectTrigger>
            <SelectContent>
              {connections.map((connection) => (
                <SelectItem
                  key={connection.id}
                  value={connection.database_name}
                >
                  {connection.database_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.connectionId && (
            <p className="text-xs text-red-500">{errors.connectionId}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="chartType"
            className="block text-sm font-medium text-gray-700"
          >
            Chart Type
          </Label>
          <Select
            onValueChange={(id) => handleSelectChange(id, "charts")}
            value={formData.chartType}
          >
            <SelectTrigger
              className={`w-full mt-1 ${errors.chartType && "border-red-500"}`}
            >
              <SelectValue placeholder="Select a connection" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(chartType).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.chartType && (
            <p className="text-xs text-red-500">{errors.chartType}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="xaxis"
            className="block text-sm font-medium text-gray-700"
          >
            X Axis field
          </Label>
          <Select
            onValueChange={(id) => handleSelectChange(id, "xaxis")}
            value={formData?.xaxis}
          >
            <SelectTrigger
              className={`w-full mt-1 ${errors.xaxis && "border-red-500"}`}
            >
              <SelectValue placeholder="Select a connection" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(queryExecutionResult) &&
              queryExecutionResult.length === 0 ? (
                <SelectItem key="empty" value="No data available">
                  No data available
                </SelectItem>
              ) : (
                Object.entries(queryExecutionResult[0]).map(([key, value]) => (
                  <SelectItem key={key} value={String(key)}>
                    {String(key)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.xaxis && (
            <p className="text-xs text-red-500">{errors.xaxis}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="yaxis"
            className="block text-sm font-medium text-gray-700"
          >
            Y Axis Field
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`w-full text-start flex justify-between ${
                  errors.yaxis && "border-red-500"
                }`}
              >
                Select a connection{" "}
                <div className="h-4 w-4 opacity-50">
                  <ChevronDown />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {Array.isArray(queryExecutionResult) &&
              queryExecutionResult.length === 0 ? (
                <DropdownMenuCheckboxItem key="empty">
                  No data available
                </DropdownMenuCheckboxItem>
              ) : (
                Object.entries(queryExecutionResult[0]).map(([key, value]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={formData?.yaxis.includes(key)} // Check if the key exists in formData.yaxis array
                    onCheckedChange={(e) => handleDropDownChange(e, key)} // Call handleDropDownChange to toggle the value
                  >
                    {key}
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {errors.yaxis && (
            <p className="text-xs text-red-500">{errors.yaxis}</p>
          )}
        </div>
      </div>
    </form>
  );
}

export default ReportForm;
