import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../common/components/ui/dialog";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
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
import { Loader2, Mail, Send, X } from "lucide-react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useToast } from "../../../common/hooks/use-toast";

const LeaveMailComposeDialog = ({
  open,
  onOpenChange,
  formData,
  initialCompose,
  onSend,
  submitting,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState(initialCompose?.admins || []);
  const [toAdminId, setToAdminId] = useState("");
  const [ccIds, setCcIds] = useState([]);
  const [subject, setSubject] = useState(initialCompose?.subject || "");
  const [body, setBody] = useState(initialCompose?.body || "");
  const [usesSaved, setUsesSaved] = useState(Boolean(initialCompose?.uses_saved_template));
  const [refreshing, setRefreshing] = useState(false);
  const editedRef = useRef(false);

  const requesterFrom = useMemo(() => {
    const name = [user?.first_name || user?.firstName, user?.last_name || user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name ? `${name} <${user?.email || ""}>` : user?.email || "";
  }, [user]);

  useEffect(() => {
    if (!open || !initialCompose) return;
    setAdmins(initialCompose.admins || []);
    setSubject(initialCompose.subject || "");
    setBody(initialCompose.body || "");
    setUsesSaved(Boolean(initialCompose.uses_saved_template));
    setToAdminId("");
    setCcIds([]);
    editedRef.current = false;
  }, [open, initialCompose]);

  const refreshForToAdmin = async (adminId) => {
    if (!formData || !adminId || editedRef.current || usesSaved) return;
    setRefreshing(true);
    try {
      const res = await leaveService.composeMail({
        ...formData,
        mail_to_admin_id: Number(adminId),
      });
      if (res.status === 1) {
        setSubject(res.subject || "");
        setBody(res.body || "");
        setUsesSaved(Boolean(res.uses_saved_template));
      }
    } catch (err) {
      toast({
        title: "Could not refresh template",
        description: err?.msg || err?.error || err?.message || "Network error",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!open || !toAdminId) return;
    refreshForToAdmin(toAdminId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toAdminId]);

  const ccOptions = useMemo(
    () => admins.filter((a) => String(a.id) !== String(toAdminId)),
    [admins, toAdminId]
  );

  const toggleCc = (id) => {
    setCcIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSend = () => {
    if (!toAdminId || !subject.trim() || !body.trim()) return;
    onSend({
      ...formData,
      mail_to_admin_id: Number(toAdminId),
      mail_cc_admin_ids: ccIds.map(Number),
      mail_subject: subject.trim(),
      mail_body: body.trim(),
      send_notification_email: true,
    });
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-slate-600" />
            <div>
              <DialogTitle className="text-left text-lg">Send leave request email</DialogTitle>
              <DialogDescription className="text-left text-xs mt-0.5">
                Edit subject and message. Your version is saved on send for next time.
                {usesSaved ? " (Your saved template.)" : " (Default template.)"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-white">
          {!initialCompose ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500 text-sm">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading email…
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[64px_1fr] items-center gap-2 text-sm border-b pb-2">
                <span className="text-slate-500 font-medium">From</span>
                <span className="text-slate-800 truncate">{requesterFrom}</span>
              </div>

              <div className="grid grid-cols-[64px_1fr] items-start gap-2 text-sm">
                <Label className="text-slate-500 font-medium pt-2">To</Label>
                <Select value={toAdminId} onValueChange={setToAdminId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin (approver)" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[300]">
                    {admins.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name} — {a.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-[64px_1fr] items-start gap-2 text-sm">
                <span className="text-slate-500 font-medium pt-2">Cc</span>
                <div className="max-h-24 overflow-y-auto border rounded-md p-2 space-y-1.5">
                  {ccOptions.length === 0 ? (
                    <p className="text-xs text-slate-400">Pick To first.</p>
                  ) : (
                    ccOptions.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 cursor-pointer text-xs">
                        <Checkbox
                          checked={ccIds.includes(a.id)}
                          onCheckedChange={() => toggleCc(a.id)}
                        />
                        <span>
                          {a.name} ({a.email})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[64px_1fr] items-center gap-2 text-sm border-t pt-3">
                <Label className="text-slate-500 font-medium">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => {
                    editedRef.current = true;
                    setSubject(e.target.value);
                  }}
                  disabled={refreshing}
                  className="font-medium"
                />
              </div>

              <div className="pt-1">
                <textarea
                  value={body}
                  onChange={(e) => {
                    editedRef.current = true;
                    setBody(e.target.value);
                  }}
                  disabled={refreshing}
                  className="w-full min-h-[220px] rounded-md border border-slate-200 px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Email body…"
                />
                {refreshing ? (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Updating greeting for selected admin…
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2 px-5 py-3 border-t bg-slate-50">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={
              submitting || refreshing || !initialCompose || !toAdminId || !subject.trim() || !body.trim()
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send &amp; submit request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveMailComposeDialog;
