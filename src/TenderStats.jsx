import React from 'react';

function TenderStats({ stats }) {
  const cards = [
    { label: 'Nuevas', value: stats.matches_new, borderColor: '#3B82F6' },
    { label: 'Interesadas', value: stats.matches_interested, borderColor: '#f59e0b' },
    { label: 'Preparando', value: stats.matches_preparing, borderColor: '#f97316' },
    { label: 'Enviadas', value: stats.matches_submitted, borderColor: '#22c55e' },
    { label: 'Ganadas', value: stats.matches_won, borderColor: '#16a34a' },
    { label: 'Monto abierto', value: '$' + new Intl.NumberFormat('es-AR').format(stats.total_amount_open), borderColor: '#6366F1' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          flex: '1 1 calc(16.66% - 12px)',
          background: '#fff',
          borderRadius: 12,
          borderTop: `3px solid ${card.borderColor}`,
          boxShadow: '0 2px 8px rgba(0,0,0,.08)',
          padding: 16,
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#0F172A',
            marginBottom: 4
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: 12,
            color: '#888',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '.06em'
          }}>
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TenderStats;