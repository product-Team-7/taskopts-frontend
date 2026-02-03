'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Filters {
  productId: string;
  status: string;
  priority: string;
  assigneeId: string;
}

interface TaskFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get<any[]>('/products'),
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-5 rounded-xl shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Product
          </label>
          <select
            value={filters.productId}
            onChange={(e) => handleFilterChange('productId', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm transition-all"
          >
            <option value="">All Products</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm transition-all"
          >
            <option value="">All Statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="READY">Ready</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="QA_TESTING">QA Testing</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm transition-all"
          >
            <option value="">All Priorities</option>
            <option value="P0_CRITICAL">P0 Critical</option>
            <option value="P1_HIGH">P1 High</option>
            <option value="P2_MEDIUM">P2 Medium</option>
            <option value="P3_LOW">P3 Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Assignee
          </label>
          <input
            type="text"
            value={filters.assigneeId}
            onChange={(e) => handleFilterChange('assigneeId', e.target.value)}
            placeholder="User ID"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm transition-all"
          />
        </div>
      </div>
    </div>
  );
}
