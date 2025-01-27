"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

function ConnectionForm({
  formData,
  handleChange,
  errors,
}: ConnectionFormProps) {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Source Type
          </Label>
          <Input
            disabled
            id="type"
            name="type"
            type="text"
            value="Postgres"
            required
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <Label
            htmlFor="databaseName"
            className="block text-sm font-medium text-gray-700"
          >
            Database Name
          </Label>
          <Input
            id="databaseName"
            name="databaseName"
            type="text"
            value={formData.databaseName}
            onChange={handleChange}
            required
            className={`mt-1 block w-full ${
              errors.databaseName ? "border-red-500" : ""
            }`}
          />
          {errors.databaseName && (
            <p className="text-xs text-red-500">{errors.databaseName}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="port"
            className="block text-sm font-medium text-gray-700"
          >
            Port
          </Label>
          <Input
            id="port"
            name="port"
            type="number"
            value={formData.port}
            onChange={handleChange}
            required
            className={`mt-1 block w-full ${
              errors.port ? "border-red-500" : ""
            }`}
          />
          {errors.port && <p className="text-xs text-red-500">{errors.port}</p>}
        </div>

        <div>
          <Label
            htmlFor="host"
            className="block text-sm font-medium text-gray-700"
          >
            Host
          </Label>
          <Input
            id="host"
            name="host"
            type="text"
            value={formData.host}
            onChange={handleChange}
            required
            className={`mt-1 block w-full ${
              errors.host ? "border-red-500" : ""
            }`}
          />
          {errors.host && <p className="text-xs text-red-500">{errors.host}</p>}
        </div>

        <div>
          <Label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`mt-1 block w-full ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            className={`mt-1 block w-full ${
              errors.username ? "border-red-500" : ""
            }`}
          />
          {errors.username && (
            <p className="text-xs text-red-500">{errors.username}</p>
          )}
        </div>
      </div>
    </form>
  );
}

export default ConnectionForm;
