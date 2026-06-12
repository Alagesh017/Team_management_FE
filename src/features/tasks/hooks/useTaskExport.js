import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectExcelService } from '../services/projectExcelService';
import { projectTaskService } from '../services/projectTaskService';
import { useAuth } from '../../auth/contexts/AuthContext';
import { createExcelFileWithData, downloadExcelFile } from '../utils/excelUtils';

export const useTaskExport = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = parseInt(searchParams.get('projectId'));
  
  const [excelFiles, setExcelFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projectTaskData, setProjectTaskData] = useState(null);

  // Load project task data
  const loadProjectTaskData = async (id) => {
    if (!id) return;
    try {
      const data = await projectTaskService.getProjectTaskData(id);
      setProjectTaskData(data);
    } catch (err) {
      console.error('Failed to load project task data:', err);
    }
  };

  // Load Excel files for this project
  const loadExcelFiles = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await projectExcelService.getExcelsByProjectId(id);
      setExcelFiles(data.excel_files || []);
    } catch (err) {
      console.error('Failed to load Excel files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProjectTaskData(projectId);
      loadExcelFiles(projectId);
    }
  }, [projectId]);

  // Derive statuses and members from projectTaskData
  const statuses = useMemo(() => projectTaskData?.statuses || [], [projectTaskData]);
  const allocatedMembers = useMemo(() => projectTaskData?.allocated_members || [], [projectTaskData]);
  const allAdmins = useMemo(() => projectTaskData?.all_admins || [], [projectTaskData]);

  const availableMembers = useMemo(() => {
    const seen = new Set();
    const combined = [];
    [...allAdmins, ...allocatedMembers].forEach((m) => {
      const memberType = m.type || (m.is_admin || m.is_superadmin ? 'admin' : 'worker');
      const uniqueKey = `${memberType}-${m.user_id}`;
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        combined.push({ ...m, type: memberType });
      }
    });
    return combined;
  }, [allAdmins, allocatedMembers]);

  // Get all tasks from statuses
  const tasks = useMemo(() => statuses.flatMap(status => status.tasks || []), [statuses]);

  const handleCreateExcel = async () => {
    if (!projectId) {
      alert('No project selected!');
      return;
    }

    try {
      setCreating(true);
      
      const { base64Data, fileName } = await createExcelFileWithData({
        statuses,
        members: availableMembers,
        tasks
      });

      await projectExcelService.createExcel({
        project_id: projectId,
        file_name: fileName,
        file_data: base64Data,
        role_id: user?.roleId,
        role: user?.role
      });

      await loadExcelFiles(projectId);
    } catch (err) {
      console.error('Failed to create Excel:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadExcel = (excelFile) => {
    if (excelFile.file_url) {
      downloadExcelFile(excelFile.file_url, excelFile.file_name);
    }
  };

  return {
    excelFiles,
    loading,
    creating,
    projectId,
    statuses,
    availableMembers,
    handleCreateExcel,
    handleDownloadExcel,
  };
};
