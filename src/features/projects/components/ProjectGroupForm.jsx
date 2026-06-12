import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { Loader2 } from "lucide-react";
import { SheetFooter, SheetClose } from "../../../common/components/ui/sheet";

const projectGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-8 flex flex-col h-full">
      <div className="flex-1 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-1 font-bold">
            Group Name <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="name" 
            {...register("name")} 
            placeholder="Enter group name (e.g., Development, Marketing)"
            className="bg-slate-50/50 focus:bg-white transition-all" 
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="font-bold">Description</Label>
          <textarea
            id="description"
            {...register("description")}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-slate-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white transition-all"
            placeholder="What kind of projects belong in this group?"
          />
          {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>}
        </div>
      </div>

      <SheetFooter className="pt-6 sticky bottom-0 bg-white z-10 mt-4 border-t pt-4 -mx-6 px-6">
        <SheetClose asChild>
          <Button type="button" variant="outline" className="font-bold flex-1">
            Cancel
          </Button>
        </SheetClose>
        <Button 
          type="submit" 
          disabled={submitting}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold flex-1"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? "Update Group" : "Create Group"
          )}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default ProjectGroupForm;
