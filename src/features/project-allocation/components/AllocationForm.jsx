import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Alert, AlertDescription } from "../../../common/components/ui/alert";
import { 
  Loader2, 
  UserPlus, 
  Trash2, 
  ChevronRight, 
  User, 
  Plus, 
  Calendar, 
  FileText,
  Briefcase
} from "lucide-react";
import { SheetClose } from "../../../common/components/ui/sheet";
import { useProjects } from "../../projects/hooks/useProjects";
import { workerService } from "../../workers/services/workerService";
import { getFullAvatarUrl } from "../../../core/utils/utils";
import { Tree, TreeNode } from 'react-organizational-chart';


const allocationFormSchema = z.object({
  project_id: z.union([z.string(), z.number()]).transform(val => Number(val)),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().nullable(),
  remark: z.string().optional(),
  members: z.array(z.object({
    user_id: z.union([z.string(), z.number()]).transform(val => Number(val)),
    role: z.string().min(1, "Role is required"),
    parent_id: z.union([z.string(), z.number()]).nullable().optional().transform(val => val ? Number(val) : null)
  })).default([]),
});

const AllocationForm = ({ onSubmit, initialData, submitting, error, onCancel, mode = "full" }) => {
  const { projects, loading: loadingProjects } = useProjects();
  const [workers, setWorkers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(allocationFormSchema),
    defaultValues: initialData || {
      project_id: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      remark: "",
      members: [],
    },
  });

  // Keep form in sync with initialData updates from parent
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoadingData(true);
        const data = await workerService.getAllWorkers();
        setWorkers(data.workers || []);
      } catch (err) {
        console.error("Failed to fetch workers:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchWorkers();
  }, []);

  const selectedProjectId = watch("project_id");
  const selectedMembers = watch("members") || [];
  
  const tls = workers.filter(w => w.is_tl);
  const regularWorkers = workers.filter(w => !w.is_tl);

  const isLoading = loadingData || loadingProjects;

  const handleShellChange = async () => {
    const currentData = watch();
    // Only auto-submit if project_id is present
    if (currentData.project_id) {
      try {
        await onSubmit(currentData);
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }
  };

  const renderShellFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="project_id" className="text-[10px] font-black uppercase text-slate-400">Project</Label>
          <Select 
            onValueChange={(val) => {
              setValue("project_id", val);
              handleShellChange();
            }} 
            value={watch("project_id")?.toString()}
            disabled={isLoading || mode === "members"}
          >
            <SelectTrigger className="h-8 bg-slate-50/50 text-xs font-bold border-none shadow-none">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="start_date" className="text-[10px] font-black uppercase text-slate-400">Start Date</Label>
          <Input 
            id="start_date" 
            type="date" 
            {...register("start_date", { onBlur: handleShellChange })} 
            className="h-8 bg-slate-50/50 text-xs font-bold border-none shadow-none" 
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="end_date" className="text-[10px] font-black uppercase text-slate-400">End Date</Label>
          <Input 
            id="end_date" 
            type="date" 
            {...register("end_date", { onBlur: handleShellChange })} 
            className="h-8 bg-slate-50/50 text-xs font-bold border-none shadow-none" 
          />
        </div>
      </div>
    </div>
  );

  const onSubmitInternal = async (data) => {
    try {
      await onSubmit(data);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleAddMember = async (userId, role, parentId = null) => {
    const newMember = { user_id: Number(userId), role, parent_id: parentId };
    const updatedMembers = [...selectedMembers, newMember];
    
    // Optimistically update UI
    setValue("members", updatedMembers);
    
    // Automatic API call as requested
    const currentData = watch();
    try {
      await onSubmit({
        ...currentData,
        members: updatedMembers
      });
    } catch (err) {
      // Revert on error
      setValue("members", selectedMembers);
    }
  };

  const handleRemoveMember = async (userId) => {
    const updatedMembers = selectedMembers.filter(m => m.user_id !== userId && m.parent_id !== userId);
    
    // Optimistically update UI
    setValue("members", updatedMembers);
    
    // Automatic API call as requested
    const currentData = watch();
    try {
      await onSubmit({
        ...currentData,
        members: updatedMembers
      });
    } catch (err) {
      // Revert on error
      setValue("members", selectedMembers);
    }
  };

  const renderHierarchyFields = () => {
    const buildTree = (parentId = null) => {
      return selectedMembers
        .filter(m => m.parent_id === parentId)
        .map(m => {
          const worker = workers.find(w => w.id === m.user_id);
          const name = worker ? `${worker.first_name} ${worker.last_name}` : "Unknown";
          const avatar = worker?.avatar_url ? getFullAvatarUrl(worker.avatar_url) : null;
          
          return {
            id: m.user_id,
            name,
            role: m.role,
            avatar,
            children: buildTree(m.user_id)
          };
        });
    };

    const treeData = {
      id: 'root',
      name: projects.find(p => p.id.toString() === selectedProjectId.toString())?.name || "Project",
      role: 'Project',
      isRoot: true,
      children: buildTree(null)
    };

    const NodeComponent = ({ node }) => (
      <div className="flex flex-col items-center">
        <div className={`p-3 rounded-xl border-2 transition-all group relative min-w-[160px] ${
          node.isRoot 
            ? 'bg-slate-900 border-slate-800 text-white shadow-xl' 
            : node.role === 'Team Leader'
              ? 'bg-white border-slate-900 text-slate-900 shadow-md'
              : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-slate-400'
        }`}>
          <div className={`flex items-center gap-3 ${node.isRoot ? 'justify-center' : ''}`}>
            {!node.isRoot && (
              <div className={`h-10 w-10 rounded-full flex items-center justify-center overflow-hidden border-2 ${
                node.role === 'Team Leader' ? 'border-slate-100 bg-slate-50' : 'border-slate-50 bg-slate-50/50'
              }`}>
                {node.avatar ? (
                  <img src={node.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-slate-400" />
                )}
              </div>
            )}
            {node.isRoot && (
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            )}
            <div className={`${node.isRoot ? 'text-center' : 'text-left'} min-w-0 flex-1`}>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none mb-1">
                {node.role}
              </p>
              <p className="text-[13px] font-bold truncate leading-tight">
                {node.name}
              </p>
            </div>
            
            {!node.isRoot && (
              <button 
                type="button"
                onClick={() => handleRemoveMember(node.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all absolute -top-2 -right-2 bg-white rounded-full border border-slate-100 shadow-sm z-20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );

    const AddWorkerButton = ({ parentId }) => (
      <div className="flex justify-center mt-3">
        <Select onValueChange={(val) => handleAddMember(val, "Worker", parentId)}>
          <SelectTrigger className="h-8 px-3 border-dashed border-2 border-slate-200 bg-transparent text-[9px] font-black uppercase text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all w-[140px] rounded-lg shadow-none group">
            <div className="flex items-center justify-center w-full gap-2">
              <Plus className="h-3 w-3" />
              <span>Add Worker</span>
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-slate-200 shadow-xl p-1.5 bg-white min-w-[200px]">
            <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Available Workers</div>
            {regularWorkers.filter(w => !selectedMembers.some(m => m.user_id === w.id)).map(worker => (
              <SelectItem 
                key={worker.id} 
                value={worker.id.toString()}
                className="rounded-lg focus:bg-slate-50 focus:text-slate-900 transition-all cursor-pointer py-2 px-2 border border-transparent focus:border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                    {worker.avatar_url ? (
                      <img src={getFullAvatarUrl(worker.avatar_url)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">{worker.first_name[0]}{worker.last_name[0]}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-700 truncate">{worker.first_name} {worker.last_name}</span>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">Worker</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );

    const AddTLButton = () => (
      <div className="flex justify-center">
        <Select onValueChange={(val) => handleAddMember(val, "Team Leader", null)}>
          <SelectTrigger className="h-10 px-4 border-dashed border-2 border-slate-200 bg-transparent text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all w-[180px] rounded-xl shadow-none group">
            <div className="flex items-center justify-center w-full gap-2.5">
              <UserPlus className="h-4 w-4" />
              <span>Add Team Leader</span>
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-slate-200 shadow-xl p-1.5 bg-white min-w-[220px]">
            <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Team Leaders</div>
            {tls.filter(t => !selectedMembers.some(m => m.user_id === t.id)).map(tl => (
              <SelectItem 
                key={tl.id} 
                value={tl.id.toString()}
                className="rounded-lg focus:bg-slate-50 focus:text-slate-900 transition-all cursor-pointer py-2.5 px-2 border border-transparent focus:border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                    {tl.avatar_url ? (
                      <img src={getFullAvatarUrl(tl.avatar_url)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-600">{tl.first_name[0]}{tl.last_name[0]}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-800 truncate">{tl.first_name} {tl.last_name}</span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Lead</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );

    const renderNode = (node) => {
      // If this is a Team Leader, render all its children (workers) vertically in a single child node
      if (!node.isRoot && node.role === 'Team Leader') {
        return (
          <TreeNode 
            key={node.id} 
            label={<NodeComponent node={node} />}
          >
            <TreeNode 
              label={
                <div className="flex flex-col items-center gap-3 pt-4">
                  {/* Vertical list of workers */}
                  {node.children && node.children.map(worker => (
                    <NodeComponent key={worker.id} node={worker} />
                  ))}
                  {/* Add Worker button at the very bottom of the vertical list */}
                  <AddWorkerButton parentId={node.id} />
                </div>
              }
            />
          </TreeNode>
        );
      }

      // Standard branching for any other horizontal nodes
      return (
        <TreeNode 
          key={node.id} 
          label={<NodeComponent node={node} />}
        >
          {node.children && node.children.map(child => renderNode(child))}
        </TreeNode>
      );
    };

    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="relative w-full flex-1 bg-[#F8FAFC]/30 rounded-2xl border border-slate-100 overflow-hidden">
          {/* Add Team Leader Action - Absolutely positioned to the right to not affect tree centering */}
          <div className="absolute top-4 right-4 z-10">
            <AddTLButton />
          </div>

          <div className="w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-slate-200 p-4">
            <div className="min-w-max flex justify-center py-4">
              <Tree
                lineWidth={'2px'}
                lineColor={'#CBD5E1'}
                lineBorderRadius={'12px'}
                label={<NodeComponent node={treeData} />}
              >
                {treeData.children.map(child => renderNode(child))}
              </Tree>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmitInternal)} className="h-full flex flex-col gap-4">
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mode !== "members" && renderShellFields()}
      {mode !== "shell" && selectedProjectId && renderHierarchyFields()}
      
      {mode !== "members" && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={submitting}
              className="text-slate-600"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitting || !watch("project_id") || !watch("start_date")}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {initialData ? "Update Allocation" : "Create Allocation"}
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};

export default AllocationForm;
