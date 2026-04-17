import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase.js';
import TenderStats from './TenderStats.jsx';
import TenderList from './TenderList.jsx';
import TenderDetail from './TenderDetail.jsx';
import AlertsConfig from './AlertsConfig.jsx';

function TendersModule() {
  const [tenders, setTenders] = useState([]);
  const [stats, setStats] = useState({
    total_open: 0,
    matches_new: 0,
    matches_interested: 0,
    matches_preparing: 0,
    matches_submitted: 0,
    matches_won: 0,
    total_amount_open: 0,
    next_deadline: null
  });
  const [alerts, setAlerts] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: 'all', sortBy: 'relevance' });
  const [loading, setLoading] = useState(true);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTenders();
    fetchStats();
    fetchAlerts();
  }, []);

  const fetchTenders = async () => {
    const { data } = await supabase
      .from('public_tenders')
      .select('*, tender_matches(*)')
      .order('relevance_score', { ascending: false })
      .limit(50);
    setTenders(data || []);
    setLoading(false);
  };

  const fetchStats = async () => {
    // Total open tenders
    const { data: openTenders } = await supabase
      .from('public_tenders')
      .select('amount, deadline')
      .eq('status', 'open');
    const total_open = openTenders?.length || 0;
    const total_amount_open = openTenders?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const next_deadline = openTenders?.length ? openTenders.reduce((min, t) => t.deadline < min ? t.deadline : min, openTenders[0].deadline) : null;

    // Matches counts
    const { data: matches } = await supabase.from('tender_matches').select('status');
    const statusCounts = matches?.reduce((acc, m) => {
      acc[`matches_${m.status}`] = (acc[`matches_${m.status}`] || 0) + 1;
      return acc;
    }, {}) || {};

    setStats({
      total_open,
      total_amount_open,
      next_deadline,
      matches_new: statusCounts.matches_new || 0,
      matches_interested: statusCounts.matches_interested || 0,
      matches_preparing: statusCounts.matches_preparing || 0,
      matches_submitted: statusCounts.matches_submitted || 0,
      matches_won: statusCounts.matches_won || 0
    });
  };

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('tender_alerts')
      .select('*')
      .eq('active', true);
    setAlerts(data || []);
  };

  const filteredTenders = useMemo(() => {
    let filtered = tenders.filter(t => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!t.title.toLowerCase().includes(search) && !t.organism.toLowerCase().includes(search)) return false;
      }
      if (filters.status !== 'all') {
        const matchStatus = t.tender_matches?.[0]?.status;
        if (matchStatus !== filters.status) return false;
      }
      return true;
    });

    if (filters.sortBy === 'relevance') {
      filtered.sort((a, b) => b.relevance_score - a.relevance_score);
    } else if (filters.sortBy === 'deadline') {
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (filters.sortBy === 'amount') {
      filtered.sort((a, b) => b.amount - a.amount);
    }

    return filtered;
  }, [tenders, filters]);

  const handleViewBriefing = (tender) => {
    setSelectedTender(tender);
  };

  const handleMarkInterested = async (id) => {
    await supabase
      .from('tender_matches')
      .update({ status: 'interested', reviewed_at: new Date().toISOString() })
      .eq('tender_id', id);
    fetchTenders();
    fetchStats();
  };

  const handleDiscard = async (id) => {
    await supabase
      .from('tender_matches')
      .update({ status: 'discarded', reviewed_at: new Date().toISOString() })
      .eq('tender_id', id);
    fetchTenders();
    fetchStats();
  };

  const handleAddToPipeline = async (tender) => {
    await supabase.from('opportunities').insert({
      title: "Licitación: " + tender.title,
      source: "comprar.ar",
      stage: "qualification",
      estimated_value: tender.amount,
      close_date: tender.deadline
    });
    alert("Licitación agregada al pipeline");
  };

  const handleGenerateBriefing = async (id) => {
    setBriefingLoading(true);
    try {
      const response = await fetch("/api/tenders/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tender_id: id })
      });
      const data = await response.json();
      setTenders(prev => prev.map(t => t.id === id ? { ...t, briefing_text: data.briefing } : t));
    } catch (error) {
      console.error("Error generating briefing:", error);
    }
    setBriefingLoading(false);
  };

  const handleSaveAlert = async (alertData) => {
    setSaving(true);
    await supabase.from('tender_alerts').upsert(alertData);
    setSaving(false);
    fetchAlerts();
  };

  const handleDeleteAlert = async (id) => {
    await supabase.from('tender_alerts').update({ active: false }).eq('id', id);
    fetchAlerts();
  };

  return (
    <div style={{ padding: 24, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>🏛️ Licitaciones Públicas</h1>
        <button
          onClick={() => setShowAlerts(true)}
          style={{
            padding: '8px 16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          ⚙️ Configurar Alertas
        </button>
      </div>

      {/* Stats */}
      <TenderStats stats={stats} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Buscar licitación..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none'
          }}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          style={{
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none'
          }}
        >
          <option value="all">Todos</option>
          <option value="new">Nuevas</option>
          <option value="interested">Interesadas</option>
          <option value="preparing">Preparando</option>
          <option value="submitted">Enviadas</option>
          <option value="discarded">Descartadas</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          style={{
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none'
          }}
        >
          <option value="relevance">Relevancia</option>
          <option value="deadline">Fecha cierre</option>
          <option value="amount">Monto</option>
        </select>
      </div>

      {/* List */}
      <TenderList
        tenders={filteredTenders}
        onViewBriefing={handleViewBriefing}
        onMarkInterested={handleMarkInterested}
        onDiscard={handleDiscard}
        loading={loading}
      />

      {/* Modals */}
      <TenderDetail
        tender={selectedTender}
        isOpen={!!selectedTender}
        onClose={() => setSelectedTender(null)}
        onStatusChange={async (id, status) => {
          if (status === 'discarded') handleDiscard(id);
        }}
        onAddToPipeline={handleAddToPipeline}
        onGenerateBriefing={handleGenerateBriefing}
        briefingLoading={briefingLoading}
      />

      <AlertsConfig
        isOpen={showAlerts}
        onClose={() => setShowAlerts(false)}
        alerts={alerts}
        onSave={handleSaveAlert}
        onDelete={handleDeleteAlert}
        saving={saving}
      />
    </div>
  );
}

export default TendersModule;