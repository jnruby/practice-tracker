import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Plus, Trash2 } from 'lucide-react';

const PracticeTracker = () => {
  // Structure: { date: { pieceId: minutes } }
  const [practiceLog, setPracticeLog] = useState(() => {
    const saved = localStorage.getItem('practiceLog');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Structure: [{ id: string, name: string }]
  const [pieces, setPieces] = useState(() => {
    const saved = localStorage.getItem('pieces');
    return saved ? JSON.parse(saved) : [];
  });

  const [newPieceName, setNewPieceName] = useState('');
  const [practiceInputs, setPracticeInputs] = useState({});
  const today = new Date().toISOString().split('T')[0];

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
    
    // Clear the input after logging
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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Practice Tracker ({pieces.length}/10 pieces)</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPieceName}
              onChange={(e) => setNewPieceName(e.target.value)}
              placeholder="New piece name"
              className="px-2 py-1 border rounded"
              disabled={pieces.length >= 10}
            />
            <button
              onClick={addPiece}
              disabled={pieces.length >= 10 || !newPieceName.trim()}
              className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pieces.map(piece => (
            <div key={piece.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div className="flex-1">
                <h3 className="font-medium">{piece.name}</h3>
                <p className="text-sm text-gray-600">
                  Today: {practiceLog[today]?.[piece.id] || 0} minutes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <input
                    type="number"
                    min="1"
                    max="240"
                    className="w-16 px-2 py-1 border rounded"
                    placeholder="Min"
                    value={practiceInputs[piece.id] || ''}
                    onChange={(e) => handleInputChange(piece.id, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, piece.id)}
                  />
                  <button
                    onClick={() => logPractice(piece.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Add
                  </button>
                </div>
                <button
                  onClick={() => removePiece(piece.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {pieces.length === 0 && (
            <p className="text-center text-gray-500">
              Add pieces to start tracking your practice!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeTracker;
