import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { ListPageShell, DataTableCard } from "../../../common/components/PageLayout";
import { FormSheet, FormSheetBody, FormSheetFooter, FormSheetActions } from "../../../common/components/FormSheet";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { projectService } from "../../projects/services/projectService";
import { projectCredentialService } from "../services/projectCredentialService";
import { useToast } from "../../../common/hooks/use-toast";
import { cn } from "../../../core/utils/utils";

const emptyForm = () => ({
  label: "",
  username: "",
  password: "",
  notes: "",
});

function copyText(text, toast) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => toast({ title: "Copied to clipboard" }),
    () => toast({ variant: "destructive", title: "Copy failed" })
  );
}

export default function ProjectCredentialsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const loadProjects = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const res = await projectService.getAllProjects();
      const list = res.projects || res || [];
      const arr = Array.isArray(list) ? list : [];
      setProjects(arr);
      setSelectedId((prev) => prev ?? (arr[0]?.id ?? null));
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to load projects" });
    } finally {
      setLoadingProjects(false);
    }
  }, [toast]);

  const loadCredentials = useCallback(async () => {
    if (!selectedId) {
      setCredentials([]);
      return;
    }
    try {
      setLoadingCreds(true);
      const res = await projectCredentialService.list(selectedId);
      setCredentials(res.credentials || []);
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg || "Failed to load credentials" });
      setCredentials([]);
    } finally {
      setLoadingCreds(false);
    }
  }, [selectedId, toast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadCredentials();
    setVisiblePasswords({});
  }, [loadCredentials]);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [projects, projectSearch]);

  const selectedProject = projects.find((p) => p.id === selectedId);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      label: row.label,
      username: row.username,
      password: "",
      notes: row.notes || "",
    });
    setSheetOpen(true);
  };

  const save = async () => {
    if (!selectedId) return;
    if (!form.label.trim() || !form.username.trim()) {
      toast({ variant: "destructive", title: "Name and username are required" });
      return;
    }
    if (!editing && !form.password) {
      toast({ variant: "destructive", title: "Password is required" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const payload = {
          label: form.label.trim(),
          username: form.username.trim(),
          notes: form.notes,
        };
        if (form.password) payload.password = form.password;
        await projectCredentialService.update(editing.id, payload);
      } else {
        await projectCredentialService.create({
          project_id: selectedId,
          label: form.label.trim(),
          username: form.username.trim(),
          password: form.password,
          notes: form.notes || null,
        });
      }
      setSheetOpen(false);
      await loadCredentials();
      toast({ title: editing ? "Updated" : "Credential added" });
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await projectCredentialService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadCredentials();
      toast({ title: "Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg || "Delete failed" });
    }
  };

  const togglePass = (id) => {
    setVisiblePasswords((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <div className="flex w-full min-w-0 flex-col">
      <ListPageShell
        className="w-full"
        title={
          <span className="inline-flex items-center gap-2 text-lg font-bold md:text-xl">
            <KeyRound className="h-5 w-5 text-amber-600" />
            Project credentials
          </span>
        }
        description="Store login details per project (encrypted on the server)."
        action={
          <Button
            size="sm"
            className="h-9 gap-1.5 bg-slate-900"
            disabled={!selectedId}
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" /> Add credential
          </Button>
        }
      >
        <div className="grid w-full min-h-[480px] gap-3 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
          <DataTableCard className="flex flex-col overflow-hidden p-0">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projects</p>
            </div>
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-8 pl-7 text-sm"
                  placeholder="Search…"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[min(60vh,520px)] flex-1 overflow-y-auto">
              {loadingProjects ? (
                <p className="p-4 text-center text-sm text-slate-500">Loading…</p>
              ) : filteredProjects.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-500">No projects</p>
              ) : (
                filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={cn(
                      "flex w-full items-center gap-2 border-b border-slate-50 px-3 py-2.5 text-left text-sm transition-colors",
                      selectedId === p.id
                        ? "bg-amber-50 font-semibold text-amber-900"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span className="truncate">{p.name}</span>
                  </button>
                ))
              )}
            </div>
          </DataTableCard>

          <DataTableCard className="flex flex-col overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
              <p className="text-sm font-semibold text-slate-900">
                {selectedProject ? selectedProject.name : "Select a project"}
              </p>
              {loadingCreds && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </div>

            {!selectedId ? (
              <p className="p-8 text-center text-sm text-slate-500">Choose a project on the left.</p>
            ) : loadingCreds ? (
              <p className="p-8 text-center text-sm text-slate-500">Loading credentials…</p>
            ) : credentials.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                No credentials yet. Add one for this project.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {credentials.map((c) => {
                  const showPass = visiblePasswords[c.id];
                  return (
                    <div
                      key={c.id}
                      className="flex flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{c.label}</p>
                        <div className="flex shrink-0 gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600"
                            onClick={() => setDeleteTarget(c)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500">Username</span>
                          <div className="mt-0.5 flex items-center gap-1">
                            <code className="flex-1 truncate rounded bg-slate-50 px-2 py-1 font-mono text-slate-800">
                              {c.username}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => copyText(c.username, toast)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Password</span>
                          <div className="mt-0.5 flex items-center gap-1">
                            <code className="flex-1 truncate rounded bg-slate-50 px-2 py-1 font-mono text-slate-800">
                              {showPass ? c.password : "••••••••"}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => togglePass(c.id)}
                            >
                              {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => copyText(c.password, toast)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {c.notes && (
                          <p className="text-slate-500 line-clamp-2" title={c.notes}>
                            {c.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DataTableCard>
        </div>
      </ListPageShell>

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title={editing ? "Edit credential" : "New credential"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <FormSheetBody className="space-y-3">
            <div>
              <Label className="text-xs">Credential name</Label>
              <Input
                className="h-9 mt-1"
                placeholder="e.g. Admin, Staging DB"
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">Username</Label>
              <Input
                className="h-9 mt-1"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">
                Password {editing && <span className="text-slate-400">(leave blank to keep)</span>}
              </Label>
              <Input
                className="h-9 mt-1"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                className="h-9 mt-1"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </FormSheetBody>
          <FormSheetFooter>
            <FormSheetActions
              submitting={saving}
              isEdit={Boolean(editing)}
              submitLabel="Add credential"
              editSubmitLabel="Save"
            />
          </FormSheetFooter>
        </form>
      </FormSheet>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete credential?"
        description={`Remove “${deleteTarget?.label}”?`}
        variant="destructive"
        confirmText="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
