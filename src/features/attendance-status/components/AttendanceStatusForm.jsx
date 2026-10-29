import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

export const attendanceStatusFormSchema = z.object({
  status_name: z.string().min(1, "Status name is required"),
  status_code: z.string().min(1, "Status code is required"),
  is_present: z.boolean().default(false),
  is_absent: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

const AttendanceStatusForm = ({ onSubmit, initialData, submitting, error }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendanceStatusFormSchema),
    defaultValues: initialData || {
      status_name: "",
      status_code: "",
      is_present: false,
      is_absent: false,
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        is_present: Boolean(initialData.is_present),
        is_absent: Boolean(initialData.is_absent),
        is_active: Boolean(initialData.is_active),
      });
    } else {
      reset({
        status_name: "",
        status_code: "",
        is_present: false,
        is_absent: false,
        is_active: true,
      });
    }
  }, [initialData, reset]);

  const watchPresent = watch("is_present");
  const watchAbsent = watch("is_absent");

  const handleFlagChange = (flagName, checked) => {
    if (checked) {
      if (flagName !== "is_present") setValue("is_present", false);
      if (flagName !== "is_absent") setValue("is_absent", false);
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status_name" className="font-semibold text-[#0f2744]">
                Status Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="status_name"
                {...register("status_name")}
                placeholder="e.g. Present, Absent, Late"
                className="border-slate-200 bg-slate-50/80 focus:bg-white"
              />
              {errors.status_name ? (
                <p className="text-xs font-medium text-red-500">{errors.status_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status_code" className="font-semibold text-[#0f2744]">
                Status Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="status_code"
                {...register("status_code")}
                placeholder="e.g. P, A, L"
                className="border-slate-200 bg-slate-50/80 focus:bg-white"
              />
              {errors.status_code ? (
                <p className="text-xs font-medium text-red-500">{errors.status_code.message}</p>
              ) : null}
            </div>
          </div>
        </FormSheetSection>

        <FormSheetSection icon={SlidersHorizontal} title="Optional Details">
          <div className="space-y-4">
            <Label className="font-semibold text-[#0f2744]">Status Type (Select only one)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_present"
                  checked={watchPresent}
                  onCheckedChange={(checked) => handleFlagChange("is_present", checked)}
                />
                <Label htmlFor="is_present">Is Present</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_absent"
                  checked={watchAbsent}
                  onCheckedChange={(checked) => handleFlagChange("is_absent", checked)}
                />
                <Label htmlFor="is_absent">Is Absent</Label>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={watch("is_active")}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
            <Label htmlFor="is_active" className="font-semibold">
              Is Active
            </Label>
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

export default AttendanceStatusForm;
