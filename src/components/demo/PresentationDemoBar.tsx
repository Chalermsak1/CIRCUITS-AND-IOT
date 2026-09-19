import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { DEMO_SCENARIOS } from '../../services/demoScenarios';
import type { DemoScenarioId } from '../../types/demo';
import {
  Sparkles,
  RotateCcw,
  FastForward,
  Cpu,
  Power,
  Thermometer,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const PresentationDemoBar: React.FC = () => {
  const {
    isDemoMode,
    activeScenarioId,
    activeScenario,
    applyDemoScenario,
    exitDemoMode,
    fastForwardTimeout,
    automationDecision,
    acState,
    sensor,
    timeSinceLastMotion,
    motionTimeout,
    activeWifiScenario,
    applyWifiScenario,
  } = useSystem();

  return (
    <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm space-y-4">
      {/* Top Header: Demo Mode Title & Active Scenario Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900">
                PRESENTATION DEMO MODE
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Instructor Showcase
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Select a scenario to verify the IoT decision logic end-to-end
            </p>
          </div>
        </div>

        {/* Active Scenario Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500 text-[11px]">ACTIVE SCENARIO:</span>
          {activeScenario ? (
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {activeScenario.name}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              None (Live Simulation Active)
            </span>
          )}

          {isDemoMode && (
            <button
              onClick={exitDemoMode}
              className="ml-2 text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 underline transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Scenario Action Buttons: [NORMAL ROOM] [HOT ROOM] [EMPTY ROOM] */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DEMO_SCENARIOS.map(sc => {
          const isActive = activeScenarioId === sc.id && isDemoMode;
          return (
            <button
              key={sc.id}
              onClick={() => applyDemoScenario(sc.id as DemoScenarioId)}
              className={cn(
                'p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 group relative overflow-hidden',
                isActive
                  ? 'bg-blue-50/70 border-blue-400 text-slate-900 shadow-sm ring-1 ring-blue-300'
                  : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs font-bold font-mono tracking-wide',
                    isActive ? 'text-blue-800' : 'text-slate-800 group-hover:text-slate-900'
                  )}
                >
                  [{sc.name}]
                </span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold',
                    sc.id === 'hot_room' && 'bg-amber-50 text-amber-700 border-amber-200',
                    sc.id === 'normal_room' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    sc.id === 'empty_room' && 'bg-rose-50 text-rose-700 border-rose-200'
                  )}
                >
                  {sc.badgeLabel}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 font-mono">
                {sc.temperature}°C • {sc.humidity}% • {sc.motionDetected ? 'Motion ON' : 'Motion OFF'}
              </div>

              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1.5 border-t border-slate-200">
                <span>Expected: <span className="font-semibold text-slate-700">{sc.expectedAcPower ? 'AC ON' : 'AC OFF'}</span></span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Wi-Fi Demo Quick Bar */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700">
            WI-FI DEMO INJECTOR:
          </span>
          <span className="text-slate-500 hidden md:inline text-[11px]">Test Failover Logic</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => applyWifiScenario('WIFI_STABLE')}
            className={cn(
              'px-2.5 py-1 rounded text-[11px] border transition-all shadow-2xs',
              activeWifiScenario === 'WIFI_STABLE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            [STABLE -62dBm]
          </button>
          <button
            onClick={() => applyWifiScenario('WIFI_DEGRADED')}
            className={cn(
              'px-2.5 py-1 rounded text-[11px] border transition-all shadow-2xs',
              activeWifiScenario === 'WIFI_DEGRADED'
                ? 'bg-amber-50 text-amber-700 border-amber-300 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            [DEGRADED -79dBm]
          </button>
          <button
            onClick={() => applyWifiScenario('WIFI_FAILOVER')}
            className={cn(
              'px-2.5 py-1 rounded text-[11px] border transition-all shadow-2xs',
              activeWifiScenario === 'WIFI_FAILOVER'
                ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            [FAILOVER LAB_WIFI]
          </button>
        </div>
      </div>

      {/* Special Helper for Empty Room Countdown / Fast-Forward */}
      {activeScenarioId === 'empty_room' && isDemoMode && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-900">
            <span className="font-mono font-bold">EMPTY ROOM COUNTDOWN:</span>
            <span>
              {timeSinceLastMotion < motionTimeout ? (
                <>
                  Inactivity: <span className="font-mono font-bold text-rose-800">{timeSinceLastMotion}s</span> / {motionTimeout}s
                  {' '}— State: <span className="font-mono text-amber-700 font-semibold">AUTO_WAITING_FOR_TIMEOUT</span>
                </>
              ) : (
                <>
                  Timeout Reached ({timeSinceLastMotion}s &gt;= {motionTimeout}s) — State: <span className="font-mono text-rose-700 font-bold">AUTO_OFF_EMPTY</span> (AC OFF)
                </>
              )}
            </span>
          </div>

          {timeSinceLastMotion < motionTimeout && (
            <button
              onClick={fastForwardTimeout}
              className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs flex items-center gap-1.5 border border-rose-500 shrink-0 transition-colors shadow-2xs"
              title="Skip waiting and immediately reach timeout to demonstrate shutdown"
            >
              <FastForward className="w-3.5 h-3.5" />
              Fast-Forward Timeout (Expire Now)
            </button>
          )}
        </div>
      )}

      {/* Presentation Flow Bar: INPUT → PROCESS → OUTPUT */}
      <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs">
        <div className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider mb-2 flex items-center gap-1.5">
          <span>PRESENTATION SIGNAL PIPELINE:</span>
          <span className="text-blue-600 font-semibold">INPUT → PROCESS → OUTPUT</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
          {/* 1. INPUT */}
          <div className="bg-white rounded-md p-2.5 border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-slate-500 text-[10px] flex items-center justify-between font-bold">
              <span className="text-blue-600">1. INPUT</span>
              <Thermometer className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-slate-900 font-bold text-xs">
              {sensor.temperature.toFixed(1)}°C • {sensor.humidity.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-600 flex items-center gap-1">
              <Activity className={cn('w-3 h-3', sensor.motion ? 'text-emerald-600' : 'text-slate-400')} />
              <span>PIR: {sensor.motion ? 'DETECTED (HIGH)' : 'CLEAR (LOW)'}</span>
            </div>
          </div>

          {/* 2. PROCESS */}
          <div className="bg-white rounded-md p-2.5 border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-slate-500 text-[10px] flex items-center justify-between font-bold">
              <span className="text-amber-600">2. PROCESS</span>
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-amber-700 font-bold text-xs truncate">
              {automationDecision.state}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              ESP32 Rule Logic Evaluated
            </div>
          </div>

          {/* 3. OUTPUT */}
          <div className="bg-white rounded-md p-2.5 border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-slate-500 text-[10px] flex items-center justify-between font-bold">
              <span className="text-emerald-600">3. OUTPUT</span>
              <Power className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div
              className={cn(
                'font-bold text-xs',
                acState.acPower ? 'text-emerald-700' : 'text-slate-600'
              )}
            >
              IR COMMAND: AC {acState.acPower ? 'POWER ON' : 'POWER OFF'}
            </div>
            <div className="text-[10px] text-slate-500">
              {acState.acPower ? `COOL ${acState.targetTemperature}°C • FAN ${acState.fanSpeed.toUpperCase()}` : 'Compressor Standby'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
