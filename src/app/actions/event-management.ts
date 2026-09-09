"use server";

import { revalidatePath } from "next/cache";

// GUESTS
export async function getGuests(_eventId: string) {
  // Mock data for guests
  return {
    data: [
      { id: "1", name: "Alice Smith", email: "alice@example.com", ticketCode: "TK-1234", status: "Approved" },
      { id: "2", name: "Bob Johnson", email: "bob@example.com", ticketCode: "TK-5678", status: "Pending" },
      { id: "3", name: "Charlie Brown", email: "charlie@example.com", ticketCode: "TK-9012", status: "Rejected" },
    ]
  };
}

export async function updateGuestStatus(_guestId: string, _status: "Approved" | "Rejected" | "Pending") {
  // Mock update
  revalidatePath(`/dashboard/events/[id]/guests`, "page");
  return { success: true };
}

// TASKS
export async function getTasks(_eventId: string) {
  // Mock data for tasks
  return {
    data: [
      { id: "t1", title: "Book venue", status: "To Do" },
      { id: "t2", title: "Catering", status: "In Progress" },
      { id: "t3", title: "Send invites", status: "Done" },
      { id: "t4", title: "Speaker arrangements", status: "To Do" },
    ]
  };
}

export async function updateTaskStatus(_taskId: string, _newStatus: string) {
  revalidatePath(`/dashboard/events/[id]/tasks`, "page");
  return { success: true };
}

export async function createTask(_eventId: string, title: string) {
  revalidatePath(`/dashboard/events/[id]/tasks`, "page");
  return { success: true, data: { id: `t-${Date.now()}`, title, status: "To Do" } };
}

// BUDGET
export async function getBudgets(_eventId: string) {
  // Mock data for budgets
  return {
    data: [
      { id: "b1", category: "Venue", estimated: 5000, actual: 5200 },
      { id: "b2", category: "Food & Drinks", estimated: 3000, actual: 2800 },
      { id: "b3", category: "Marketing", estimated: 1000, actual: 1000 },
      { id: "b4", category: "Audio/Visual", estimated: 1500, actual: 1650 },
    ]
  };
}
