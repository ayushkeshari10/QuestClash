import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBattle } from '../context/BattleContext';
import { Trash2, Save } from 'lucide-react';

export default function Sketchpad() {
  const { currentUser } = useAuth();
  const { activeBattle, updateDoodle } = useBattle();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);

  if (!activeBattle) return null;

  const { playerA, playerB, playerC, doodleA, doodleB, doodleC } = activeBattle;
  
  // Resolve who I am and map participants
  const isPlayerA = playerA.id === currentUser?.id || playerA.username.toLowerCase() === currentUser?.username.toLowerCase();
  const isPlayerB = playerB && (playerB.id === currentUser?.id || playerB.username.toLowerCase() === currentUser?.username.toLowerCase());
  const isPlayerC = playerC && (playerC.id === currentUser?.id || playerC.username.toLowerCase() === currentUser?.username.toLowerCase());

  let myDoodle = '';
  let oppBDoodle = '';
  let oppCDoodle = '';
  let oppBName = 'Opponent 1';
  let oppCName = 'Opponent 2';

  if (isPlayerA) {
    myDoodle = doodleA;
    oppBDoodle = doodleB;
    oppCDoodle = doodleC;
    oppBName = playerB ? playerB.username : 'Opponent 1';
    oppCName = playerC ? playerC.username : 'Opponent 2';
  } else if (isPlayerB) {
    myDoodle = doodleB;
    oppBDoodle = doodleA;
    oppCDoodle = doodleC;
    oppBName = playerA.username;
    oppCName = playerC ? playerC.username : 'Opponent 2';
  } else if (isPlayerC) {
    myDoodle = doodleC;
    oppBDoodle = doodleA;
    oppCDoodle = doodleB;
    oppBName = playerA.username;
    oppCName = playerB ? playerB.username : 'Opponent 1';
  }

  // Initialize Canvas with existing drawing or white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 240;
    canvas.height = 150;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (myDoodle) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = myDoodle;
    }
  }, [canvasRef, myDoodle]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(e);

    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    updateDoodle(dataURL);
  };

  return (
    <div className="sketch-border sketchpad-container animate-fade-in">
      <div className="sketchpad-header">
        <h2>✍️ Arena Sketchpad</h2>
        <p className="sketchpad-subtitle">Doodle your focus or mood today!</p>
      </div>

      <div className="sketchpad-grid">
        {/* Draw Area */}
        <div className="sketchpad-panel sketch-border-subtle">
          <h3>My Board</h3>
          <div className="canvas-wrapper">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="doodle-canvas"
            />
          </div>

          <div className="canvas-controls">
            <div className="controls-group">
              <button onClick={() => setBrushSize(3)} className={`size-btn ${brushSize === 3 ? 'active' : ''}`}>✎</button>
              <button onClick={() => setBrushSize(8)} className={`size-btn ${brushSize === 8 ? 'active' : ''}`}>✏️</button>
            </div>
            
            <div className="controls-actions">
              <button onClick={clearCanvas} className="action-btn-danger">
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
              <button onClick={saveCanvas} className="action-btn-save">
                <Save size={12} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* View Area (Opponent B Doodle) */}
        <div className="sketchpad-panel sketch-border-subtle">
          <h3>{oppBName}'s Mood</h3>
          
          <div className="opponent-doodle-wrapper">
            {oppBDoodle ? (
              <img src={oppBDoodle} alt={`${oppBName}'s sketch`} className="opponent-doodle-img" />
            ) : (
              <div className="opponent-doodle-placeholder">Empty board...</div>
            )}
          </div>
        </div>

        {/* View Area (Opponent C Doodle) */}
        <div className="sketchpad-panel sketch-border-subtle">
          <h3>{oppCName}'s Mood</h3>
          
          <div className="opponent-doodle-wrapper">
            {oppCDoodle ? (
              <img src={oppCDoodle} alt={`${oppCName}'s sketch`} className="opponent-doodle-img" />
            ) : (
              <div className="opponent-doodle-placeholder">Empty board...</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sketchpad-container {
          background: var(--surface-color);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 20px;
        }

        .sketchpad-header {
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 6px;
        }

        .sketchpad-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .sketchpad-grid {
          display: flex;
          overflow-x: auto;
          gap: 16px;
          padding-bottom: 8px;
        }

        .sketchpad-panel {
          padding: 12px;
          background: var(--surface-color);
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
          flex: 0 0 auto;
          width: 270px;
        }

        .sketchpad-panel h3 {
          font-size: 13px;
          align-self: flex-start;
          border-bottom: 1.5px dashed #000;
          padding-bottom: 2px;
          margin-bottom: 4px;
        }

        .canvas-wrapper {
          border: 2px solid var(--border-color);
          background: var(--surface-color);
          border-radius: 6px;
          overflow: hidden;
          width: 240px;
          height: 150px;
          cursor: crosshair;
          box-shadow: 2px 2px 0px var(--border-color);
        }

        .doodle-canvas {
          display: block;
        }

        .canvas-controls {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          max-width: 240px;
        }

        .controls-group {
          display: flex;
          gap: 4px;
        }

        .size-btn {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 11px;
        }

        .size-btn.active {
          background: var(--text-primary);
          color: var(--bg-color);
        }

        .controls-actions {
          display: flex;
          gap: 6px;
        }

        .action-btn-danger, .action-btn-save {
          padding: 4px 6px;
          font-size: 10px;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .action-btn-danger:hover {
          background: var(--failed-glow);
        }

        .action-btn-save {
          background: var(--text-primary);
          color: var(--bg-color);
        }

        .opponent-doodle-wrapper {
          border: 2px solid var(--border-color);
          background: var(--surface-color);
          border-radius: 6px;
          box-shadow: 2px 2px 0px var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          width: 240px;
          height: 150px;
        }

        .opponent-doodle-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .opponent-doodle-placeholder {
          color: var(--text-muted);
          font-size: 11px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
