import React from 'react';
import { useSystem } from '../context/SystemContext';
import { Settings, Sliders, Sparkles, Play, ShieldAlert, Clock, RotateCcw } from 'lucide-react';
import { DEMO_SCENARIOS } from '../services/demoScenarios';
import { cn } from '../utils/cn';

export const SettingsPage: React.FC = () => {
  const {
    temperatureThreshold,
    setTemperatureThreshold,
    motionTimeout,
    setMotionTimeout,
    activeScenarioId,
    applyDemoScenario,
    exitDemoMode,
    isDemoMode,
  } = useSystem();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-wide flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          SYSTEM CONFIGURATION & DEMO SUITE
        </h2>
        <p className="text-xs text-slate-500">
          Tune automation boundary thresholds and simulate real-world university evaluation test cases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Automation Thresholds */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase font-mono text-slate-900">
              CLOSED-LOOP THRESHOLD PARAMETERS
            </h3>
          </div>

          {/* Temperature Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Cooling Trigger Threshold (T_high)
              </span>
              <span className="font-mono text-amber-700 font-bold">
                {temperatureThreshold.toFixed(1)} °C
              </span>
            </div>
            <input
              type="range"
              min="22.0"
              max="30.0"
              step="0.5"
              value={temperatureThreshold}
              onChange={e => setTemperatureThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 border border-slate-200"
            />
            <p className="text-[11px] text-slate-500">
              When room temperature rises above this value and occupancy is detected, AC power turns ON.
            </p>
          </div>

          {/* Motion Inactivity Timeout */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Inactivity Vacancy Timeout
              </span>
              <span className="font-mono text-blue-700 font-bold">
                {motionTimeout} seconds
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={motionTimeout}
              onChange={e => setMotionTimeout(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 border border-slate-200"
            />
            <p className="text-[11px] text-slate-500">
              Seconds of continuous room absence before the automation engine issues an IR OFF command.
            </p>
          </div>
        </div>

        {/* Section 2: Demo Mode Scenario Launchpad */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase font-mono text-slate-900">
                EVALUATION TEST SCENARIOS
              </h3>
            </div>
            {isDemoMode && (
              <button
                onClick={exitDemoMode}
                className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Exit Demo
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Click any scenario to immediately inject its sensor parameters and verify the decision engine:
          </p>

          <div className="space-y-2.5">
            {DEMO_SCENARIOS.map(sc => {
              const isActive = activeScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => applyDemoScenario(sc.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between gap-3',
                    isActive
                      ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs ring-1 ring-purple-400/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
                  )}
                >
                  <div>
                    <div className="font-bold font-mono text-slate-900 flex items-center gap-2">
                      <span>{sc.name}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white border border-slate-200 text-blue-700 shadow-2xs">
                        {sc.expectedDecision}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {sc.description}
                    </div>
                  </div>
                  <Play className={cn('w-4 h-4 shrink-0', isActive ? 'text-purple-600' : 'text-slate-400')} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 36: Easter Egg & Project Motto */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono text-blue-700 uppercase tracking-widest font-bold block mb-1">
              SYSTEM MOTTO / คติประจำระบบ
            </span>
            <div className="text-sm font-medium text-slate-800 space-y-1 leading-relaxed">
              <p>“แผงควบคุมอัจฉริยะ</p>
              <p>ตรวจจับความเคลื่อนไหว</p>
              <p>ปรับอุณหภูมิให้เย็นใจ</p>
              <p>ประหยัดไฟทุกเวลา”</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500 font-mono">
            <span>Automatic Air Conditioner Control System</span>
            <div className="text-blue-600 font-semibold mt-0.5">Faculty of Engineering • Circuits &amp; IoT Project</div>
          </div>
        </div>
      </div>
    </div>
  );
};

