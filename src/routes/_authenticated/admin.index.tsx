import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarCheck, DollarSign, Users, Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

function Dashboard() {
  const [stats, setStats] = useState({ bookings: 0, pending: 0, revenue: 0, packages: 0, contacts: 0, subscribers: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const [{ count: bookings }, { count: pending }, { data: pkgs }, { data: rec }, { count: contactCount }, { data: contactData }, { data: subData }] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }).neq("package_title", "General Inquiry"),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending").neq("package_title", "General Inquiry"),
        supabase.from("packages").select("price"),
        supabase.from("bookings").select("*").neq("package_title", "General Inquiry").order("created_at", { ascending: false }).limit(5),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("package_title", "General Inquiry"),
        supabase.from("bookings").select("*").eq("package_title", "General Inquiry").order("created_at", { ascending: false }).limit(10),
        supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(10),
      ]);
      setStats({ bookings: bookings ?? 0, pending: pending ?? 0, revenue: (pkgs ?? []).reduce((s: number, p: any) => s + Number(p.price || 0), 0), packages: pkgs?.length ?? 0, contacts: contactCount ?? 0, subscribers: subData?.length ?? 0 });
      setRecentBookings(rec ?? []);
      setContacts(contactData ?? []);
      setSubscribers(subData ?? []);
    })();
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Overview of bookings, contacts, and subscribers.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [CalendarCheck, "Total bookings", stats.bookings],
          [Users, "Pending", stats.pending],
          [Package, "Packages", stats.packages],
          [DollarSign, "Contact Msgs", stats.contacts],
        ].map(([Icon, label, value]: any, i) => (
          <div key={i} className="rounded-2xl bg-card border border-border p-5">
            <Icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-3xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
      <h2 className="mt-10 font-display text-2xl font-bold">Recent bookings</h2>
      <div className="mt-4 rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Name</th><th className="p-3">Package</th><th className="p-3">Date</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {recentBookings.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="p-3">{b.full_name}</td><td className="p-3">{b.package_title}</td><td className="p-3">{b.tour_date}</td><td className="p-3 capitalize">{b.status}</td>
              </tr>
            ))}
            {recentBookings.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No bookings yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="mt-10 font-display text-2xl font-bold">Contact form submissions</h2>
      <div className="mt-4 rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Message</th><th className="p-3">Date</th></tr></thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3">{c.full_name}</td><td className="p-3 text-xs">{c.email}</td><td className="p-3 truncate max-w-xs">{c.message}</td><td className="p-3 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {contacts.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No contact submissions yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <h2 className="mt-10 font-display text-2xl font-bold">Newsletter subscribers ({stats.subscribers})</h2>
      <div className="mt-4 rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Email</th><th className="p-3">Subscribed</th></tr></thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3">{s.email}</td><td className="p-3 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {subscribers.length === 0 && <tr><td colSpan={2} className="p-6 text-center text-muted-foreground">No subscribers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
