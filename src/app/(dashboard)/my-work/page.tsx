'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getUser } from '@/lib/auth';
import Link from 'next/link';

export default function MyWorkPage() {
  const user = getUser();
  const userId = user?.id;

  const { data: tasks } = useQuery({
    queryKey: ['my-tasks', userId],
    queryFn: () => apiClient.get<any>(`/tasks?assigneeId=${userId}`),
    enabled: !!userId,
  });

  const myTasks = tasks?.tasks || [];
  const activeTasks = myTasks.filter((t: any) => t.status === 'IN_PROGRESS');
  const blockedTasks = myTasks.filter((t: any) => t.status === 'BLOCKED');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Work</h1>
        <p className="text-muted-foreground mt-2">Tasks assigned to you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="flex items-center justify-between mb-4 mt-1">
            <h2 className="text-lg font-semibold text-foreground">Active Tasks</h2>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeTasks.map((task: any) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block p-3 hover:bg-accent rounded-lg border border-border hover:border-primary/50 transition-all group/item"
              >
                <div className="font-bold text-sm text-primary group-hover/item:underline">{task.taskKey}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.title}</div>
              </Link>
            ))}
            {activeTasks.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm">No active tasks</p>
              </div>
            )}
          </div>
        </div>

        {/* Blocked Tasks */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
          <div className="flex items-center justify-between mb-4 mt-1">
            <h2 className="text-lg font-semibold text-foreground">Blocked Tasks</h2>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {blockedTasks.map((task: any) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block p-3 hover:bg-accent rounded-lg border border-border hover:border-orange-500/50 transition-all group/item"
              >
                <div className="font-bold text-sm text-primary group-hover/item:underline">{task.taskKey}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.title}</div>
              </Link>
            ))}
            {blockedTasks.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm">No blocked tasks</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></div>
          <div className="flex items-center justify-between mb-4 mt-1">
            <h2 className="text-lg font-semibold text-foreground">Summary</h2>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                {myTasks.length}
              </div>
              <div className="text-sm text-muted-foreground font-medium">Total assigned tasks</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
              <div className="text-center p-3 rounded-lg bg-card/50">
                <div className="text-2xl font-bold text-foreground">{activeTasks.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Active</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-card/50">
                <div className="text-2xl font-bold text-foreground">{blockedTasks.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Blocked</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
