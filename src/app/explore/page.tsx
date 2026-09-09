import { getPublicEvents } from "@/app/actions/events";
import ExploreClient from "./explore-client";
import { Header } from "@/components/ui/header";

export const metadata = {
  title: "Explore Events | EventJini",
  description: "Discover upcoming hackathons, meetups, and conferences.",
};

export default async function ExplorePage() {
  const { data: events, error } = await getPublicEvents();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />
      <ExploreClient initialEvents={events || []} error={error} />
    </main>
  );
}
