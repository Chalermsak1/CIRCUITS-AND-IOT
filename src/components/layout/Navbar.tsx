import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Wifi, Sparkles, Play, Pause, Cpu } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const {
    isDemoMode,
    activeScenario,
    exitDemoMode,
    liveSimulationActive,
    setLiveSimulationActive,
    acState,
    systemHealth,
    activeWifiNetwork,
  } = useSystem();
  const esp32 = systemHealth.esp32;

  // Real-time digital clock
  const [timeStr, setTimeStr] = useState(() => {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      {/* Active Demo Mode High-Visibility Alert Banner */}
      {isDemoMode && activeScenario && (
        <div className="bg-blue-50/90 border-b border-blue-200 px-4 py-1.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-blue-900">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold tracking-wide">
              DEMO MODE ACTIVE:
            </span>
            <span className="font-semibold uppercase text-blue-800">
              [{activeScenario.name}]
            </span>
            <span className="hidden md:inline text-blue-700">
              — Target: {activeScenario.expectedAcPower ? 'AC ON' : 'AC OFF'} ({activeScenario.temperature}°C, {activeScenario.humidity}%, {activeScenario.motionDetected ? 'Motion' : 'No Motion'})
            </span>
          </div>
          <button
            onClick={exitDemoMode}
            className="px-2.5 py-0.5 rounded bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-bold shadow-2xs transition-colors"
          >
            Exit Demo
          </button>
        </div>
      )}

      {/* Main Navbar Row */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-blue-500/20">
            AC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                AUTOMATIC AIR CONDITIONER CONTROL
              </h1>
              <span className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-blue-50 text-blue-700 border border-blue-200">
                ESP32 IoT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-mono">
              IoT Environmental Monitoring &amp; Automatic HVAC Control
            </p>
          </div>
        </div>

        {/* Center: Live Clock & Runtime (Visible on md+) */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 tracking-widest">{timeStr}</span>
          </div>
          <div className="h-3.5 w-px bg-slate-200" />
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-slate-400">RUNTIME:</span>
            <span className="text-blue-700 font-semibold">{esp32.uptime}</span>
          </div>
        </div>

        {/* Right: Engineering Indicators & Simulation Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Hardware Honesty: ESP32 SIM status pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-mono">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500">ESP32:</span>
            <span className="text-emerald-700 font-bold">ONLINE</span>
            <span className="text-[9px] px-1 rounded bg-slate-200 text-slate-600">
              SIM
            </span>
          </div>

          {/* Wi-Fi Status Indicator */}
          <div
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-mono"
            title={activeWifiNetwork ? `${activeWifiNetwork.ssid} (${activeWifiNetwork.rssi} dBm)` : 'Wi-Fi'}
          >
            <Wifi className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-slate-700 hidden md:inline truncate max-w-[90px]">
              {activeWifiNetwork ? activeWifiNetwork.ssid : 'Home_WiFi'}
            </span>
            <span className="text-[10px] text-sky-700 font-semibold">
              {activeWifiNetwork ? `${activeWifiNetwork.rssi}dBm` : '-65dBm'}
            </span>
          </div>

          {/* AC Power Indicator */}
          <div
            className={cn(
              'px-2.5 py-1 text-xs rounded-md border font-mono flex items-center gap-1.5 transition-colors',
              acState.acPower
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                acState.acPower ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-slate-400'
              )}
            />
            <span className="hidden sm:inline text-slate-500">AC:</span>
            <span className="font-bold">{acState.acPower ? 'ON' : 'OFF'}</span>
          </div>

          {/* Simulation Drift Pause / Resume Toggle */}
          <button
            onClick={() => setLiveSimulationActive(!liveSimulationActive)}
            className={cn(
              'px-2 py-1 text-xs rounded-md border flex items-center gap-1 font-mono transition-colors',
              liveSimulationActive
                ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            )}
            title="Toggle Background Sensor Simulation Drift"
          >
            {liveSimulationActive ? (
              <>
                <Pause className="w-3 h-3 text-slate-500" />
                <span className="hidden md:inline text-[11px]">Pause Drift</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-amber-600" />
                <span className="hidden md:inline text-[11px]">Resume Drift</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
