import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../../common/components/ui/button";
import { leaveService } from "../services/leaveService";
import { Loader2, X } from "lucide-react";
import { useToast } from "../../../common/hooks/use-toast";
import { LeaveRecipientField } from "./LeaveRecipientField";

const LeaveMailComposeDialog = ({
  open,
  onOpenChange,
  formData,
  initialCompose,
  onSend,
  submitting,
}) => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState(initialCompose?.admins || []);
  const [toIds, setToIds] = useState([]);
  const [ccIds, setCcIds] = useState([]);
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [usesSaved, setUsesSaved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const editedRef = useRef(false);

  const toAdminId = toIds[0] ?? null;

  useEffect(() => {
    if (!open || !initialCompose) return;
    setAdmins(initialCompose.admins || []);
    setSubject(initialCompose.subject || "");
    setBody(initialCompose.body || "");
    setUsesSaved(Boolean(initialCompose.uses_saved_template));
    setToIds([]);
    setCcIds([]);
    setShowCc(false);
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

  if (!open || !formData) return null;

  return createPortal(
  <>
      <button
        type="button"
        aria-label="Close compose"
        className="fixed inset-0 z-[90] bg-black/20"
        onClick={() => !submitting && onOpenChange(false)}
      />
      <div
        className="leave-mail-compose-dialog fixed z-[100] bottom-0 right-4 sm:right-6 flex w-[min(560px,calc(100vw-2rem))] max-h-[min(520px,calc(100vh-2rem))] flex-col overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-labelledby="leave-compose-title"
      >
        <div className="flex items-center justify-between bg-[#404040] px-4 py-2.5 text-white shrink-0">
          <h2 id="leave-compose-title" className="text-sm font-medium">
            New Message
          </h2>
          <button
            type="button"
            onClick={() => !submitting && onOpenChange(false)}
            className="rounded p-1 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4">
          {!initialCompose ? (
            <div className="flex flex-1 items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <div className="relative">
                <LeaveRecipientField
                  label="To"
                  admins={admins}
                  selectedIds={toIds}
                  onSelectedIdsChange={setToIds}
                  multiple={false}
                  disabled={refreshing || submitting}
                />
                {!showCc ? (
                  <button
                    type="button"
                    className="absolute right-0 top-2.5 text-xs text-slate-500 hover:text-slate-800"
                    onClick={() => setShowCc(true)}
                  >
                    Cc
                  </button>
                ) : null}
              </div>

              {showCc ? (
                <LeaveRecipientField
                  label="Cc"
                  admins={admins}
                  selectedIds={ccIds}
                  onSelectedIdsChange={setCcIds}
                  multiple
                  excludeIds={toIds}
                  disabled={refreshing || submitting}
                />
              ) : null}

              <div className="flex items-center gap-2 border-b border-slate-200 py-2">
                <span className="w-14 shrink-0 text-slate-500 text-sm">Subject</span>
                <input
                  type="text"
                  value={subject}
                  disabled={refreshing || submitting}
                  onChange={(e) => {
                    editedRef.current = true;
                    setSubject(e.target.value);
                  }}
                  className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm outline-none"
                  placeholder="Subject"
                />
              </div>

              <textarea
                value={body}
                disabled={refreshing || submitting}
                onChange={(e) => {
                  editedRef.current = true;
                  setBody(e.target.value);
                }}
                className="min-h-[200px] flex-1 resize-none border-0 py-3 text-sm leading-relaxed outline-none"
                placeholder=""
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-3 shrink-0">
          <Button
            type="button"
            onClick={handleSend}
            disabled={
              submitting ||
              refreshing ||
              !initialCompose ||
              !toAdminId ||
              !subject.trim() ||
              !body.trim()
            }
            className="rounded-full bg-[#0b57d0] hover:bg-[#0948ad] px-6 text-white"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
          {refreshing ? (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Updating template…
            </span>
          ) : null}
        </div>
      </div>
    </>,
    document.body
  );
};

export default LeaveMailComposeDialog;