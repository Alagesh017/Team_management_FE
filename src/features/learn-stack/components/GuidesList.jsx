import React from "react";
import GuideCard from "./GuideCard";

export default function GuidesList({ cards, loading, emptyHint, onOpen }) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-slate-500">Loading…</p>;
  }
  if (!cards.length) {
    return <p className="py-10 text-center text-sm text-slate-500">{emptyHint}</p>;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {cards.map((c) => (
        <GuideCard key={c.id} card={c} onOpen={onOpen} />
      ))}
    </div>
  );
}
