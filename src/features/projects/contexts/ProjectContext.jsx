import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { projectService } from "../services/projectService";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getAllProjects();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError(err.msg || err.error || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
