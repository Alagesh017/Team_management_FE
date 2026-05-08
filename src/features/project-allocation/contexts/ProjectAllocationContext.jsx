import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { allocationService } from "../services/allocationService";

const ProjectAllocationContext = createContext();

export const ProjectAllocationProvider = ({ children }) => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await allocationService.getAllAllocations();
      setAllocations(data.allocations || []);
    } catch (err) {
      console.error("Failed to fetch allocations:", err);
      setError(err.msg || err.error || "Failed to fetch allocations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  const addAllocation = async (allocationData) => {
    try {
      setLoading(true);
      const data = await allocationService.createAllocation(allocationData);
      await fetchAllocations();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAllocation = async (id, allocationData) => {
    try {
      setLoading(true);
      const data = await allocationService.updateAllocation(id, allocationData);
      await fetchAllocations();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAllocation = async (id) => {
    try {
      setLoading(true);
      const data = await allocationService.deleteAllocation(id);
      await fetchAllocations();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllocationById = async (id) => {
    try {
      return await allocationService.getAllocationById(id);
    } catch (err) {
      throw err;
    }
  };

  const updateAllocationMembers = async (id, members) => {
    try {
      setLoading(true);
      const data = await allocationService.updateAllocationMembers(id, members);
      await fetchAllocations();
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectAllocationContext.Provider
      value={{
        allocations,
        loading,
        error,
        fetchAllocations,
        addAllocation,
        updateAllocation,
        updateAllocationMembers,
        deleteAllocation,
        getAllocationById,
      }}
    >
      {children}
    </ProjectAllocationContext.Provider>
  );
};

export default ProjectAllocationContext;
