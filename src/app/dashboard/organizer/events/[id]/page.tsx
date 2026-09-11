import { redirect } from "next/navigation";

export default async function EventRootPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  redirect(`/dashboard/organizer/events/${resolvedParams.id}/analytics`);
}
