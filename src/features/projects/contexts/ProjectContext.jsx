import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { projectService } from "../services/projectService";
import { projectGroupService } from "../services/projectGroupService";
import { useAuth } from "../../auth/contexts/AuthContext";

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = user ? { role: user.role, user_id: user.userId, role_id: user.roleId } : {};
      const data = await projectService.getAllProjects(params);
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError(err.msg || err.error || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await projectGroupService.getAllGroups();
      setGroups(data.groups || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchGroups();
  }, [fetchProjects, fetchGroups]);

  const addProject = async (projectData) => {
    try {
      setLoading(true);
      const data = await projectService.createProject(projectData);
      await fetchProjects();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      setLoading(true);
      const data = await projectService.updateProject(id, projectData);
      await fetchProjects();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    try {
      setLoading(true);
      const data = await projectService.deleteProject(id);
      await fetchProjects();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = async (id) => {
    try {
      return await projectService.getProjectById(id);
    } catch (err) {
      throw err;
    }
  };

  const addGroup = async (groupData) => {
    try {
      const data = await projectGroupService.createGroup(groupData);
      await fetchGroups();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateGroup = async (id, groupData) => {
    try {
      const data = await projectGroupService.updateGroup(id, groupData);
      await fetchGroups();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteGroup = async (id) => {
    try {
      const data = await projectGroupService.deleteGroup(id);
      await fetchGroups();
      return data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        groups,
        loading,
        error,
        fetchProjects,
        fetchGroups,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
        addGroup,
        updateGroup,
        deleteGroup,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
