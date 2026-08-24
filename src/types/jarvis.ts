export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface JarvisEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: "system" | "work" | "personal" | "task";
}

export interface TimelineItem {
  id: string;
  title: string;
  timestamp: string;
  type: "activity" | "task" | "event";
}

export interface JarvisState {
  tasks: Task[];
  events: JarvisEvent[];
  timeline: TimelineItem[];
}