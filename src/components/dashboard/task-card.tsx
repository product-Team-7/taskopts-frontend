'use client';

import { getPriorityColor, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getUser } from '@/lib/auth';

interface TaskCardProps {
  task: {
    id: string;
    taskKey: string;
    title: string;
    priority: string;
    status: string;
    product: { name: string; colorTheme?: string };
    assignee?: { name: string };
    createdAt: string;
    lastActivityAt: string;
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const user = getUser();

  const priorityColor = getPriorityColor(task.priority);
  const age = Math.floor(
    (new Date().getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  const handleAssignToMe = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await apiClient.post(`/tasks/${task.id}/assign`, {
        assigneeId: user.id,
        autoStartTimer: true,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Failed to assign task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await apiClient.post(`/tasks/${task.id}/complete`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyles = () => {
    switch (task.priority) {
      case 'P0_CRITICAL':
        return {
          border: 'border-l-red-500',
          badge: 'bg-red-50 text-red-700 border border-red-200',
        };
      case 'P1_HIGH':
        return {
          border: 'border-l-orange-500',
          badge: 'bg-orange-50 text-orange-700 border border-orange-200',
        };
      case 'P2_MEDIUM':
        return {
          border: 'border-l-blue-500',
          badge: 'bg-blue-50 text-blue-700 border border-blue-200',
        };
      default:
        return {
          border: 'border-l-gray-400',
          badge: 'bg-gray-50 text-gray-700 border border-gray-200',
        };
    }
  };

  const styles = getPriorityStyles();

  return (
    <div
      className={`group bg-white rounded-xl shadow-sm hover:shadow-md border-l-4 ${styles.border} p-5 transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            {task.taskKey}
          </div>
          <div className="flex items-center gap-2 mb-1">
            {task.product.colorTheme && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: task.product.colorTheme }}
              />
            )}
            <span className="text-xs text-gray-500 font-medium">{task.product.name}</span>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-md ${styles.badge} shrink-0`}
        >
          {task.priority.replace('_', ' ')}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
        {task.title}
      </h3>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              task.assignee ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          <span className="font-medium">
            {task.assignee ? task.assignee.name : 'Unassigned'}
          </span>
        </div>
        <span className="text-gray-400">{age}d ago</span>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        {!task.assignee && (
          <button
            onClick={handleAssignToMe}
            disabled={loading}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Assign to me
          </button>
        )}
        {task.status !== 'DONE' && (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
