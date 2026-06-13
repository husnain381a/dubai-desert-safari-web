import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({ component: Reviews });

function Reviews() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => supabase.from("testimonials").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);
  const approve = async (id: string) => { await supabase.from("testimonials").update({ approved: true }).eq("id", id); load(); };
  const del = async (id: string) => { await supabase.from("testimonials").delete().eq("id", id); load(); };
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Reviews</h1>
      <div className="mt-6 grid gap-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex justify-between gap-3">
              <div>
                <div className="font-semibold">{r.name} <span className="text-xs text-muted-foreground">({r.country || "—"})</span></div>
                <div className="flex gap-0.5 text-primary mt-1">{Array.from({length:r.rating}).map((_,i)=><Star key={i} className="h-3.5 w-3.5 fill-current" />)}</div>
              </div>
              <div className="text-xs">{r.approved ? <span className="text-green-600">Approved</span> : <span className="text-amber-600">Pending</span>}</div>
            </div>
            <p className="mt-2 text-sm">{r.comment}</p>
            <div className="mt-3 flex gap-2">
              {!r.approved && <Button size="sm" onClick={() => approve(r.id)}>Approve</Button>}
              <Button size="sm" variant="destructive" onClick={() => del(r.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
