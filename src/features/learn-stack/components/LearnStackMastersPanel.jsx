import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../common/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../common/components/ui/select";
import { learnStackService } from "../services/learnStackService";
import { useToast } from "../../../common/hooks/use-toast";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";

export default function LearnStackMastersPanel() {
  const { toast } = useToast();
  const [domains, setDomains] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainForm, setDomainForm] = useState({ name: "", description: "", color: "#6366f1" });
  const [techForm, setTechForm] = useState({ domain_id: "", name: "", description: "" });
  const [editDomain, setEditDomain] = useState(null);
  const [editTech, setEditTech] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [dRes, tRes] = await Promise.all([
        learnStackService.getDomains({ active_only: "0" }),
        learnStackService.getTechnologies({ active_only: "0" }),
      ]);
      setDomains(dRes.domains || []);
      setTechnologies(tRes.technologies || []);
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to load masters", description: e?.msg || e?.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveDomain = async () => {
    try {
      if (editDomain) {
        await learnStackService.updateDomain(editDomain.id, {
          name: domainForm.name,
          description: domainForm.description,
          color: domainForm.color,
        });
        setEditDomain(null);
      } else {
        await learnStackService.createDomain(domainForm);
      }
      setDomainForm({ name: "", description: "", color: "#6366f1" });
      refresh();
      toast({ title: "Domain saved" });
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg || "Save failed" });
    }
  };

  const saveTech = async () => {
    if (!techForm.domain_id || !techForm.name.trim()) {
      toast({ variant: "destructive", title: "Pick domain and enter technology name" });
      return;
    }
    try {
      const payload = {
        domain_id: Number(techForm.domain_id),
        name: techForm.name.trim(),
        description: techForm.description,
      };
      if (editTech) {
        await learnStackService.updateTechnology(editTech.id, payload);
        setEditTech(null);
      } else {
        await learnStackService.createTechnology(payload);
      }
      setTechForm({ domain_id: techForm.domain_id, name: "", description: "" });
      refresh();
      toast({ title: "Technology saved" });
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg || "Save failed" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "domain") {
        await learnStackService.deleteDomain(deleteTarget.id);
      } else {
        await learnStackService.deleteTechnology(deleteTarget.id);
      }
      setDeleteTarget(null);
      refresh();
      toast({ title: "Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg || "Delete failed" });
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500 py-8 text-center">Loading masters…</p>;
  }

  return (
  <>
      <Tabs defaultValue="domains" className="w-full min-w-0">
        <TabsList className="mb-3 h-9">
          <TabsTrigger value="domains" className="text-xs sm:text-sm">Domains</TabsTrigger>
          <TabsTrigger value="technologies" className="text-xs sm:text-sm">Technologies</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="mt-0 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              {editDomain ? "Edit domain" : "Add domain"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-xs">Name</Label>
                <Input className="h-9 text-sm"
                  value={domainForm.name}
                  onChange={(e) => setDomainForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Web, Mobile, Backend…"
                />
              </div>
              <div>
                <Label className="text-xs">Color</Label>
                <Input
                  type="color"
                  value={domainForm.color}
                  onChange={(e) => setDomainForm((p) => ({ ...p, color: e.target.value }))}
                  className="h-9 p-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Description</Label>
                <Input className="h-9 text-sm"
                  value={domainForm.description}
                  onChange={(e) => setDomainForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveDomain} size="sm" className="inline-flex h-8 items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 shrink-0" /> Save domain
              </Button>
              {editDomain && (
                <Button variant="ghost" size="sm" onClick={() => { setEditDomain(null); setDomainForm({ name: "", description: "", color: "#6366f1" }); }}>
                  Cancel edit
                </Button>
              )}
            </div>
          </div>

          <ul className="divide-y rounded-lg border border-slate-200 bg-white">
            {domains.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ background: d.color || "#6366f1" }} />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{d.name}</p>
                    {d.description && <p className="text-xs text-slate-500 truncate">{d.description}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      setEditDomain(d);
                      setDomainForm({ name: d.name, description: d.description || "", color: d.color || "#6366f1" });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-red-600 hover:text-red-700"
                    onClick={() => setDeleteTarget({ type: "domain", id: d.id, label: d.name })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="technologies" className="mt-0 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              {editTech ? "Edit technology" : "Add technology (stack)"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-xs">Domain</Label>
                <Select
                  value={String(techForm.domain_id || "")}
                  onValueChange={(v) => setTechForm((p) => ({ ...p, domain_id: v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.filter((d) => d.is_active !== false).map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  className="h-9 text-sm"
                  value={techForm.name}
                  onChange={(e) => setTechForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="React, Flask, Node.js…"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  className="h-9 text-sm"
                  value={techForm.description}
                  onChange={(e) => setTechForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={saveTech} size="sm" className="inline-flex h-8 items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 shrink-0" /> Save technology
            </Button>
          </div>

          <ul className="divide-y rounded-lg border border-slate-200 bg-white">
            {technologies.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.domain_name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      setEditTech(t);
                      setTechForm({
                        domain_id: String(t.domain_id),
                        name: t.name,
                        description: t.description || "",
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-red-600 hover:text-red-700"
                    onClick={() => setDeleteTarget({ type: "technology", id: t.id, label: t.name })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete?"
        description={`Remove “${deleteTarget?.label}”?`}
        onConfirm={confirmDelete}
      />
    </>
  );
}
