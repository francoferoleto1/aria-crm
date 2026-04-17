import React from 'react';

function TenderStats({ stats }) {
  const cards = [
    { label: 'Nuevas', value: stats.matches_new, color: '#3B82F6' },
    { label: 'En revisión', value: stats.matches_interested, color: '#F59E0B' },
    { label: 'Preparando', value: stats.matches_preparing, color: '#F97316' },
    { label: 'Enviadas', value: stats.matches_submitted, color: '#10B981' },
    { label: 'Ganadas', value: stats.matches_won, color: '#059669' },
    { label: 'Monto total', value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(stats.total_amount_open), color: '#6366F1' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 16,
      marginBottom: 24
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          background: '#fff',
          borderRadius: 12,
          borderTop: `3px solid ${card.color}`,
          boxShadow: '0 2px 8px rgba(0,0,0,.08)',
          padding: '20px 16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#0F172A',
            marginBottom: 4,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: 12,
            color: '#64748B',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '.06em',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
          }}>
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TenderStats;