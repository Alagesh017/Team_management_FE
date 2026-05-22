import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { Loader2, Upload, X } from "lucide-react";
import { SheetFooter, SheetClose } from "../../../common/components/ui/sheet";
import { getFullAvatarUrl } from "../../../core/utils/utils";

export const adminFormSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role_type: z.enum(["superadmin", "admin", "scrum"]),
  experience_years: z.union([z.string(), z.number()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) {
      return null;
    }
    const num = Number(val);
    return isNaN(num) ? null : num;
  }),
  working_hours: z.string().optional(),
  work_mode: z.string().optional(),
  office_location: z.string().optional(),
  linkedin_url: z.string().url("Invalid LinkedIn URL").or(z.literal("")).optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  status: z.string().default("ACTIVE"),
  joining_date: z.string().optional(),
  remark: z.string().optional(),
  avatar_url: z.string().optional(),
});

const AdminForm = ({ onSubmit, initialData, submitting, error }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminFormSchema),
    defaultValues: initialData || {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role_type: "admin",
      experience_years: "",
      working_hours: "",
      work_mode: "OFFICE",
      office_location: "",
      linkedin_url: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
      status: "ACTIVE",
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-8">
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
              If no image is uploaded, we'll use the first letter of the email as the profile icon.
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
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1 font-bold">Email <span className="text-red-500">*</span></Label>
            <Input id="email" type="email" {...register("email")} className="bg-slate-50/50 focus:bg-white transition-all" />
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role_type" className="flex items-center gap-1 font-bold">Role <span className="text-red-500">*</span></Label>
            <Select onValueChange={(val) => setValue("role_type", val)} value={watch("role_type")}>
              <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-all"><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="scrum">Scrum Master</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Optional Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <div className="h-4 w-1 bg-slate-200 rounded-full" />
          <h3 className="font-bold text-slate-500">Optional Details</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input id="first_name" {...register("first_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input id="last_name" {...register("last_name")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register("phone")} placeholder="1234567890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="joining_date">Joining Date</Label>
            <Input id="joining_date" type="date" {...register("joining_date")} className="w-full h-10" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="experience_years">Experience (Years)</Label>
            <Input id="experience_years" {...register("experience_years")} type="number" />
            {errors.experience_years && <p className="text-xs text-red-500 font-medium">{errors.experience_years.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="working_hours">Working Hours</Label>
            <Input id="working_hours" {...register("working_hours")} placeholder="e.g. 9:00 AM - 6:00 PM" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
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
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
          <Input id="linkedin_url" {...register("linkedin_url")} placeholder="https://linkedin.com/in/username" />
          {errors.linkedin_url && <p className="text-xs text-red-500 font-medium">{errors.linkedin_url.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="office_location">Office Location</Label>
          <Input id="office_location" {...register("office_location")} placeholder="Main Office, Branch name, etc." />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input id="address_line1" {...register("address_line1")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input id="address_line2" {...register("address_line2")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" {...register("pincode")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remark">Remarks / Notes</Label>
          <Input id="remark" {...register("remark")} />
        </div>
      </div>

      {error && <Alert variant="destructive" className="border-red-200 bg-red-50"><AlertDescription className="text-red-800 font-medium">{error}</AlertDescription></Alert>}
      
      <SheetFooter className="border-t pt-8 flex gap-3">
        <SheetClose asChild><Button variant="ghost" className="text-slate-500 font-bold">Cancel</Button></SheetClose>
        <Button type="submit" disabled={submitting} className="bg-slate-900 text-white font-bold px-8 shadow-lg hover:shadow-xl transition-all">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : initialData ? "Update Account" : "Create Account"}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default AdminForm;
