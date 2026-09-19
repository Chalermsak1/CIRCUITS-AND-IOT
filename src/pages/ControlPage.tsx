import React from 'react';
import { useSystem } from '../context/SystemContext';
import { AutomationDecisionPanel } from '../components/automation/AutomationDecisionPanel';
import {
  Power,
  Sliders,
  Wind,
  SunMedium,
  Droplets,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type { ACMode, FanSpeed } from '../types/ac';
import { cn } from '../utils/cn';
import { PanasonicIrControlSection } from '../components/ir/PanasonicIrControlSection';

export const ControlPage: React.FC = () => {
  const {
    acState,
    toggleAcPower,
    setTargetTemperature,
    setAcMode,
    setFanSpeed,
    toggleAutoMode,
  } = useSystem();

  const modes: { id: ACMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'cool', label: 'Cool', icon: SunMedium },
    { id: 'dry', label: 'Dry', icon: Droplets },
    { id: 'fan', label: 'Fan Only', icon: Wind },
    { id: 'auto', label: 'Auto Mode', icon: RotateCcw },
  ];

  const fanSpeeds: { id: FanSpeed; label: string }[] = [
    { id: 'auto', label: 'Auto' },
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Med' },
    { id: 'high', label: 'High' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            AIR CONDITIONER CONTROL CONSOLE
          </h2>
          <p className="text-xs text-slate-500">
            Manual remote overrides and automated closed-loop setpoint management
          </p>
        </div>
      </div>

      {/* Primary Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Power & Auto Mode Master Switches */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase font-mono text-slate-500 mb-4">
              POWER & AUTOMATION MASTER
            </h3>

            {/* Large AC Power Button */}
            <button
              onClick={toggleAcPower}
              className={cn(
                'w-full py-6 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all shadow-sm',
                acState.acPower
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-emerald-100'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              )}
            >
              <Power className={cn('w-10 h-10', acState.acPower ? 'text-emerald-600' : 'text-slate-400')} />
              <span className="text-base font-bold font-mono">
                AC POWER: {acState.acPower ? 'ON' : 'OFF'}
              </span>
              <span className="text-[11px] text-slate-500">
                Click to manually toggle AC power
              </span>
            </button>
          </div>

          {/* Auto Mode Switch with Explanatory Warning */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold font-mono text-slate-900 block">
                  AUTOMATIC DECISION LOGIC
                </span>
                <span className="text-[11px] text-slate-500">
                  {acState.autoMode ? 'Algorithm currently controlling AC' : 'Manual control mode active'}
                </span>
              </div>
              <button
                onClick={toggleAutoMode}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all shadow-2xs',
                  acState.autoMode
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                )}
              >
                {acState.autoMode ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="text-[11px] text-slate-600 flex items-start gap-2 bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                {acState.autoMode
                  ? 'Auto Mode is active. The ESP32 logic engine will power down the unit when room is vacant or cooled.'
                  : 'RULE A Active: Auto Mode is disabled. Automation will NOT overwrite manual user selections.'}
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Temperature Setpoint Control */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase font-mono text-slate-500 mb-4">
              TEMPERATURE SETPOINT
            </h3>

            <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 shadow-2xs">
              <div className="text-5xl font-black font-mono-data text-slate-900">
                {acState.targetTemperature}
                <span className="text-2xl font-normal text-slate-500">°C</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Target Cooling Temperature</p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setTargetTemperature(Math.max(16, acState.targetTemperature - 1))}
                className="w-14 h-14 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-2xl font-mono text-slate-800 flex items-center justify-center transition-all shadow-2xs"
              >
                −
              </button>
              <button
                onClick={() => setTargetTemperature(Math.min(30, acState.targetTemperature + 1))}
                className="w-14 h-14 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-2xl font-mono text-slate-800 flex items-center justify-center transition-all shadow-2xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 mt-4 font-mono">
            Operating range: 16°C – 30°C (Preset comfort: 24°C)
          </div>
        </div>

        {/* Column 3: Mode & Fan Speed Selectors */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          {/* Mode Selector */}
          <div>
            <h3 className="text-xs font-semibold uppercase font-mono text-slate-500 mb-3">
              AC OPERATING MODE
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {modes.map(m => {
                const Icon = m.icon;
                const isSel = acState.acMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setAcMode(m.id)}
                    className={cn(
                      'p-3 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all shadow-2xs',
                      isSel
                        ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fan Speed */}
          <div>
            <h3 className="text-xs font-semibold uppercase font-mono text-slate-500 mb-3">
              BLOWER FAN SPEED
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {fanSpeeds.map(f => {
                const isSel = acState.fanSpeed === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFanSpeed(f.id)}
                    className={cn(
                      'py-2 rounded-lg border text-xs font-mono font-medium transition-all text-center shadow-2xs',
                      isSel
                        ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Engine Status Preview */}
      <AutomationDecisionPanel compact />

      {/* Panasonic AC IR Learning & Replay Engineering Section */}
      <div className="pt-4 border-t border-slate-200">
        <PanasonicIrControlSection />
      </div>
    </div>
  );
};
