import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { Shield } from "lucide-react";
import {
  FormSheetActions,
  FormSheetBody,
  FormSheetFooter,
  FormSheetSection,
} from "../../../common/components/FormSheet";

const projectGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required"),
  description: z.string().optional(),
});

const ProjectGroupForm = ({ onSubmit, initialData, submitting, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectGroupSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
      <FormSheetBody className="space-y-5">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FormSheetSection icon={Shield} title="Group Details">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold text-[#0f2744]">
              Group Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter group name (e.g., Development, Marketing)"
              className="border-slate-200 bg-slate-50/80 focus:bg-white"
            />
            {errors.name ? (
              <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold text-[#0f2744]">
              Description
            </Label>
            <textarea
              id="description"
              {...register("description")}
              className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus:bg-white"
              placeholder="What kind of projects belong in this group?"
            />
          </div>
        </FormSheetSection>
      </FormSheetBody>

      <FormSheetFooter>
        <FormSheetActions
          submitting={submitting}
          isEdit={Boolean(initialData)}
          submitLabel="Create Group"
          editSubmitLabel="Update Group"
        />
      </FormSheetFooter>
    </form>
  );
};

export default ProjectGroupForm;
