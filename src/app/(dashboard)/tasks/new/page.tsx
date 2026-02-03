'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function NewTaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    description: '',
    priority: 'P2_MEDIUM',
    status: 'BACKLOG',
    severity: '',
    assigneeId: '',
    dueDate: '',
    estimatePoints: '',
    tags: '',
    acceptanceCriteria: '',
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get<any[]>('/products'),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get<any[]>('/users').catch(() => []), // Fallback if endpoint doesn't exist
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/tasks', data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      router.push(`/tasks/${task.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: any = {
      productId: formData.productId,
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      status: formData.status,
      assigneeId: formData.assigneeId || undefined,
      dueDate: formData.dueDate || undefined,
      estimatePoints: formData.estimatePoints ? parseInt(formData.estimatePoints) : undefined,
      tags: formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : undefined,
      acceptanceCriteria: formData.acceptanceCriteria
        ? formData.acceptanceCriteria.split('\n').filter(Boolean)
        : undefined,
    };

    if (formData.severity) {
      taskData.severity = formData.severity;
    }

    createTaskMutation.mutate(taskData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-gray-500 mt-1">Add a new task to track work</p>
        </div>
        <Link
          href="/tasks"
          className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm rounded-xl p-8 space-y-6">
        {createTaskMutation.isError && (
          <div className="bg-red-50 border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm">
            {createTaskMutation.error instanceof Error
              ? createTaskMutation.error.message
              : 'Failed to create task'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="productId" className="block text-sm font-semibold text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              id="productId"
              name="productId"
              required
              value={formData.productId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Select a product</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            >
              <option value="P0_CRITICAL">P0 Critical</option>
              <option value="P1_HIGH">P1 High</option>
              <option value="P2_MEDIUM">P2 Medium</option>
              <option value="P3_LOW">P3 Low</option>
            </select>
          </div>
        </div>

        <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter task title"
          />
        </div>

        <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            >
              <option value="BACKLOG">Backlog</option>
              <option value="READY">Ready</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>

          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
              Severity (for bugs)
            </label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Not a bug</option>
              <option value="S0_BLOCKER">S0 Blocker</option>
              <option value="S1_CRITICAL">S1 Critical</option>
              <option value="S2_MAJOR">S2 Major</option>
              <option value="S3_MINOR">S3 Minor</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              value={formData.assigneeId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Unassigned</option>
              {users?.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="estimatePoints" className="block text-sm font-medium text-gray-700 mb-1">
              Estimate Points
            </label>
            <input
              type="number"
              id="estimatePoints"
              name="estimatePoints"
              min="1"
              value={formData.estimatePoints}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
              placeholder="e.g., 5"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
              placeholder="e.g., frontend, bug, urgent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="acceptanceCriteria" className="block text-sm font-medium text-gray-700 mb-1">
            Acceptance Criteria (one per line)
          </label>
          <textarea
            id="acceptanceCriteria"
            name="acceptanceCriteria"
            rows={4}
            value={formData.acceptanceCriteria}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter acceptance criteria, one per line"
          />
        </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Link
            href="/tasks"
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createTaskMutation.isPending}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
