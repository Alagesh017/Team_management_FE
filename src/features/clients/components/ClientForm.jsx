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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-8">
      {/* Core Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <div className="h-4 w-1 bg-slate-900 rounded-full" />
          <h3 className="font-bold text-slate-900">Mandatory Details</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-1 font-bold">Name <span className="text-red-500">*</span></Label>
          <Input id="name" {...register("name")} placeholder="Client or Company Name" className="bg-slate-50/50 focus:bg-white transition-all" />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>
      </div>

      {/* Optional Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b pb-2">
          <div className="h-4 w-1 bg-slate-200 rounded-full" />
          <h3 className="font-bold text-slate-500">Contact Details</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="client@example.com" />
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register("phone")} placeholder="1234567890" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} placeholder="Parent Company name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} placeholder="Full address" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="remark">Remarks / Notes</Label>
          <Input id="remark" {...register("remark")} placeholder="Any additional notes" />
        </div>
      </div>

      {error && <Alert variant="destructive" className="border-red-200 bg-red-50"><AlertDescription className="text-red-800 font-medium">{error}</AlertDescription></Alert>}
      
      <SheetFooter className="border-t pt-8 flex gap-3">
        <SheetClose asChild><Button variant="ghost" className="text-slate-500 font-bold">Cancel</Button></SheetClose>
        <Button type="submit" disabled={submitting} className="bg-slate-900 text-white font-bold px-8 shadow-lg hover:shadow-xl transition-all">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : initialData ? "Update Client" : "Create Client"}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default ClientForm;
