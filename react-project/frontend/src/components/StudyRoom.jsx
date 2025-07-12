import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowLeft, BookOpen, HelpCircle, Target, RefreshCcw, BarChart2, MessageCircle, Play, Pause, RotateCcw, Settings, Coffee, Timer, Zap, FileText } from 'lucide-react';
import './StudyRoom.css';

const tools = [
  { icon: <BookOpen size={24} color="#7c83fd" />, label: 'Decks', route: '/study-room/decks', color: '#7c83fd' },
  { icon: <HelpCircle size={24} color="#4ecdc4" />, label: 'Quiz', route: '/quiz', color: '#4ecdc4' },
  { icon: <Target size={24} color="#3b82f6" />, label: 'Focus', route: '/focus', color: '#3b82f6' }, // blue
  { icon: <RefreshCcw size={24} color="#ffd93d" />, label: 'Review', route: '/review', color: '#ffd93d' },
  { icon: <BarChart2 size={24} color="#22c55e" />, label: 'Progress', route: '/progress', color: '#22c55e' }, // green
  { icon: <MessageCircle size={24} color="#4ECDC4" />, label: 'Ask NeuroNote', route: '/chat', color: '#06B6D4' },
];

const mockTasks = [
  { id: 1, text: 'Read Chapter 5: Neurotransmitters', done: false },
  { id: 2, text: 'Summarize lecture notes', done: false },
  { id: 3, text: 'Complete flashcard review', done: false },
  { id: 4, text: 'Practice quiz: Synapses', done: false },
];

const mockResources = [
  { id: 1, type: 'note', title: 'Neurotransmitters Summary', pinned: true },
  { id: 2, type: 'pdf', title: 'Lecture Slides.pdf', pinned: false },
  { id: 3, type: 'link', title: 'Khan Academy: Synapses', pinned: true },
  { id: 4, type: 'note', title: 'Quiz Review Notes', pinned: false },
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const phaseMeta = {
  pomodoro: { label: 'Focus', color: '#ef4444', icon: <Timer size={22} /> },
  break: { label: 'Short Break', color: '#10b981', icon: <Coffee size={22} /> },
  longBreak: { label: 'Long Break', color: '#3b82f6', icon: <Zap size={22} /> },
};

const StudyRoom = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(mockTasks);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [resources, setResources] = useState(mockResources);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Import modal state
  const [importStep, setImportStep] = useState('select'); // 'select' | 'input'
  const [selectedType, setSelectedType] = useState(null);
  const [importValue, setImportValue] = useState('');
  const [importFile, setImportFile] = useState(null);

  // Pomodoro timer state
  const [phase, setPhase] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [timeLeft, setTimeLeft] = useState(pomodoroTime * 60);

  useEffect(() => {
    setTimeLeft(
      phase === 'pomodoro' ? pomodoroTime * 60 :
      phase === 'break' ? breakTime * 60 :
      longBreakTime * 60
    );
  }, [phase, pomodoroTime, breakTime, longBreakTime]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      handleTimerComplete();
      return;
    }
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    if (phase === 'pomodoro') {
      setCompletedPomodoros(c => c + 1);
      if ((completedPomodoros + 1) % longBreakInterval === 0) {
        setPhase('longBreak');
      } else {
        setPhase('break');
      }
    } else {
      setPhase('pomodoro');
    }
    setIsRunning(false);
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(
      phase === 'pomodoro' ? pomodoroTime * 60 :
      phase === 'break' ? breakTime * 60 :
      longBreakTime * 60
    );
  };
  const handleSkip = () => {
    setIsRunning(false);
    if (phase === 'pomodoro') {
      if ((completedPomodoros + 1) % longBreakInterval === 0) {
        setPhase('longBreak');
      } else {
        setPhase('break');
      }
    } else {
      setPhase('pomodoro');
    }
  };

  const handleTaskToggle = (id) => {
    setTasks(tasks => tasks.map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  // Settings handlers
  const handleSettingsChange = (setter) => (e) => setter(Number(e.target.value));

  const handlePinToggle = (id) => {
    setResources(resources => resources.map(r =>
      r.id === id ? { ...r, pinned: !r.pinned } : r
    ));
  };

  const resourceTypes = [
    { key: 'note', label: 'Note', icon: <BookOpen color="#7c83fd" size={22} /> },
    { key: 'pdf', label: 'PDF', icon: <FileText color="#f56565" size={22} /> },
    { key: 'doc', label: 'Doc', icon: <FileText color="#ffd93d" size={22} /> },
    { key: 'link', label: 'Link', icon: <MessageCircle color="#4ecdc4" size={22} /> },
    { key: 'textbook', label: 'Textbook', icon: <BookOpen color="#22c55e" size={22} /> },
  ];

  const handleImportResource = (e) => {
    // For now, just close modal and reset
    setShowImportModal(false);
    setImportStep('select');
    setSelectedType(null);
    setImportValue('');
    setImportFile(null);
  };

  return (
    <div className="study-room">
      <div className="study-room-header">
        <div className="buttons-container">
            <div className="header-left">
            <button className="btn-ghost back-button" onClick={() => navigate('/night-owl-flashcards')}>
                <ArrowLeft size={20} />
                Back to Flashcards
            </button>
            </div>
            <div className="header-right">
                <div className="header-controls">
                    <button className="btn-ghost theme-toggle" onClick={() => setIsDarkMode((d) => !d)} aria-label="Toggle theme">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="btn-ghost" onClick={() => setShowPomodoro(s => !s)} title="Pomodoro Timer">
                      <Timer size={20} />
                    </button>
                    <button className="btn-ghost study-mode-toggle" onClick={() => setIsStudyMode((s) => !s)}>
                    {isStudyMode ? 'Exit Study Mode' : 'Enter Study Mode'}
                    </button>
                </div>
            </div>
        </div>
        
        <div className="header-center">
          <h1><span className="leaf-emoji">🌱</span>Study Room</h1>
        </div>
      </div>
      <div className="study-room-subtitle">
        Get started by choosing what study tool you'd like to work with today.
      </div>
      <div className="study-room-grid">
        {tools.map((tool, index) => (
          <div key={index} className="study-room-card" onClick={() => navigate(tool.route)} style={{ cursor: 'pointer' }}>
            {React.cloneElement(tool.icon, { color: tool.color })}
            <span>{tool.label}</span>
          </div>
        ))}
      </div>
      {/* Pinned Notes & Resources Section */}
      <div className="pinned-resources-section">
        <div className="pinned-resources-header">
          <h3>Pinned Notes & Resources</h3>
          <button 
            className="btn-ghost" 
            onClick={() => {
              setShowImportModal(true);
            }} 
            style={{ 
              fontSize: 15, 
              padding: '8px 18px',
              position: 'relative',
              zIndex: 1000,
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          >
            Import Resource
          </button>
        </div>
        <div className="pinned-resources-grid">
          {resources.map(resource => (
            <div key={resource.id} className={`pinned-resource-card${resource.pinned ? ' pinned' : ''}`}>
              <div className="pinned-resource-title">
                <span style={{ fontSize: 20 }}>
                  {resource.type === 'note' && <BookOpen color="#7c83fd" size={20} />}
                  {resource.type === 'pdf' && <FileText color="#f56565" size={20} />}
                  {resource.type === 'link' && <MessageCircle color="#4ecdc4" size={20} />}
                </span>
                {resource.title}
              </div>
              <button
                className="pinned-resource-pin-btn"
                onClick={() => handlePinToggle(resource.id)}
              >
                {resource.pinned ? 'Unpin' : 'Pin'}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Import Modal (placeholder) */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.55)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ background: '#23272f', borderRadius: 16, padding: 32, minWidth: 340, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, fontSize: 20 }}>Import Resource</h3>
            {importStep === 'select' && (
              <>
                <p style={{ color: '#a0aec0', fontSize: 15, marginBottom: 18 }}>Choose the type of resource to import:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                  {resourceTypes.map(rt => (
                    <button
                      key={rt.key}
                      className="btn-ghost"
                      style={{ minWidth: 90, minHeight: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 15, borderColor: selectedType === rt.key ? '#7c83fd' : '#2d3748', background: selectedType === rt.key ? '#18181b' : 'transparent', fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => { setSelectedType(rt.key); setImportStep('input'); }}
                    >
                      {rt.icon}
                      {rt.label}
                    </button>
                  ))}
                </div>
                <button className="btn-ghost" style={{ marginTop: 8 }} onClick={handleImportResource}>Cancel</button>
              </>
            )}
            {importStep === 'input' && selectedType && (
              <>
                <button className="btn-ghost" style={{ position: 'absolute', top: 18, right: 18, fontSize: 22 }} onClick={handleImportResource}>×</button>
                <button className="btn-ghost" style={{ marginBottom: 18 }} onClick={() => { setImportStep('select'); setSelectedType(null); setImportValue(''); setImportFile(null); }}>← Back</button>
                <div style={{ marginBottom: 18 }}>
                  <strong style={{ fontSize: 16 }}>{resourceTypes.find(rt => rt.key === selectedType)?.label}</strong>
                </div>
                {selectedType === 'note' && (
                  <textarea
                    placeholder="Paste or type your note here..."
                    value={importValue}
                    onChange={e => setImportValue(e.target.value)}
                    style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #2d3748', background: '#18181b', color: '#fff', padding: 12, marginBottom: 18 }}
                  />
                )}
                {(selectedType === 'pdf' || selectedType === 'doc') && (
                  <input
                    type="file"
                    accept={selectedType === 'pdf' ? '.pdf' : '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
                    onChange={e => setImportFile(e.target.files[0])}
                    style={{ marginBottom: 18, color: '#fff' }}
                  />
                )}
                {selectedType === 'link' && (
                  <input
                    type="url"
                    placeholder="Paste a link (https://...)"
                    value={importValue}
                    onChange={e => setImportValue(e.target.value)}
                    style={{ width: '100%', borderRadius: 8, border: '1px solid #2d3748', background: '#18181b', color: '#fff', padding: 12, marginBottom: 18 }}
                  />
                )}
                {selectedType === 'textbook' && (
                  <input
                    type="text"
                    placeholder="Enter textbook title or details..."
                    value={importValue}
                    onChange={e => setImportValue(e.target.value)}
                    style={{ width: '100%', borderRadius: 8, border: '1px solid #2d3748', background: '#18181b', color: '#fff', padding: 12, marginBottom: 18 }}
                  />
                )}
                <button className="btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={handleImportResource}>Import</button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Timer & Tasks Panel (toggleable modal) */}
      {showPomodoro && <div className="pomodoro-overlay" />}
      {showPomodoro && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: 420,
          height: '100vh',
          background: 'rgba(28,28,38,0.98)',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.25)',
          zIndex: 1002,
          padding: '32px 24px',
          overflowY: 'auto',
          borderLeft: '1.5px solid #23272f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'slideInRight 0.25s',
        }}>
          <button className="btn-ghost" style={{ position: 'absolute', top: 18, right: 18, zIndex: 1003 }} onClick={() => setShowPomodoro(false)}>
            ×
          </button>
          <div style={{ width: '100%', maxWidth: 380 }}>
            {/* Pomodoro timer panel content (copy from previous focus-timer-panel) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: phaseMeta[phase].color }}>{phaseMeta[phase].icon}</span>
                <span style={{ color: phaseMeta[phase].color, fontWeight: 600, fontSize: 18 }}>{phaseMeta[phase].label}</span>
                <span style={{ color: '#a0aec0', fontSize: 15, marginLeft: 8 }}>{completedPomodoros} / {longBreakInterval}</span>
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, color: phaseMeta[phase].color, letterSpacing: 2, fontFamily: 'Courier New, monospace', marginBottom: 8 }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: '100%', borderRadius: 3, background: phaseMeta[phase].color, width: `${100 - (timeLeft / (phase === 'pomodoro' ? pomodoroTime * 60 : phase === 'break' ? breakTime * 60 : longBreakTime * 60)) * 100}%`, transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                {isRunning ? (
                  <button className="pomodoro-btn" onClick={handlePause}><Pause size={18} />Pause</button>
                ) : (
                  <button className="pomodoro-btn" onClick={handleStart}><Play size={18} />Start</button>
                )}
                <button className="pomodoro-btn" onClick={handleReset}><RotateCcw size={18} />Reset</button>
                <button className="pomodoro-btn" onClick={handleSkip}>Skip</button>
                <button className="pomodoro-btn" onClick={() => setShowSettings(s => !s)}><Settings size={16} /></button>
              </div>
            </div>
            {showSettings && (
              <div className="pomodoro-settings" style={{ margin: '24px auto 0', maxWidth: 340, background: '#18181b', borderRadius: 16, border: '1px solid #23272f', color: '#fff', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Pomodoro Settings</h3>
                  <button className="pomodoro-btn" style={{ borderRadius: '50%', width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSettings(false)}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label>Focus Time (min)
                    <input type="number" min={1} max={120} value={pomodoroTime} onChange={handleSettingsChange(setPomodoroTime)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                  <label>Short Break (min)
                    <input type="number" min={1} max={30} value={breakTime} onChange={handleSettingsChange(setBreakTime)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                  <label>Long Break (min)
                    <input type="number" min={1} max={60} value={longBreakTime} onChange={handleSettingsChange(setLongBreakTime)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                  <label>Long Break Interval
                    <input type="number" min={1} max={10} value={longBreakInterval} onChange={handleSettingsChange(setLongBreakInterval)} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid #23272f', background: '#23272f', color: '#fff' }} />
                  </label>
                </div>
              </div>
            )}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 12, textAlign: 'left' }}>Today's Focus Tasks</h3>
              <ul className="focus-tasks-list">
                {tasks.map(task => (
                  <li key={task.id} className={`focus-task-item${task.done ? ' checked' : ''}`}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                      <input
                        type="checkbox"
                        className="focus-task-checkbox"
                        checked={task.done}
                        onChange={() => handleTaskToggle(task.id)}
                      />
                      <span className="focus-task-label">{task.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyRoom; 