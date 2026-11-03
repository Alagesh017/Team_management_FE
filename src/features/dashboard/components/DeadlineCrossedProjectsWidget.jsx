import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../common/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../common/components/ui/table";
import { useDashboardDeadlineProjects } from "../hooks/useDashboardData";
import { formatDate } from "../../../core/utils/utils";
import { Link } from "react-router-dom";

export default function DeadlineCrossedProjectsWidget() {
  const { projects, loading, error } = useDashboardDeadlineProjects();

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="py-2 px-3 space-y-0">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <div>
            <CardTitle className="text-sm font-semibold">Deadline crossed</CardTitle>
            <CardDescription className="text-xs">Past end date, not completed</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}
        {error && !loading && <p className="text-xs text-red-600">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="text-xs text-slate-500 py-2 text-center">No overdue projects.</p>
        )}
        {!loading && !error && projects.length > 0 && (
          <div className="overflow-x-auto max-h-[200px] overflow-y-auto rounded-md border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-7 text-[10px]">Project</TableHead>
                  <TableHead className="h-7 text-[10px]">Due</TableHead>
                  <TableHead className="h-7 text-[10px] text-right">Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id} className="text-[11px]">
                    <TableCell className="py-1 font-medium max-w-[100px] truncate">
                      <Link to={`/projects/${p.id}`} className="text-blue-600 hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-1">{formatDate(p.end_date)}</TableCell>
                    <TableCell className="py-1 text-right text-amber-700 font-semibold">
                      {p.days_overdue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
