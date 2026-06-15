import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { Checkbox } from "../../../common/components/ui/checkbox";
import { Loader2, Upload, X } from "lucide-react";
import { SheetFooter, SheetClose } from "../../../common/components/ui/sheet";
import { clientService } from "../../clients/services/clientService";
import { projectGroupService } from "../services/projectGroupService";
import { getFullAvatarUrl, formatDate } from "../../../core/utils/utils";

export const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]).default("active"),
  remark: z.string().optional(),
  client_id: z.union([z.string(), z.number()]).optional().nullable().transform(val => val ? Number(val) : null),
  group_id: z.union([z.string(), z.number()]).optional().nullable().transform(val => val ? Number(val) : null),
  project_logo: z.string().optional(),
  by_tl_managed: z.boolean().default(false),
  team_managed: z.boolean().default(false),
  company_managed: z.boolean().default(false),
});

const ProjectForm = ({ onSubmit, initialData, submitting, error }) => {
  const [clients, setClients] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      status: "active",
      remark: "",
      client_id: "",
      group_id: "",
      project_logo: "",
      by_tl_managed: false,
      team_managed: false,
      company_managed: false,
    },
  });

  const previewLogo = watch("project_logo");

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("project_logo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setValue("project_logo", "");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingClients(true);
        setLoadingGroups(true);
        const [clientsData, groupsData] = await Promise.all([
          clientService.getAllClients(),
          projectGroupService.getAllGroups()
        ]);
        setClients(clientsData.clients || []);
        setGroups(groupsData.groups || []);
      } catch (err) {
        console.error("Failed to fetch form data:", err);
      } finally {
        setLoadingClients(false);
        setLoadingGroups(false);
      }
    };
    fetchData();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-8 flex flex-col h-full">
      <div className="flex-1 space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Project Logo Section */}
        <div className="space-y-4">
          <Label className="text-base font-bold text-slate-900">Project Logo</Label>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <div className="h-24 w-24 rounded-2xl border-2 border-slate-100 bg-slate-50 overflow-hidden shadow-inner flex items-center justify-center">
                {previewLogo ? (
                  <img src={getFullAvatarUrl(previewLogo)} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-slate-900 flex items-center justify-center text-white text-2xl font-bold">
                    {watch("name")?.[0]?.toUpperCase() || "P"}
                  </div>
                )}
              </div>
              {previewLogo && (
                <button 
                  type="button" 
                  onClick={clearLogo}
                  className="absolute -top-2 -right-2 bg-white border shadow-sm rounded-full p-1 text-slate-500 hover:text-red-500 transition-colors z-10"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <Label 
                  htmlFor="logo-upload" 
                  className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-slate-200"
                >
                  <Upload className="h-4 w-4" /> Upload Logo
                </Label>
                <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                <span className="text-xs text-slate-400 font-medium">PNG, JPG up to 2MB</span>
              </div>
              
              <p className="text-xs text-slate-500 italic">
                This logo will be displayed inside the project folder.
              </p>
            </div>
          </div>
        </div>

        {/* Core Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="h-4 w-1 bg-slate-900 rounded-full" />
            <h3 className="font-bold text-slate-900">Project Details</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1 font-bold">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="name" 
              {...register("name")} 
              placeholder="Enter project name"
              className="bg-slate-50/50 focus:bg-white transition-all" 
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-bold">Description</Label>
            <textarea
              id="description"
              {...register("description")}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-slate-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white transition-all"
              placeholder="Enter project description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="flex items-center gap-1 font-bold">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="start_date" 
                type="date" 
                {...register("start_date")} 
                className="bg-slate-50/50 focus:bg-white transition-all" 
              />
              {errors.start_date && <p className="text-xs text-red-500 font-medium">{errors.start_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="flex items-center gap-1 font-bold">
                Approx End Date
              </Label>
              <Input 
                id="end_date" 
                type="date" 
                {...register("end_date")} 
                className="bg-slate-50/50 focus:bg-white transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status" className="font-bold">Status</Label>
              <Select onValueChange={(val) => setValue("status", val)} value={watch("status")}>
                <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-all">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_id" className="font-bold">Client</Label>
              <Select 
                onValueChange={(val) => setValue("client_id", val)} 
                value={watch("client_id")?.toString()}
                disabled={loadingClients}
              >
                <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-all">
                  <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select client"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="group_id" className="font-bold">Project Group</Label>
              <Select 
                onValueChange={(val) => setValue("group_id", val)} 
                value={watch("group_id")?.toString()}
                disabled={loadingGroups}
              >
                <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-all">
                  <SelectValue placeholder={loadingGroups ? "Loading groups..." : "Select group"} />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark" className="font-bold">Remark</Label>
            <Input 
              id="remark" 
              {...register("remark")} 
              placeholder="Any additional notes"
              className="bg-slate-50/50 focus:bg-white transition-all" 
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                <Checkbox 
                  id="team_managed" 
                  checked={watch("team_managed")}
                  onCheckedChange={(checked) => {
                    setValue("team_managed", checked);
                    if (checked) {
                      setValue("company_managed", false);
                    } else {
                      setValue("by_tl_managed", false);
                    }
                  }}
                />
                <Label htmlFor="team_managed" className="font-bold cursor-pointer">Team Managed</Label>
              </div>
              <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                <Checkbox 
                  id="company_managed" 
                  checked={watch("company_managed")}
                  onCheckedChange={(checked) => {
                    setValue("company_managed", checked);
                    if (checked) {
                      setValue("team_managed", false);
                      setValue("by_tl_managed", false);
                    }
                  }}
                />
                <Label htmlFor="company_managed" className="font-bold cursor-pointer">Company Managed</Label>
              </div>
            </div>
            {watch("team_managed") && (
              <div className="flex items-center gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                <Checkbox 
                  id="by_tl_managed" 
                  checked={watch("by_tl_managed")}
                  onCheckedChange={(checked) => setValue("by_tl_managed", checked)}
                />
                <Label htmlFor="by_tl_managed" className="font-bold cursor-pointer">By TL Managed</Label>
              </div>
            )}
          </div>
        </div>
      </div>

      <SheetFooter className="pt-4 border-t gap-3 sticky bottom-0 bg-white z-10 mt-4 -mx-6 px-6 pb-6">
        <SheetClose asChild>
          <Button type="button" variant="outline" className="font-bold flex-1">Cancel</Button>
        </SheetClose>
        <Button type="submit" disabled={submitting} className="bg-slate-900 font-bold flex-1">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? "Update Project" : "Create Project"
          )}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default ProjectForm;
