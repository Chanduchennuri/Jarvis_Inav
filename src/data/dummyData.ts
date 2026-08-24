import type { JarvisState } from "../types/jarvis";

export const initialJarvisState: JarvisState = {
  tasks: [
    {
      id: "task-1",
      title: "Finish Jarvis frontend",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "task-2",
      title: "Review project architecture",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "task-3",
      title: "Complete face authentication prototype",
      status: "completed",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
  ],

  events: [
    {
      id: "event-1",
      title: "Jarvis frontend initialized",
      description: "Initial application interface created.",
      timestamp: new Date().toISOString(),
      type: "system",
    },
    {
      id: "event-2",
      title: "Face verification tested",
      description: "Camera authentication prototype completed.",
      timestamp: new Date().toISOString(),
      type: "system",
    },
  ],

  timeline: [
    {
      id: "timeline-1",
      title: "Logged into Jarvis",
      timestamp: new Date().toISOString(),
      type: "activity",
    },
    {
      id: "timeline-2",
      title: "Face verification completed",
      timestamp: new Date().toISOString(),
      type: "activity",
    },
  ],
};