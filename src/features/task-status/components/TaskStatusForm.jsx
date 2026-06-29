import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Checkbox } from "../../../common/components/ui/checkbox";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { Loader2 } from "lucide-react";
import { SheetFooter, SheetClose } from "../../../common/components/ui/sheet";
import { taskStatusService } from "../services/taskStatusService";
import { useToast } from "../../../common/hooks/use-toast";

export const taskStatusFormSchema = z.object({
  name: z.string().min(1, "Status name is required"),
  color: z.string().default("#000000"),
  remark: z.string().default(""),
  is_confidential: z.boolean().default(false),
  is_backlog: z.boolean().default(false),
  is_todo: z.boolean().default(false),
  is_in_progress: z.boolean().default(false),
  is_completed: z.boolean().default(false),
});

const TaskStatusForm = ({ onSubmit, initialData, submitting, error }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskStatusFormSchema),
    defaultValues: initialData || {
      name: "",
      color: "#000000",
      remark: "",
      is_confidential: false,
      is_backlog: false,
      is_todo: false,
      is_in_progress: false,
      is_completed: false,
    },
  });
  
  const { toast } = useToast();

  React.useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        is_confidential: Boolean(initialData.is_confidential),
        is_backlog: Boolean(initialData.is_backlog),
        is_todo: Boolean(initialData.is_todo),
        is_in_progress: Boolean(initialData.is_in_progress),
        is_completed: Boolean(initialData.is_completed),
        color: initialData.color || "#000000",
        remark: initialData.remark || "",
      });
    } else {
      reset({
        name: "",
        color: "#000000",
        remark: "",
        is_confidential: false,
        is_backlog: false,
        is_todo: false,
        is_in_progress: false,
        is_completed: false,
      });
    }
  }, [initialData, reset]);

  const currentColor = watch("color");
  const watchBacklog = watch("is_backlog");
  const watchTodo = watch("is_todo");
  const watchInProgress = watch("is_in_progress");
  const watchCompleted = watch("is_completed");

  // Handle only one flag being true at a time and check API
  const handleFlagChange = async (flagName, checked) => {
    if (checked) {
      // Check if another status already has this flag marked
      try {
        await taskStatusService.checkTaskStatusFlag(flagName, initialData?.id);
      } catch (err) {
        toast({
          title: "Warning",
          description: err.msg || "Another status already has this flag marked",
          variant: "destructive",
        });
        return;
      }
      
      // If turning this flag on, turn others off
      if (flagName !== "is_backlog") setValue("is_backlog", false);
      if (flagName !== "is_todo") setValue("is_todo", false);
      if (flagName !== "is_in_progress") setValue("is_in_progress", false);
      if (flagName !== "is_completed") setValue("is_completed", false);
    }
    setValue(flagName, checked);
  };
  
  console.log("Form errors:", errors);
  console.log("Form values:", watch());
  console.log("Submitting prop:", submitting);

  return (
    <form onSubmit={(e) => {
      console.log("Form submitted!");
      e.preventDefault();
      handleSubmit(onSubmit)(e);
    }} className="space-y-8 py-8 flex flex-col h-full">
      <div className="flex-1 space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="h-4 w-1 bg-slate-900 rounded-full" />
            <h3 className="font-bold text-slate-900">Mandatory Details</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1 font-bold">
              Status Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g. To Do, In Progress, Completed"
              className="bg-slate-50/50 focus:bg-white transition-all"
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="h-4 w-1 bg-slate-200 rounded-full" />
            <h3 className="font-bold text-slate-500">Optional Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="color" className="font-bold">Display Color</Label>
              <div className="flex gap-3">
                <Input
                  id="color-picker"
                  type="color"
                  value={currentColor || "#000000"}
                  onChange={(e) => setValue("color", e.target.value.toUpperCase())}
                  className="w-12 h-10 p-1 cursor-pointer border-2"
                />
                <Input
                  id="color"
                  type="text"
                  {...register("color")}
                  onChange={(e) => setValue("color", e.target.value.toUpperCase())}
                  placeholder="#000000"
                  className="flex-1 uppercase bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark" className="font-bold">Remark / Description</Label>
            <Input
              id="remark"
              {...register("remark")}
              placeholder="Optional description for this workflow stage"
              className="bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_confidential"
                checked={watch("is_confidential")}
                onCheckedChange={(checked) => setValue("is_confidential", checked)}
              />
              <Label htmlFor="is_confidential" className="font-bold">Is Confidential</Label>
            </div>
            <p className="text-xs text-slate-500">Mark this status as confidential</p>
          </div>

          <div className="space-y-4">
            <Label className="font-bold">Status Type (Select only one)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_backlog"
                  checked={watchBacklog}
                  onCheckedChange={(checked) => handleFlagChange("is_backlog", checked)}
                />
                <Label htmlFor="is_backlog">Is Backlog</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_todo"
                  checked={watchTodo}
                  onCheckedChange={(checked) => handleFlagChange("is_todo", checked)}
                />
                <Label htmlFor="is_todo">Is Todo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_in_progress"
                  checked={watchInProgress}
                  onCheckedChange={(checked) => handleFlagChange("is_in_progress", checked)}
                />
                <Label htmlFor="is_in_progress">Is In Progress</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_completed"
                  checked={watchCompleted}
                  onCheckedChange={(checked) => handleFlagChange("is_completed", checked)}
                />
                <Label htmlFor="is_completed">Is Completed</Label>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Only one of these can be selected at a time
            </p>
          </div>
        </div>
      </div>

      <SheetFooter className="pt-6 sticky bottom-0 bg-white z-10 mt-4 border-t pt-4 -mx-6 px-6">
        <SheetClose asChild>
          <Button variant="outline" type="button" className="flex-1">Cancel</Button>
        </SheetClose>
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Status"
          )}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default TaskStatusForm;
