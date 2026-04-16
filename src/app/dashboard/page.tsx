'use client';

import Header from '@/components/layout/Header';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  statsData, revenueChartData, leadsBySourceData,
  dealsPipelineData, weeklyActivityData, recentActivities
} from '@/lib/data';

function StatCard({ label, value, change, changeType, icon, accent }: {
  label: string; value: string; change: string; changeType: 'up' | 'down';
  icon: React.ReactNode; accent: string;
}) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '22px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease',
    }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent + '44'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: accent + '10', filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            {label}
          </p>
          <p className="font-display animate-countup" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {value}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              fontSize: '12px', fontWeight: 600,
              color: changeType === 'up' ? 'var(--success)' : 'var(--danger)',
            }}>
              {changeType === 'up' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              )}
              {change}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>vs last month</span>
          </div>
        </div>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: accent + '15', border: `1px solid ${accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>{label}</p>
        {payload.map((item) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{item.name}:</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {item.name.includes('revenue') || item.name.includes('target')
                ? '$' + (item.value / 1000).toFixed(0) + 'K'
                : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const fmt = (n: number) => n >= 1000000
    ? '$' + (n / 1000000).toFixed(2) + 'M'
    : n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'K' : n.toString();

  return (
    <div className="page-enter">
      <Header title="Dashboard" subtitle="Welcome back, Alexandra — here's what's happening today" />

      <div style={{ padding: '28px', flex: 1 }}>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard
            label="Total Revenue"
            value={fmt(statsData.totalRevenue)}
            change={`${statsData.revenueGrowth}%`}
            changeType="up"
            accent="#3b7eff"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
          />
          <StatCard
            label="Total Leads"
            value={statsData.totalLeads.toLocaleString()}
            change={`${statsData.leadsGrowth}%`}
            changeType="up"
            accent="#00d4aa"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>}
          />
          <StatCard
            label="Closed Deals"
            value={statsData.closedDeals.toString()}
            change={`${statsData.dealsGrowth}%`}
            changeType="up"
            accent="#f59e0b"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
          />
          <StatCard
            label="Active Users"
            value={statsData.activeUsers.toString()}
            change={`${statsData.usersGrowth}%`}
            changeType="up"
            accent="#8b5cf6"
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
          />
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', marginBottom: '16px' }}>
          {/* Revenue Area Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Revenue vs Target</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Full year performance overview</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '3px', background: '#3b7eff', borderRadius: '2px' }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Revenue</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {/* ✅ FIXED: Removed duplicate height property */}
                  <div style={{ width: '10px', height: '3px', background: '#00d4aa', borderRadius: '2px', opacity: 0.6 }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b7eff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b7eff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tgtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => '$' + (v / 1000) + 'K'} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#3b7eff" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#3b7eff', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="target" stroke="#00d4aa" strokeWidth={2} strokeDasharray="5 4" fill="url(#tgtGrad)" dot={false} activeDot={{ r: 5, fill: '#00d4aa', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by Source Pie */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Leads by Source</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Distribution overview</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={leadsBySourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" strokeWidth={0} paddingAngle={3}>
                  {leadsBySourceData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {leadsBySourceData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Pipeline Bar */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Deals Pipeline</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Deals by stage count</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dealsPipelineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="stage" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {dealsPipelineData.map((_, idx) => (
                    <Cell key={idx} fill={['#3b7eff', '#5b8fff', '#00d4aa', '#f59e0b', '#10b981'][idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Activity */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Weekly Activity</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Calls, emails & meetings</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyActivityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={3} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)' }} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
                <Bar dataKey="calls" fill="#3b7eff" radius={[3, 3, 0, 0]} />
                <Bar dataKey="emails" fill="#00d4aa" radius={[3, 3, 0, 0]} />
                <Bar dataKey="meetings" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row: Secondary stats + Recent Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>
          {/* KPI mini cards */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <h3 className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Key Performance Indicators</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Conversion Rate', value: `${statsData.conversionRate}%`, sub: 'Leads to deals', color: '#3b7eff' },
                { label: 'Avg. Deal Size', value: '$185K', sub: 'Per closed deal', color: '#00d4aa' },
                { label: 'Active Listings', value: '94', sub: 'Across all realtors', color: '#f59e0b' },
                { label: 'Avg. Response Time', value: '1.4h', sub: 'Lead response', color: '#8b5cf6' },
                { label: 'Client Satisfaction', value: '4.8/5', sub: 'NPS score', color: '#10b981' },
                { label: 'Monthly Target', value: '87%', sub: 'Q1 progress', color: '#ef4444' },
              ].map((kpi) => (
                <div key={kpi.label} style={{
                  padding: '16px', borderRadius: '10px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</p>
                  <p className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: kpi.color, marginBottom: '2px' }}>{kpi.value}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{kpi.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</h3>
              <button style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recentActivities.map((activity, idx) => (
                <div key={activity.id} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '12px 0',
                  borderBottom: idx < recentActivities.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                    background: activity.type === 'deal_closed' ? 'rgba(16,185,129,0.12)' :
                      activity.type === 'lead_added' ? 'rgba(59,126,255,0.12)' : 'rgba(245,158,11,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: activity.type === 'deal_closed' ? '#10b981' :
                      activity.type === 'lead_added' ? '#3b7eff' : '#f59e0b',
                  }}>
                    {activity.type === 'deal_closed' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>}
                    {activity.type === 'lead_added' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>}
                    {(activity.type === 'meeting' || activity.type === 'proposal' || activity.type === 'note') && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activity.action}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {activity.user} · {activity.time}
                    </p>
                  </div>
                  {activity.amount && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', flexShrink: 0 }}>{activity.amount}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}