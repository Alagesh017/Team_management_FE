import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Checkbox } from "../../../common/components/ui/checkbox";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { Shield, SlidersHorizontal } from "lucide-react";
import {
  FormSheetActions,
  FormSheetBody,
  FormSheetFooter,
  FormSheetSection,
} from "../../../common/components/FormSheet";
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

  const handleFlagChange = async (flagName, checked) => {
    if (checked) {
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

      if (flagName !== "is_backlog") setValue("is_backlog", false);
      if (flagName !== "is_todo") setValue("is_todo", false);
      if (flagName !== "is_in_progress") setValue("is_in_progress", false);
      if (flagName !== "is_completed") setValue("is_completed", false);
    }
    setValue(flagName, checked);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
      <FormSheetBody className="space-y-5">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FormSheetSection icon={Shield} title="Mandatory Details">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1 font-semibold text-[#0f2744]">
              Status Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g. To Do, In Progress, Completed"
              className="border-slate-200 bg-slate-50/80 focus:bg-white"
            />
            {errors.name ? (
              <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
            ) : null}
          </div>
        </FormSheetSection>

        <FormSheetSection icon={SlidersHorizontal} title="Optional Details">
          <div className="space-y-2">
            <Label htmlFor="color" className="font-semibold text-[#0f2744]">
              Display Color
            </Label>
            <div className="flex gap-3">
              <Input
                id="color-picker"
                type="color"
                value={currentColor || "#000000"}
                onChange={(e) => setValue("color", e.target.value.toUpperCase())}
                className="h-10 w-12 cursor-pointer border-2 p-1"
              />
              <Input
                id="color"
                type="text"
                {...register("color")}
                onChange={(e) => setValue("color", e.target.value.toUpperCase())}
                placeholder="#000000"
                className="flex-1 uppercase bg-slate-50/80"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark" className="font-semibold text-[#0f2744]">
              Remark / Description
            </Label>
            <Input
              id="remark"
              {...register("remark")}
              placeholder="Optional description for this workflow stage"
              className="border-slate-200 bg-slate-50/80 focus:bg-white"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_confidential"
                checked={watch("is_confidential")}
                onCheckedChange={(checked) => setValue("is_confidential", checked)}
              />
              <Label htmlFor="is_confidential" className="font-semibold">
                Is Confidential
              </Label>
            </div>
            <p className="text-xs text-slate-500">Mark this status as confidential</p>
          </div>

          <div className="space-y-4">
            <Label className="font-semibold text-[#0f2744]">Status Type (Select only one)</Label>
            <div className="space-y-3">
              {[
                ["is_backlog", "Is Backlog", watchBacklog],
                ["is_todo", "Is Todo", watchTodo],
                ["is_in_progress", "Is In Progress", watchInProgress],
                ["is_completed", "Is Completed", watchCompleted],
              ].map(([flag, label, checked]) => (
                <div key={flag} className="flex items-center gap-2">
                  <Checkbox
                    id={flag}
                    checked={checked}
                    onCheckedChange={(val) => handleFlagChange(flag, val)}
                  />
                  <Label htmlFor={flag}>{label}</Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">Only one of these can be selected at a time</p>
          </div>
        </FormSheetSection>
      </FormSheetBody>

      <FormSheetFooter>
        <FormSheetActions
          submitting={submitting}
          isEdit={Boolean(initialData)}
          submitLabel="Save Status"
          editSubmitLabel="Update Status"
        />
      </FormSheetFooter>
    </form>
  );
};

export default TaskStatusForm;
