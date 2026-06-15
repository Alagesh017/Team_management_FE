import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { Upload, X, Loader2 } from "lucide-react";
import { SheetFooter, SheetClose } from "../../../common/components/ui/sheet";
import { getFullAvatarUrl } from "../../../core/utils/utils";

const phoneRegex = /^[0-9]{10}$/;

export const workerFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.union([z.string(), z.null()]).optional().transform((val) => val ?? "").refine((val) => !val || phoneRegex.test(val), {
    message: "Phone number must be 10 digits",
  }),
  role_type: z.enum(["team_leader", "worker"]),
  job_title: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  department: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  experience_years: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : Math.max(0, num);
    },
    z.number().min(0, "Experience must be at least 0").default(0)
  ),
  working_hours: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  work_mode: z.union([z.string(), z.null()]).optional().transform((val) => val ?? "OFFICE"),
  office_location: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  github_url: z.union([z.string().url("Invalid Github URL"), z.literal(""), z.null()]).optional().transform((val) => val ?? ""),
  linkedin_url: z.union([z.string().url("Invalid LinkedIn URL"), z.literal(""), z.null()]).optional().transform((val) => val ?? ""),
  portfolio_url: z.union([z.string().url("Invalid Portfolio URL"), z.literal(""), z.null()]).optional().transform((val) => val ?? ""),
  address_line1: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  address_line2: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  city: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  state: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  country: z.union([z.string(), z.null()]).optional().transform((val) => val ?? "India"),
  pincode: z.union([z.string(), z.null()]).optional().transform((val) => val ?? "").refine((val) => !val || /^[0-9]{6}$/.test(val), {
    message: "Pincode must be 6 digits",
  }),
  status: z.string().default("ACTIVE"),
  employment_type: z.union([z.string(), z.null()]).optional().transform((val) => val ?? "FULL_TIME"),
  joining_date: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  remark: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
  avatar_url: z.union([z.string(), z.null()]).optional().transform((val) => val ?? ""),
});

const WorkerForm = ({ onSubmit, initialData, submitting, error }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workerFormSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role_type: "worker",
      job_title: "",
      department: "",
      experience_years: 0,
      working_hours: "",
      work_mode: "OFFICE",
      office_location: "",
      github_url: "",
      linkedin_url: "",
      portfolio_url: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      status: "ACTIVE",
      employment_type: "FULL_TIME",
      joining_date: new Date().toISOString().split('T')[0],
      remark: "",
      avatar_url: "",
    },
  });

  const previewImage = watch("avatar_url");
  const firstName = watch("first_name");
  const email = watch("email");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("avatar_url", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setValue("avatar_url", "");
  };

  const fullAvatarUrl = getFullAvatarUrl(previewImage);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-8 flex flex-col h-full">
      <div className="flex-1 space-y-8">
        {/* Profile Image Section */}
        <div className="space-y-4">
          <Label className="text-base font-bold text-slate-900">Profile Image</Label>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <div className="h-24 w-24 rounded-2xl border-2 border-slate-100 bg-slate-50 overflow-hidden shadow-inner flex items-center justify-center">
                {previewImage ? (
                  <img src={getFullAvatarUrl(previewImage)} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-slate-900 flex items-center justify-center text-white text-2xl font-bold">
                    {(firstName?.[0] || email?.[0] || "?").toUpperCase()}
                  </div>
                )}
              </div>
              {previewImage && (
                <button 
                  type="button" 
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-white border shadow-sm rounded-full p-1 text-slate-500 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <Label 
                  htmlFor="image-upload" 
                  className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-slate-200"
                >
                  <Upload className="h-4 w-4" /> Upload Photo
                </Label>
                <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <span className="text-xs text-slate-400 font-medium">PNG, JPG up to 2MB</span>
              </div>
              
              <p className="text-xs text-slate-500 italic">
                If no image is uploaded, we'll use initials as the profile icon.
              </p>
            </div>
          </div>
        </div>

        {/* Core Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="h-4 w-1 bg-slate-900 rounded-full" />
            <h3 className="font-bold text-slate-900">Mandatory Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
              <Input id="first_name" {...register("first_name")} className="bg-slate-50/50 focus:bg-white transition-all" />
              {errors.first_name && <p className="text-sm text-red-500 font-medium">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
              <Input id="last_name" {...register("last_name")} className="bg-slate-50/50 focus:bg-white transition-all" />
              {errors.last_name && <p className="text-sm text-red-500 font-medium">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1 font-bold">Email <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" {...register("email")} className="bg-slate-50/50 focus:bg-white transition-all" />
              {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role_type" className="flex items-center gap-1 font-bold">Role <span className="text-red-500">*</span></Label>
              <Select onValueChange={(val) => setValue("role_type", val)} value={watch("role_type")}>
                <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-all"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_leader">Team Leader</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Optional Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="h-4 w-1 bg-slate-200 rounded-full" />
            <h3 className="font-bold text-slate-500">Professional Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input id="job_title" {...register("job_title")} placeholder="e.g. Senior Developer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...register("department")} placeholder="e.g. Engineering" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select onValueChange={(val) => setValue("employment_type", val)} value={watch("employment_type")}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="INTERN">Intern</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="joining_date">Joining Date</Label>
              <Input id="joining_date" type="date" {...register("joining_date")} className="w-full h-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="experience_years">Experience (Years)</Label>
              <Input 
                id="experience_years" 
                {...register("experience_years")} 
                type="number"
                min="0"
                step="0.1"
                onChange={(e) => {
                  let val = e.target.value;
                  if (val === "") {
                    setValue("experience_years", 0);
                  } else {
                    const num = Number(val);
                    if (!isNaN(num) && num >= 0) {
                      setValue("experience_years", num);
                    }
                  }
                }}
              />
              {errors.experience_years && <p className="text-sm text-red-500 font-medium">{errors.experience_years.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="working_hours">Working Hours</Label>
              <Input id="working_hours" {...register("working_hours")} placeholder="e.g. 9:00 AM - 6:00 PM" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="work_mode">Work Mode</Label>
              <Select onValueChange={(val) => setValue("work_mode", val)} value={watch("work_mode")}>
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFFICE">Office</SelectItem>
                  <SelectItem value="WFH">Work From Home</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(val) => setValue("status", val)} value={watch("status")}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="RESIGNED">Resigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                {...register("phone")} 
                placeholder="1234567890"
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  e.target.value = val;
                }}
              />
              {errors.phone && <p className="text-sm text-red-500 font-medium">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input id="linkedin_url" {...register("linkedin_url")} placeholder="https://linkedin.com/in/username" />
              {errors.linkedin_url && <p className="text-sm text-red-500 font-medium">{errors.linkedin_url.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="github_url">Github URL</Label>
              <Input id="github_url" {...register("github_url")} placeholder="https://github.com/username" />
              {errors.github_url && <p className="text-sm text-red-500 font-medium">{errors.github_url.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input id="portfolio_url" {...register("portfolio_url")} placeholder="https://yourportfolio.com" />
              {errors.portfolio_url && <p className="text-sm text-red-500 font-medium">{errors.portfolio_url.message}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <div className="h-4 w-1 bg-slate-200 rounded-full" />
              <h3 className="font-bold text-slate-500">Address Details</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="office_location">Office Location</Label>
              <Input id="office_location" {...register("office_location")} placeholder="Main Office, Branch name, etc." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="address_line1">Address Line 1</Label>
                <Input id="address_line1" {...register("address_line1")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input id="address_line2" {...register("address_line2")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register("state")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input 
                  id="pincode" 
                  {...register("pincode")} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    e.target.value = val;
                  }}
                />
                {errors.pincode && <p className="text-sm text-red-500 font-medium">{errors.pincode.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remark">Remarks / Notes</Label>
              <Input id="remark" {...register("remark")} />
            </div>
          </div>
        </div>

        {error && <Alert variant="destructive" className="border-red-200 bg-red-50"><AlertDescription className="text-red-800 font-medium">{error}</AlertDescription></Alert>}
      </div>
      
      <SheetFooter className="border-t pt-6 flex gap-3 sticky bottom-0 bg-white z-10 mt-4 -mx-6 px-6 pb-6">
        <SheetClose asChild><Button variant="ghost" className="text-slate-500 font-bold flex-1">Cancel</Button></SheetClose>
        <Button type="submit" disabled={submitting} className="bg-slate-900 text-white font-bold flex-1 shadow-lg hover:shadow-xl transition-all">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : initialData ? "Update Account" : "Create Account"}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default WorkerForm;
