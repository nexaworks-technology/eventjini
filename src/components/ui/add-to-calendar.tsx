"use client";

import { useState } from "react";
import { Button } from "./button";
import { CalendarPlus, Loader2 } from "lucide-react";
import { createEvent } from "ics";

interface AddToCalendarProps {
  event: any;
  className?: string;
}

export function AddToCalendar({ event, className }: AddToCalendarProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (!event.start_date) {
        setIsLoading(false);
        return;
      }
      
      const startDate = new Date(event.start_date);
      const start: [number, number, number, number, number] = [
        startDate.getUTCFullYear(),
        startDate.getUTCMonth() + 1,
        startDate.getUTCDate(),
        startDate.getUTCHours(),
        startDate.getUTCMinutes()
      ];

      // Assume 2 hours duration if end_date is missing
      let end: [number, number, number, number, number];
      if (event.end_date) {
        const endDate = new Date(event.end_date);
        end = [
          endDate.getUTCFullYear(),
          endDate.getUTCMonth() + 1,
          endDate.getUTCDate(),
          endDate.getUTCHours(),
          endDate.getUTCMinutes()
        ];
      } else {
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        end = [
          endDate.getUTCFullYear(),
          endDate.getUTCMonth() + 1,
          endDate.getUTCDate(),
          endDate.getUTCHours(),
          endDate.getUTCMinutes()
        ];
      }

      createEvent({
        title: event.title,
        description: event.description || "Join us for this exciting event!",
        location: event.location_name || "TBA",
        start,
        end,
        url: window.location.origin + "/e/" + event.slug,
      }, (error, value) => {
        setIsLoading(false);
        if (error) {
          console.error(error);
          return;
        }
        
        const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${event.slug}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }, 500); // Small delay for UX
  };

  return (
    <Button 
      variant="secondary" 
      onClick={handleDownload} 
      disabled={isLoading}
      className={`w-full gap-2 ${className}`}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
      Add to Calendar
    </Button>
  );
}
