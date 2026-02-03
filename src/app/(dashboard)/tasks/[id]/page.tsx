'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

export default function TaskDetailsPage() {
  const params = useParams();
  const taskId = params.id as string;
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => apiClient.get<any>(`/tasks/${taskId}`),
  });

  const { data: events } = useQuery({
    queryKey: ['task-events', taskId],
    queryFn: () => apiClient.get<any[]>(`/tasks/${taskId}/events`),
  });

  const { data: comments } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () => apiClient.get<any[]>(`/tasks/${taskId}/comments`),
  });

  const { data: timeEntries } = useQuery({
    queryKey: ['task-time', taskId],
    queryFn: () => apiClient.get<any[]>(`/tasks/${taskId}/time`),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      apiClient.post(`/tasks/${taskId}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      setComment('');
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  if (!task)
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Task not found</h2>
        <p className="text-gray-500">The task you're looking for doesn't exist.</p>
      </div>
    );

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      commentMutation.mutate(comment);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">{task.taskKey}</h1>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
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
        </div>
        <p className="text-gray-600 text-lg">{task.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{task.description || 'No description'}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              {events?.map((event: any) => (
                <div key={event.id} className="border-l-2 border-indigo-200 pl-4 py-2 hover:bg-gray-50/50 rounded-r-lg transition-colors">
                  <div className="text-sm font-semibold text-gray-900">{event.type.replace('_', ' ')}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {event.actor?.name} • {formatDate(event.occurredAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                rows={3}
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                disabled={commentMutation.isPending}
                className="mt-3 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
            <div className="space-y-4">
              {comments?.map((c: any) => (
                <div key={c.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-indigo-600">
                        {c.user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{c.user?.name}</div>
                      <div className="text-xs text-gray-500">{formatDate(c.createdAt)}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 ml-10">{c.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</dt>
                <dd className="text-sm font-medium text-gray-900">{task.status.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Priority</dt>
                <dd className="text-sm font-medium text-gray-900">{task.priority.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Assignee</dt>
                <dd className="text-sm font-medium text-gray-900">{task.assignee?.name || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Product</dt>
                <dd className="text-sm font-medium text-gray-900">{task.product?.name}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Entries</h2>
            <div className="space-y-3">
              {timeEntries?.map((entry: any) => (
                <div key={entry.id} className="text-sm p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">{entry.user?.name}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {formatDate(entry.startAt)} - {entry.endAt ? formatDate(entry.endAt) : 'Active'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Git Integration</h2>
            <p className="text-sm text-gray-500">Coming in Phase 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
