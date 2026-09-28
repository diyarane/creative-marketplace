import * as React from "react";
export function DataTable({ headers, children, empty }: { headers: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-muted"><tr>{headers.map((h) => <th key={h} className="whitespace-nowrap p-4">{h}</th>)}</tr></thead>
        <tbody>{empty ? <tr><td colSpan={headers.length} className="p-8 text-center text-muted">Nothing to show.</td></tr> : children}</tbody>
      </table>
    </div>
  );
}
