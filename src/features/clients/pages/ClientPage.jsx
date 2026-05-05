import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "../../../common/components/DataTable";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { clientService } from "../services/clientService";
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
import ClientForm from "../components/ClientForm";
import ClientDetails from "../components/ClientDetails";

const ClientAvatar = ({ name, className = "h-10 w-10" }) => {
  const initial = (name?.[0] || "?").toUpperCase();
  return (
    <div className={`${className} rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm border-2 border-slate-100 shadow-sm`}>
      {initial}
    </div>
  );
};

const ClientPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data.clients || []);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEdit = (client) => {
    setEditingClient(client);
    setIsSheetOpen(true);
  };

  const handleView = (client) => {
    setViewingClient(client);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id) => {
    setClientToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        await clientService.deleteClient(clientToDelete);
        fetchClients();
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeleteDialogOpen(false);
        setClientToDelete(null);
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingClient) {
        await clientService.updateClient(editingClient.id, data);
      } else {
        await clientService.createClient(data);
      }
      
      setIsSheetOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      setError(err.msg || err.error || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <ClientAvatar name={row.getValue("name")} />
          <span className="font-bold text-slate-900">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Company <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.getValue("company") || <span className="text-slate-400 italic">Not set</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email") || "-",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <div className="flex items-center gap-1.5 capitalize font-semibold text-emerald-600">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          ACTIVE
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(client)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(client)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Client Management</h1>
          <p className="text-slate-500">Manage your project clients and their contact information.</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) {
            setEditingClient(null);
            setError("");
          }
        }}>
          <SheetTrigger asChild>
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all active:scale-95">
              <Plus className="mr-2 h-4 w-4" /> Add Client
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[600px] overflow-y-auto border-l shadow-2xl">
            <SheetHeader className="border-b pb-6">
              <SheetTitle className="text-2xl font-bold">
                {editingClient ? "Edit Client" : "New Client"}
              </SheetTitle>
              <SheetDescription>
                Only Client Name is mandatory. All other contact fields are optional.
              </SheetDescription>
            </SheetHeader>
            
            <ClientForm 
              onSubmit={onSubmit} 
              initialData={editingClient}
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
          <DataTable 
            columns={columns} 
            data={clients} 
            searchPlaceholder="Search clients or companies..."
            searchColumn="name"
          />
        )}
      </div>

      <ClientDetails 
        client={viewingClient} 
        open={isViewDialogOpen} 
        onOpenChange={setIsViewDialogOpen} 
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Client?"
        description="Are you sure you want to delete this client? This action will permanently remove their data and associated project records."
        confirmText="Delete Client"
        variant="destructive"
      />
    </div>
  );
};

export default ClientPage;
