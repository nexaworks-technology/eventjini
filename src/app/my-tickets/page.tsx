import { getMyTickets } from "@/app/actions/registrations";
import MyTicketsClient from "./my-tickets-client";
import { Header } from "@/components/ui/header";

export const metadata = {
  title: "My Tickets | EventJini",
};

export default async function MyTicketsPage() {
  const { data: tickets, error } = await getMyTickets();

  return (
    <main className="min-h-screen bg-canvas text-white">
      <Header />
      <MyTicketsClient initialTickets={tickets || []} error={error} />
    </main>
  );
}
