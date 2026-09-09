import { getGuests } from "@/app/actions/os";
import GuestsClient from "./guests-client";

interface GuestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function GuestsPage({ params }: GuestsPageProps) {
  const resolvedParams = await params;
  const rawGuests = await getGuests(resolvedParams.id);

  const mappedGuests = rawGuests.map((g: any) => ({
    id: g.id,
    name: g.user?.full_name || "Unknown",
    email: g.user?.email || "No email",
    ticketCode: g.ticket_code,
    status: g.status.charAt(0).toUpperCase() + g.status.slice(1),
  }));

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">Guests Management</h1>
      <GuestsClient initialGuests={mappedGuests} />
    </div>
  );
}
