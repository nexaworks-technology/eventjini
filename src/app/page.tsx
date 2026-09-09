import { getPublicEvents } from "@/app/actions/events";
import HomeClient from "./home-client";

export const metadata = {
  title: "EventJini | Gen-Z Event Platform",
  description: "Seamlessly manage, host, and experience events with EventJini. The premium Event Management SaaS.",
};

export default async function HomePage() {
  const { data: featuredEvents } = await getPublicEvents();

  return <HomeClient featuredEvents={featuredEvents || []} />;
}
