"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { updateTaskStatus, createTask } from "@/app/actions/os";
import { Plus } from "lucide-react";
import { FadeInUp } from "@/components/animations/motion";

interface Task {
  id: string;
  title: string;
  status: string;
}

const columns = ["To Do", "In Progress", "Done"];

export default function TasksClient({ initialTasks, eventId }: { initialTasks: Task[], eventId: string }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic update
    setTasks(prev => {
      const newTasks = [...prev];
      const taskIndex = newTasks.findIndex(t => t.id === draggableId);
      if (taskIndex !== -1) {
        newTasks[taskIndex].status = newStatus;
      }
      return newTasks;
    });

    await updateTaskStatus(draggableId, newStatus);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const title = newTaskTitle;
    setNewTaskTitle("");

    // Optimistic update
    const optimisticId = `temp-${Date.now()}`;
    const newTask = { id: optimisticId, title, status: "To Do" };
    setTasks(prev => [...prev, newTask]);

    const res = await createTask({ event_id: eventId, title, status: "To Do" });
    if (res) {
      setTasks(prev => prev.map(t => t.id === optimisticId ? (res as Task) : t));
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <FadeInUp className="mb-6">
        <form onSubmit={handleAddTask} className="flex gap-4">
          <input 
            type="text" 
            placeholder="New task title..." 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 max-w-sm px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <button type="submit" className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </form>
      </FadeInUp>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {columns.map(status => {
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="flex-1 min-w-[300px] flex flex-col bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 pl-2">
                  {status} <span className="text-slate-500 text-sm ml-2 font-normal">{columnTasks.length}</span>
                </h3>
                
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className="flex-1 flex flex-col gap-3 min-h-[150px]"
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 rounded-xl border border-white/10 transition-all ${snapshot.isDragging ? 'bg-cyan-500/20 border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'bg-white/5 hover:bg-white/10'}`}
                              style={{
                                ...provided.draggableProps.style,
                                backdropFilter: "blur(24px)",
                                WebkitBackdropFilter: "blur(24px)",
                              }}
                            >
                              <p className="text-slate-200 font-medium">{task.title}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
