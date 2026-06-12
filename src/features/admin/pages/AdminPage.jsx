import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "../../../common/components/DataTable";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { adminService } from "../services/adminService";
import { Button } from "../../../common/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../common/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../common/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Plus, Pencil, Trash2, Loader2, Eye } from "lucide-react";
import AdminForm from "../components/AdminForm";
import AdminDetails from "../components/AdminDetails";
import { getFullAvatarUrl, formatDate } from "../../../core/utils/utils";

const UserAvatar = ({ url, email, firstName, className = "h-10 w-10" }) => {
  const fullUrl = getFullAvatarUrl(url);
  if (fullUrl) {
    return (
      <img 
        src={fullUrl}
        alt="Avatar" 
        className={`${className} rounded-full border-2 border-slate-100 shadow-sm object-cover`} 
      />
    );
  }

  const initial = (firstName?.[0] || email?.[0] || "?").toUpperCase();
  return (
    <div className={`${className} rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm border-2 border-slate-100 shadow-sm`}>
      {initial}
    </div>
  );
};

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
      } catch (err) {
        console.error("Delete failed:", err);
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
      accessorKey: "avatar_url",
      header: "Profile",
      cell: ({ row }) => (
        <UserAvatar 
          url={row.getValue("avatar_url")} 
          email={row.original.email} 
          firstName={row.original.first_name} 
        />
      ),
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const first = row.original.first_name || "";
        const last = row.original.last_name || "";
        return (first || last) ? `${first} ${last}` : <span className="text-slate-400 italic">Not set</span>;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const admin = row.original;
        if (admin.is_superadmin) return <span className="bg-slate-900 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Super Admin</span>;
        if (admin.is_scrum) return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Scrum Master</span>;
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Admin</span>;
      }
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
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
      accessorKey: "created_at",
      header: "Joined Date",
      cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
      id: "actions",
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
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 truncate">Admin Management</h1>
          <p className="text-slate-500 hidden md:block">Manage administrators for the Company.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            setEditingAdmin(null);
          }
        }}>
          <SheetTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> Add Admin
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[450px] md:max-w-[550px] lg:max-w-[650px] xl:max-w-[700px] border-l shadow-2xl p-0 flex flex-col">
            <SheetHeader className="border-b pb-6 px-6 pt-6">
              <SheetTitle className="text-2xl font-bold">{editingAdmin ? "Edit Administrator" : "New Administrator"}</SheetTitle>
              <SheetDescription>Only Email and Role are mandatory. All other fields are optional.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6">
              <AdminForm 
                onSubmit={onSubmit} 
                initialData={editingAdmin ? {
                  ...editingAdmin,
                  role_type: editingAdmin.is_superadmin ? "superadmin" : editingAdmin.is_scrum ? "scrum" : "admin"
                } : null}
                submitting={submitting}
                error={error}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : (
          <DataTable columns={columns} data={admins} filterColumn="email" />
        )}
      </div>

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
    </div>
  );
};

export default AdminPage;
