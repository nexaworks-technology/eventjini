import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const avatarInitial = user.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-canvas text-white selection:bg-brand-primary/30">
      <Sidebar />

      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-14 border-b border-white/[0.04] bg-canvas/80 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-xs font-bold text-white">
              {avatarInitial}
            </div>
            <span className="text-sm text-muted hidden sm:block">
              {user.email}
            </span>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/[0.04] transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
