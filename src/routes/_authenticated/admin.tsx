import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CalendarCheck, Package, FileText, Star, Image as ImageIcon, LogOut } from "lucide-react";
import logo1 from "@/assets/logo-1.png";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/packages", label: "Packages", icon: Package },
  { to: "/admin/blogs", label: "Blogs", icon: FileText },
  { to: "/admin/testimonials", label: "Reviews", icon: Star },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
];

function AdminLayout() {
  const navigate = useNavigate();

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); };
  
  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-card hidden lg:block p-5">
        <div className="flex items-center gap-2 mb-8">
          <img src={logo1} alt="" className="h-20 w-20" />
          <div><div className="font-display font-bold">Admin</div><div className="text-xs text-muted-foreground">Red Sand Dunes</div></div>
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: !!n.exact }} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-secondary" activeProps={{ className: "bg-secondary text-primary font-semibold" }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <Button onClick={signOut} variant="outline" className="mt-8 w-full"><LogOut className="h-4 w-4" /> Sign out</Button>
      </aside>
      <div className="p-6 md:p-10 max-w-full">
        <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: !!n.exact }} className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-secondary" activeProps={{ className: "bg-primary text-primary-foreground" }}>
              {n.label}
            </Link>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
