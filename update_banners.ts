import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateEvents() {
  const { data: events, error } = await supabase.from("events").select("id, title");
  
  if (error) {
    console.error("Error fetching events:", error);
    return;
  }
  
  for (const event of events) {
    let banner_url = "/demo/tech.jpg"; // default
    
    const titleLower = event.title.toLowerCase();
    
    if (titleLower.includes("music") || titleLower.includes("festival") || titleLower.includes("concert")) {
      banner_url = "/demo/music.jpg";
    } else if (titleLower.includes("wellness") || titleLower.includes("yoga") || titleLower.includes("retreat")) {
      banner_url = "/demo/wellness.jpg";
    } else if (titleLower.includes("tech") || titleLower.includes("summit") || titleLower.includes("dev")) {
      banner_url = "/demo/tech.jpg";
    }
    
    await supabase.from("events").update({ banner_url }).eq("id", event.id);
    console.log(`Updated event: ${event.title} with ${banner_url}`);
  }
}

updateEvents();
