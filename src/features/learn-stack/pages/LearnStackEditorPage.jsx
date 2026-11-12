import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { ListPageShell, DataTableCard } from "../../../common/components/PageLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../common/components/ui/select";
import { learnStackService } from "../services/learnStackService";
import { useToast } from "../../../common/hooks/use-toast";
import { getFullAvatarUrl } from "../../../core/utils/utils";

const emptyStep = () => ({
  title: "",
  body: "",
  image_url: "",
  document_url: "",
});

const fieldClass =
  "flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900";

export default function LearnStackEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [domains, setDomains] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [form, setForm] = useState({
    domain_id: "",
    technology_id: "",
    title: "",
    description: "",
    overview_document_url: "",
    steps: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const [dRes, tRes] = await Promise.all([
          learnStackService.getDomains(),
          learnStackService.getTechnologies(),
        ]);
        setDomains(dRes.domains || []);
        setTechnologies(tRes.technologies || []);
        if (isEdit) {
          const cRes = await learnStackService.getCard(id);
          const card = cRes.card;
          setForm({
            domain_id: String(card.domain_id),
            technology_id: String(card.technology_id),
            title: card.title || "",
            description: card.description || "",
            overview_document_url: card.overview_document_url || "",
            steps: (card.steps || []).map((s) => ({
              title: s.title,
              body: s.body || "",
              image_url: s.image_url || "",
              document_url: s.document_url || "",
            })),
          });
        }
      } catch (e) {
        toast({ variant: "destructive", title: "Failed to load", description: e?.msg });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, toast]);

  const filteredTech = useMemo(() => {
    if (!form.domain_id) return [];
    return technologies.filter((t) => String(t.domain_id) === String(form.domain_id));
  }, [technologies, form.domain_id]);

  const upload = async (file, kind) => {
    const res = await learnStackService.uploadFile(file, kind);
    return res.url;
  };

  const onOverviewFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await upload(file, "document");
      setForm((p) => ({ ...p, overview_document_url: url }));
      toast({ title: "Document uploaded" });
    } catch (err) {
      toast({ variant: "destructive", title: err?.msg || "Upload failed" });
    }
    e.target.value = "";
  };

  const onStepFile = async (index, e, kind) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await upload(file, kind);
      setForm((p) => {
        const steps = [...p.steps];
        const key = kind === "image" ? "image_url" : "document_url";
        steps[index] = { ...steps[index], [key]: url };
        return { ...p, steps };
      });
    } catch (err) {
      toast({ variant: "destructive", title: err?.msg || "Upload failed" });
    }
    e.target.value = "";
  };

  const submit = async () => {
    if (!form.title.trim() || !form.domain_id || !form.technology_id) {
      toast({ variant: "destructive", title: "Title, domain and technology are required" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        domain_id: Number(form.domain_id),
        technology_id: Number(form.technology_id),
        overview_document_url: form.overview_document_url || null,
        steps: form.steps.map((s, i) => ({
          step_order: i,
          title: s.title || `Step ${i + 1}`,
          body: s.body,
          image_url: s.image_url || null,
          document_url: s.document_url || null,
        })),
        is_published: true,
      };
      if (isEdit) {
        await learnStackService.updateCard(id, payload);
        navigate(`/learn-stack/${id}`);
      } else {
        const res = await learnStackService.createCard(payload);
        navigate(`/learn-stack/${res.id || res.card?.id}`);
      }
      toast({ title: isEdit ? "Guide updated" : "Guide published" });
    } catch (e) {
      toast({ variant: "destructive", title: e?.msg || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 pb-8">
      <ListPageShell
        className="w-full"
        title={isEdit ? "Edit guide" : "New guide"}
        description="Domain, stack, overview, and optional steps."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={() => navigate("/learn-stack")}>
              Cancel
            </Button>
            <Button size="sm" className="h-9 min-w-[100px] bg-slate-900" onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save" : "Publish"}
            </Button>
          </div>
        }
      />

      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 -ml-2" onClick={() => navigate("/learn-stack")}>
          <ArrowLeft className="h-4 w-4" /> Library
        </Button>
      </div>

      <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DataTableCard className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-slate-600">Domain</Label>
              <Select
                value={form.domain_id}
                onValueChange={(v) => setForm((p) => ({ ...p, domain_id: v, technology_id: "" }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Technology</Label>
              <Select
                value={form.technology_id}
                onValueChange={(v) => setForm((p) => ({ ...p, technology_id: v }))}
                disabled={!form.domain_id}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select stack" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTech.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-600">Title</Label>
            <Input
              className="h-9"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-600">Description</Label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={fieldClass}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-600">Full document</Label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <Upload className="h-3.5 w-3.5" />
                Upload
                <input type="file" className="hidden" onChange={onOverviewFile} />
              </label>
              {form.overview_document_url && (
                <a
                  href={getFullAvatarUrl(form.overview_document_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-violet-600 hover:underline"
                >
                  View file
                </a>
              )}
            </div>
          </div>
        </DataTableCard>

        <DataTableCard className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <Label className="text-sm font-semibold text-slate-900">Steps</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => setForm((p) => ({ ...p, steps: [...p.steps, emptyStep()] }))}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>

          <div className="max-h-[calc(100vh-280px)] space-y-2 overflow-y-auto pr-1">
            {form.steps.length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">No steps — optional walkthrough.</p>
            )}
            {form.steps.map((step, idx) => (
              <div key={idx} className="rounded-md border border-slate-200 p-3 space-y-2 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Step {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setForm((p) => ({ ...p, steps: p.steps.filter((_, i) => i !== idx) }))
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
                <Input
                  className="h-8 text-sm"
                  placeholder="Title"
                  value={step.title}
                  onChange={(e) => {
                    const steps = [...form.steps];
                    steps[idx] = { ...steps[idx], title: e.target.value };
                    setForm((p) => ({ ...p, steps }));
                  }}
                />
                <textarea
                  rows={2}
                  placeholder="Instructions"
                  value={step.body}
                  onChange={(e) => {
                    const steps = [...form.steps];
                    steps[idx] = { ...steps[idx], body: e.target.value };
                    setForm((p) => ({ ...p, steps }));
                  }}
                  className={fieldClass}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded border bg-white px-2 py-1 text-[10px] font-medium">
                    Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onStepFile(idx, e, "image")} />
                  </label>
                  <label className="cursor-pointer rounded border bg-white px-2 py-1 text-[10px] font-medium">
                    Doc
                    <input type="file" className="hidden" onChange={(e) => onStepFile(idx, e, "document")} />
                  </label>
                  {step.image_url && (
                    <img
                      src={getFullAvatarUrl(step.image_url)}
                      alt=""
                      className="h-10 w-10 rounded border object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DataTableCard>
      </div>
    </div>
  );
}
