import React from "react";
import { Loader2, Users } from "lucide-react";
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
import { useDashboardInProgressToday } from "../hooks/useDashboardData";
import { useDashboardFilters } from "../contexts/DashboardFiltersContext";

export default function InProgressTodayWidget() {
  const { inProgressParams } = useDashboardFilters();
  const { data, loading, error } = useDashboardInProgressToday(inProgressParams);
  const people = data?.people || [];

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="py-2 px-3 space-y-0">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600 shrink-0" />
          <div>
            <CardTitle className="text-sm font-semibold">In progress today</CardTitle>
            <CardDescription className="text-xs">
              People with tasks in progress updated today
              {data?.date ? ` · ${data.date}` : ""}
            </CardDescription>
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
        {!loading && !error && people.length === 0 && (
          <p className="text-xs text-slate-500 py-3 text-center">No in-progress tasks for today.</p>
        )}
        {!loading && !error && people.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 text-xs">Person</TableHead>
                  <TableHead className="h-8 text-xs">Email</TableHead>
                  <TableHead className="h-8 text-xs text-right">Tasks</TableHead>
                  <TableHead className="h-8 text-xs">Task titles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((p) => {
                  const name =
                    [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email || "—";
                  const titles = (p.tasks || []).map((t) => t.title).join(", ");
                  return (
                    <TableRow key={`${p.role}-${p.user_id}`} className="text-xs">
                      <TableCell className="py-1.5 font-medium">{name}</TableCell>
                      <TableCell className="py-1.5 text-slate-600">{p.email || "—"}</TableCell>
                      <TableCell className="py-1.5 text-right font-semibold">{p.task_count}</TableCell>
                      <TableCell className="py-1.5 text-slate-600 max-w-[280px] truncate" title={titles}>
                        {titles || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
