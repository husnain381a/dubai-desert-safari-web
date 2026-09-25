import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Bell, Loader2 } from "lucide-react";
import { waGuestLink } from "@/lib/site";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/bookings")({ component: Bookings });

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

function Bookings() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [notifying, setNotifying] = useState<string | null>(null);
  const load = () =>
    supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: status as (typeof STATUSES)[number] })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  /** Manual send for a booking the edge function never managed to email. */
  const notify = async (id: string) => {
    setNotifying(id);
    const { error } = await supabase.functions.invoke("booking-notification", { body: { id } });
    setNotifying(null);
    if (error) return toast.error(error.message);
    toast.success("Notification sent to the studio email");
    load();
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Bookings</h1>
      <div className="mt-4 flex gap-2 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs capitalize ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4">
        {filtered.map((b) => (
          <div key={b.id} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-semibold text-lg">
                  {b.full_name}{" "}
                  <span className="text-xs text-muted-foreground">({b.country || "—"})</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {b.email} · {b.phone}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{b.package_title}</div>
                <div className="text-sm text-muted-foreground">
                  {b.tour_date} · {b.guests} guests
                </div>
              </div>
            </div>
            {b.message && (
              <p className="mt-3 text-sm bg-secondary p-3 rounded-md whitespace-pre-line">
                {b.message}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <select
                value={b.status}
                onChange={(e) => update(b.id, e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {b.notified_at ? (
                <span
                  title={`Notification sent ${new Date(b.notified_at).toLocaleString()}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-xs text-secondary-foreground"
                >
                  <Mail className="h-3.5 w-3.5 text-primary" /> Studio emailed
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={notifying === b.id}
                  onClick={() => notify(b.id)}
                >
                  {notifying === b.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  Email me this
                </Button>
              )}
              <a href={`mailto:${b.email}?subject=Your booking with Red Sand Dunes DXB`}>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4" /> Email
                </Button>
              </a>
              <a
                href={waGuestLink(
                  b.phone,
                  `Hi ${b.full_name}, this is Red Sand Dunes DXB about your booking for ${b.package_title}…`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </Button>
              </a>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-10">No bookings.</p>
        )}
      </div>
    </div>
  );
}
