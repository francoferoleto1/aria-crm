import React from 'react';

const getDaysRemaining = (deadline) => {
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff < 0) return "Vencida hace " + Math.abs(diff) + " días";
  return diff + " días";
};

const formatARS = (amount) => "$" + Number(amount).toLocaleString("es-AR");

function TenderList({ tenders, onViewBriefing, onMarkInterested, onDiscard, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{
            background: '#f1f5f9',
            borderRadius: 12,
            height: 120
          }} />
        ))}
      </div>
    );
  }

  if (!tenders.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#64748b',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No hay licitaciones que coincidan con tus alertas.</div>
        <div style={{ fontSize: 14 }}>Configurá tus keywords para empezar.</div>
      </div>
    );
  }

  const getBorderColor = (score) => {
    if (score >= 0.8) return '#ef4444';
    if (score >= 0.5) return '#f59e0b';
    return '#9ca3af';
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: 16,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      {tenders.map((tender) => {
        const days = getDaysRemaining(tender.deadline);
        const isUrgent = days.includes('días') && parseInt(days) < 5 && !days.includes('Vencida');
        const isInterested = tender.match_status === 'interested';
        const isDiscarded = tender.match_status === 'discarded';

        return (
          <div key={tender.id} style={{
            background: '#fff',
            borderRadius: 12,
            borderLeft: `4px solid ${getBorderColor(tender.relevance_score)}`,
            padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,.08)',
            opacity: isDiscarded ? 0.5 : 1
          }}>
            {/* Fila superior */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{
                background: getBorderColor(tender.relevance_score),
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
                marginRight: 8
              }}>
                {Math.round(tender.relevance_score * 100)}%
              </span>
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#0f172a',
                flex: 1
              }}>
                {tender.title}
              </div>
            </div>

            {/* Fila media */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, fontSize: 13, color: '#64748b' }}>
              <span style={{ marginRight: 16 }}>🏛️ {tender.organism}</span>
              <span style={{ marginRight: 16 }}>💰 {formatARS(tender.amount)}</span>
              <span style={{ color: isUrgent ? '#ef4444' : '#64748b' }}>
                {isUrgent && '⚠️ '}📅 Cierre: {days}
              </span>
            </div>

            {/* Keywords */}
            {tender.keywords_matched && tender.keywords_matched.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {tender.keywords_matched.slice(0, 5).map((kw, i) => (
                  <span key={i} style={{
                    background: '#f1f5f9',
                    borderRadius: 20,
                    padding: '2px 10px',
                    fontSize: 11,
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onViewBriefing(tender)}
                style={{
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Ver briefing
              </button>
              {isInterested ? (
                <span style={{
                  padding: '8px 12px',
                  background: '#dcfce7',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  flex: 1,
                  textAlign: 'center'
                }}>
                  Interesada ✓
                </span>
              ) : (
                <>
                  <button
                    onClick={() => onMarkInterested(tender.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      color: '#16a34a',
                      border: '1px solid #16a34a',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Me interesa ✅
                  </button>
                  <button
                    onClick={() => onDiscard(tender.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      color: '#6b7280',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Descartar ❌
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TenderList;