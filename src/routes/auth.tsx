import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Sign In — Red Sand Dunes DXB" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/admin" });
  };
  return (
    <SiteLayout>
      <section className="pt-32 pb-20 min-h-screen">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-2xl bg-card border border-border p-8 shadow-lg">
            <h1 className="font-display text-3xl font-bold text-center">Welcome back</h1>
            <p className="mt-2 text-center text-muted-foreground text-sm">Sign in to manage bookings & content.</p>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <div><Label>Email</Label><Input name="email" type="email" required /></div>
              <div><Label>Password</Label><Input name="password" type="password" minLength={6} required /></div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">Sign in</Button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
