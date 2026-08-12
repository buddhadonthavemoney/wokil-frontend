'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSiteAnalyticsOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Globe, QrCode, TrendingUp, Users } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#1B2B44', '#C5A059', '#4B5563', '#059669', '#4338ca'];

interface InsightsSectionProps {
  /**
   * Whether this account has Google Analytics turned on — `googleAnalyticsId`
   * on the profile for an individual, on the firm for a firm. When false the
   * section shows the enable prompt and never queries.
   */
  enabled: boolean;
}

/**
 * Website analytics for the dashboard: totals, traffic history and sources.
 *
 * Shared by the individual and firm dashboards. `GET /api/sites/analytics`
 * resolves the owner server-side, so the two callers differ only in where the
 * `enabled` flag is read from.
 */
export function InsightsSection({ enabled }: InsightsSectionProps) {
  const router = useRouter();

  const { data: analytics } = useQuery({
    ...getSiteAnalyticsOptions(),
    enabled,
    refetchInterval: 30000,
  });

  return (
    <section className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Insights</h2>
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-green-600" />
          Live Activity
        </div>
      </div>

      {!analytics && !enabled ? (
        <div className="bg-card border border-border rounded-xl p-10 md:p-16 text-center shadow-premium">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">Enable Site Analytics</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Get detailed insights about your visitors, page views, and traffic sources by enabling
            Google Analytics integration in Settings.
          </p>
          <Button size="lg" onClick={() => router.push('/settings')} className="px-8">
            Go to Settings
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-8 shadow-premium hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Total Views</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-bold">{analytics?.totalViews || 0}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 shadow-premium hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Unique Visitors</span>
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-3xl font-bold">{analytics?.visitors || 0}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 shadow-premium hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">QR Opens</span>
                <QrCode className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-bold">{analytics?.qrHovers || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Visitors who opened your contact QR</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 shadow-premium opacity-60">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Avg. Time</span>
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-3xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-2">Coming Soon</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-8 shadow-premium">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Traffic History
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.history || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="views" stroke="#1B2B44" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#1B2B44', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-premium">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Traffic Sources
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics?.sources || {}).map(([name, value]) => ({ name, value }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      {Object.entries(analytics?.sources || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
