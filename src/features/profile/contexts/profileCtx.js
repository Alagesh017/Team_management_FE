import { createContext } from "react";

/** Shared context instance (separate module avoids duplicate context on circular imports). */
export const ProfileContext = createContext(null);
