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
import { supabase } from "../../../../utils/supabase/client";
import RedirectionButtons from "../../../components/RedirectionButtons";

async function fetchConnections() {
  const supabases = supabase
  const { data, error } = await supabases.from("reports").select("*");
  if (error) {
    console.error("Error fetching connections:", error.message);
    return [];
  }
  return data;
}

export default async function Page() {
  const connections = await fetchConnections();
  return (
    <div className="mx-8 space-y-4 w-full ">
      <div className="flex">
        <RedirectionButtons
          title="Create new report"
          icon={<LucideCirclePlus />}
          path="/dashboard/reports/new-report"
        />
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.length > 0 ? (
              connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell className="font-medium">
                    {connection.name}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/reports/edit/${connection.id}`}>
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
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
