import React from "react";
import { Camera, Upload, User, X } from "lucide-react";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { getFullAvatarUrl } from "../../../core/utils/utils";
import { toDateInputValue, roleTypeFromUser } from "../config/profileFieldConfig";
import {
  ProfileFormSelect,
  ProfileSelectItem,
  normalizeEmploymentType,
  normalizeWorkerStatus,
  normalizeWorkMode,
} from "./ProfileFormSelect";

const inputClass = "mt-1.5 border-slate-200 bg-slate-50/50 focus:bg-white";

export function ProfileWorkerFields({ section, form, set, onImageUpload, user }) {
  const roleType = roleTypeFromUser(user, form);

  if (section === 0) {
    return (
      <>
        <div className="space-y-4 pb-2">
          <Label className="text-base font-bold text-slate-900">Profile Image</Label>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <label className="relative cursor-pointer group">
              <div className="h-24 w-24 rounded-2xl border-2 border-slate-100 bg-slate-50 overflow-hidden shadow-inner flex items-center justify-center">
                {form.avatar_url ? (
                  <img
                    src={getFullAvatarUrl(form.avatar_url)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-slate-300" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-md">
                <Camera className="h-3.5 w-3.5" />
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
            </label>
            <div className="flex-1 space-y-3">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200">
                <Upload className="h-4 w-4" /> Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
              </label>
              {form.avatar_url && (
                <button
                  type="button"
                  className="ml-2 text-xs text-red-500 font-medium inline-flex items-center gap-1"
                  onClick={() => set("avatar_url", "")}
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              )}
              <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>First Name *</Label>
            <Input
              value={form.first_name ?? ""}
              onChange={(e) => set("first_name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <Label>Last Name *</Label>
            <Input
              value={form.last_name ?? ""}
              onChange={(e) => set("last_name", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <Label>Role *</Label>
            <ProfileFormSelect value={roleType} disabled triggerClassName={inputClass}>
              <ProfileSelectItem value="team_leader">Team Leader</ProfileSelectItem>
              <ProfileSelectItem value="worker">Worker</ProfileSelectItem>
            </ProfileFormSelect>
            <p className="mt-1 text-[11px] text-slate-400">Role is managed by your organization.</p>
          </div>
        </div>

        <div className="mt-4">
          <Label>Phone Number</Label>
          <Input
            value={form.phone ?? ""}
            placeholder="1234567890"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              set("phone", val);
            }}
            className={inputClass}
          />
        </div>
      </>
    );
  }

  if (section === 1) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Job Title</Label>
            <Input
              value={form.job_title ?? ""}
              placeholder="e.g. Senior Developer"
              onChange={(e) => set("job_title", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              value={form.department ?? ""}
              placeholder="e.g. Engineering"
              onChange={(e) => set("department", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Employment Type</Label>
            <ProfileFormSelect
              value={normalizeEmploymentType(form.employment_type)}
              onValueChange={(v) => set("employment_type", v)}
              triggerClassName={inputClass}
            >
              <ProfileSelectItem value="FULL_TIME">Full Time</ProfileSelectItem>
              <ProfileSelectItem value="INTERN">Intern</ProfileSelectItem>
              <ProfileSelectItem value="CONTRACT">Contract</ProfileSelectItem>
            </ProfileFormSelect>
          </div>
          <div>
            <Label>Joining Date</Label>
            <Input
              type="date"
              max={new Date().toLocaleDateString("en-CA")}
              value={toDateInputValue(form.joining_date)}
              onChange={(e) => set("joining_date", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Experience (Years)</Label>
            <Input
              type="number"
              min={0}
              max={70}
              step={0.1}
              value={form.experience_years ?? ""}
              onChange={(e) => set("experience_years", e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">0 - 70 years</p>
          </div>
          <div>
            <Label>Working Hours</Label>
            <Input
              type="number"
              min={0}
              max={14}
              step={1}
              placeholder="e.g. 8"
              value={form.working_hours ?? ""}
              onChange={(e) => set("working_hours", e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">0 - 14 hours</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Work Mode</Label>
            <ProfileFormSelect
              value={normalizeWorkMode(form.work_mode)}
              onValueChange={(v) => set("work_mode", v)}
              triggerClassName={inputClass}
            >
              <ProfileSelectItem value="OFFICE">Office</ProfileSelectItem>
              <ProfileSelectItem value="WFH">Work From Home</ProfileSelectItem>
              <ProfileSelectItem value="HYBRID">Hybrid</ProfileSelectItem>
            </ProfileFormSelect>
          </div>
          <div>
            <Label>Status</Label>
            <ProfileFormSelect
              value={normalizeWorkerStatus(form.status)}
              onValueChange={(v) => set("status", v)}
              triggerClassName={inputClass}
            >
              <ProfileSelectItem value="ACTIVE">Active</ProfileSelectItem>
              <ProfileSelectItem value="INACTIVE">Inactive</ProfileSelectItem>
              <ProfileSelectItem value="RESIGNED">Resigned</ProfileSelectItem>
            </ProfileFormSelect>
          </div>
        </div>

        <div className="mt-4">
          <Label>Office Location</Label>
          <Input
            value={form.office_location ?? ""}
            placeholder="Main Office, Branch name, etc."
            onChange={(e) => set("office_location", e.target.value)}
            className={inputClass}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <p className="text-sm font-semibold text-[#0f2744] mb-4">Profile links</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>LinkedIn URL</Label>
          <Input
            value={form.linkedin_url ?? ""}
            placeholder="https://linkedin.com/in/username"
            onChange={(e) => set("linkedin_url", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <Label>Github URL</Label>
          <Input
            value={form.github_url ?? ""}
            placeholder="https://github.com/username"
            onChange={(e) => set("github_url", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <Label>Portfolio URL</Label>
        <Input
          value={form.portfolio_url ?? ""}
          placeholder="https://yourportfolio.com"
          onChange={(e) => set("portfolio_url", e.target.value)}
          className={inputClass}
        />
      </div>

      <p className="text-sm font-semibold text-[#0f2744] mt-8 mb-4">Address details</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Address Line 1</Label>
          <Input
            value={form.address_line1 ?? ""}
            onChange={(e) => set("address_line1", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <Label>Address Line 2</Label>
          <Input
            value={form.address_line2 ?? ""}
            onChange={(e) => set("address_line2", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>City</Label>
          <Input
            value={form.city ?? ""}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <Label>State</Label>
          <Input
            value={form.state ?? ""}
            onChange={(e) => set("state", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Country</Label>
          <Input
            value={form.country ?? ""}
            onChange={(e) => set("country", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <Label>Pincode</Label>
          <Input
            value={form.pincode ?? ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              set("pincode", val);
            }}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <Label>Remarks / Notes</Label>
        <Input
          value={form.remark ?? ""}
          onChange={(e) => set("remark", e.target.value)}
          className={inputClass}
        />
      </div>
    </>
  );
}
