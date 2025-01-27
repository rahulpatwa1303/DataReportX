"use client";
import SQLQueryEditor from "@/components/SQLQueryEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@radix-ui/react-label";
import { Hourglass, Info, LoaderCircle, Play, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import BackButton from "../../../../components/BackButton";
import QueryResultTable from "../component/QueryResultTable";
import ReportForm from "../component/ReportForm";
import ChartsCard from "../component/ChartsCard";
import { chartType } from "../component/data";
import { getKeyByValue } from "@/lib/helper";

const NewConnection: React.FC = () => {
  const { toast } = useToast();
  const pathname = usePathname();
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [timer, setTimer] = useState<number>(30); // Timer for 30 seconds
  const [pingResult, setPingResult] = useState<boolean>(false);
  const [pingDisabled, setPingDisabled] = useState<boolean>(false); // Track whether ping is disabled
  const [connections, setConnections] = useState<
    { id: string; database_name: string }[]
  >([]);
  const [formData, setFormData] = useState<any>({
    name: "",
    connectionId: "",
    query: "",
    connectionName: "",
    yaxis: [], // Initial empty array for yaxis
    xaxis: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    connectionId: "",
    query: "",
    connectionName: "",
  });
  const [dbRunResult, setDBRunResult] = useState<SuggestionsData>({
    // tables: [],
    // columns: [],
  });
  const [queryExecutionResult, setQueryExecutionResult] = useState<any>([]);
  const [enableChartPreview, setEnableChartPreview] = useState<boolean>(false);

  // Function to validate form
  const validateForm = (type: string) => {
    const newErrors: { [key: string]: string } = {};

    // Base required fields
    const requiredFields = ["name", "connectionId"];

    // Include 'query' only if type is not 'ping'
    if (type !== "ping" && type !== "run_all") {
      requiredFields.push("query");
      if (type !== "run_query") {
        requiredFields.push("yaxis");
        requiredFields.push("xaxis");
        requiredFields.push("chartType");
      }
    }

    // Validate each required field
    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required.`;
      }
    });

    setErrors(newErrors as any);
    return Object.keys(newErrors).length === 0;
  };

  // Handles input and textarea changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDropDownChange = (selected: boolean, value: string) => {
    setFormData((prevData: any) => {
      let updatedYaxis: string[] = [...prevData.yaxis]; // Create a copy of the current yaxis array

      if (selected) {
        // Add value to the yaxis array if selected is true
        if (!updatedYaxis.includes(value)) {
          updatedYaxis.push(value);
        }
      } else {
        // Remove value from the yaxis array if selected is false
        updatedYaxis = updatedYaxis.filter((item) => item !== value);
      }

      return {
        ...prevData,
        yaxis: updatedYaxis, // Update yaxis with the modified array
      };
    });
  };

  // Handles dropdown selection changes
  const handleSelectChange = (id: string, inputType: string) => {
    if (inputType === "connection") {
      const selectedConnection = connections.find(
        (connection) => connection.database_name === id
      );

      if (selectedConnection) {
        setFormData((prevData: any) => ({
          ...prevData,
          connectionId: selectedConnection.id, // Set the connection ID
          connectionName: selectedConnection.database_name, // Set the connection name
        }));
      }
    } else if (inputType == "charts") {
      setFormData((prevData: any) => ({
        ...prevData,
        chartType: id, // Set the connection ID
      }));
    } else if (inputType == "xaxis") {
      setFormData((prevData: any) => ({
        ...prevData,
        xaxis: id, // Set the connection ID
      }));
    }
  };

  // Fetches available connections
  const fetchConnections = async () => {
    setConnectionLoading(true);
    try {
      const response = await fetch("/api/connections");
      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }
      const data = await response.json();
      setConnections(data.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not load connections. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectionLoading(false);
    }
  };

  const handlePing = async () => {
    if (!validateForm("ping")) {
      toast({
        title: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the connection by ID
      const selectedConnection: any = connections.find((connection) => {
        // Ensure both values are strings and trimmed before comparing
        return (
          String(connection.id).trim() === String(formData.connectionId).trim()
        );
      });

      if (!selectedConnection) {
        toast({
          title: "Invalid connection selected.",
          variant: "destructive",
        });
        return;
      }

      // Construct the payload
      const payload: PingRequestBody = {
        host: selectedConnection.host, // Replace with actual property
        port: Number(selectedConnection.port), // Ensure port is a number
        databaseName: selectedConnection.database_name, // Replace with actual property
        username: selectedConnection.username, // Replace with actual property
        password: selectedConnection.password, // Replace with actual property
      };

      const response = await fetch("/api/pingDatabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setPingResult(true);
        toast({ title: "Connection successful!", variant: "default" });

        // Disable the Ping button for 30 seconds
        setPingDisabled(true);
        setTimer(30);
      } else {
        toast({ title: `Error: ${data.message}`, variant: "destructive" });
        setPingResult(false);
      }
    } catch (error) {
      toast({
        title: "Error: Unable to ping the database.",
        variant: "destructive",
      });
      setPingResult(false);
    }
  };

  const handleRun = async () => {
    if (!validateForm("run_all")) {
      toast({
        title: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    try {
      const selectedConnection: any = connections.find((connection) => {
        // Ensure both values are strings and trimmed before comparing
        return (
          String(connection.id).trim() === String(formData.connectionId).trim()
        );
      });

      if (!selectedConnection) {
        toast({
          title: "Invalid connection selected.",
          variant: "destructive",
        });
        return;
      }

      // Construct the payload
      const payload: RunAllRequestBody = {
        host: selectedConnection.host, // Replace with actual property
        port: Number(selectedConnection.port), // Ensure port is a number
        database: selectedConnection.database_name, // Replace with actual property
        user: selectedConnection.username, // Replace with actual property
        password: selectedConnection.password, // Replace with actual property
      };

      const response = await fetch("/api/run/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dbConfig: { ...payload } }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: errorData.error || "Error fetching data",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      // Handle the response data here (e.g., display tables or columns)
      if (data && data.length > 0) {
        const formattedResult = {
          tables: data.reduce((acc: any, item: any) => {
            acc[item.table_name] = {
              columns: item.columns || [],
            };
            return acc;
          }, {}),
        };
        setDBRunResult(formattedResult);
        toast({ title: "Data fetched successfully." });
      } else {
        setDBRunResult({ tables: [], columns: [] });
        toast({ title: "No data found.", variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "An error occurred while fetching data.",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  const handleRunQuery = async () => {
    if (!validateForm("run_query")) {
      toast({
        title: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedConnection: any = connections.find((connection) => {
        return (
          String(connection.id).trim() === String(formData.connectionId).trim()
        );
      });

      if (!selectedConnection) {
        toast({
          title: "Invalid connection selected.",
          variant: "destructive",
        });
        return;
      }

      // Construct the payload
      const payload = {
        dbConfig: {
          host: selectedConnection.host,
          port: Number(selectedConnection.port),
          database: selectedConnection.database_name,
          user: selectedConnection.username,
          password: selectedConnection.password,
        },
        query: formData.query, // Include the query from your form
      };

      const response = await fetch("/api/run/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: errorData.error || "Error executing query",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      // Handle the response data here
      if (data && data.success && data.data) {
        toast({ title: "Query executed successfully." });
        setQueryExecutionResult(data.data);
      } else {
        toast({ title: "No results found.", variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "An error occurred while executing the query.",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  const handleSaveReport = async () => {
    if (!validateForm("save_report")) {
      toast({
        title: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedConnection: any = connections.find((connection) => {
        return (
          String(connection.id).trim() === String(formData.connectionId).trim()
        );
      });

      if (!selectedConnection) {
        toast({
          title: "Invalid connection selected.",
          variant: "destructive",
        });
        return;
      }

      // Construct the payload
      const payload = {
        connectionId: formData.connectionId,
        name: formData.name,
        query: formData.query,
        xaxis: formData.xaxis,
        yaxis: formData.yaxis,
        chart_type: formData.chartType,
        user_id: "e618403f-2c3d-44e5-9a85-636794441ead",
      };

      const response = await fetch("/api/saveReport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: errorData.error || "Error executing query",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      // Handle the response data here
      if (data && data.success && data.data) {
        toast({ title: "Query executed successfully." });
      } else {
        toast({ title: "No results found.", variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "An error occurred while executing the query.",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  const handleUpdateReport = async () => {
    if (!validateForm("updated_report")) {
      toast({
        title: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedConnection: any = connections.find((connection) => {
        return (
          String(connection.id).trim() === String(formData.connectionId).trim()
        );
      });

      if (!selectedConnection) {
        toast({
          title: "Invalid connection selected.",
          variant: "destructive",
        });
        return;
      }

      // Construct the payload
      const payload = {
        connectionId: formData.connectionId,
        name: formData.name,
        query: formData.query,
        xaxis: formData.xaxis,
        yaxis: formData.yaxis,
        chart_type: formData.chartType,
        user_id: "e618403f-2c3d-44e5-9a85-636794441ead",
      };
      const id = pathname.split("/").pop();
      const response = await fetch(`/api/saveReport?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: errorData.error || "Error executing query",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      // Handle the response data here
      if (data && data.success && data.data) {
        toast({ title: "Query executed successfully." });
      } else {
        toast({ title: "No results found.", variant: "destructive" });
      }
    } catch (error) {
      toast({
        title: "An error occurred while executing the query.",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  const fetchReportData = async (id: string) => {
    setConnectionLoading(true);
    try {
      const response = await fetch(`/api/saveReport?id=${id}`, {
        method: "GET", // Ensure that it's POST
      });

      const data = await response.json();
      if (data.success) {
        const selectedConnection = connections.find(
          (connection) => connection.id === data.data.connection_id
        );

        setFormData({
          chartType: data.data.chart_type,
          connectionId: data.data.connection_id,
          connectionName: selectedConnection!.database_name,
          name: data.data.name,
          query: data.data.query,
          xaxis: data.data.x_axis_field,
          yaxis: data.data.y_axis_field
            .split(",")
            .map((field: string) => field.trim()),
        });
      } else {
        toast({
          title: "An error occurred while fetching data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving connection:", error);
    } finally {
      setConnectionLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    // Check if the path includes "edit"
    if (pathname.includes("edit")) {
      // Extract the last segment of the path (ID)
      const id = pathname.split("/").pop();
      if (connections.length > 0) {
        if (id) {
          // Fetch the data from Supabase for the given ID
          fetchReportData(id);
        }
      }
    }
  }, [pathname, connections.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (pingDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      // Reset timer and re-enable button
      setPingDisabled(false);
      setTimer(30); // Reset to 30 seconds
    }

    // Clean up the interval when component is unmounted or timer ends
    return () => clearInterval(interval);
  }, [pingDisabled, timer]);
  return (
    <div className=" mx-8 space-y-4 w-full">
      <div className="flex flex-row ">
        <BackButton />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {pathname.includes("edit") ? "Edit" : "New"} Report
          </h2>
          <p className="text-muted-foreground">
            Connect to your database securely and efficiently.
          </p>
        </div>
      </div>
      <Separator />
      {connectionLoading ? (
        <div className="flex justify-center items-center flex-col">
          <div>
            <LoaderCircle className="animate-spin" />
          </div>
          Fetching data...
        </div>
      ) : (
        <ResizablePanelGroup direction="vertical" className="w-full sm:w-1/2">
          <ResizablePanel>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel>
                <ScrollArea className="overflow-x-auto">
                  <div className="mx-8 space-y-4">
                    <ReportForm
                      connections={connections}
                      formData={formData}
                      handleChange={handleChange}
                      handleSelectChange={handleSelectChange}
                      errors={errors} // Pass empty errors for now
                      queryExecutionResult={queryExecutionResult}
                      handleDropDownChange={handleDropDownChange}
                    />
                    <div className="flex gap-4">
                      <div className="relative">
                        <Button onClick={handlePing} disabled={pingDisabled}>
                          Ping
                        </Button>

                        {pingDisabled && (
                          <div className="mt-2 absolute flex justify-center items-center gap-2 text-sm text-gray-500 text-xs ">
                            <Hourglass size={12} /> {`${timer} s remaining`}
                          </div>
                        )}
                      </div>
                      <Button
                        disabled={!pingResult}
                        onClick={
                          pathname.includes("edit")
                            ? handleUpdateReport
                            : handleSaveReport
                        }
                      >
                        {pathname.includes("edit") ? "Update" : "Save"}
                      </Button>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            asChild
                            onClick={() => {
                              !pingResult ? null : handleRun();
                            }}
                            className={`${
                              !pingResult ? "opacity-50" : "opacity-100"
                            }`}
                          >
                            <Button variant={"outline"}>Run</Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {!pingResult ? (
                              <p>You must first ping your connection</p>
                            ) : (
                              <p>
                                This would the table and columns from the
                                database {formData?.connectionName}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            asChild
                            onClick={() => {
                              !formData?.chartType &&
                              !formData?.xaxis &&
                              formData?.yaxis?.length == 0
                                ? null
                                : setEnableChartPreview(true);
                            }}
                            className={`${
                              !formData?.chartType &&
                              !formData?.xaxis &&
                              formData?.yaxis?.length == 0
                                ? "opacity-50"
                                : "opacity-100"
                            }`}
                          >
                            <Button variant={"ghost"}>Preview</Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {!formData?.chartType &&
                            !formData?.xaxis &&
                            formData?.yaxis?.length == 0 ? (
                              <p>
                                Please select a chart type, as well as values
                                for the x-axis and y-axis.
                              </p>
                            ) : (
                              <p>
                                You can preview the chart with a limited number
                                of rows.
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel maxSize={40}>
                <div className="px-4 space-y-2">
                  <div className="flex h-10 justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="query"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Query
                      </Label>
                      {Object.entries(dbRunResult).length == 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              onClick={() => {
                                !pingResult ? null : handleRunQuery();
                              }}
                            >
                              <Info size={14} />
                            </TooltipTrigger>
                            <TooltipContent>
                              No suggestions are available. Click "Run" to get
                              suggestions.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          asChild
                          onClick={() => {
                            !pingResult ? null : handleRunQuery();
                          }}
                        >
                          <Button
                            className="rounded-full p-4"
                            variant={"ghost"}
                          >
                            <Play size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {!pingResult ? (
                            <p>Please ping your connection first.</p>
                          ) : (
                            <p>
                              Suggestions will be displayed from the selected
                              connection: {formData?.connectionName}.
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Card>
                    <SQLQueryEditor
                      suggestionsData={dbRunResult}
                      setParentFormData={setFormData}
                      parentFormData={formData}
                    />
                  </Card>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />
          <ResizablePanel maxSize={50}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel maxSize={50}>
                <div className="flex w-full  items-center justify-center p-6">
                  {queryExecutionResult.length == 0 ? (
                    <span className="font-semibold">
                      {" "}
                      No query results available{" "}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <span className="flex justify-between text-muted-foreground">
                        <p>
                          The maximum allowed data limit is set to 10 entries.
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              asChild
                              onClick={() => {
                                setQueryExecutionResult([]);
                              }}
                            >
                              <Button
                                variant={"ghost"}
                                className="rounded-full p-4"
                              >
                                <Trash2
                                  size={18}
                                  className="hover:text-rose-500"
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clear data</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <ScrollArea className="h-80 w-full rounded-md max-w-2xl overflow-y-auto overflow-x-auto">
                        <QueryResultTable
                          queryExecutionResult={queryExecutionResult}
                        />
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                maxSize={50}
                // defaultSize={30}
                // className={`${
                //   enableChartPreview ? "visible" : "hidden"
                // } max-w-fit`}
              >
                <div className="flex w-full items-center justify-center p-6">
                  {queryExecutionResult.length == 0 ? (
                    <span className="font-semibold">
                      {" "}
                      No query results available{" "}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <span className="flex justify-between text-muted-foreground">
                        <p>
                          The maximum allowed data limit is set to 10 entries.
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              asChild
                              onClick={() => {
                                setQueryExecutionResult([]);
                              }}
                            >
                              <Button
                                variant={"ghost"}
                                className="rounded-full p-4"
                              >
                                <Trash2
                                  size={18}
                                  className="hover:text-rose-500"
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clear data</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <ScrollArea className="h-80 rounded-md border max-w-full overflow-x-auto">
                        {!formData.chartType &&
                        !formData.xaxis &&
                        formData.yaxis.length == 0 ? (
                          <span>No preview enabled</span>
                        ) : (
                          <ChartsCard
                            data={queryExecutionResult}
                            formData={formData}
                          />
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};

export default NewConnection;
