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
      className={`group relative bg-card rounded-xl shadow-sm hover:shadow-lg border-l-4 ${styles.border} p-5 transition-all duration-200 hover:-translate-y-1 cursor-pointer overflow-hidden`}
      onClick={() => window.location.href = `/tasks/${task.id}`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
                {task.taskKey}
              </div>
              {task.product.colorTheme && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: task.product.colorTheme }}
                  />
                  <span className="text-xs text-muted-foreground font-medium">{task.product.name}</span>
                </div>
              )}
            </div>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${styles.badge} shrink-0 shadow-sm`}
          >
            {task.priority.replace('_', ' ')}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-4 line-clamp-2 leading-relaxed text-pretty">
          {task.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[10px] font-semibold shadow-sm">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-foreground/80">
                  {task.assignee.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-dashed border-muted-foreground/50 rounded-full"></div>
                </div>
                <span className="font-medium text-muted-foreground">
                  Unassigned
                </span>
              </div>
            )}
          </div>
          <span className="text-muted-foreground/70">{age}d ago</span>
        </div>

        <div className="flex gap-2 pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
          {!task.assignee && (
            <button
              onClick={handleAssignToMe}
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Assign to me
            </button>
          )}
          {task.status !== 'DONE' && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Mark Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
