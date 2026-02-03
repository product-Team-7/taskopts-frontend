'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getUser } from '@/lib/auth';
import { formatDate, getPriorityColor } from '@/lib/utils';
import Link from 'next/link';

type UserRole = 'ADMIN' | 'PRODUCT_OWNER' | 'PRODUCT_MANAGER' | 'TEAM_MEMBER' | 'MARKETING' | 'VIEWER';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const user = getUser();
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'tasks'>('products');
  
  // Product state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    colorTheme: '#3b82f6',
  });

  // User state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    email: '',
    name: '',
    role: 'TEAM_MEMBER' as UserRole,
    password: '',
    skillsTags: '',
  });

  // Task state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskFormData, setTaskFormData] = useState({
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

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.get<any[]>('/products'),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get<any[]>('/users'),
    enabled: user?.role === 'ADMIN',
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient.get<any>('/tasks'),
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowCreateModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch(`/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', slug: '', colorTheme: '#3b82f6' });
  };

  const resetUserForm = () => {
    setUserFormData({
      email: '',
      name: '',
      role: 'TEAM_MEMBER',
      password: '',
      skillsTags: '',
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      colorTheme: product.colorTheme || '#3b82f6',
    });
    setShowCreateModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProduct(null);
    resetForm();
  };

  // User mutations
  const createUserMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowUserModal(false);
      resetUserForm();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      resetUserForm();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...userFormData,
      skillsTags: userFormData.skillsTags
        ? userFormData.skillsTags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
    };
    if (!data.password) {
      delete data.password; // Optional for MVP
    }
    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const data: any = {
        name: userFormData.name,
        role: userFormData.role,
        skillsTags: userFormData.skillsTags
          ? userFormData.skillsTags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
      };
      if (userFormData.password) {
        data.password = userFormData.password;
      }
      updateUserMutation.mutate({ id: editingUser.id, data });
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      password: '',
      skillsTags: user.skillsTags?.join(', ') || '',
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Are you sure you want to deactivate this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    resetUserForm();
  };

  // Task mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowTaskModal(false);
      resetTaskForm();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.patch(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
      resetTaskForm();
    },
  });

  const resetTaskForm = () => {
    setTaskFormData({
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
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      productId: taskFormData.productId,
      title: taskFormData.title,
      description: taskFormData.description || undefined,
      priority: taskFormData.priority,
      status: taskFormData.status,
      assigneeId: taskFormData.assigneeId || undefined,
      dueDate: taskFormData.dueDate || undefined,
      estimatePoints: taskFormData.estimatePoints ? parseInt(taskFormData.estimatePoints) : undefined,
      tags: taskFormData.tags
        ? taskFormData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : undefined,
      acceptanceCriteria: taskFormData.acceptanceCriteria
        ? taskFormData.acceptanceCriteria.split('\n').filter(Boolean)
        : undefined,
    };
    if (taskFormData.severity) {
      data.severity = taskFormData.severity;
    }
    createTaskMutation.mutate(data);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      const data: any = {
        title: taskFormData.title,
        description: taskFormData.description || undefined,
        priority: taskFormData.priority,
        status: taskFormData.status,
        assigneeId: taskFormData.assigneeId || undefined,
        dueDate: taskFormData.dueDate || undefined,
        estimatePoints: taskFormData.estimatePoints ? parseInt(taskFormData.estimatePoints) : undefined,
        tags: taskFormData.tags
          ? taskFormData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : undefined,
        acceptanceCriteria: taskFormData.acceptanceCriteria
          ? taskFormData.acceptanceCriteria.split('\n').filter(Boolean)
          : undefined,
      };
      if (taskFormData.severity) {
        data.severity = taskFormData.severity;
      }
      updateTaskMutation.mutate({ id: editingTask.id, data });
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setTaskFormData({
      productId: task.productId,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      severity: task.severity || '',
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatePoints: task.estimatePoints?.toString() || '',
      tags: task.tags?.join(', ') || '',
      acceptanceCriteria: task.acceptanceCriteria?.join('\n') || '',
    });
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    resetTaskForm();
  };

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-500 mt-1">Manage products, users, and system settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'products'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'users'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'tasks'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tasks
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Products</h2>
            <button
              onClick={() => {
                resetForm();
                setEditingProduct(null);
                setShowCreateModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              + Add Product
            </button>
          </div>

          {productsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading products...</div>
          ) : products && products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-5 border border-gray-200/50 rounded-xl hover:bg-gray-50/50 hover:border-gray-300/50 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-4">
                    {product.colorTheme && (
                      <div
                        className="w-4 h-4 rounded-full shadow-sm border border-gray-200"
                        style={{ backgroundColor: product.colorTheme }}
                      />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 font-medium">{product.slug}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No products found. Create your first product.</div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Users</h2>
            <button
              onClick={() => {
                resetUserForm();
                setEditingUser(null);
                setShowUserModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              + Add User
            </button>
          </div>

          {usersLoading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : users && users.length > 0 ? (
            <div className="space-y-3">
              {users.map((userItem: any) => (
                <div
                  key={userItem.id}
                  className={`p-5 border rounded-xl hover:bg-gray-50/50 hover:border-gray-300/50 flex items-center justify-between transition-all ${
                    !userItem.isActive ? 'opacity-60 border-gray-200/50' : 'border-gray-200/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {userItem.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {userItem.name}
                        {!userItem.isActive && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">Inactive</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">{userItem.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Role: <span className="font-semibold">{userItem.role.replace('_', ' ')}</span>
                        {userItem.skillsTags && userItem.skillsTags.length > 0 && (
                          <span className="ml-2">
                            • Skills: {userItem.skillsTags.slice(0, 2).join(', ')}
                            {userItem.skillsTags.length > 2 && ` +${userItem.skillsTags.length - 2}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditUser(userItem)}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(userItem.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      {userItem.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No users found. Create your first user.</div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
            <button
              onClick={() => {
                resetTaskForm();
                setEditingTask(null);
                setShowTaskModal(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              + Create Task
            </button>
          </div>

          {tasksLoading ? (
            <div className="text-center py-8 text-gray-500">Loading tasks...</div>
          ) : tasksData?.tasks && tasksData.tasks.length > 0 ? (
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200/50">
                  {tasksData.tasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="block"
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            Edit
                          </button>
                          <Link
                            href={`/tasks/${task.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No tasks found. Create your first task.</div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h3>

            <form onSubmit={editingProduct ? handleUpdate : handleCreate} className="space-y-4">
              {(createMutation.isError || updateMutation.isError) && (
                <div className="bg-red-50 border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : updateMutation.error instanceof Error
                    ? updateMutation.error.message
                    : 'An error occurred'}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder="e.g., Product A"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder="e.g., product-a"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Slug will be auto-formatted (lowercase, hyphens only)
                </p>
              </div>

              <div>
                <label htmlFor="colorTheme" className="block text-sm font-semibold text-gray-700 mb-2">
                  Color Theme
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    id="colorTheme"
                    value={formData.colorTheme}
                    onChange={(e) => setFormData({ ...formData, colorTheme: e.target.value })}
                    className="h-12 w-16 border border-gray-200 rounded-xl cursor-pointer shadow-sm"
                  />
                  <input
                    type="text"
                    value={formData.colorTheme}
                    onChange={(e) => setFormData({ ...formData, colorTheme: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingProduct
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Create/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              {(createUserMutation.isError || updateUserMutation.isError) && (
                <div className="bg-red-50 border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                  {createUserMutation.error instanceof Error
                    ? createUserMutation.error.message
                    : updateUserMutation.error instanceof Error
                    ? updateUserMutation.error.message
                    : 'An error occurred'}
                </div>
              )}

              {!editingUser && (
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    placeholder="user@example.com"
                  />
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  required
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="TEAM_MEMBER">Team Member</option>
                  <option value="PRODUCT_OWNER">Product Owner</option>
                  <option value="PRODUCT_MANAGER">Product Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password {!editingUser && <span className="text-gray-500 text-xs font-normal">(Optional)</span>}
                  {editingUser && <span className="text-xs text-gray-500 ml-2">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder={editingUser ? 'Enter new password (min 6 chars)' : 'Optional - defaults to "password123"'}
                  minLength={6}
                />
                {!editingUser && (
                  <p className="text-xs text-gray-500 mt-2">
                    If not provided, user will use default password: <span className="font-mono">password123</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="skillsTags" className="block text-sm font-semibold text-gray-700 mb-2">
                  Skills Tags
                </label>
                <input
                  type="text"
                  id="skillsTags"
                  value={userFormData.skillsTags}
                  onChange={(e) => setUserFormData({ ...userFormData, skillsTags: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder="react, typescript, nodejs (comma separated)"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Separate multiple skills with commas
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseUserModal}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {createUserMutation.isPending || updateUserMutation.isPending
                    ? 'Saving...'
                    : editingUser
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Create/Edit Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl border border-gray-200/50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>

            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
              {(createTaskMutation.isError || updateTaskMutation.isError) && (
                <div className="bg-red-50 border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                  {createTaskMutation.error instanceof Error
                    ? createTaskMutation.error.message
                    : updateTaskMutation.error instanceof Error
                    ? updateTaskMutation.error.message
                    : 'An error occurred'}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="taskProductId" className="block text-sm font-semibold text-gray-700 mb-2">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="taskProductId"
                    required
                    value={taskFormData.productId}
                    onChange={(e) => setTaskFormData({ ...taskFormData, productId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    disabled={!!editingTask}
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
                  <label htmlFor="taskPriority" className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="taskPriority"
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
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
                <label htmlFor="taskTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="taskTitle"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label htmlFor="taskDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="taskDescription"
                  rows={4}
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="taskStatus" className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="taskStatus"
                    value={taskFormData.status}
                    onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="READY">Ready</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="QA_TESTING">QA Testing</option>
                    <option value="DONE">Done</option>
                    <option value="REOPENED">Reopened</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="taskSeverity" className="block text-sm font-semibold text-gray-700 mb-2">
                    Severity (for bugs)
                  </label>
                  <select
                    id="taskSeverity"
                    value={taskFormData.severity}
                    onChange={(e) => setTaskFormData({ ...taskFormData, severity: e.target.value })}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="taskAssigneeId" className="block text-sm font-semibold text-gray-700 mb-2">
                    Assignee
                  </label>
                  <select
                    id="taskAssigneeId"
                    value={taskFormData.assigneeId}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assigneeId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Unassigned</option>
                    {users?.map((userItem: any) => (
                      <option key={userItem.id} value={userItem.id}>
                        {userItem.name} ({userItem.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="taskDueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="taskDueDate"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="taskEstimatePoints" className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimate Points
                  </label>
                  <input
                    type="number"
                    id="taskEstimatePoints"
                    min="1"
                    value={taskFormData.estimatePoints}
                    onChange={(e) => setTaskFormData({ ...taskFormData, estimatePoints: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    placeholder="e.g., 5"
                  />
                </div>

                <div>
                  <label htmlFor="taskTags" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="taskTags"
                    value={taskFormData.tags}
                    onChange={(e) => setTaskFormData({ ...taskFormData, tags: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    placeholder="e.g., frontend, bug, urgent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="taskAcceptanceCriteria" className="block text-sm font-semibold text-gray-700 mb-2">
                  Acceptance Criteria (one per line)
                </label>
                <textarea
                  id="taskAcceptanceCriteria"
                  rows={4}
                  value={taskFormData.acceptanceCriteria}
                  onChange={(e) => setTaskFormData({ ...taskFormData, acceptanceCriteria: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder="Enter acceptance criteria, one per line"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseTaskModal}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {createTaskMutation.isPending || updateTaskMutation.isPending
                    ? 'Saving...'
                    : editingTask
                    ? 'Update'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
