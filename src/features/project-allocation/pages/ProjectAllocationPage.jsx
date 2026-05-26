import React, { useState } from "react";
import { useAllocations } from "../hooks/useAllocations";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import { Button } from "../../../common/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../common/components/ui/sheet";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search,
  Users,
  Calendar,
  Briefcase,
  ChevronRight
} from "lucide-react";
import { Input } from "../../../common/components/ui/input";
import AllocationForm from "../components/AllocationForm";
import FolderIcon from "../../projects/components/FolderIcon";
import { ContextMenu, ContextMenuItem } from "../../../common/components/ui/context-menu";
import { formatDate } from "../../../core/utils/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/contexts/AuthContext";

const AllocationCard = ({ allocation, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const contextContent = (
    <div className="flex flex-col">
      <ContextMenuItem onClick={() => onEdit(allocation)} className="gap-3">
        <Pencil className="h-4 w-4 text-slate-500" />
        <span>Edit Details</span>
      </ContextMenuItem>
      <div className="h-px bg-slate-100 my-1 mx-1" />
      <ContextMenuItem onClick={() => onDelete(allocation.id)} className="gap-3" destructive>
        <Trash2 className="h-4 w-4" />
        <span>Delete Allocation</span>
      </ContextMenuItem>
    </div>
  );

  return (
    <ContextMenu content={contextContent}>
      <div 
        className="group flex flex-col items-center gap-2 cursor-pointer outline-none"
        onClick={() => navigate(`/project-allocation/${allocation.project_id}`)}
      >
        <div className="relative transition-all duration-300 group-hover:scale-105 active:scale-95 group-hover:-translate-y-1">
          <FolderIcon 
            className="h-24 w-32 md:h-28 md:w-36" 
            previewUrl={allocation.project_logo}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                <Users className="h-5 w-5 text-slate-900" />
             </div>
          </div>
        </div>

        <div className="w-full text-center max-w-[140px] mt-1">
          <span 
            className="text-[13px] font-semibold text-slate-700 leading-tight line-clamp-1 break-all transition-colors group-hover:text-slate-900"
            title={allocation.project_name}
          >
            {allocation.project_name}
          </span>
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold mt-0.5">
            <Calendar className="h-2.5 w-2.5" />
            <span>
              {formatDate(allocation.start_date)}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">
             <span>Manage Team</span>
             <ChevronRight className="h-2 w-2" />
          </div>
        </div>
      </div>
    </ContextMenu>
  );
};

const ProjectAllocationPage = () => {
  const { user } = useAuth();
  const { 
    allocations, 
    loading, 
    addAllocation, 
    updateAllocation, 
    deleteAllocation 
  } = useAllocations();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [allocationToDelete, setAllocationToDelete] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (allocation) => {
    setEditingAllocation(allocation);
    setIsSheetOpen(true);
  };

  const handleDelete = (id) => {
    setAllocationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (allocationToDelete) {
      try {
        await deleteAllocation(allocationToDelete);
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeleteDialogOpen(false);
        setAllocationToDelete(null);
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      // Get user data from localStorage
      let userData = null;
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          userData = JSON.parse(storedUser);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
      
      const dataWithRole = {
        ...data,
        role_id: userData?.roleId,
        role: userData?.role,
        members: data.members || []
      };
      
      if (editingAllocation) {
        await updateAllocation(editingAllocation.id, dataWithRole);
      } else {
        await addAllocation(dataWithRole);
      }
      
      setIsSheetOpen(false);
      setEditingAllocation(null);
    } catch (err) {
      setError(err.msg || err.error || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAllocations = allocations.filter(a => 
    a.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-8 bg-white min-h-screen">
      <div className="flex flex-row items-center justify-between gap-4 border-b pb-6">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 truncate">
            <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-slate-900 shrink-0" />
            Project Allocations
          </h1>
          <p className="text-sm text-slate-500 font-medium hidden md:block">Create and manage project team assignments.</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-48 lg:w-64 group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <Input 
              placeholder="Search project..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-300 transition-all"
            />
          </div>
          <Button 
            onClick={() => {
              setEditingAllocation(null);
              setIsSheetOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 px-6 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> New Allocation
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading allocations...</p>
        </div>
      ) : filteredAllocations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-8 gap-y-12">
          {filteredAllocations.map((alloc) => (
            <AllocationCard 
              key={alloc.id} 
              allocation={alloc} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center gap-6">
          <div className="h-20 w-24 relative opacity-20">
             <FolderIcon className="w-full h-full" />
          </div>
          <div className="space-y-2 max-w-xs">
            <h3 className="text-lg font-bold text-slate-900">No allocations found</h3>
            <p className="text-slate-500 text-xs">
              {searchQuery ? "Try adjusting your search query." : "Create project allocations to manage team records."}
            </p>
          </div>
          {!searchQuery && (
            <Button 
              onClick={() => setIsSheetOpen(true)}
              variant="outline"
              className="font-bold border-slate-200 hover:bg-white"
            >
              Add Allocation
            </Button>
          )}
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader className="border-b pb-6">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              {editingAllocation ? (
                <><Pencil className="h-5 w-5" /> Edit Allocation</>
              ) : (
                <><Plus className="h-5 w-5" /> New Allocation</>
              )}
            </SheetTitle>
            <SheetDescription className="font-medium">
              {editingAllocation 
                ? `Update basic details for "${editingAllocation.project_name}"` 
                : "Select a project and set the basic timeline details."}
            </SheetDescription>
          </SheetHeader>
          
          <AllocationForm 
            mode="shell"
            onSubmit={onSubmit} 
            initialData={editingAllocation} 
            submitting={submitting}
            error={error}
            onCancel={() => {
              setIsSheetOpen(false);
              setEditingAllocation(null);
            }}
          />
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Allocation?"
        description="This will remove the team assignment record for this project. This action cannot be undone."
        confirmText="Delete Allocation"
        variant="destructive"
      />
    </div>
  );
};

export default ProjectAllocationPage;
