import { useCallback, useEffect, useMemo, useState } from "react";
import { DerivedTask, Metrics, Task } from "@/types";
import {
  computeAverageROI,
  computePerformanceGrade,
  computeRevenuePerHour,
  computeTimeEfficiency,
  computeTotalRevenue,
  withDerived,
  sortTasks,
} from "@/utils/logic";

interface UseTasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  derivedSorted: DerivedTask[];
  metrics: Metrics;
  lastDeleted: Task | null;
  addTask: (task: Omit<Task, "id"> & { id?: string }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  undoDelete: () => void;
  clearLastDeleted: () => void;
}

const INITIAL_METRICS: Metrics = {
  totalRevenue: 0,
  totalTimeTaken: 0,
  timeEfficiencyPct: 0,
  revenuePerHour: 0,
  averageROI: 0,
  performanceGrade: "Needs Improvement",
};

export function useTasks(): UseTasksState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);

  function normalizeTasks(input: any[]): Task[] {
    const now = Date.now();
    return (Array.isArray(input) ? input : []).map((t, idx) => {
      const createdAt = t.createdAt
        ? new Date(t.createdAt).toISOString()
        : new Date(now - idx * 86400000).toISOString();

      const timeTaken =
        Number.isFinite(t.timeTaken) && t.timeTaken > 0 ? t.timeTaken : 1;

      const revenue = Number.isFinite(t.revenue) ? t.revenue : 0;

      const completedAt =
        t.status === "Done"
          ? t.completedAt ?? new Date(createdAt).toISOString()
          : undefined;

      return {
        id: t.id,
        title: t.title,
        revenue,
        timeTaken,
        priority: t.priority,
        status: t.status,
        notes: t.notes,
        createdAt,
        completedAt,
      };
    });
  }

  // ✅ FIXED: StrictMode-safe fetch
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/tasks.json");
        if (!res.ok) throw new Error("Failed to load tasks");
        const data = normalizeTasks(await res.json());
        if (mounted) setTasks(data);
      } catch (e: any) {
        if (mounted) setError(e.message ?? "Failed to load tasks");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const derivedSorted = useMemo(() => {
    return sortTasks(tasks.map(withDerived));
  }, [tasks]);

  const metrics = useMemo<Metrics>(() => {
    if (!tasks.length) return INITIAL_METRICS;
    const avgROI = computeAverageROI(tasks);
    return {
      totalRevenue: computeTotalRevenue(tasks),
      totalTimeTaken: tasks.reduce((s, t) => s + t.timeTaken, 0),
      timeEfficiencyPct: computeTimeEfficiency(tasks),
      revenuePerHour: computeRevenuePerHour(tasks),
      averageROI: avgROI,
      performanceGrade: computePerformanceGrade(avgROI),
    };
  }, [tasks]);

  const addTask = useCallback((task: Omit<Task, "id"> & { id?: string }) => {
    setTasks((prev) => [
      ...prev,
      {
        ...task,
        id: task.id ?? crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        completedAt:
          task.status === "Done" ? new Date().toISOString() : undefined,
      },
    ]);
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...patch,
              completedAt:
                t.status !== "Done" && patch.status === "Done"
                  ? new Date().toISOString()
                  : t.completedAt,
            }
          : t
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id) ?? null;
      setLastDeleted(target);
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    setTasks((prev) => [...prev, lastDeleted]);
    setLastDeleted(null);
  }, [lastDeleted]);

  const clearLastDeleted = useCallback(() => {
    setLastDeleted(null);
  }, []);

  return {
    tasks,
    loading,
    error,
    derivedSorted,
    metrics,
    lastDeleted,
    addTask,
    updateTask,
    deleteTask,
    undoDelete,
    clearLastDeleted,
  };
}
