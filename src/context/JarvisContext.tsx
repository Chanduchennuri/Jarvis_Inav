import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { initialJarvisState } from "../data/dummyData";

import type {
  JarvisState,
  Task,
} from "../types/jarvis";

interface JarvisContextValue {
  state: JarvisState;

  createTask: (title: string) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const JarvisContext =
  createContext<JarvisContextValue | undefined>(
    undefined
  );

interface JarvisProviderProps {
  children: ReactNode;
}

export function JarvisProvider({
  children,
}: JarvisProviderProps) {
  const [state, setState] =
    useState<JarvisState>(initialJarvisState);

  const createTask = (title: string) => {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: cleanTitle,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setState((current) => ({
      ...current,

      tasks: [
        newTask,
        ...current.tasks,
      ],

      timeline: [
        {
          id: `timeline-${Date.now()}`,
          title: `Created task: ${cleanTitle}`,
          timestamp: new Date().toISOString(),
          type: "task",
        },
        ...current.timeline,
      ],
    }));
  };

  const completeTask = (id: string) => {
    setState((current) => ({
      ...current,

      tasks: current.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "completed",
              completedAt: new Date().toISOString(),
            }
          : task
      ),

      timeline: [
        {
          id: `timeline-${Date.now()}`,
          title: "Completed a task",
          timestamp: new Date().toISOString(),
          type: "task",
        },
        ...current.timeline,
      ],
    }));
  };

  const deleteTask = (id: string) => {
    setState((current) => ({
      ...current,

      tasks: current.tasks.filter(
        (task) => task.id !== id
      ),

      timeline: [
        {
          id: `timeline-${Date.now()}`,
          title: "Deleted a task",
          timestamp: new Date().toISOString(),
          type: "task",
        },
        ...current.timeline,
      ],
    }));
  };

  const value = useMemo(
    () => ({
      state,
      createTask,
      completeTask,
      deleteTask,
    }),
    [state]
  );

  return (
    <JarvisContext.Provider value={value}>
      {children}
    </JarvisContext.Provider>
  );
}

export function useJarvis() {
  const context = useContext(JarvisContext);

  if (!context) {
    throw new Error(
      "useJarvis must be used inside JarvisProvider"
    );
  }

  return context;
}