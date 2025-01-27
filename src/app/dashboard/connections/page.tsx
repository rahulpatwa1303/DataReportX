import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LucideCirclePlus } from "lucide-react";
import Link from "next/link";
import { BiLogoPostgresql } from "react-icons/bi";
import { supabase } from "../../../../utils/supabase/client";
import RedirectionButtons from "../../../components/RedirectionButtons";

async function fetchConnections() {
  const supabases = supabase
  const { data, error } = await supabases.from("connections").select("*");
  if (error) {
    console.error("Error fetching connections:", error.message);
    return [];
  }
  return data;
}

export default async function Page() {
  const connections = await fetchConnections();

  return (
    <div className="mx-8 space-y-4 w-full">
      <div className="flex">
        <RedirectionButtons
          title="Create new connection"
          icon={<LucideCirclePlus />}
          path="/dashboard/connections/new-connection"
        />
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Connection Name</TableHead>
              <TableHead>Connection Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.length > 0 ? (
              connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell className="font-medium">
                    {connection.database_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row gap-2 items-center">
                      {<BiLogoPostgresql />} Postgres
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/connections/edit/${connection.id}`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No connections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
