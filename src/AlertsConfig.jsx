import React, { useState, useEffect } from 'react';

function AlertsConfig({ isOpen, onClose, alerts, onSave, onDelete, saving }) {
  const [editingAlert, setEditingAlert] = useState(null);
  const [form, setForm] = useState({
    name: '',
    keywords: [],
    excluded_keywords: [],
    min_amount: '',
    max_amount: '',
    tender_types: []
  });

  useEffect(() => {
    if (editingAlert) {
      setForm({
        name: editingAlert.name || '',
        keywords: editingAlert.keywords || [],
        excluded_keywords: editingAlert.excluded_keywords || [],
        min_amount: editingAlert.min_amount || '',
        max_amount: editingAlert.max_amount || '',
        tender_types: editingAlert.tender_types || []
      });
    } else {
      setForm({
        name: '',
        keywords: [],
        excluded_keywords: [],
        min_amount: '',
        max_amount: '',
        tender_types: []
      });
    }
  }, [editingAlert]);

  const handleSave = () => {
    if (!form.name.trim() || form.keywords.length === 0) return;
    onSave(form);
    setEditingAlert(null);
  };

  const handleCancel = () => {
    setEditingAlert(null);
  };

  const addKeyword = (field, value) => {
    if (value.trim()) {
      setForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeKeyword = (field, index) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleKeyDown = (e, field) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      addKeyword(field, e.target.value);
      e.target.value = '';
    }
  };

  const toggleTenderType = (type) => {
    setForm(prev => ({
      ...prev,
      tender_types: prev.tender_types.includes(type)
        ? prev.tender_types.filter(t => t !== type)
        : [...prev.tender_types, type]
    }));
  };

  if (!isOpen) return null;

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
          maxWidth: 600,
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

        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
          Configurar Alertas
        </h2>

        {/* Lista de alertas existentes */}
        <div style={{ marginBottom: 24 }}>
          {alerts.map((alert) => (
            <div key={alert.id} style={{
              background: '#f8fafc',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{alert.name}</div>
                <div>
                  <button
                    onClick={() => setEditingAlert(alert)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 16,
                      marginRight: 8,
                      color: '#64748b'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(alert.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 16,
                      color: '#ef4444'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {alert.keywords.map((kw, i) => (
                  <span key={i} style={{
                    background: '#e2e8f0',
                    borderRadius: 20,
                    padding: '2px 8px',
                    fontSize: 12,
                    color: '#64748b'
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Monto: {alert.min_amount && alert.max_amount ? `Desde $${alert.min_amount} hasta $${alert.max_amount}` : 'Sin filtro de monto'}
              </div>
            </div>
          ))}
        </div>

        {/* Botón nueva alerta */}
        <button
          onClick={() => setEditingAlert({})}
          style={{
            width: '100%',
            padding: '12px',
            background: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: '#64748b',
            cursor: 'pointer',
            marginBottom: 24
          }}
        >
          + Nueva alerta
        </button>

        {/* Formulario */}
        {editingAlert !== null && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '.06em'
              }}>
                Nombre de la alerta
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#0f172a',
                  outline: 'none'
                }}
                placeholder="Ej: Licencias Microsoft"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '.06em'
              }}>
                Keywords (separadas por coma)
              </label>
              <input
                type="text"
                onKeyDown={(e) => handleKeyDown(e, 'keywords')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#0f172a',
                  outline: 'none',
                  marginBottom: 8
                }}
                placeholder="microsoft, office, 365"
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.keywords.map((kw, i) => (
                  <span key={i} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#e2e8f0',
                    borderRadius: 20,
                    padding: '2px 8px',
                    fontSize: 12,
                    color: '#64748b',
                    gap: 4
                  }}>
                    {kw}
                    <span
                      onClick={() => removeKeyword('keywords', i)}
                      style={{ cursor: 'pointer', color: '#64748b' }}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '.06em'
              }}>
                Excluir keywords (opcional)
              </label>
              <input
                type="text"
                onKeyDown={(e) => handleKeyDown(e, 'excluded_keywords')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#0f172a',
                  outline: 'none',
                  marginBottom: 8
                }}
                placeholder="competidor, marca específica"
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.excluded_keywords.map((kw, i) => (
                  <span key={i} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#e2e8f0',
                    borderRadius: 20,
                    padding: '2px 8px',
                    fontSize: 12,
                    color: '#64748b',
                    gap: 4
                  }}>
                    {kw}
                    <span
                      onClick={() => removeKeyword('excluded_keywords', i)}
                      style={{ cursor: 'pointer', color: '#64748b' }}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em'
                }}>
                  Monto mínimo
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    fontSize: 14
                  }}>
                    $
                  </span>
                  <input
                    type="number"
                    value={form.min_amount}
                    onChange={(e) => setForm(prev => ({ ...prev, min_amount: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 24px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em'
                }}>
                  Monto máximo
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    fontSize: 14
                  }}>
                    $
                  </span>
                  <input
                    type="number"
                    value={form.max_amount}
                    onChange={(e) => setForm(prev => ({ ...prev, max_amount: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 24px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                    placeholder="Sin límite"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '.06em'
              }}>
                Tipos de proceso
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {[
                  { value: 'licitacion_publica', label: 'Licitación pública' },
                  { value: 'contratacion_directa', label: 'Contratación directa' },
                  { value: 'concurso', label: 'Concurso' },
                  { value: 'subasta', label: 'Subasta' }
                ].map((type) => (
                  <label key={type.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.tender_types.includes(type.value)}
                      onChange={() => toggleTenderType(type.value)}
                      style={{ marginRight: 6 }}
                    />
                    <span style={{ fontSize: 14, color: '#0f172a' }}>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || form.keywords.length === 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: saving ? '#cbd5e1' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={handleCancel}
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
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div style={{
          marginTop: 24,
          padding: 16,
          background: '#f0f9ff',
          borderRadius: 8,
          fontSize: 12,
          color: '#0369a1'
        }}>
          💡 Keywords más específicas = mejores resultados. 'microsoft 365' es mejor que solo 'software'.
        </div>
      </div>
    </div>
  );
}

export default AlertsConfig;