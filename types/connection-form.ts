type ConnectionFormData = {
  databaseName: string;
  port: number | string; // Can be a string initially if bound to input
  host: string;
  username: string;
  password: string;
};

type ConnectionFormErrors = Partial<Record<keyof ConnectionFormData, string>>;

type ConnectionFormProps = {
  formData: ConnectionFormData;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors: ConnectionFormErrors;
};

interface PingRequestBody {
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
}

interface RunAllRequestBody {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}