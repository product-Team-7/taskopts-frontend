'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { getPriorityColor, formatDate } from '@/lib/utils';

export default function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.get<any>('/tasks'),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );

  const tasks = data?.tasks || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-2">View and manage all tasks</p>
        </div>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg font-semibold text-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </Link>
      </div>

      <div className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/50">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border/50">
              {tasks.map((task: any) => (
                <tr
                  key={task.id}
                  className="hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => (window.location.href = `/tasks/${task.id}`)}
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-sm font-bold text-primary group-hover:underline">
                        {task.taskKey}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{task.title}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {task.product?.colorTheme && (
                        <div
                          className="w-2 h-2 rounded-full shadow-sm"
                          style={{ backgroundColor: task.product.colorTheme }}
                        />
                      )}
                      <span className="text-sm text-foreground font-medium">{task.product?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border shadow-sm ${
                        task.priority === 'P0_CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : task.priority === 'P1_HIGH'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : task.priority === 'P2_MEDIUM'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {task.priority.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted/50">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        task.status === 'DONE' ? 'bg-emerald-500' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        task.status === 'BLOCKED' ? 'bg-red-500' :
                        'bg-muted-foreground'
                      }`}></div>
                      <span className="text-sm text-foreground font-medium">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {task.assignee ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[10px] font-semibold shadow-sm">
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-foreground font-medium">
                            {task.assignee.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-dashed border-muted-foreground/50 rounded-full"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Unassigned
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(task.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
