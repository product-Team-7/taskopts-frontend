'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { TaskCard } from '@/components/dashboard/task-card';
import { TaskFilters } from '@/components/dashboard/filters';
import { useState } from 'react';

interface Task {
  id: string;
  taskKey: string;
  title: string;
  priority: string;
  status: string;
  product: { name: string; colorTheme?: string };
  assignee?: { name: string };
  createdAt: string;
  lastActivityAt: string;
}

interface TasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    productId: '',
    status: '',
    priority: '',
    assigneeId: '',
  });

  const { data, isLoading, error } = useQuery<TasksResponse>({
    queryKey: ['tasks', filters],
    queryFn: () =>
      apiClient.get<TasksResponse>(
        `/tasks?${new URLSearchParams(
          Object.entries(filters).filter(([_, v]) => v !== ''),
        ).toString()}`,
      ),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading tasks</h3>
        <p className="text-gray-500">Please try refreshing the page.</p>
      </div>
    );
  }

  const tasks = data?.tasks || [];

  // Sort by priority then last activity
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      P0_CRITICAL: 0,
      P1_HIGH: 1,
      P2_MEDIUM: 2,
      P3_LOW: 3,
    };
    const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and track your tasks</p>
        </div>
      </div>

      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">Create your first task to get started.</p>
        </div>
      )}
    </div>
  );
}
