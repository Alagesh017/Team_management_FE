import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { cn } from "../../../core/utils/utils";

const ContextMenuContext = createContext(null);

const ContextMenu = ({ children, content, className }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  const closeMenu = useCallback(() => {
    setVisible(false);
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close any other open context menus in the app
    window.dispatchEvent(new CustomEvent("close-context-menus"));
    
    setVisible(true);
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const handleGlobalClose = () => closeMenu();
    window.addEventListener("close-context-menus", handleGlobalClose);
    return () => window.removeEventListener("close-context-menus", handleGlobalClose);
  }, [closeMenu]);

  const handleClickOutside = useCallback((e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      closeMenu();
    } else if (!menuRef.current) {
      closeMenu();
    }
  }, [closeMenu]);

  useEffect(() => {
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside, true);
      document.addEventListener("contextmenu", handleClickOutside, true);
      window.addEventListener("scroll", closeMenu, true);
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true);
        document.removeEventListener("contextmenu", handleClickOutside, true);
        window.removeEventListener("scroll", closeMenu, true);
      };
    }
  }, [visible, handleClickOutside, closeMenu]);

  return (
    <ContextMenuContext.Provider value={{ closeMenu }}>
      <div onContextMenu={handleContextMenu} className={cn("contents", className)}>
        {children}
        {visible && (
          <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[12rem] overflow-hidden rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-1.5 text-slate-900 shadow-2xl animate-in fade-in-0 zoom-in-95"
            style={{ 
              top: position.y, 
              left: position.x,
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3), 0 0 1px rgba(0,0,0,0.2)'
            }}
          >
            {content}
          </div>
        )}
      </div>
    </ContextMenuContext.Provider>
  );
};

const ContextMenuItem = ({ children, onClick, className, destructive = false }) => {
  const context = useContext(ContextMenuContext);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
        if (context) context.closeMenu();
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-sm font-medium outline-none hover:bg-slate-100 hover:text-slate-900 transition-colors",
        destructive && "text-red-600 hover:bg-red-50 hover:text-red-700",
        className
      )}
    >
      {children}
    </div>
  );
};

export { ContextMenu, ContextMenuItem };
