"use client";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronRight,
  Columns,
  Columns4,
  Hourglass,
  LoaderCircle,
  Table,
} from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import BackButton from "../../../../components/BackButton";
import ConnectionForm from "../component/ConnectionForm";

const NewConnection: React.FC = () => {
  const { toast } = useToast();
  const pathname = usePathname();
  // Define state types for form data
  const [formData, setFormData] = useState({
    host: "",
    port: "",
    databaseName: "",
    username: "",
    password: "",
  });

  const [pingResult, setPingResult] = useState<boolean>(false);
  const [pingDisabled, setPingDisabled] = useState<boolean>(false); // Track whether ping is disabled
  const [dbTables, setDbTables] = useState<any>([]);
  const [columnsData, setColumnsData] = useState<any>({}); // To store column data for each table

  const [fetchingDataLoading, setFetchingDataLoading] = useState<boolean>(true);

  const [timer, setTimer] = useState<number>(30); // Timer for 30 seconds

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  // Error states
  const [errors, setErrors] = useState({
    host: "",
    port: "",
    databaseName: "",
    username: "",
    password: "",
  });

  // Function to validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const requiredFields = [
      "host",
      "port",
      "databaseName",
      "username",
      "password",
    ];

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

  // Function to handle database ping
  const handlePing = async () => {
    if (!validateForm()) {
      toast({
        title: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/pingDatabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData, // Spread the formData to include all fields
          port: Number(formData.port), // Ensure port is a number
        }),
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
    if (!validateForm()) {
      toast({
        title: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { databaseName, username, ...rest } = formData;

      const payload = {
        queryType: "tables",
        dbConfig: {
          ...rest,
          user: username,
          database: databaseName, // Renaming databaseName to database
        },
      };

      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
        setDbTables(data);
        toast({
          title: "Data fetched successfully.",
        });
        // Logic to display fetched tables or columns
      } else {
        toast({
          title: "No data found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred while fetching data.",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  const handleFetchColumns = async (tableName: string) => {
    // Check if columns data for the table is already fetched
    if (columnsData[tableName]) return;
    const { databaseName, username, ...rest } = formData;
    const payload = {
      queryType: "columns",
      tableName: tableName,
      dbConfig: {
        ...rest,
        user: username,
        database: databaseName, // Renaming databaseName to database
      },
    };

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: errorData.error || "Error fetching column data",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      // Update state to append column data for the table
      setColumnsData((prevState: any) => ({
        ...prevState,
        [tableName]: data,
      }));
    } catch (error) {
      toast({
        title: "An error occurred while fetching column data.",
        variant: "destructive",
      });
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("/api/saveConnection", {
        method: "POST", // Ensure that it's POST
        headers: {
          "Content-Type": "application/json", // Set content-type to application/json
        },
        body: JSON.stringify({
          user_id: "e618403f-2c3d-44e5-9a85-636794441ead", // Example user ID, replace with actual user ID
          host: formData.host,
          port: formData.port,
          database_name: formData.databaseName,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Connection saved successfully");
      } else {
        alert("Failed to save connection");
      }
    } catch (error) {
      console.error("Error saving connection:", error);
    }
  };

  const fetchConnectionData = async (id: string) => {
    setFetchingDataLoading(true);
    try {
      const response = await fetch(`/api/saveConnection?id=${id}`, {
        method: "GET", // Ensure that it's POST
      });

      const data = await response.json();
      if (data.success) {
        setFetchingDataLoading(false);
        setFormData({
          host: data.data.host,
          port: data.data.port,
          databaseName: data.data.database_name,
          username: data.data.username,
          password: data.data.password,
        });
      } else {
        toast({
          title: "An error occurred while fetching data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving connection:", error);
    }
  };

  useEffect(() => {
    // Check if the path includes "edit"
    setFetchingDataLoading(false);
    if (pathname.includes("edit")) {
      // Extract the last segment of the path (ID)
      const id = pathname.split("/").pop();

      if (id) {
        // Fetch the data from Supabase for the given ID
        fetchConnectionData(id);
      }
    }
  }, [pathname]);

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
    <div className=" mx-8 space-y-4 w-full" >
      <div className="flex flex-row ">
        <BackButton />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {pathname.includes("edit") ? "Edit" : "New"} Connection
          </h2>
          <p className="text-muted-foreground">
            Connect to your database securely and efficiently.
          </p>
        </div>
      </div>
      <Separator />
      {pathname.includes("edit") && fetchingDataLoading && (
        <div className="flex justify-center items-center flex-col">
          <div>
            <LoaderCircle className="animate-spin" />
          </div>
          Fetching data...
        </div>
      )}
      {!fetchingDataLoading && (
        <ResizablePanelGroup direction={"horizontal"}>
          <ResizablePanel className="mt-">
            {/* Panel One (Your Form Content) */}
            <div className="mx-8 space-y-4">
              <ConnectionForm
                errors={errors}
                formData={formData}
                handleChange={handleChange}
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
                <Button disabled={!pingResult} onClick={handleSubmit}>
                  Save
                </Button>
                <Button
                  variant={"outline"}
                  disabled={!pingResult}
                  onClick={handleRun}
                >
                  Run
                </Button>
              </div>
            </div>
          </ResizablePanel>

          {/* Handle for resizing */}
          <ResizableHandle withHandle />

          <ResizablePanel maxSize={40}>
            {/* Panel Two (You can add more content here) */}
            {dbTables.length == 0 && (
              <div className="text-center h-full">
                <div className="text-xl text-gray-500 mb-4 px-4">
                  It seems like we haven't fetched any database tables yet.
                  Let's get started!
                </div>
                <Button
                  variant={!pingResult ? "outline" : "default"}
                  disabled={!pingResult}
                  onClick={handleRun}
                  className={`${
                    !pingResult ? " cursor-not-allowed" : ""
                  } px-6 py-2 rounded-md transition-all duration-200`}
                >
                  Fetch Tables
                </Button>
              </div>
            )}
            {dbTables.length >= 0 && (
              <div className="mx-10 py-10">
                <p className="flex flex-row justify-start items-center gap-2">
                  <Table size={18} />
                  Tables
                </p>
                {dbTables.map((data: any, index: number) => {
                  return (
                    <Collapsible className="group/collapsible" key={`${data.table_name}-${index}`}>
                      <CollapsibleTrigger>
                        <div className="flex flex-row justify-center items-center gap-2">
                          {/* <ChevronDown className="h-4 w-4" /> */}
                          <ChevronRight className="h-4 w-4 group-data-[state=open]/collapsible:rotate-90 transition-transform duration-200" />
                          {data?.table_name}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Collapsible className="group/column mx-4">
                          <CollapsibleTrigger
                            onClick={() => handleFetchColumns(data.table_name)}
                          >
                            <div className="flex flex-row justify-center items-center gap-2">
                              {/* <ChevronDown className="h-4 w-4" /> */}
                              <ChevronRight className="h-4 w-4 group-data-[state=open]/column:rotate-90 transition-transform duration-200" />
                              <Columns4 size={18} /> Columns
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="mx-8">
                            {columnsData[data.table_name] ? (
                              <ul>
                                {columnsData[data.table_name].map(
                                  (column: any, index: number) => (
                                    <li
                                      key={index}
                                      className="flex flex-row items-center gap-2 truncate"
                                    >
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger className="flex items-center gap-2">
                                            <div>
                                              <Columns size={18} />
                                            </div>
                                            {column.column_name} (
                                            {column.data_type})
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{column.column_name}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p>Loading columns...</p>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};

export default NewConnection;
