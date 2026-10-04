import { tickets, type Ticket, type TicketStatus, type TicketType } from "../data/mock";

const typeColor: Record<TicketType, string> = {
  bug: "text-[#ffa657]",
  feature: "text-[#79c0ff]",
  art: "text-[#d2a8ff]",
  docs: "text-muted-foreground",
};

const columns: { status: TicketStatus; label: string; labelClass: string }[] = [
  { status: "in_progress", label: "IN PROGRESS", labelClass: "text-[#e3b341]" },
  { status: "todo", label: "TO DO", labelClass: "text-muted-foreground" },
  { status: "done", label: "DONE", labelClass: "text-accent-primary" },
];

function TicketCard({ ticket }: { ticket: Ticket }) {
  if (ticket.status === "done") {
    return (
      <div className="rounded-xl border border-panel-border/60 bg-panel p-3 opacity-70">
        <div className="text-sm text-muted-foreground line-through">{ticket.title}</div>
      </div>
    );
  }

  const active = ticket.status === "in_progress";
  return (
    <button
      type="button"
      className={`w-full rounded-xl border bg-panel p-3 text-left transition ${
        active ? "border-panel-border-hover" : "border-panel-border hover:border-panel-border-hover"
      }`}
    >
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="font-mono">{ticket.id}</span>
        <span className={typeColor[ticket.type]}>{ticket.type}</span>
      </div>
      <div className="mt-1.5 text-sm font-semibold text-foreground">{ticket.title}</div>
      {(ticket.link || ticket.assignee) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">{ticket.link ?? ""}</span>
          {ticket.assignee && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-secondary text-[11px] font-bold text-accent-primary">
              {ticket.assignee}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

export default function TicketBoard() {
  return (
    <section
      aria-label="Tickets"
      className="flex w-full shrink-0 flex-col gap-3.5 overflow-y-auto border-t border-panel-border/70 bg-panel-muted p-4 lg:w-[360px] lg:border-l lg:border-t-0"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Board</h2>
        <button
          type="button"
          className="rounded-lg border border-panel-border bg-panel-elevated px-3 py-1.5 text-[13px] font-semibold text-foreground transition hover:border-panel-border-hover"
        >
          + Ticket
        </button>
      </div>

      {columns.map((col) => {
        const items = tickets.filter((t) => t.status === col.status);
        return (
          <div key={col.status}>
            <div className={`mb-2 font-mono text-[11px] tracking-[0.08em] ${col.labelClass}`}>
              {col.label} · {items.length}
            </div>
            <div className="flex flex-col gap-2">
              {items.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
