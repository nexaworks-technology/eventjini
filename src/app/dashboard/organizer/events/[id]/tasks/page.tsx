import { getTasks } from "@/app/actions/os";
import TasksClient from "./tasks-client";

interface TasksPageProps {
  params: Promise<{ id: string }>;
}

export default async function TasksPage({ params }: TasksPageProps) {
  const resolvedParams = await params;
  const tasks = await getTasks(resolvedParams.id);

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full h-full flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">Tasks Kanban</h1>
      <TasksClient initialTasks={tasks || []} eventId={resolvedParams.id} />
    </div>
  );
}
