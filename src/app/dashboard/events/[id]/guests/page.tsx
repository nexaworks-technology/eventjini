import { getGuests } from "@/app/actions/event-management";
import GuestsClient from "./guests-client";

interface GuestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuestsPage({ params }: GuestsPageProps) {
  const resolvedParams = await params;
  const { data: guests } = await getGuests(resolvedParams.id);

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">Guests Management</h1>
      <GuestsClient initialGuests={guests || []} />
    </div>
  );
}
