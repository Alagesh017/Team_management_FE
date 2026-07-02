import React, { useState, useEffect } from "react";
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
import { Loader2, UploadCloud, X, Clock } from "lucide-react";
import { useToast } from "../../../common/hooks/use-toast";

// Helper to convert 24h to 12h format
const to12Hour = (time24) => {
  if (!time24) return { hours: "12", minutes: "00", period: "AM" };
  const [hours, minutes] = time24.split(":");
  let h = parseInt(hours);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return {
    hours: h.toString().padStart(2, "0"),
    minutes: minutes,
    period
  };
};

// Helper to convert 12h to 24h format
const to24Hour = (hours, minutes, period) => {
  let h = parseInt(hours);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${minutes}`;
};

const TimePicker12H = ({ value, onChange, label }) => {
  const time12 = to12Hour(value);
  const [hours, setHours] = useState(time12.hours);
  const [minutes, setMinutes] = useState(time12.minutes);
  const [period, setPeriod] = useState(time12.period);

  useEffect(() => {
    const newTime = to24Hour(hours, minutes, period);
    onChange(newTime);
  }, [hours, minutes, period]);

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => 
    (i + 1).toString().padStart(2, "0")
  );

  // Generate minute options (00, 15, 30, 45 or every 5 mins)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => 
    (i * 5).toString().padStart(2, "0")
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-slate-400" />
        <Select value={hours} onValueChange={setHours}>
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {hourOptions.map(h => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-slate-400 font-bold">:</span>
        <Select value={minutes} onValueChange={setMinutes}>
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {minuteOptions.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const LeaveForm = ({ onSubmit, submitting, error }) => {
  const [formData, setFormData] = useState({
    type: "leave",
    leave_subtype: "full_day",
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
  const { toast } = useToast();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

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
        <div className="space-y-2">
          <Label htmlFor="leave_subtype">Leave Type</Label>
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

      {(formData.type === "permission" || formData.leave_subtype === "half_day") && (
        <div className="grid grid-cols-2 gap-4">
          <TimePicker12H
            label="From Time"
            value={formData.start_time}
            onChange={(time) => setFormData(prev => ({ ...prev, start_time: time }))}
          />
          <TimePicker12H
            label="To Time"
            value={formData.end_time}
            onChange={(time) => setFormData(prev => ({ ...prev, end_time: time }))}
          />
        </div>
      )}



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

      <Button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Submit Request
      </Button>
    </form>
  );
};

export default LeaveForm;
