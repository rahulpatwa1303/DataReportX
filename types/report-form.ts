// Represents the data for a single report
type Reports = {
  id?: string; // Optional for new reports, required for editing
  name: string; // Name of the report
  connectionId: string; // ID referencing the selected connection
  query: string; // The SQL query
  connectionName: "";
  yaxis: string[];
  xaxis: string;
  chartType: string;
};

// Represents the errors in the report form
type ReportFormErrors = Partial<Record<keyof Reports, string>>;

// Props for the report form component
type ReportFormProps = {
  formData: Reports; // The report data
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void; // Form change handler
  handleSelectChange: (key: string, type: string) => void; // Dropdown change handler for connection
  handleDropDownChange: (selected: boolean, value: string) => void; // Dropdown change handler for connection
  errors: ReportFormErrors; // Validation errors
  connections: { id: string; database_name: string }[]; // List of connections for the dropdown
  queryExecutionResult: Record<string, string>;
};

type SuggestionsData = {
  // tables: string[];
  // columns: string[];
};

type SQLQueryEditorProps = {
  suggestionsData: SuggestionsData;
  setParentFormData: any;
  parentFormData: any;
};
