import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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

  const [expandedPieces, setExpandedPieces] = useState({});
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

  const toggleHistory = (pieceId) => {
    setExpandedPieces(prev => ({
      ...prev,
      [pieceId]: !prev[pieceId]
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
    <div className="h-screen bg-gray-100 overflow-hidden flex flex-col">
      {/* Fixed Header */}
      <div className="flex-none px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center max-w-screen-2xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Practice Tracker ({pieces.length}/10 pieces)</h1>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPieceName}
              onChange={(e) => setNewPieceName(e.target.value)}
              placeholder="New piece name"
              className="px-2 py-1 border rounded text-gray-900"
              disabled={pieces.length >= 10}
            />
            <button
              onClick={addPiece}
              disabled={pieces.length >= 10 || !newPieceName.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full">
          {pieces.map(piece => {
            const history = getPracticeHistory(piece.id);
            const isExpanded = expandedPieces[piece.id];
            return (
              <div key={piece.id} className="w-72 flex-none">
                <div className="bg-white rounded-lg shadow h-full flex flex-col">
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate flex-1">{piece.name}</h3>
                      <button
                        onClick={() => removePiece(piece.id)}
                        className="p-0.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Clock size={14} className="text-gray-600" />
                      <input
                        type="number"
                        min="1"
                        max="240"
                        className="w-14 px-1 py-0.5 border rounded text-gray-900 text-sm"
                        placeholder="Min"
                        value={practiceInputs[piece.id] || ''}
                        onChange={(e) => handleInputChange(piece.id, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, piece.id)}
                      />
                      <button
                        onClick={() => logPractice(piece.id)}
                        className="px-2 py-0.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      Today: {practiceLog[today]?.[piece.id] || 0} minutes
                    </div>
                  </div>
                  
                  <div className="p-3 flex-1">
                    <button
                      onClick={() => toggleHistory(piece.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Practice History
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        {history.map(entry => (
                          <div key={entry.date} className="py-1 text-sm text-gray-600 border-b border-gray-100 last:border-0">
                            {formatDate(entry.date)}: {entry.minutes} minutes
                          </div>
                        ))}
                        {history.length === 0 && (
                          <div className="text-sm text-gray-400">No practice history yet</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {pieces.length < 10 && (
            <div className="w-72 flex-none">
              <div className="h-full border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-400">Add a piece to practice</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeTracker;
