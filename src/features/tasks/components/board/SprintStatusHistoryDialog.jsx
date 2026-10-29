import React, { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../common/components/ui/dialog";
import { Button } from "../../../../common/components/ui/button";
import { taskStatusHistoryService } from "../../services/taskStatusHistoryService";
import { useToast } from "../../../../common/hooks/use-toast";

/** Stored local time string → display with AM/PM (no timezone conversion). */
function formatWhen(stored) {
  if (!stored) return "—";
  const s = String(stored);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const [datePart, timePart] = s.split("T");
    const [y, m, d] = datePart.split("-");
    const hms = (timePart || "").replace(/\.\d+.*$/, "").slice(0, 8);
    const [hh, mm, ss] = hms.split(":");
    let h = parseInt(hh, 10);
    if (Number.isNaN(h)) return `${d}/${m}/${y}, ${hms}`;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    const time12 = `${h}:${mm}${ss ? `:${ss}` : ""} ${ampm}`;
    return `${d}/${m}/${y}, ${time12}`;
  }
  return s;
}

function actorLabel(entry) {
  const p = entry.changed_by || {};
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
  if (name) return `${name}${p.role ? ` (${p.role})` : ""}`;
  if (p.email) return p.email;
  return p.role || "Unknown";
}

const SprintStatusHistoryDialog = ({ open, onOpenChange, sprintId, sprintName }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!open || !sprintId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await taskStatusHistoryService.getSprintStatusHistory(sprintId);
        if (!cancelled) setRows(data.history || []);
      } catch (err) {
        if (!cancelled) {
          setRows([]);
          toast({
            title: err.restricted ? "Restricted" : "Error",
            description:
              err.msg ||
              err.message ||
              err.error ||
              "Could not load status history",
            variant: "destructive",
          });
          if (err.restricted) onOpenChange(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, sprintId, toast, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600" />
            Status change history
          </DialogTitle>
          <DialogDescription>
            {sprintName ? `Sprint: ${sprintName}` : "Task status moves for this sprint"} — administrators only.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : rows.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No status changes recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Task</th>
                  <th className="px-3 py-2">Change</th>
                  <th className="px-3 py-2">By</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                      {formatWhen(row.changed_at || row.created_at)}
                    </td>
                    <td className="px-3 py-2.5 text-slate-800 max-w-[180px] truncate" title={row.task_title}>
                      {row.task_title || `#${row.task_id}`}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      <span className="text-slate-500">{row.from_status_name || "—"}</span>
                      <span className="mx-1 text-slate-300">→</span>
                      <span className="font-medium">{row.to_status_name || "—"}</span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{actorLabel(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SprintStatusHistoryDialog;
