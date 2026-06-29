import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { Loader2 } from "lucide-react";
import { SheetFooter, SheetClose } from "../../../common/components/ui/sheet";

export const sprintFormSchema = z.object({
  sprint_name: z.string().min(1, "Sprint name is required"),
  sprint_goal: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  sprint_status: z.union([z.string(), z.number()]).transform(val => Number(val)).default(0), // 0: Not Started, 1: Active, 2: Completed
  project_id: z.union([z.string(), z.number()]).transform(val => Number(val)),
});

// Helper function to calculate end date, skipping weekends
const calculateEndDate = (startDate, workDays) => {
  let currentDate = new Date(startDate);
  let daysAdded = 0;

  // Start from the day after start date
  while (daysAdded < workDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) { // Not Sunday (0) or Saturday (6)
      daysAdded++;
    }
  }

  return currentDate.toISOString().split('T')[0];
};

const SprintForm = ({ onSubmit, initialData, submitting, error, projectId }) => {
  const [selectedFrame, setSelectedFrame] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: initialData || {
      sprint_name: "",
      sprint_goal: "",
      description: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      sprint_status: 0,
      project_id: projectId,
    },
  });

  const startDate = useWatch({
    control,
    name: "start_date",
  });

  // Handle date frame selection
  const handleFrameSelect = (frame) => {
    setSelectedFrame(frame);
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    setValue("start_date", startDate);

    let workDays = 0;
    switch(frame) {
      case "1week":
        workDays = 5;
        break;
      case "2weeks":
        workDays = 10;
        break;
      case "3weeks":
        workDays = 15;
        break;
      case "4weeks":
        workDays = 20;
        break;
      default:
        break;
    }

    if (workDays > 0) {
      const endDate = calculateEndDate(startDate, workDays);
      setValue("end_date", endDate);
    }
  };

  useEffect(() => {
    if (initialData) {
      setValue("sprint_name", initialData.sprint_name || "");
      setValue("sprint_goal", initialData.sprint_goal || "");
      setValue("description", initialData.description || "");
      setValue("start_date", initialData.start_date || new Date().toISOString().split('T')[0]);
      setValue("end_date", initialData.end_date || "");
      setValue("sprint_status", initialData.sprint_status ?? 0);
      setValue("project_id", initialData.project_id || projectId);
    } else {
      setValue("project_id", projectId);
    }
  }, [initialData, projectId, setValue]);

  // Update end date when start date changes and a frame is selected
  useEffect(() => {
    if (selectedFrame && startDate) {
      let workDays = 0;
      switch(selectedFrame) {
        case "1week":
          workDays = 5;
          break;
        case "2weeks":
          workDays = 10;
          break;
        case "3weeks":
          workDays = 15;
          break;
        case "4weeks":
          workDays = 20;
          break;
        default:
          break;
      }
      if (workDays > 0) {
        const endDate = calculateEndDate(startDate, workDays);
        setValue("end_date", endDate);
      }
    }
  }, [selectedFrame, startDate, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[85vh]">
      {/* Scrollable content area only - capped height so footer always stays visible */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-8 py-8 px-1 -mx-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Sprint Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="h-4 w-1 bg-slate-900 rounded-full" />
            <h3 className="font-bold text-slate-900">Sprint Details</h3>
          </div>

          {/* Date Frames */}
          <div className="space-y-2">
            <Label className="font-bold">Quick Sprint Duration</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "1 Week", value: "1week" },
                { label: "2 Weeks", value: "2weeks" },
                { label: "3 Weeks", value: "3weeks" },
                { label: "4 Weeks", value: "4weeks" },
              ].map((frame) => (
                <Button
                  key={frame.value}
                  type="button"
                  variant={selectedFrame === frame.value ? "default" : "outline"}
                  onClick={() => handleFrameSelect(frame.value)}
                  className={`text-sm ${
                    selectedFrame === frame.value ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {frame.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint_name" className="flex items-center gap-1 font-bold">
              Sprint Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sprint_name"
              {...register("sprint_name")}
              placeholder="Enter sprint name"
              className="bg-slate-50/50 focus:bg-white transition-all"
            />
            {errors.sprint_name && <p className="text-xs text-red-500 font-medium">{errors.sprint_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint_goal" className="font-bold">Sprint Goal</Label>
            <textarea
              id="sprint_goal"
              {...register("sprint_goal")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white transition-all"
              placeholder="Enter sprint goal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-bold">Description</Label>
            <textarea
              id="description"
              {...register("description")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white transition-all"
              placeholder="Enter sprint description"
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
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                {...register("end_date")}
                className="bg-slate-50/50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint_status" className="font-bold">Status</Label>
            <Select onValueChange={(val) => setValue("sprint_status", val)} value={String(watch("sprint_status"))}>
              <SelectTrigger className="bg-slate-50/50 focus:bg-white transition-all">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Not Started</SelectItem>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="2">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Fixed footer, always visible since content area above is height-capped and scrolls independently */}
      <SheetFooter className="border-t pt-6 flex gap-3 mt-0 px-0 pb-2 shrink-0">
        <SheetClose asChild>
          <Button variant="ghost" className="text-slate-500 font-bold flex-1">Cancel</Button>
        </SheetClose>
        <Button type="submit" disabled={submitting} className="bg-slate-900 text-white font-bold flex-1 shadow-lg hover:shadow-xl transition-all">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? "Update Sprint" : "Create Sprint"
          )}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default SprintForm;