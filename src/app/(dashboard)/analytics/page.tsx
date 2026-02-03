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
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">Team performance and metrics</p>
      </div>

      {userStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{userStats.completedCount}</div>
            <div className="text-sm text-muted-foreground font-medium">Tasks Completed</div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{userStats.avgCycleTime}s</div>
            <div className="text-sm text-muted-foreground font-medium">Avg Cycle Time</div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {(userStats.reopenRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground font-medium">Reopen Rate</div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{userStats.wipCount}</div>
            <div className="text-sm text-muted-foreground font-medium">Work in Progress</div>
          </div>
        </div>
      )}

      <div className="bg-card/80 backdrop-blur-sm border border-border/50 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Team Leaderboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/50">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Avg Cycle Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Reopen Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border/50">
              {leaderboard?.slice(0, 10).map((user: any, index: number) => (
                <tr key={user.userId} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {index < 3 ? (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                          'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-muted-foreground w-8 text-center">#{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{user.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-foreground">{user.completedCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-foreground">{user.avgCycleTime}s</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      user.reopenRate < 0.1 ? 'bg-emerald-100 text-emerald-700' :
                      user.reopenRate < 0.3 ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {(user.reopenRate * 100).toFixed(1)}%
                    </span>
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
