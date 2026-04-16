'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { leads } from '@/lib/data';

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  Hot: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', dot: '#ef4444' },
  Warm: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', dot: '#f59e0b' },
  Cold: { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af', dot: '#9ca3af' },
};

const priorityConfig: Record<string, { bg: string; color: string }> = {
  High: { bg: 'rgba(239,68,68,0.08)', color: '#ef4444' },
  Medium: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b' },
  Low: { bg: 'rgba(107,114,128,0.08)', color: '#9ca3af' },
};

const stageConfig: Record<string, { bg: string; color: string; border: string }> = {
  Prospecting: { bg: 'rgba(107,114,128,0.08)', color: '#9ca3af', border: 'rgba(107,114,128,0.2)' },
  Qualified: { bg: 'rgba(59,126,255,0.08)', color: '#3b7eff', border: 'rgba(59,126,255,0.2)' },
  Proposal: { bg: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
  Negotiation: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  'Closed Won': { bg: 'rgba(16,185,129,0.08)', color: '#10b981', border: 'rgba(16,185,129,0.2)' },
  'Closed Lost': { bg: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' },
};

const sources = ['All', 'Referral', 'Website', 'Social Media', 'Cold Outreach', 'Events'];
const statuses = ['All', 'Hot', 'Warm', 'Cold'];
const stages = ['All', 'Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];
const priorities = ['All', 'High', 'Medium', 'Low'];

const pipelineStages = ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#9ca3af';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.3s ease' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color, minWidth: '28px', textAlign: 'right' }}>{score}</span>
    </div>
  );
}

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  const [sortBy, setSortBy] = useState('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const m = l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.assignedTo.toLowerCase().includes(q) || l.propertyType.toLowerCase().includes(q);
    return m &&
      (sourceFilter === 'All' || l.source === sourceFilter) &&
      (statusFilter === 'All' || l.status === statusFilter) &&
      (stageFilter === 'All' || l.stage === stageFilter) &&
      (priorityFilter === 'All' || l.priority === priorityFilter);
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
    if (sortBy === 'score') return (a.score - b.score) * dir;
    if (sortBy === 'date') return new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime() * dir;
    return 0;
  });

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: sortBy === col ? 1 : 0.3 }}>
      {sortBy === col && sortDir === 'desc' ? <polyline points="6 9 12 15 18 9" /> : <polyline points="18 15 12 9 6 15" />}
    </svg>
  );

  const hotLeads = leads.filter(l => l.status === 'Hot').length;
  const warmLeads = leads.filter(l => l.status === 'Warm').length;
  const pipeline = leads.reduce((s, l) => {
    const n = parseInt(l.budget.replace(/[^0-9.]/g, ''));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="page-enter">
      <Header title="Leads" subtitle={`${leads.length} total leads — ${hotLeads} hot, ${warmLeads} warm in pipeline`} />

      <div style={{ padding: '28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Leads', value: leads.length.toString(), color: '#3b7eff', icon: '📊' },
            { label: 'Hot Leads', value: hotLeads.toString(), color: '#ef4444', icon: '🔥' },
            { label: 'Warm Leads', value: warmLeads.toString(), color: '#f59e0b', icon: '☀️' },
            { label: 'Closed Won', value: leads.filter(l => l.stage === 'Closed Won').length.toString(), color: '#10b981', icon: '✅' },
            { label: 'In Negotiation', value: leads.filter(l => l.stage === 'Negotiation').length.toString(), color: '#8b5cf6', icon: '🤝' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{s.label}</p>
                <p className="font-display" style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', minWidth: '200px', maxWidth: '260px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }} />
            </div>

            {[
              { label: 'Source', value: sourceFilter, set: setSourceFilter, opts: sources },
              { label: 'Status', value: statusFilter, set: setStatusFilter, opts: statuses },
              { label: 'Stage', value: stageFilter, set: setStageFilter, opts: stages },
              { label: 'Priority', value: priorityFilter, set: setPriorityFilter, opts: priorities },
            ].map(f => (
              <select key={f.label} value={f.value} onChange={e => f.set(e.target.value)}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
                {f.opts.map(o => <option key={o} style={{ background: 'var(--bg-elevated)' }}>{o === 'All' ? `All ${f.label}s` : o}</option>)}
              </select>
            ))}

            {/* View toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              {([['table', 'Table'], ['pipeline', 'Pipeline']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setViewMode(v)}
                  style={{ padding: '8px 14px', background: viewMode === v ? 'var(--accent)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === v ? 'white' : 'var(--text-muted)', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s' }}>
                  {l}
                </button>
              ))}
            </div>

            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              New Lead
            </button>
          </div>

          {viewMode === 'table' ? (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px 16px', width: '40px' }}>
                        <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: 'var(--accent)' }} />
                      </th>
                      {[
                        { label: 'Lead', col: 'name' },
                        { label: 'Source', col: null },
                        { label: 'Property / Budget', col: null },
                        { label: 'Status', col: null },
                        { label: 'Priority', col: null },
                        { label: 'Stage', col: null },
                        { label: 'Score', col: 'score' },
                        { label: 'Assigned To', col: null },
                        { label: 'Last Contact', col: 'date' },
                        { label: 'Actions', col: null },
                      ].map(h => (
                        <th key={h.label} onClick={h.col ? () => toggleSort(h.col!) : undefined}
                          style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: h.col ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {h.label}
                            {h.col && <SortIcon col={h.col} />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead) => (
                      <tr key={lead.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: 'var(--accent)' }} />
                        </td>
                        <td style={{ padding: '14px 16px', minWidth: '200px' }}>
                          <div>
                            <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1px' }}>{lead.name}</p>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{lead.email}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{lead.phone}</p>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                            {lead.source}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', minWidth: '160px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>{lead.propertyType}</p>
                          <p style={{ fontSize: '11.5px', color: '#00d4aa', fontWeight: 600 }}>{lead.budget}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lead.location}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusConfig[lead.status]?.dot }} />
                            <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: statusConfig[lead.status]?.bg, color: statusConfig[lead.status]?.color }}>
                              {lead.status}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: priorityConfig[lead.priority]?.bg, color: priorityConfig[lead.priority]?.color }}>
                            {lead.priority}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: stageConfig[lead.stage]?.bg, color: stageConfig[lead.stage]?.color, border: `1px solid ${stageConfig[lead.stage]?.border}` }}>
                            {lead.stage}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', minWidth: '120px' }}>
                          <ScoreBar score={lead.score} />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>{lead.assignedTo}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.lastContact}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(59,126,255,0.08)', border: '1px solid rgba(59,126,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3b7eff' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#00d4aa' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                            <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f59e0b' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{leads.length}</strong> leads
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3].map(p => (
                    <button key={p} style={{ width: '30px', height: '30px', borderRadius: '6px', background: p === 1 ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border)', color: p === 1 ? 'white' : 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', fontWeight: p === 1 ? 700 : 400 }}>{p}</button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Pipeline view
            <div style={{ padding: '20px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: '14px', minWidth: `${pipelineStages.length * 260}px` }}>
                {pipelineStages.map(stage => {
                  const stageLeads = leads.filter(l => l.stage === stage);
                  const cfg = stageConfig[stage];
                  return (
                    <div key={stage} style={{ flex: '1', minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '10px 12px', background: cfg.bg, borderRadius: '10px', border: `1px solid ${cfg.border}` }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage}</span>
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: cfg.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: cfg.color }}>
                          {stageLeads.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stageLeads.map(lead => (
                          <div key={lead.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s' }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = cfg.color + '44';
                              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                            }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</p>
                              <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: statusConfig[lead.status]?.bg, color: statusConfig[lead.status]?.color }}>
                                {lead.status}
                              </span>
                            </div>
                            <p style={{ fontSize: '11.5px', color: '#00d4aa', fontWeight: 600, marginBottom: '6px' }}>{lead.budget}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>{lead.propertyType} · {lead.location.split(',')[0]}</p>
                            <ScoreBar score={lead.score} />
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{lead.assignedTo.split(' ')[0]} {lead.assignedTo.split(' ')[1]?.[0]}.</span>
                              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{lead.lastContact}</span>
                            </div>
                          </div>
                        ))}
                        {stageLeads.length === 0 && (
                          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', border: '2px dashed var(--border)', borderRadius: '10px' }}>
                            No leads
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}