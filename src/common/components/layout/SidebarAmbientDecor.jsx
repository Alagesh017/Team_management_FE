import React from "react";

/** Subtle bottom-left ambient motion (hidden when sidebar is icon-only). */
export function SidebarAmbientDecor() {
  return (
    <div
      className="sidebar-ambient-decor pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[min(38vh,200px)] overflow-hidden"
      aria-hidden
    >
      <div className="sidebar-ambient-mesh" />
      <div className="sidebar-ambient-vignette" />
      <div className="sidebar-ambient-goo">
        <div className="sidebar-ambient-blob sidebar-ambient-blob--blue" />
        <div className="sidebar-ambient-blob sidebar-ambient-blob--cyan" />
        <div className="sidebar-ambient-blob sidebar-ambient-blob--pink" />
      </div>
      <div className="sidebar-ambient-ring sidebar-ambient-ring--red" />
      <div className="sidebar-ambient-ring sidebar-ambient-ring--purple-a" />
      <div className="sidebar-ambient-ring sidebar-ambient-ring--gold" />
      {["a", "b", "c"].map((id) => (
        <span key={id} className={`sidebar-ambient-spark sidebar-ambient-spark--${id}`} />
      ))}
    </div>
  );
}
