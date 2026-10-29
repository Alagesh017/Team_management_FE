import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../common/components/ui/button";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { SheetClose } from "../../../common/components/ui/sheet";
import {
  FormSheetBody,
  FormSheetFooter,
  FormSheetField,
  FormSheetSection,
} from "../../../common/components/FormSheet";
import { IconInput } from "../../../common/components/IconInput";
import {
  Building2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  User,
} from "lucide-react";

export const clientFormSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  remark: z.string().optional(),
});

const ClientForm = ({ onSubmit, initialData, submitting, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      remark: "",
    },
  });

  const isEdit = Boolean(initialData);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
      <FormSheetBody className="space-y-5">
        <FormSheetSection icon={Shield} title="Mandatory Details">
          <FormSheetField label="Name" required error={errors.name?.message}>
            <IconInput
              id="name"
              icon={User}
              placeholder="Client or Company Name"
              {...register("name")}
            />
          </FormSheetField>
        </FormSheetSection>

        <FormSheetSection icon={Phone} title="Contact Details">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormSheetField label="Email" error={errors.email?.message}>
              <IconInput
                id="email"
                type="email"
                icon={Mail}
                placeholder="client@example.com"
                {...register("email")}
              />
            </FormSheetField>
            <FormSheetField label="Phone Number">
              <IconInput
                id="phone"
                icon={Phone}
                placeholder="1234567890"
                {...register("phone")}
              />
            </FormSheetField>
          </div>

          <FormSheetField label="Company">
            <IconInput
              id="company"
              icon={Building2}
              placeholder="Parent Company name"
              {...register("company")}
            />
          </FormSheetField>

          <FormSheetField label="Address">
            <IconInput
              id="address"
              icon={MapPin}
              placeholder="Full address"
              {...register("address")}
            />
          </FormSheetField>

          <FormSheetField label="Remarks / Notes">
            <IconInput
              id="remark"
              icon={FileText}
              placeholder="Any additional notes"
              {...register("remark")}
            />
          </FormSheetField>
        </FormSheetSection>

        {error ? (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="font-medium text-red-800">{error}</AlertDescription>
          </Alert>
        ) : null}
      </FormSheetBody>

      <FormSheetFooter>
        <SheetClose asChild>
          <Button
            type="button"
            variant="ghost"
            className="font-semibold text-[#5b7c99] hover:bg-slate-100 hover:text-[#0f2744]"
          >
            Cancel
          </Button>
        </SheetClose>
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#3b82f6] px-5 font-semibold text-white shadow-md hover:bg-[#2563eb]"
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {isEdit ? "Update Client" : "Create Client"}
        </Button>
      </FormSheetFooter>
    </form>
  );
};

export default ClientForm;
