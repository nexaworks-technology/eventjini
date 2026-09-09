import Link from "next/link";
import { getEvents } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { EventsList } from "./events-list";

export const metadata = {
  title: "Events - EventJini",
};

export default async function EventsPage() {
  const { data: events, error } = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Events</h1>
        <Link href="/dashboard/events/new">
          <Button variant="primary">
            <PlusIcon className="w-5 h-5 mr-1" />
            Create Event
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="text-red-400 p-4 rounded-xl bg-red-400/10 border border-red-400/20">
          Failed to load events: {error}
        </div>
      ) : (
        <EventsList events={events || []} />
      )}
    </div>
  );
}
