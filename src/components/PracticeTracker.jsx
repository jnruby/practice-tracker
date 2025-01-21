import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  });
};

const PracticeTracker = () => {
  const [practiceLog, setPracticeLog] = useState(() => {
    const saved = localStorage.getItem('practiceLog');
    return saved ? JSON.parse(saved) : {};
  });

  const [pieces, setPieces] = useState(() => {
    const saved = localStorage.getItem('pieces');
    return saved ? JSON.parse(saved) : [];
  });

  const [newPieceName, setNewPieceName] = useState('');
  const [practiceInputs, setPracticeInputs] = useState({});
  const today = new Date().toISOString().split('T')[0];

  const getPracticeHistory = (pieceId) => {
    return Object.entries(practiceLog)
      .filter(([_, logs]) => logs[pieceId])
      .map(([date, logs]) => ({
        date,
        minutes: logs[pieceId]
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  useEffect(() => {
    localStorage.setItem('practiceLog', JSON.stringify(practiceLog));
  }, [practiceLog]);

  useEffect(() => {
    localStorage.setItem('pieces', JSON.stringify(pieces));
  }, [pieces]);

  const addPiece = () => {
    if (newPieceName.trim() && pieces.length < 10) {
      setPieces([...pieces, {
        id: Date.now().toString(),
        name: newPieceName.trim()
      }]);
      setNewPieceName('');
    }
  };

  const removePiece = (pieceId) => {
    setPieces(pieces.filter(p => p.id !== pieceId));
    setPracticeLog(prevLog => {
      const newLog = { ...prevLog };
      Object.keys(newLog).forEach(date => {
        delete newLog[date][pieceId];
      });
      return newLog;
    });
  };

  const logPractice = (pieceId) => {
    const minutes = practiceInputs[pieceId];
    if (!minutes || minutes <= 0) return;

    setPracticeLog(prevLog => {
      const todayLog = prevLog[today] || {};
      return {
        ...prevLog,
        [today]: {
          ...todayLog,
          [pieceId]: (todayLog[pieceId] || 0) + parseInt(minutes)
        }
      };
    });

    setPracticeInputs(prev => ({
      ...prev,
      [pieceId]: ''
    }));
  };

  const handleInputChange = (pieceId, value) => {
    setPracticeInputs(prev => ({
      ...prev,
      [pieceId]: value
    }));
  };

  const handleKeyPress = (e, pieceId) => {
    if (e.key === 'Enter') {
      logPractice(pieceId);
    }
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Header */}
      <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            Practice Tracker ({pieces.length}/10 pieces)
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newPieceName}
              onChange={(e) => setNewPieceName(e.target.value)}
              placeholder="New piece name"
              style={{ padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}
              disabled={pieces.length >= 10}
            />
            <button
              onClick={addPiece}
              disabled={pieces.length >= 10 || !newPieceName.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: pieces.length >= 10 || !newPieceName.trim() ? '#d1d5db' : '#3b82f6',
                color: 'white',
                borderRadius: '0.25rem',
                cursor: pieces.length >= 10 || !newPieceName.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Container */}
      <div style={{
        overflowX: 'auto',
        padding: '1rem',
        backgroundColor: '#f3f4f6',
        flex: '1',
        whiteSpace: 'nowrap'
      }}>
        <div style={{
          display: 'inline-flex',
          gap: '1rem',
          height: '100%'
        }}>
          {pieces.map(piece => (
            <div key={piece.id} style={{
              width: '300px',
              flexShrink: 0,
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              marginRight: '1rem',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}>
                    {piece.name}
                  </h3>
                  <button
                    onClick={() => removePiece(piece.id)}
                    style={{ color: '#ef4444', padding: '0.125rem' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <Clock size={14} style={{ color: '#6b7280' }} />
                  <input
                    type="number"
                    min="1"
                    max="240"
                    style={{
                      width: '3.5rem',
                      padding: '0.25rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                    placeholder="Min"
                    value={practiceInputs[piece.id] || ''}
                    onChange={(e) => handleInputChange(piece.id, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, piece.id)}
                  />
                  <button
                    onClick={() => logPractice(piece.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.875rem',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      borderRadius: '0.25rem'
                    }}
                  >
                    Add
                  </button>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Today: {practiceLog[today]?.[piece.id] || 0} minutes
                </div>
              </div>

              <div style={{ padding: '1rem', flex: 1 }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Practice History
                </div>
                <div style={{
                  maxHeight: '12rem',
                  overflowY: 'auto',
                  whiteSpace: 'normal'
                }}>
                  {getPracticeHistory(piece.id).map(entry => (
                    <div key={entry.date} style={{
                      padding: '0.25rem 0',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      {formatDate(entry.date)}: {entry.minutes} minutes
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {pieces.length < 10 && (
            <div style={{
              width: '300px',
              flexShrink: 0,
              border: '2px dashed #e5e7eb',
              borderRadius: '0.5rem',
              backgroundColor: '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              minHeight: '200px'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Add a piece to practice
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeTracker;
