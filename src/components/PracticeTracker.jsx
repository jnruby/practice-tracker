import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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

  // Get practice history for a piece
  const getPracticeHistory = (pieceId) => {
    return Object.entries(practiceLog)
      .filter(([_, logs]) => logs[pieceId])
      .map(([date, logs]) => ({
        date,
        minutes: logs[pieceId]
      }))
      .sort((a, b) => b.date.localeCompare(a.date));  // Sort newest first
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
    <Card className="w-full max-w-4xl bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-gray-900">
          <span>Practice Tracker ({pieces.length}/10 pieces)</span>
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {pieces.map(piece => {
            const history = getPracticeHistory(piece.id);
            const isExpanded = expandedPieces[piece.id];
            return (
              <div key={piece.id} className="bg-gray-50 rounded overflow-hidden">
                <div className="flex items-center justify-between p-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{piece.name}</h3>
                      <button
                        onClick={() => toggleHistory(piece.id)}
                        className="p-0.5 text-gray-500 hover:bg-gray-200 rounded"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Today: {practiceLog[today]?.[piece.id] || 0} minutes
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <div className="flex items-center gap-1">
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
                    <button
                      onClick={() => removePiece(piece.id)}
                      className="p-0.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {isExpanded && history.length > 0 && (
                  <div className="border-t border-gray-200 bg-white">
                    <div className="max-h-32 overflow-y-auto">
                      {history.map(entry => (
                        <div key={entry.date} className="px-4 py-1 text-sm border-b border-gray-100 text-gray-600">
                          {formatDate(entry.date)}: {entry.minutes} minutes
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {pieces.length === 0 && (
            <p className="text-center text-gray-500">
              Add pieces to start tracking your practice!
            </p>
          )}
          
          {/* Empty slots to show total capacity */}
          {pieces.length < 10 && Array.from({ length: 10 - pieces.length }).map((_, index) => (
            <div key={`empty-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded border-2 border-dashed border-gray-200">
              <div className="flex-1">
                <p className="text-sm text-gray-400">Empty slot</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeTracker;
