import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@radix-ui/react-scroll-area";

function QueryResultTable({
  queryExecutionResult,
}: {
  queryExecutionResult: any;
}) {
  return (
    <div className="query-result-table overflow-x-auto">
      <ScrollArea className="h-80 w-full max-w-md overflow-y-auto overflow-x-auto">
        <Card>
          <Table className="table-auto w-full overflow-x-auto">
            <TableHeader className="sticky overflow-x-auto">
              <TableRow>
                {Object.keys(queryExecutionResult[0]).map((key, index) => (
                  <TableHead key={`${key}-${index}`}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-x-auto">
              {queryExecutionResult.map((data: any, index: number) => (
                <TableRow key={index}>
                  {Object.values(data).map((value: any, idx: number) => (
                    <TableCell
                      key={`${value}-${idx}`}
                      className="px-4 py-2 border-b"
                    >
                      {value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </ScrollArea>
    </div>
  );
}

export default QueryResultTable;
