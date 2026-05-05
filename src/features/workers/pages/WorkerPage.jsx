import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "../../../common/components/DataTable";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { workerService } from "../services/workerService";
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
import WorkerForm from "../components/WorkerForm";
import WorkerDetails from "../components/WorkerDetails";
import { getFullAvatarUrl } from "../../../core/utils/utils";

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

const WorkerPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [viewingWorker, setViewingWorker] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const data = await workerService.getAllWorkers();
      setWorkers(data.workers || []);
    } catch (err) {
      console.error("Failed to fetch workers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setIsSheetOpen(true);
  };

  const handleView = (worker) => {
    setViewingWorker(worker);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id) => {
    setWorkerToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (workerToDelete) {
      try {
        await workerService.deleteWorker(workerToDelete);
        fetchWorkers();
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeleteDialogOpen(false);
        setWorkerToDelete(null);
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...data,
        is_tl: data.role_type === "team_leader",
        is_worker: data.role_type === "worker",
      };
      
      if (editingWorker) {
        await workerService.updateWorker(editingWorker.id, payload);
      } else {
        await workerService.createWorker(payload);
      }
      
      setIsSheetOpen(false);
      setEditingWorker(null);
      fetchWorkers();
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
      accessorKey: "job_title",
      header: "Designation",
      cell: ({ row }) => row.getValue("job_title") || "-",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const worker = row.original;
        if (worker.is_tl) return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Team Leader</span>;
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Worker</span>;
      }
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
      id: "actions",
      cell: ({ row }) => {
        const worker = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(worker)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(worker)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(worker.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Worker Management</h1>
          <p className="text-slate-500">Manage your team members and leaders.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            setEditingWorker(null);
          }
        }}>
          <SheetTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> Add Worker
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[750px] overflow-y-auto border-l shadow-2xl">
            <SheetHeader className="border-b pb-6">
              <SheetTitle className="text-2xl font-bold">{editingWorker ? "Edit Worker" : "New Worker"}</SheetTitle>
              <SheetDescription>Enter the worker details. Email, First Name, Last Name and Role are mandatory.</SheetDescription>
            </SheetHeader>
            
            <WorkerForm 
              onSubmit={onSubmit} 
              initialData={editingWorker ? {
                ...editingWorker,
                role_type: editingWorker.is_tl ? "team_leader" : "worker"
              } : null}
              submitting={submitting}
              error={error}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : (
          <DataTable columns={columns} data={workers} filterColumn="email" />
        )}
      </div>

      <WorkerDetails 
        worker={viewingWorker} 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen} 
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Worker?"
        description="Are you sure you want to delete this worker? This action will permanently remove their access and data."
        confirmText="Delete Account"
        variant="destructive"
      />
    </div>
  );
};

export default WorkerPage;
