import React, { useCallback, useEffect, useState } from "react";
import { ListPageShell } from "../../../common/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../common/components/ui/card";
import { leaveService } from "../services/leaveService";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Checkbox } from "../../../common/components/ui/checkbox";
import { useToast } from "../../../common/hooks/use-toast";
import { Loader2, Plus, Trash2, Settings2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../common/components/ui/table";
import { useAuth } from "../../auth/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { formatDate } from "../../../core/utils/utils";

const WEEKDAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const LeavePolicyPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const canManage = ["superadmin", "admin", "scrum"].includes(user?.role);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [annualDays, setAnnualDays] = useState("12");
  const [workingDays, setWorkingDays] = useState([0, 1, 2, 3, 4]);
  const [holidays, setHolidays] = useState([]);
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear());

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [pol, hol] = await Promise.all([
        leaveService.getPolicy(),
        leaveService.getHolidays(holidayYear),
      ]);
      if (pol.status === 1 && pol.policy) {
        setAnnualDays(String(pol.policy.annual_leave_days));
        setWorkingDays(pol.policy.working_weekdays || [0, 1, 2, 3, 4]);
      }
      if (hol.status === 1) {
        setHolidays(hol.holidays || []);
      }
    } catch (err) {
      toast({
        title: "Could not load leave policy",
        description: err?.msg || err?.error || err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [holidayYear, toast]);

  useEffect(() => {
    if (canManage) loadAll();
  }, [canManage, loadAll]);

  if (!canManage) {
    return <Navigate to="/leave" replace />;
  }

  const toggleWeekday = (value) => {
    setWorkingDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value].sort()
    );
  };

  const savePolicy = async () => {
    try {
      setSaving(true);
      const res = await leaveService.updatePolicy({
        annual_leave_days: Number(annualDays),
        working_weekdays: workingDays,
      });
      if (res.status === 1) {
        toast({ title: "Saved", description: res.msg || "Leave policy updated", variant: "success" });
      }
    } catch (err) {
      toast({
        title: "Save failed",
        description: err?.msg || err?.error || err?.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addHoliday = async () => {
    if (!holidayDate || !holidayName.trim()) return;
    try {
      const res = await leaveService.createHoliday({
        date: holidayDate,
        name: holidayName.trim(),
      });
      if (res.status === 1) {
        setHolidayDate("");
        setHolidayName("");
        await loadAll();
        toast({ title: "Holiday added", variant: "success" });
      }
    } catch (err) {
      toast({
        title: "Could not add holiday",
        description: err?.msg || err?.error || err?.message,
        variant: "destructive",
      });
    }
  };

  const removeHoliday = async (id) => {
    try {
      await leaveService.deleteHoliday(id);
      await loadAll();
      toast({ title: "Holiday removed", variant: "success" });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err?.msg || err?.error || err?.message,
        variant: "destructive",
      });
    }
  };

  return (
    <ListPageShell
      title="Leave policy master"
      description="Annual quota, working week, and festival holidays for the leave dashboard."
    >
      {loading ? (
        <div className="flex justify-center py-16 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quota &amp; working week</CardTitle>
              <CardDescription>
                Monthly limit is annual ÷ 12 (e.g. 12 days/year → 1 day/month on working days).
              </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 md:col-span-2">
                <Settings2 className="h-4 w-4" /> Policy
              </h3>
              <div className="space-y-2">
                <Label htmlFor="annual">Annual leave days</Label>
                <Input
                  id="annual"
                  type="number"
                  min={0}
                  step={0.5}
                  value={annualDays}
                  onChange={(e) => setAnnualDays(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Working days in the week</Label>
                <div className="flex flex-wrap gap-3">
                  {WEEKDAYS.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={workingDays.includes(value)}
                        onCheckedChange={() => toggleWeekday(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={savePolicy} disabled={saving} className="md:col-span-2 w-fit">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save policy"}
              </Button>
            </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Festival / company holidays</CardTitle>
              <CardDescription>Shown on every user’s leave calendar (indigo).</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <Label>Year filter</Label>
                  <Input
                    type="number"
                    className="w-28"
                    value={holidayYear}
                    onChange={(e) => setHolidayYear(Number(e.target.value))}
                    onBlur={loadAll}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                  />
                </div>
                <div className="min-w-[200px] flex-1 space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    placeholder="Festival name"
                  />
                </div>
                <Button type="button" onClick={addHoliday} className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-500">
                        No holidays for this year
                      </TableCell>
                    </TableRow>
                  ) : (
                    holidays.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{formatDate(h.date)}</TableCell>
                        <TableCell>{h.name}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => removeHoliday(h.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ListPageShell>
  );
};

export default LeavePolicyPage;