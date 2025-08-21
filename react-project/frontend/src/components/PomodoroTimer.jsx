import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Coffee, Timer, Zap } from 'lucide-react';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('pomodoro'); // pomodoro, break, longBreak
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Initialize timer with current phase time
  useEffect(() => {
    updateTimerForPhase();
  }, [currentPhase, pomodoroTime, breakTime, longBreakTime]);

  const updateTimerForPhase = () => {
    let newTime;
    switch (currentPhase) {
      case 'pomodoro':
        newTime = pomodoroTime * 60;
        break;
      case 'break':
        newTime = breakTime * 60;
        break;
      case 'longBreak':
        newTime = longBreakTime * 60;
        break;
      default:
        newTime = pomodoroTime * 60;
    }
    setTimeLeft(newTime);
  };

  const handleTimerComplete = () => {
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    // Show browser notification
    if (Notification.permission === 'granted') {
      const phaseNames = {
        pomodoro: 'Pomodoro',
        break: 'Break',
        longBreak: 'Long Break'
      };
      new Notification(`Timer Complete!`, {
        body: `${phaseNames[currentPhase]} session finished.`,
        icon: '/favicon.png'
      });
    }

    // Show in-app notification
    showInAppNotification();

    // Update completed pomodoros
    if (currentPhase === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);
    }

    // Auto-advance to next phase
    advanceToNextPhase();
  };

  const showInAppNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'pomodoro-notification';
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.2rem;">🔔</span>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Timer Complete!</div>
          <div style="font-size: 0.9rem; opacity: 0.8;">${getPhaseName()} session finished.</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const advanceToNextPhase = () => {
    if (currentPhase === 'pomodoro') {
      // Check if it's time for a long break
      const shouldTakeLongBreak = (completedPomodoros + 1) % longBreakInterval === 0;
      setCurrentPhase(shouldTakeLongBreak ? 'longBreak' : 'break');
    } else {
      setCurrentPhase('pomodoro');
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    updateTimerForPhase();
  };

  const skipToNextPhase = () => {
    setIsRunning(false);
    advanceToNextPhase();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'pomodoro':
        return '#ef4444'; // red
      case 'break':
        return '#10b981'; // green
      case 'longBreak':
        return '#3b82f6'; // blue
      default:
        return '#ef4444';
    }
  };

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'pomodoro':
        return <Timer size={24} />;
      case 'break':
        return <Coffee size={24} />;
      case 'longBreak':
        return <Zap size={24} />;
      default:
        return <Timer size={24} />;
    }
  };

  const getPhaseName = () => {
    switch (currentPhase) {
      case 'pomodoro':
        return 'Focus Time';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  const requestNotificationPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="pomodoro-timer">
      {/* Audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>

      {/* Main Timer Display */}
      <div className="pomodoro-display">
        <div className="pomodoro-phase-info">
          <div className="phase-icon" style={{ color: getPhaseColor() }}>
            {getPhaseIcon()}
          </div>
          <div className="phase-name">{getPhaseName()}</div>
          <div className="completed-count">
            {completedPomodoros} of {longBreakInterval} completed
          </div>
        </div>

        <div 
          className={`pomodoro-time ${isRunning ? 'running' : ''}`}
          style={{ color: getPhaseColor() }}
        >
          {formatTime(timeLeft)}
        </div>

        <div className="pomodoro-progress">
          <div 
            className="progress-fill"
            style={{ 
              width: `${((getPhaseTime() - timeLeft) / getPhaseTime()) * 100}%`,
              backgroundColor: getPhaseColor()
            }}
          />
        </div>
      </div>

      {/* Timer Controls */}
      <div className="pomodoro-controls">
        {isRunning ? (
          <button className="pomodoro-btn pause" onClick={pauseTimer}>
            <Pause size={20} />
            Pause
          </button>
        ) : (
          <button className="pomodoro-btn start" onClick={startTimer}>
            <Play size={20} />
            Start
          </button>
        )}
        
        <button className="pomodoro-btn reset" onClick={resetTimer}>
          <RotateCcw size={20} />
          Reset
        </button>
        
        <button className="pomodoro-btn skip" onClick={skipToNextPhase}>
          Skip
        </button>
      </div>

      {/* Settings Button */}
      <button 
        className="pomodoro-settings-btn"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings size={18} />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="pomodoro-settings">
          <div className="settings-header">
            <h3>Pomodoro Settings</h3>
            <button 
              className="close-settings"
              onClick={() => setShowSettings(false)}
            >
              ×
            </button>
          </div>
          
          <div className="settings-content">
            <div className="setting-group">
              <label>Focus Time (minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={pomodoroTime}
                onChange={(e) => setPomodoroTime(parseInt(e.target.value) || 25)}
              />
            </div>
            
            <div className="setting-group">
              <label>Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={breakTime}
                onChange={(e) => setBreakTime(parseInt(e.target.value) || 5)}
              />
            </div>
            
            <div className="setting-group">
              <label>Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={longBreakTime}
                onChange={(e) => setLongBreakTime(parseInt(e.target.value) || 15)}
              />
            </div>
            
            <div className="setting-group">
              <label>Long Break Interval</label>
              <input
                type="number"
                min="1"
                max="10"
                value={longBreakInterval}
                onChange={(e) => setLongBreakInterval(parseInt(e.target.value) || 4)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getPhaseTime() {
    switch (currentPhase) {
      case 'pomodoro':
        return pomodoroTime * 60;
      case 'break':
        return breakTime * 60;
      case 'longBreak':
        return longBreakTime * 60;
      default:
        return pomodoroTime * 60;
    }
  }
};

export default PomodoroTimer; 