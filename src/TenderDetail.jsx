import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const getDaysRemaining = (deadline) => {
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff < 0) return "Vencida hace " + Math.abs(diff) + " días";
  return diff + " días";
};

const formatARS = (amount) => "$" + Number(amount).toLocaleString("es-AR");

function TenderDetail({ tender, isOpen, onClose, onStatusChange, onAddToPipeline, onGenerateBriefing, briefingLoading }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const statusColor = tender.status === 'open' ? '#10b981' : '#ef4444';
  const days = getDaysRemaining(tender.deadline);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          maxWidth: 700,
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: 32,
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
          {tender.title}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColor,
              marginRight: 8
            }}
          />
          <span style={{ fontSize: 14, color: '#64748b', textTransform: 'capitalize' }}>
            {tender.status === 'open' ? 'Abierta' : 'Cerrada'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 24
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Organismo</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>🏛️ {tender.organism}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Monto</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>💰 {formatARS(tender.amount)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Fecha publicación</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>📅 {new Date(tender.publication_date).toLocaleDateString('es-AR')}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Fecha cierre</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>⏰ {new Date(tender.deadline).toLocaleDateString('es-AR')} ({days})</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Tipo de proceso</div>
            <div style={{ fontSize: 14, color: '#0f172a', textTransform: 'capitalize' }}>{tender.tender_type.replace('_', ' ')}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Relevancia</div>
            <div style={{
              width: '100%',
              height: 8,
              background: '#e5e7eb',
              borderRadius: 4,
              overflow: 'hidden',
              marginTop: 4
            }}>
              <div style={{
                width: `${tender.relevance_score * 100}%`,
                height: '100%',
                background: 'linear-gradient(135deg,#2563eb,#7c3aed)'
              }} />
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{Math.round(tender.relevance_score * 100)}%</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Briefing IA</h3>
          {tender.briefing_text ? (
            <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
              <ReactMarkdown>{tender.briefing_text}</ReactMarkdown>
            </div>
          ) : (
            <div>
              {briefingLoading ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                  ARIA está analizando esta licitación... ⏳
                </div>
              ) : (
                <button
                  onClick={() => onGenerateBriefing(tender.id)}
                  style={{
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Generar briefing con IA 🤖
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => onAddToPipeline(tender)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Agregar al Pipeline
          </button>
          <button
            onClick={() => window.open(tender.url, '_blank')}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Abrir en comprar.ar
          </button>
          <button
            onClick={() => onStatusChange(tender.id, 'discarded')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TenderDetail;