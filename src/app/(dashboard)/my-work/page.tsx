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
        <h1 className="text-3xl font-bold text-gray-900">My Work</h1>
        <p className="text-gray-500 mt-1">Tasks assigned to you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-1">Active Tasks</h2>
          <div className="space-y-2">
            {activeTasks.map((task: any) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
              >
                <div className="font-semibold text-sm text-gray-900">{task.taskKey}</div>
                <div className="text-sm text-gray-600 mt-1">{task.title}</div>
              </Link>
            ))}
            {activeTasks.length === 0 && (
              <p className="text-gray-500 text-sm py-4 text-center">No active tasks</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-1">Blocked Tasks</h2>
          <div className="space-y-2">
            {blockedTasks.map((task: any) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block p-3 hover:bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
              >
                <div className="font-semibold text-sm text-gray-900">{task.taskKey}</div>
                <div className="text-sm text-gray-600 mt-1">{task.title}</div>
              </Link>
            ))}
            {blockedTasks.length === 0 && (
              <p className="text-gray-500 text-sm py-4 text-center">No blocked tasks</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-1">All My Tasks</h2>
          <div className="text-4xl font-bold text-indigo-600 mb-1">{myTasks.length}</div>
          <div className="text-sm text-gray-600 font-medium">Total assigned</div>
        </div>
      </div>
    </div>
  );
}
