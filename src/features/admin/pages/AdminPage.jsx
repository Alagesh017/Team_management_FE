import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "../../../common/components/DataTable";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { adminService } from "../services/adminService";
import { Button } from "../../../common/components/ui/button";
import { FormSheet } from "../../../common/components/FormSheet";
import { ListPageShell, DataTableCard } from "../../../common/components/PageLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../common/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Plus, Pencil, Trash2, Loader2, Eye, UserCog } from "lucide-react";
import AdminForm from "../components/AdminForm";
import AdminDetails from "../components/AdminDetails";
import { UserAvatar } from "../../../common/components/UserAvatar";
import { formatDate } from "../../../core/utils/utils";
import { useToast } from "../../../common/hooks/use-toast";

const AdminPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [viewingAdmin, setViewingAdmin] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAdmins();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setIsSheetOpen(true);
  };

  const handleView = (admin) => {
    setViewingAdmin(admin);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id) => {
    setAdminToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (adminToDelete) {
      try {
        await adminService.deleteAdmin(adminToDelete);
        fetchAdmins();
        toast({
          title: "Success",
          description: "Admin deleted successfully",
          variant: "success"
        });
      } catch (err) {
        console.error("Delete failed:", err);
        toast({
          title: "Error",
          description: err.msg || err.message || "Failed to delete admin",
          variant: "destructive"
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setAdminToDelete(null);
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...data,
        is_superadmin: data.role_type === "superadmin",
        is_admin: data.role_type === "admin",
        is_scrum: data.role_type === "scrum",
      };
      
      if (editingAdmin) {
        await adminService.updateAdmin(editingAdmin.id, payload);
      } else {
        await adminService.createAdmin(payload);
      }
      
      setIsSheetOpen(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err) {
      setError(err.msg || err.error || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(() => [
    {
      id: "profile",
      accessorKey: "avatar_url",
      header: "Profile",
      size: 72,
      minSize: 72,
      maxSize: 72,
      enableSorting: false,
      enableColumnFilter: false,
      meta: { displayName: "Profile" },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <UserAvatar 
            url={row.original.avatar_url} 
            email={row.original.email} 
            firstName={row.original.first_name} 
          />
        </div>
      ),
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-800"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      ),
      meta: { displayName: "Name" },
      cell: ({ row }) => {
        const first = row.original.first_name || "";
        const last = row.original.last_name || "";
        return (first || last) ? (
          <span className="font-medium text-slate-900">{`${first} ${last}`.trim()}</span>
        ) : (
          <span className="text-slate-400 italic">Not set</span>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { displayName: "Email" },
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: { displayName: "Role" },
      cell: ({ row }) => {
        const admin = row.original;
        if (admin.is_superadmin) {
          return (
            <span className="inline-flex rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Super Admin
            </span>
          );
        }
        if (admin.is_scrum) {
          return (
            <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
              Scrum Master
            </span>
          );
        }
        return (
          <span className="inline-flex rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
            Admin
          </span>
        );
      }
    },
    {
      accessorKey: "phone",
      header: "Phone",
      meta: { displayName: "Phone" },
      cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: { displayName: "Status" },
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <div className={`flex items-center gap-1.5 capitalize font-semibold ${status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-400'}`} />
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "joining_date",
      header: "Joining Date",
      meta: { displayName: "Joining Date" },
      cell: ({ row }) => formatDate(row.getValue("joining_date")),
    },
    {
      id: "actions",
      header: "Actions",
      meta: { displayName: "Actions" },
      cell: ({ row }) => {
        const admin = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(admin)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(admin)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(admin.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  return (
    <ListPageShell
      title="Admin Management"
      description="Manage administrators for the Company."
      action={
        <FormSheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) setEditingAdmin(null);
          }}
          icon={UserCog}
          title={editingAdmin ? "Edit Administrator" : "New Administrator"}
          description="Only Email and Role are mandatory. All other fields are optional."
          contentClassName="w-full sm:max-w-[680px]"
          trigger={
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> Add Admin
            </Button>
          }
        >
          <AdminForm
            key={editingAdmin?.id ?? "new"}
            onSubmit={onSubmit}
            initialData={
              editingAdmin
                ? {
                    ...editingAdmin,
                    role_type: editingAdmin.is_superadmin
                      ? "superadmin"
                      : editingAdmin.is_scrum
                        ? "scrum"
                        : "admin",
                    joining_date: editingAdmin.joining_date
                      ? new Date(editingAdmin.joining_date).toISOString().split("T")[0]
                      : "",
                    avatar_url: editingAdmin.avatar_url || "",
                  }
                : null
            }
            submitting={submitting}
            error={error}
          />
        </FormSheet>
      }
    >
      <DataTableCard loading={loading}>
        <DataTable
          columns={columns}
          data={admins}
          filterColumn="email"
          filterPlaceholder="Search by email…"
          embedded
        />
      </DataTableCard>

      <AdminDetails 
        admin={viewingAdmin} 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen} 
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Administrator?"
        description="Are you sure you want to delete this administrator? This action will permanently remove their access and data."
        confirmText="Delete Account"
        variant="destructive"
      />
    </ListPageShell>
  );
};

export default AdminPage;
