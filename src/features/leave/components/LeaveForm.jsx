import React, { useState, useEffect, useRef } from "react";
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
import { leaveService } from "../services/leaveService";
import { Loader2, Shield } from "lucide-react";
import LeaveTimeField, {
  addMinutesToTime,
  formatTime12h,
  nowTime24,
  parseTimeToMinutes,
} from "./LeaveTimeField";
import { cn } from "../../../core/utils/utils";

const DURATION_OPTIONS = [
  { label: "10 min", minutes: 10 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "3 hours", minutes: 180 },
];
import {
  FormSheetActions,
  FormSheetBody,
  FormSheetFooter,
  FormSheetSection,
} from "../../../common/components/FormSheet";
import { useToast } from "../../../common/hooks/use-toast";

const LeaveForm = ({ onSubmit, onOpenCompose, composeLoading, submitting, error }) => {
  const needsMail = Boolean(onOpenCompose);
  const [formData, setFormData] = useState({
    type: "leave",
    leave_subtype: "full_day",
    leave_category: "normal",
    reason: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    attachment_path: "",
    remark: "",
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [timeError, setTimeError] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const { toast } = useToast();

  const needsTimeRange =
    formData.type === "permission" || formData.leave_subtype === "half_day";

  const applyDuration = (minutes, startTime) => {
    const start = startTime || formData.start_time || nowTime24();
    setDurationMinutes(minutes);
    setTimeError("");
    setFormData((prev) => ({
      ...prev,
      start_time: start,
      end_time: addMinutesToTime(start, minutes),
    }));
  };

  const hadTimeRangeRef = useRef(false);

  useEffect(() => {
    if (needsTimeRange && !hadTimeRangeRef.current) {
      const start = nowTime24();
      setDurationMinutes(60);
      setFormData((prev) => ({
        ...prev,
        start_time: start,
        end_time: addMinutesToTime(start, 60),
      }));
    }
    hadTimeRangeRef.current = needsTimeRange;
  }, [needsTimeRange]);

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      start_date: today,
      end_date: today
    }));
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingFile(true);
      try {
        const result = await leaveService.uploadAttachment(file);
        if (result.status === 1) {
          setFormData((prev) => ({
            ...prev,
            attachment_path: result.path,
          }));
          setFileName(file.name);
          toast({
            title: "Success",
            description: "File uploaded successfully",
            variant: "success"
          });
        }
      } catch (err) {
        console.error("Error uploading file:", err);
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive"
        });
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleDateChange = (date) => {
    if (formData.type === "permission") {
      setFormData(prev => ({
        ...prev,
        start_date: date,
        end_date: date
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        start_date: date
      }));
    }
  };

  const handleStartTimeChange = (time) => {
    if (!time) return;
    applyDuration(durationMinutes, time);
  };

  const validateTimeRange = () => {
    if (!needsTimeRange) {
      setTimeError("");
      return null;
    }
    if (!durationMinutes || durationMinutes <= 0) {
      const msg = "Choose how long you need (10 min to 3 hours).";
      setTimeError(msg);
      return msg;
    }
    if (!formData.start_time || !formData.end_time) {
      const msg = "Set a start time and pick a duration.";
      setTimeError(msg);
      return msg;
    }
    const startM = parseTimeToMinutes(formData.start_time);
    const endM = parseTimeToMinutes(formData.end_time);
    if (startM == null || endM == null || endM <= startM) {
      const msg = "End time must be later than start time.";
      setTimeError(msg);
      return msg;
    }
    setTimeError("");
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const timeMsg = validateTimeRange();
    if (timeMsg) {
      toast({
        title: "Check your times",
        description: timeMsg,
        variant: "destructive",
      });
      return;
    }
    if (needsMail && onOpenCompose) {
      onOpenCompose(formData);
      return;
    }
    onSubmit({ ...formData, send_notification_email: false });
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <FormSheetBody className="space-y-5">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <FormSheetSection icon={Shield} title="Request Details">
        <div className="space-y-2">
        <Label htmlFor="type">Request Type</Label>
        <Select
          value={formData.type}
          onValueChange={(val) => setFormData((prev) => ({ ...prev, type: val }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="leave">Leave</SelectItem>
            <SelectItem value="permission">Permission</SelectItem>
          </SelectContent>
        </Select>
        </div>

      {formData.type === "leave" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="leave_subtype">Duration</Label>
            <Select
              value={formData.leave_subtype}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, leave_subtype: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_day">Full Day Leave</SelectItem>
                <SelectItem value="half_day">Half Day Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="leave_category">Leave category</Label>
            <Select
              value={formData.leave_category}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, leave_category: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">
                  Normal (counts toward annual quota)
                </SelectItem>
                <SelectItem value="religious">
                  Religious (unlimited, not counted in annual quota)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {formData.type === "permission" && (
        <p className="text-xs text-slate-500 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          Permission is up to <strong>1 hour</strong>. Longer than 1 hour is saved as{" "}
          <strong>half-day leave</strong> automatically.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason">Reason <span className="text-red-500">*</span></Label>
        <textarea
          id="reason"
          value={formData.reason}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, reason: e.target.value }))
          }
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[100px] resize-vertical"
          placeholder="Enter reason for leave/permission"
          required
        />
      </div>

      {formData.type === "permission" ? (
        <div className="space-y-2">
          <Label htmlFor="permission_date">Date <span className="text-red-500">*</span></Label>
          <Input
            type="date"
            id="permission_date"
            value={formData.start_date}
            onChange={(e) => handleDateChange(e.target.value)}
            required
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">From Date <span className="text-red-500">*</span></Label>
            <Input
              type="date"
              id="start_date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, start_date: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">To Date <span className="text-red-500">*</span></Label>
            <Input
              type="date"
              id="end_date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, end_date: e.target.value }))
              }
              required
            />
          </div>
        </div>
      )}

      {needsTimeRange ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <LeaveTimeField
            id="leave_start_time"
            label="Start time"
            value={formData.start_time}
            onChange={handleStartTimeChange}
            required
            hint="Defaults to current time — tap the clock or edit"
          />

          <div className="space-y-2">
            <Label>How long?</Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <Button
                  key={opt.minutes}
                  type="button"
                  variant={durationMinutes === opt.minutes ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full px-4",
                    durationMinutes === opt.minutes && "bg-slate-900 hover:bg-slate-800"
                  )}
                  onClick={() => applyDuration(opt.minutes)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            {timeError ? (
              <p className="text-xs font-medium text-red-600">{timeError}</p>
            ) : (
              <p className="text-sm text-slate-700">
                Ends at{" "}
                <span className="font-semibold text-slate-900">
                  {formatTime12h(formData.end_time)}
                </span>
              </p>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="remark">Remark (Optional)</Label>
        <textarea
          id="remark"
          value={formData.remark}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, remark: e.target.value }))
          }
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[80px] resize-vertical"
          placeholder="Add any additional remarks"
        />
      </div>
        </FormSheetSection>
      </FormSheetBody>

      <FormSheetFooter>
        <FormSheetActions
          submitting={submitting || composeLoading}
          isEdit={false}
          submitLabel={needsMail ? "Next: compose email" : "Submit Request"}
          editSubmitLabel={needsMail ? "Next: compose email" : "Submit Request"}
        />
      </FormSheetFooter>
    </form>
  );
};

export default LeaveForm;
