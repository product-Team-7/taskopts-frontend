'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getUser } from '@/lib/auth';

export default function AnalyticsPage() {
  const user = getUser();

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiClient.get<any[]>('/analytics/leaderboard'),
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-analytics', user?.id],
    queryFn: () => apiClient.get<any>(`/analytics/user/${user?.id}`),
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Team performance and metrics</p>
      </div>

      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.completedCount}</div>
            <div className="text-sm text-gray-600 font-medium">Completed</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.avgCycleTime}s</div>
            <div className="text-sm text-gray-600 font-medium">Avg Cycle Time</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {(userStats.reopenRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 font-medium">Reopen Rate</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{userStats.wipCount}</div>
            <div className="text-sm text-gray-600 font-medium">WIP</div>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Avg Cycle Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reopen Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/50">
              {leaderboard?.slice(0, 10).map((user: any, index: number) => (
                <tr key={user.userId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {user.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.completedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.avgCycleTime}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(user.reopenRate * 100).toFixed(1)}%
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
