import { getVendors } from "@/app/actions/vendors";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const eventId = resolvedParams.id;
  const initialVendors = await getVendors(eventId);

  return <VendorsClient eventId={eventId} initialVendors={initialVendors} />;
}
