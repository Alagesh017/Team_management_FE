import { useContext } from "react";
import ProjectAllocationContext from "../contexts/ProjectAllocationContext";

export const useAllocations = () => {
  const context = useContext(ProjectAllocationContext);
  if (!context) {
    throw new Error("useAllocations must be used within a ProjectAllocationProvider");
  }
  return context;
};
