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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">View and manage all tasks</p>
        </div>
        <Link
          href="/tasks/new"
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
        >
          + New Task
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/50">
              {tasks.map((task: any) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/tasks/${task.id}`)}
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                        {task.taskKey}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">{task.title}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {task.product?.colorTheme && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: task.product.colorTheme }}
                        />
                      )}
                      <span className="text-sm text-gray-900">{task.product?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                        task.priority === 'P0_CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : task.priority === 'P1_HIGH'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : task.priority === 'P2_MEDIUM'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {task.priority.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-medium">
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          task.assignee ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                      <span className="text-sm text-gray-900">
                        {task.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
