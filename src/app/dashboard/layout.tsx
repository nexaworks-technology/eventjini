import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { FadeInUp } from "@/components/animations/motion";
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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#06b6d4]/30">
      <Sidebar />

      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-[#050505]/50 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium border border-white/10">
              {avatarInitial}
            </div>
            <span className="text-sm font-medium text-white/80 hidden sm:block">
              {user.email}
            </span>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </button>
          </form>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <FadeInUp className="h-full max-w-5xl mx-auto">{children}</FadeInUp>
        </main>
      </div>
    </div>
  );
}
