import React from 'react';
import { useSystem } from '../context/SystemContext';
import { AutomationDecisionPanel } from '../components/automation/AutomationDecisionPanel';
import { PresentationDemoBar } from '../components/demo/PresentationDemoBar';
import { SystemHealthSummary } from '../components/devices/SystemHealthSummary';
import { SystemDataFlowDiagram } from '../components/system/SystemDataFlowDiagram';
import {
  Thermometer,
  Droplets,
  Activity,
  Power,
  Zap,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { cn } from '../utils/cn';
import { DashboardIrSummaryCard } from '../components/ir/DashboardIrSummaryCard';

interface DashboardPageProps {
  onNavigateToControl?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToControl }) => {
  const {
    sensor,
    acState,
    sensorHistory,
    timeSinceLastMotion,
    motionTimeout,
    temperatureThreshold,
    triggerManualMotion,
    setManualTemperature,
    systemEvents,
  } = useSystem();

  return (
    <div className="space-y-6">
      {/* 1. Presentation Demo Mode Bar for Instant 1-Click Scenario Switching */}
      <PresentationDemoBar />

      {/* 2. Four Main Real-Time Sensor & Actuator Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ambient Temperature */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono">DHT22 Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {sensor.temperature.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-500 font-mono">°C</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-500 font-mono">
            <span>Threshold: {temperatureThreshold.toFixed(1)}°C</span>
            <span
              className={cn(
                'text-[11px] px-1.5 py-0.5 rounded font-bold',
                sensor.temperature > temperatureThreshold
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              )}
            >
              {sensor.temperature > temperatureThreshold ? 'HOT' : 'NORMAL'}
            </span>
          </div>
        </div>

        {/* Card 2: Relative Humidity */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono">DHT22 Humidity</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {sensor.humidity.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-500 font-mono">%</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono">
            Comfort Band: 40% – 70% RH
          </div>
        </div>

        {/* Card 3: PIR Motion Sensor */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono">PIR Motion Sensor</span>
            <Activity className={cn('w-4 h-4', sensor.motion ? 'text-emerald-600' : 'text-slate-400')} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={cn(
                'text-2xl font-bold font-mono tracking-wide',
                sensor.motion ? 'text-emerald-700' : 'text-slate-500'
              )}
            >
              {sensor.motion ? 'DETECTED' : 'CLEAR'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between font-mono">
            <span>Timeout: {motionTimeout}s</span>
            <span className="text-[11px] text-slate-500">
              {sensor.motion ? 'Active' : `Idle: ${timeSinceLastMotion}s`}
            </span>
          </div>
        </div>

        {/* Card 4: AC Power & Control State */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono">Panasonic AC Unit</span>
            <Power className={cn('w-4 h-4', acState.acPower ? 'text-emerald-600' : 'text-slate-400')} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={cn(
                'text-3xl font-bold font-mono',
                acState.acPower ? 'text-emerald-700' : 'text-slate-500'
              )}
            >
              {acState.acPower ? 'ON' : 'OFF'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({acState.acMode.toUpperCase()} / {acState.targetTemperature}°C)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between font-mono">
            <span>Control Mode:</span>
            <span className={cn('font-bold', acState.autoMode ? 'text-blue-700' : 'text-purple-700')}>
              {acState.autoMode ? 'AUTOMATIC' : 'MANUAL'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Primary Hero Section: 5-Zone Industrial Automation Decision Matrix */}
      <AutomationDecisionPanel />

      {/* 4. System Data Flow Architecture Diagram */}
      <SystemDataFlowDiagram />

      {/* 3. Real-Time Telemetry Trend Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wide flex items-center gap-2">
              REAL-TIME ENVIRONMENTAL TELEMETRY
            </h3>
            <p className="text-xs text-slate-500">
              DHT22 Temperature & Humidity readings stream with AC trigger threshold line ({temperatureThreshold.toFixed(1)}°C)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-700">Temp (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-700">Humidity (%)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sensorHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={[15, 80]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  color: '#0f172a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tempGradient)"
                name="Temperature"
              />
              <Area
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#humGradient)"
                name="Humidity"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Compact System Health Node Overview */}
      <SystemHealthSummary />

      {/* 7 & 8. Interactive Quick-Test Workbench & Panasonic IR Control Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  ENGINEERING INTERACTIVE TEST HARNESS
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Simulate physical sensor signals directly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Button: Trigger Motion */}
              <button
                onClick={() => triggerManualMotion(true)}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs text-left transition-all shadow-2xs"
              >
                <div className="font-semibold text-emerald-700 flex items-center justify-between">
                  <span>PIR: Motion Active</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Set PIR signal HIGH (Occupancy detected)
                </p>
              </button>

              {/* Button: Clear Motion */}
              <button
                onClick={() => triggerManualMotion(false)}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 text-xs text-left transition-all shadow-2xs"
              >
                <div className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>PIR: Motion Clear</span>
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Set PIR signal LOW (Start timeout clock)
                </p>
              </button>

              {/* Button: Hot Room */}
              <button
                onClick={() => setManualTemperature(29.2)}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-700 text-xs text-left transition-all shadow-2xs"
              >
                <div className="font-semibold text-amber-700 flex items-center justify-between">
                  <span>Set Temp: 29.2°C</span>
                  <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Above threshold ({temperatureThreshold}°C)
                </p>
              </button>

              {/* Button: Cool Room */}
              <button
                onClick={() => setManualTemperature(24.5)}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 text-xs text-left transition-all shadow-2xs"
              >
                <div className="font-semibold text-blue-700 flex items-center justify-between">
                  <span>Set Temp: 24.5°C</span>
                  <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Below threshold (Normal comfort)
                </p>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Hardware Emulation: Active</span>
            <span className="text-blue-700 font-semibold">Ready for ESP32 Field Bus</span>
          </div>
        </div>

        {/* Section 9: Dashboard IR Summary Card */}
        <div className="lg:col-span-1">
          <DashboardIrSummaryCard onNavigateToControl={onNavigateToControl} />
        </div>
      </div>

      {/* 5. Live System Event Log */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            RECENT DECISION & HARDWARE EVENTS
          </h4>
          <span className="text-[10px] font-mono text-slate-500">
            Real-Time Event Stream
          </span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
          {systemEvents.slice(0, 6).map(evt => (
            <div
              key={evt.id}
              className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start gap-2.5 shadow-2xs"
            >
              <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">
                {evt.timestamp}
              </span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0',
                  evt.level === 'success' && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                  evt.level === 'warning' && 'bg-amber-50 text-amber-700 border border-amber-200',
                  evt.level === 'info' && 'bg-blue-50 text-blue-700 border border-blue-200',
                  evt.level === 'error' && 'bg-rose-50 text-rose-700 border border-rose-200'
                )}
              >
                {evt.type}
              </span>
              <span className="text-slate-700 leading-tight">{evt.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
