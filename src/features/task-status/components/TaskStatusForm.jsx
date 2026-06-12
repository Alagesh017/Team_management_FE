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

export const taskStatusFormSchema = z.object({
  name: z.string().min(1, "Status name is required"),
  color: z.string().default("#000000"),
  sort_order: z.coerce.number().int().nonnegative().default(0),
  remark: z.string().default(""),
  is_confidential: z.boolean().default(false),
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
      sort_order: 0,
      remark: "",
      is_confidential: false,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        is_confidential: Boolean(initialData.is_confidential),
        sort_order: initialData.sort_order || 0,
        color: initialData.color || "#000000",
        remark: initialData.remark || "",
      });
    } else {
      reset({
        name: "",
        color: "#000000",
        sort_order: 0,
        remark: "",
        is_confidential: false,
      });
    }
  }, [initialData, reset]);

  const currentColor = watch("color");
  
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="space-y-2">
              <Label htmlFor="sort_order" className="font-bold">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                {...register("sort_order")}
                className="bg-slate-50/50 focus:bg-white transition-all"
              />
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

          <div className="space-y-2">
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
