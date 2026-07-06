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

  // Handle only one of present/absent being true at a time
  const handleFlagChange = (flagName, checked) => {
    if (checked) {
      // If turning this flag on, turn others off
      if (flagName !== "is_present") setValue("is_present", false);
      if (flagName !== "is_absent") setValue("is_absent", false);
    }
    setValue(flagName, checked);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }}
      className="space-y-8 py-8 flex flex-col h-full"
    >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status_name" className="flex items-center gap-1 font-bold">
                Status Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="status_name"
                {...register("status_name")}
                placeholder="e.g. Present, Absent, Late"
                className="bg-slate-50/50 focus:bg-white transition-all"
              />
              {errors.status_name && (
                <p className="text-xs text-red-500 font-medium">{errors.status_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_code" className="flex items-center gap-1 font-bold">
                Status Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="status_code"
                {...register("status_code")}
                placeholder="e.g. P, A, L"
                className="bg-slate-50/50 focus:bg-white transition-all"
              />
              {errors.status_code && (
                <p className="text-xs text-red-500 font-medium">{errors.status_code.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="h-4 w-1 bg-slate-200 rounded-full" />
            <h3 className="font-bold text-slate-500">Optional Details</h3>
          </div>

          <div className="space-y-4">
            <Label className="font-bold">Status Type (Select only one)</Label>
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
            <p className="text-xs text-slate-500">
              Only one of these can be selected at a time
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label htmlFor="is_active" className="font-bold">Is Active</Label>
            </div>
            <p className="text-xs text-slate-500">Mark this status as active</p>
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

export default AttendanceStatusForm;
