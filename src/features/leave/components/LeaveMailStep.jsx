import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../../common/components/ui/button";
import { Label } from "../../../common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../common/components/ui/select";
import { Checkbox } from "../../../common/components/ui/checkbox";
import { leaveService } from "../services/leaveService";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { FormSheetBody, FormSheetFooter, FormSheetSection } from "../../../common/components/FormSheet";
import { useAuth } from "../../auth/contexts/AuthContext";

const LeaveMailStep = ({ formData, onBack, onSubmit, submitting, error }) => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [toAdminId, setToAdminId] = useState("");
  const [ccIds, setCcIds] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingAdmins(true);
        const res = await leaveService.getMailRecipients();
        if (res.status === 1) {
          setAdmins(res.admins || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAdmins(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!toAdminId) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingPreview(true);
      try {
        const res = await leaveService.previewMail({
          ...formData,
          mail_to_admin_id: Number(toAdminId),
        });
        if (!cancelled && res.status === 1) {
          setPreview(res);
        }
      } catch (e) {
        if (!cancelled) setPreview(null);
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toAdminId, formData]);

  const ccOptions = useMemo(
    () => admins.filter((a) => String(a.id) !== String(toAdminId)),
    [admins, toAdminId]
  );

  const toggleCc = (id) => {
    setCcIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const requesterLabel = useMemo(() => {
    const name = [user?.first_name || user?.firstName, user?.last_name || user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name ? `${name} (${user?.email || "no email"})` : user?.email || "You";
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!toAdminId) return;
    onSubmit({
      ...formData,
      mail_to_admin_id: Number(toAdminId),
      mail_cc_admin_ids: ccIds.map(Number),
      send_notification_email: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <FormSheetBody className="space-y-5">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          From: <strong>{requesterLabel}</strong>
        </div>

        <FormSheetSection icon={Mail} title="Email to approver">
          {loadingAdmins ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading admins…
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-amber-700">
              No admins with email found. Add emails on admin profiles first.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>
                  Send To (approver) <span className="text-red-500">*</span>
                </Label>
                <Select value={toAdminId} onValueChange={setToAdminId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name} — {a.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>CC (other admins, optional)</Label>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 p-3 space-y-2">
                  {ccOptions.length === 0 ? (
                    <p className="text-xs text-slate-500">Select approver first.</p>
                  ) : (
                    ccOptions.map((a) => (
                      <label
                        key={a.id}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={ccIds.includes(a.id)}
                          onCheckedChange={() => toggleCc(a.id)}
                        />
                        <span>
                          {a.name} <span className="text-slate-500">({a.email})</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </FormSheetSection>

        {toAdminId && (
          <div className="space-y-2">
            <Label>Email preview</Label>
            {loadingPreview ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-6 justify-center border rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" /> Building template…
              </div>
            ) : preview ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 text-xs text-slate-600 border-b">
                  <div>
                    <span className="font-semibold">Subject:</span> {preview.subject}
                  </div>
                  <div>
                    <span className="font-semibold">To:</span> {preview.to_admin?.email}
                  </div>
                </div>
                <div
                  className="p-3 bg-white text-sm max-h-64 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: preview.html_body }}
                />
              </div>
            ) : null}
          </div>
        )}
      </FormSheetBody>

      <FormSheetFooter>
        <div className="flex w-full gap-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            type="submit"
            disabled={submitting || !toAdminId || loadingAdmins}
            className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit &amp; send email
          </Button>
        </div>
      </FormSheetFooter>
    </form>
  );
};

export default LeaveMailStep;
