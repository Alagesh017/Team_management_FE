import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search,
  LayoutGrid,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../common/components/ui/sheet";
import { ConfirmDialog } from "../../../common/components/ConfirmDialog";
import ProjectGroupForm from "../components/ProjectGroupForm";
import { projectGroupService } from "../services/projectGroupService";
import { ContextMenu, ContextMenuItem } from "../../../common/components/ui/context-menu";

const GroupCard = ({ group, onEdit, onDelete }) => {
  const contextContent = (
    <div className="flex flex-col">
      <ContextMenuItem onClick={() => onEdit(group)} className="gap-3">
        <Pencil className="h-4 w-4 text-slate-500" />
        <span>Edit Group</span>
      </ContextMenuItem>
      <div className="h-px bg-slate-100 my-1 mx-1" />
      <ContextMenuItem onClick={() => onDelete(group.id)} className="gap-3" destructive>
        <Trash2 className="h-4 w-4" />
        <span>Delete Group</span>
      </ContextMenuItem>
    </div>
  );

  return (
    <ContextMenu content={contextContent}>
      <div className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-slate-300">
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Projects</span>
            <span className="text-xl font-black text-slate-900">{group.project_count || 0}</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors truncate" title={group.name}>
            {group.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
            {group.description || "No description provided."}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Master Group</span>
          <button className="text-[10px] font-black uppercase text-slate-900 flex items-center gap-1 hover:gap-2 transition-all">
            Manage <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </ContextMenu>
  );
};

const ProjectGroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await projectGroupService.getAllGroups();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleEdit = (group) => {
    setEditingGroup(group);
    setIsSheetOpen(true);
  };

  const handleDelete = (id) => {
    setGroupToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (groupToDelete) {
      try {
        await projectGroupService.deleteGroup(groupToDelete);
        fetchGroups();
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeleteDialogOpen(false);
        setGroupToDelete(null);
      }
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError("");
    try {
      if (editingGroup) {
        await projectGroupService.updateGroup(editingGroup.id, data);
      } else {
        await projectGroupService.createGroup(data);
      }
      fetchGroups();
      setIsSheetOpen(false);
      setEditingGroup(null);
    } catch (err) {
      setError(err.msg || err.error || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-8 bg-slate-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3 truncate uppercase">
            <LayoutGrid className="h-6 w-6 text-slate-900 shrink-0" />
            Project Grouping
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider hidden md:block">Master classification for project directories.</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-48 lg:w-64 group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <Input 
              placeholder="Search groups..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-300 transition-all rounded-xl"
            />
          </div>
          <Button 
            onClick={() => {
              setEditingGroup(null);
              setIsSheetOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black gap-2 px-6 transition-all active:scale-95 rounded-xl uppercase text-xs"
          >
            <Plus className="h-4 w-4" /> New Group
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Loading master groups...</p>
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard 
              key={group.id} 
              group={group} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
            <FolderOpen className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Groups Found</h3>
          <p className="text-sm text-slate-500 max-w-[250px] text-center mt-1">Create your first project group to start organizing your directories.</p>
          <Button 
            onClick={() => setIsSheetOpen(true)}
            variant="outline"
            className="mt-6 font-bold gap-2"
          >
            <Plus className="h-4 w-4" /> Create First Group
          </Button>
        </div>
      )}

      {/* Group Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl font-black uppercase tracking-tight">
              {editingGroup ? "Edit Project Group" : "Create New Group"}
            </SheetTitle>
            <SheetDescription className="font-medium">
              Groups help you categorize and manage multiple related projects together.
            </SheetDescription>
          </SheetHeader>
          <ProjectGroupForm 
            onSubmit={onSubmit} 
            initialData={editingGroup} 
            submitting={submitting}
            error={error}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Project Group?"
        description="This action cannot be undone. Projects in this group will not be deleted, but they will no longer be associated with this group."
      />
    </div>
  );
};

export default ProjectGroupPage;
