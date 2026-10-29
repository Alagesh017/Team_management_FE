import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "../../../common/components/DataTable";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { workerService } from "../services/workerService";
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
import { MoreHorizontal, ArrowUpDown, Plus, Pencil, Trash2, Loader2, Eye, HardHat } from "lucide-react";
import WorkerForm from "../components/WorkerForm";
import WorkerDetails from "../components/WorkerDetails";
import { UserAvatar } from "../../../common/components/UserAvatar";
import { formatDate } from "../../../core/utils/utils";
import { useToast } from "../../../common/hooks/use-toast";

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
  const { toast } = useToast();

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
        toast({
          title: "Success",
          description: "Worker deleted successfully",
          variant: "success"
        });
      } catch (err) {
        console.error("Delete failed:", err);
        toast({
          title: "Error",
          description: err.msg || err.message || "Failed to delete worker",
          variant: "destructive"
        });
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
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      meta: { displayName: "Name" },
      cell: ({ row }) => {
        const first = row.original.first_name || "";
        const last = row.original.last_name || "";
        return (first || last) ? `${first} ${last}` : <span className="text-slate-400 italic">Not set</span>;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { displayName: "Email" },
      cell: ({ row }) => row.getValue("email") || "-",
    },
    {
      accessorKey: "job_title",
      header: "Designation",
      meta: { displayName: "Designation" },
      cell: ({ row }) => row.getValue("job_title") || "-",
    },
    {
      accessorKey: "role",
      header: "Role",
      meta: { displayName: "Role" },
      cell: ({ row }) => {
        const worker = row.original;
        if (worker.is_tl) return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Team Leader</span>;
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Developer</span>;
      }
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
      header: "Joined Date",
      meta: { displayName: "Joined Date" },
      cell: ({ row }) => formatDate(row.getValue("joining_date")),
    },
    {
      id: "actions",
      header: "Actions",
      meta: { displayName: "Actions" },
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
    <ListPageShell
      title="Worker Management"
      description="Manage your team members and leaders."
      action={
        <FormSheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) setEditingWorker(null);
          }}
          icon={HardHat}
          title={editingWorker ? "Edit Worker" : "New Worker"}
          description="Enter the worker details. Email, First Name, Last Name and Role are mandatory."
          contentClassName="w-full sm:max-w-[680px]"
          trigger={
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> Add Worker
            </Button>
          }
        >
          <WorkerForm
            key={editingWorker?.id ?? "new"}
            onSubmit={onSubmit}
            initialData={
              editingWorker
                ? {
                    ...editingWorker,
                    role_type: editingWorker.is_tl ? "team_leader" : "worker",
                    joining_date: editingWorker.joining_date
                      ? new Date(editingWorker.joining_date).toISOString().split("T")[0]
                      : "",
                    avatar_url: editingWorker.avatar_url || "",
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
          data={workers}
          filterColumn="email"
          filterPlaceholder="Search by email…"
          embedded
        />
      </DataTableCard>

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
    </ListPageShell>
  );
};

export default WorkerPage;
