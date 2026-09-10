import { getProfile } from "@/app/actions/profile";
import ProfileClient from "./profile-client";
import { Header } from "@/components/ui/header";

export const metadata = {
  title: "Profile Settings | EventJini",
};

export default async function ProfilePage() {
  const { data: profile, error } = await getProfile();

  return (
    <main className="min-h-screen bg-canvas text-white">
      <Header />
      <ProfileClient initialProfile={profile || {}} error={error} />
    </main>
  );
}
