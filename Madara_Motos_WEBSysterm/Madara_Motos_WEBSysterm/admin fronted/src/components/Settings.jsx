import React, { useState, useEffect, useCallback } from 'react';
import { 
  Palette, Bell, Keyboard, MonitorSmartphone, 
  Zap, Volume2, VolumeX, CheckCircle2, LayoutGrid
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [showToast, setShowToast] = useState(false);

  
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'dark');

  // 🟢 App Preferences State
  const [preferences, setPreferences] = useState({
    animations: true,
    compactTables: false,
    soundEffects: true,
    notifications: true
  });

  // 1. Load from LocalStorage on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('madaraAppPrefs');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  
  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  // 🔊 3. Generate a small Beep sound
  const playBeep = useCallback((forcePlay = false) => {
    const currentPrefs = JSON.parse(localStorage.getItem('madaraAppPrefs')) || preferences;
    if (!currentPrefs.soundEffects && !forcePlay) return;

    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1); 
    } catch (e) {
      console.warn("Audio Context not supported");
    }
  }, [preferences.soundEffects]);

  // 4. Toggle & Save Preferences
  const handleToggle = useCallback((key) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: !prev[key] };
      localStorage.setItem('madaraAppPrefs', JSON.stringify(newPrefs));
      
      if (key === 'soundEffects' && newPrefs[key]) {
        playBeep(true); 
      } else {
        playBeep();
      }

      return newPrefs;
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, [playBeep]);

  // 🚪 5. Handle Logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    window.location.href = "/login"; 
  }, []);

  // ❌ 6. Handle Exit App
  const handleExitApp = useCallback(() => {
    if (window.confirm("Are you sure you want to close the dashboard?")) {
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      
      try { 
        window.close(); 
      } catch (e) {
        window.location.href = "/login";
      } 
    }
  }, []);

  // ⌨️ 7. Keyboard Shortcuts Event Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'a') {
          e.preventDefault();
          handleToggle('animations');
        }
        if (key === 'm') {
          e.preventDefault();
          handleToggle('soundEffects');
        }
        if (key === 'l') {
          e.preventDefault();
          handleLogout();
        }
        if (key === 'x') {
          e.preventDefault();
          handleExitApp();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggle, handleLogout, handleExitApp]);

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* 🟢 Main Background Container - Hardcoded #080808 removed, uses var(--bg-main) */}
      <div className="w-full min-h-screen p-5 md:p-8 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-main)', fontFamily: "'Inter', sans-serif" }}>
        
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">

          <div className="mb-8" style={{ animation: preferences.animations ? 'fadeIn 0.6s ease forwards' : 'none' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-gradient-to-r from-orange-500 to-transparent" />
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Local Preferences</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                {/* 🟢 Title Color updated to dynamic variable */}
                <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3" style={{ color: 'var(--text-main)' }}>
                  App Settings
                </h1>
                <p className="text-sm font-medium max-w-lg" style={{ color: 'var(--text-muted)' }}>
                  Customize how the Madara Motors system looks and behaves on this specific device.
                </p>
              </div>

              {showToast && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full shadow-lg" style={{ animation: preferences.animations ? 'slideDown 0.3s ease' : 'none' }}>
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold">Preferences Updated</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
              {[
                { id: 'appearance', label: 'Display & UI', icon: Palette },
                { id: 'audio', label: 'Audio & Alerts', icon: Bell },
                { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); playBeep(); }}
                    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 text-left
                      ${isActive 
                        ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-inner' 
                        : 'bg-transparent border border-transparent hover:bg-gray-800/10'}`}
                    style={{ color: isActive ? '#f97316' : 'var(--text-muted)' }}
                  >
                    <Icon size={18} className={isActive ? "text-orange-500" : ""} style={{ color: isActive ? '#f97316' : 'var(--text-muted)' }} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 🟢 Right Panel Background Updated */}
            <div className="flex-1 rounded-3xl p-6 md:p-8 shadow-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              
              {/* TAB 1: APPEARANCE */}
              {activeTab === 'appearance' && (
                <div style={{ animation: preferences.animations ? 'fadeIn 0.4s ease forwards' : 'none' }}>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2 pb-4" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                    <Palette style={{ color: 'var(--text-muted)' }} /> Display & UI Settings
                  </h2>
                  
                  <div className="space-y-4">
                    {/* 🟢 THEME DROPDOWN */}
                    <div className="p-5 rounded-2xl flex items-center justify-between" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}><MonitorSmartphone size={20} /></div>
                        <div>
                          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Color Theme</h3>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Choose your preferred application theme.</p>
                        </div>
                      </div>
                      
                      <select 
                          value={theme} 
                          onChange={(e) => setTheme(e.target.value)}
                          style={{ 
                              background: 'var(--bg-card)', 
                              color: 'var(--text-main)', 
                              padding: '8px 15px', 
                              borderRadius: '8px', 
                              border: '1px solid var(--border-color)',
                              outline: 'none',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                          }}
                      >
                          <option value="dark">Dark Mode</option>
                          <option value="light">Light (White) Mode</option>
                          <option value="wire">Wireframe Mode</option>
                      </select>
                    </div>

                    {/* Animations Toggle */}
                    <div className="p-5 rounded-2xl flex items-center justify-between hover:border-orange-500/30 transition-colors cursor-pointer" onClick={() => handleToggle('animations')} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500"><Zap size={20} /></div>
                        <div>
                          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>UI Animations</h3>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Disable animations if the system feels slow on this PC.</p>
                        </div>
                      </div>
                      <button className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${preferences.animations ? 'bg-orange-500' : 'bg-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${preferences.animations ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Compact Tables Toggle */}
                    <div className="p-5 rounded-2xl flex items-center justify-between hover:border-blue-500/30 transition-colors cursor-pointer" onClick={() => handleToggle('compactTables')} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><LayoutGrid size={20} /></div>
                        <div>
                          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Compact Tables</h3>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Reduce row height in inventory and customer lists.</p>
                        </div>
                      </div>
                      <button className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${preferences.compactTables ? 'bg-orange-500' : 'bg-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${preferences.compactTables ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AUDIO & ALERTS */}
              {activeTab === 'audio' && (
                <div style={{ animation: preferences.animations ? 'fadeIn 0.4s ease forwards' : 'none' }}>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2 pb-4" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                    <Bell style={{ color: 'var(--text-muted)' }} /> Audio & Alerts
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-colors cursor-pointer" onClick={() => handleToggle('soundEffects')} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          {preferences.soundEffects ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>System Sound Effects</h3>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Play sounds for success, error, and barcode scans.</p>
                        </div>
                      </div>
                      <button className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${preferences.soundEffects ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${preferences.soundEffects ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl flex items-center justify-between hover:border-purple-500/30 transition-colors cursor-pointer" onClick={() => handleToggle('notifications')} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><Bell size={20} /></div>
                        <div>
                          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>On-Screen Notifications</h3>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Show popup alerts for low stock and new orders.</p>
                        </div>
                      </div>
                      <button className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${preferences.notifications ? 'bg-purple-500' : 'bg-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${preferences.notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SHORTCUTS */}
              {activeTab === 'shortcuts' && (
                <div style={{ animation: preferences.animations ? 'fadeIn 0.4s ease forwards' : 'none' }}>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-2 pb-4" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                    <Keyboard style={{ color: 'var(--text-muted)' }} /> Keyboard Shortcuts
                  </h2>
                  
                  <div className="rounded-2xl p-2" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                    {[
                      { action: 'Toggle System Sounds (Mute/Unmute)', key: 'Alt + M', fn: () => handleToggle('soundEffects') },
                      { action: 'Toggle UI Animations', key: 'Alt + A', fn: () => handleToggle('animations') },
                      { action: 'Quick Logout / Return to Login', key: 'Alt + L', fn: handleLogout },
                      { action: 'Exit Dashboard / Close App', key: 'Alt + X', fn: handleExitApp },
                    ].map((shortcut, i) => (
                      <div key={i} className="flex justify-between items-center p-4 border-b last:border-0 hover:opacity-80 transition-colors group" style={{ borderColor: 'var(--border-color)' }}>
                        <span className="text-sm font-medium transition-colors" style={{ color: 'var(--text-main)' }}>{shortcut.action}</span>
                        <div className="flex gap-3 items-center">
                          <button onClick={shortcut.fn} className="text-xs text-orange-500 hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">Try it!</button>
                          <span className="px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>{shortcut.key}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] mt-4 text-center" style={{ color: 'var(--text-muted)' }}>Press the keyboard shortcuts anywhere on this page to trigger actions instantly.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;