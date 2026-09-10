import { getProfile } from "@/app/actions/profile";
import { ProfileForm } from "./profile-form";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const { data: profile, error } = await getProfile();

  if (error || !profile) {
    // If not authenticated, the layout should technically catch it first, 
    // but just in case, redirect to login
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Profile Settings</h1>
        <p className="text-white/60 mt-1">Manage your account settings and preferences.</p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
