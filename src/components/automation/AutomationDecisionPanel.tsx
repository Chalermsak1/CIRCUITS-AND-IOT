import React from 'react';
import { useSystem } from '../../context/SystemContext';
import {
  Cpu,
  Thermometer,
  ShieldAlert,
  Activity,
  CheckCircle2,
  XCircle,
  Radio,
  Power,
  Clock,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
  className?: string;
  compact?: boolean;
}

export const AutomationDecisionPanel: React.FC<Props> = ({ className, compact = false }) => {
  const {
    sensor,
    temperatureThreshold,
    acState,
    automationDecision,
    timeSinceLastMotion,
    motionTimeout,
  } = useSystem();

  const isMotionDetected = sensor.motion;
  const isAutoEnabled = acState.autoMode;
  const isTempAboveThreshold = sensor.temperature > temperatureThreshold;
  const isTimeoutActive = !isMotionDetected && timeSinceLastMotion < motionTimeout;

  // Decision Display Tag & Style
  let decisionTitle = 'AUTO_IDLE';
  let decisionBadgeBg = 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs';
  let irCommand = 'NO_TRANSMISSION';
  let irHex = '0x00 0x00 0x00 0x00';
  let irStatus = 'STANDBY';

  if (!isAutoEnabled) {
    decisionTitle = 'MANUAL_CONTROL';
    decisionBadgeBg = 'bg-purple-50 text-purple-700 border-purple-200 shadow-2xs';
    irCommand = acState.acPower ? 'MANUAL_AC_ON' : 'MANUAL_AC_OFF';
    irHex = acState.acPower ? '0x02 0x20 0xE0 0x04 0x00 0x00 0x00 0x01' : '0x02 0x20 0xE0 0x04 0x00 0x00 0x00 0x02';
    irStatus = 'MANUAL_OVERRIDE';
  } else if (automationDecision.state === 'AUTO_COOLING') {
    decisionTitle = 'AUTO_ON (COOLING)';
    decisionBadgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs ring-1 ring-emerald-200';
    irCommand = 'PANASONIC_AC_POWER_ON';
    irHex = '0x02 0x20 0xE0 0x04 0x00 0x00 0x00 0x06';
    irStatus = 'TRANSMITTED';
  } else if (automationDecision.state === 'AUTO_IDLE') {
    decisionTitle = 'AUTO_IDLE (TEMP NORMAL)';
    decisionBadgeBg = 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs';
    irCommand = 'PANASONIC_AC_POWER_OFF';
    irHex = '0x02 0x20 0xE0 0x04 0x00 0x00 0x00 0x07';
    irStatus = 'TRANSMITTED';
  } else if (automationDecision.state === 'AUTO_WAITING_FOR_TIMEOUT') {
    decisionTitle = `AUTO_WAITING (${automationDecision.timeRemaining}s)`;
    decisionBadgeBg = 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs ring-1 ring-amber-200';
    irCommand = 'MAINTAIN_CURRENT_STATE';
    irHex = '0x00 0x00 0x00 0x00';
    irStatus = 'HOLDING';
  } else if (automationDecision.state === 'AUTO_OFF_EMPTY') {
    decisionTitle = 'AUTO_OFF (EMPTY ROOM)';
    decisionBadgeBg = 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs';
    irCommand = 'PANASONIC_AC_POWER_OFF';
    irHex = '0x02 0x20 0xE0 0x04 0x00 0x00 0x00 0x07';
    irStatus = 'TRANSMITTED';
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all',
        className
      )}
    >
      {/* Panel Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase font-mono">
              AUTOMATION DECISION MATRIX
            </h3>
            <p className="text-xs text-slate-500">
              ESP32 Closed-Loop Real-Time Logic Engine &amp; Rule Evaluation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[10px] text-slate-500">ENGINE STATE:</span>
          <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold">
            {automationDecision.state}
          </span>
        </div>
      </div>

      {/* 5-ZONE INDUSTRIAL DECISION ARCHITECTURE */}
      <div className="space-y-4">
        {/* ROW 1: ZONE 1 (INPUT) & ZONE 2 (DECISION CHECKLIST) */}
        <div className={cn('grid grid-cols-1 gap-4', compact ? '' : 'lg:grid-cols-12')}>
          {/* ZONE 1: INPUT */}
          <div className={cn('bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-3', compact ? 'w-full' : 'lg:col-span-6')}>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-b border-slate-200 pb-2">
              <span className="text-blue-700 font-bold">ZONE 1: SENSOR &amp; CONFIG INPUTS</span>
              <span>SAMPLING: 1 Hz</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 font-mono">
              {/* Temp Input */}
              <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 flex items-center justify-between mb-1">
                  <span>Temperature</span>
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {sensor.temperature.toFixed(1)} <span className="text-xs text-slate-500">°C</span>
                </div>
              </div>

              {/* Threshold */}
              <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 flex items-center justify-between mb-1">
                  <span>Threshold</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-700">
                  {temperatureThreshold.toFixed(1)} <span className="text-xs text-slate-500">°C</span>
                </div>
              </div>

              {/* Motion Input */}
              <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 flex items-center justify-between mb-1">
                  <span>PIR Motion</span>
                  <Activity className={cn('w-3.5 h-3.5', isMotionDetected ? 'text-emerald-600' : 'text-slate-400')} />
                </div>
                <div
                  className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded border inline-block',
                    isMotionDetected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  )}
                >
                  {isMotionDetected ? 'DETECTED' : 'CLEAR'}
                </div>
                {!isMotionDetected && (
                  <div className="text-[10px] text-slate-500 mt-1">
                    idle: {timeSinceLastMotion}s / {motionTimeout}s
                  </div>
                )}
              </div>

              {/* Auto Mode Input */}
              <div className="bg-white p-2.5 rounded border border-slate-200 shadow-2xs">
                <div className="text-[11px] text-slate-500 flex items-center justify-between mb-1">
                  <span>Control Mode</span>
                  <Power className={cn('w-3.5 h-3.5', isAutoEnabled ? 'text-blue-600' : 'text-purple-600')} />
                </div>
                <div
                  className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded border inline-block',
                    isAutoEnabled
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  )}
                >
                  {isAutoEnabled ? 'AUTO ENABLED' : 'MANUAL MODE'}
                </div>
              </div>
            </div>
          </div>

          {/* ZONE 2: DECISION CHECKLIST (6 Cols, hidden when compact) */}
          {!compact && (
            <div className="lg:col-span-6 bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-b border-slate-200 pb-2">
                <span className="text-amber-700 font-bold">ZONE 2: LOGIC CHECKLIST EVALUATION</span>
                <span>DETERMINISTIC</span>
              </div>

            <div className="space-y-2 font-mono text-xs">
              {/* Check 1: Temp > Threshold */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  {isTempAboveThreshold ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-slate-700">
                    Temp &gt; Threshold ({sensor.temperature.toFixed(1)} &gt; {temperatureThreshold.toFixed(1)}°C)
                  </span>
                </div>
                <span className={cn('font-bold', isTempAboveThreshold ? 'text-emerald-700' : 'text-slate-500')}>
                  {isTempAboveThreshold ? 'TRUE' : 'FALSE'}
                </span>
              </div>

              {/* Check 2: Motion Detected */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  {isMotionDetected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-slate-700">PIR Occupancy Active</span>
                </div>
                <span className={cn('font-bold', isMotionDetected ? 'text-emerald-700' : 'text-slate-500')}>
                  {isMotionDetected ? 'TRUE' : 'FALSE'}
                </span>
              </div>

              {/* Check 3: Timeout Active */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  {isTimeoutActive ? (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-slate-700">Inactivity Timeout Pending</span>
                </div>
                <span className={cn('font-bold', isTimeoutActive ? 'text-amber-700' : 'text-slate-500')}>
                  {isTimeoutActive ? `TRUE (${automationDecision.timeRemaining}s)` : 'FALSE'}
                </span>
              </div>

              {/* Check 4: Auto Mode Enabled */}
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  {isAutoEnabled ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-purple-500 shrink-0" />
                  )}
                  <span className="text-slate-700">System In Automatic Control</span>
                </div>
                <span className={cn('font-bold', isAutoEnabled ? 'text-blue-700' : 'text-purple-700')}>
                  {isAutoEnabled ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* ROW 2: ZONE 3 (DECISION), ZONE 4 (REASON) & ZONE 5 (IR COMMAND) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* ZONE 3: SYSTEM DECISION */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-mono font-bold flex items-center justify-between">
              <span className="text-emerald-700">ZONE 3: SYSTEM DECISION</span>
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            <div className="my-1">
              <span
                className={cn(
                  'px-3 py-1.5 text-xs font-mono font-bold rounded-lg border block text-center shadow-2xs',
                  decisionBadgeBg
                )}
              >
                {decisionTitle}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>AC Power Target:</span>
              <span className={cn('font-bold', acState.acPower ? 'text-emerald-700' : 'text-slate-500')}>
                {acState.acPower ? 'POWER ON' : 'POWER OFF'}
              </span>
            </div>
          </div>

          {/* ZONE 4: REASON */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-mono font-bold flex items-center justify-between">
              <span className="text-amber-700">ZONE 4: LOGIC RATIONALE</span>
              <span>RULE AUDIT</span>
            </div>

            <div className="bg-white p-2.5 rounded border border-slate-200 text-xs text-slate-700 italic font-mono flex-1 flex items-center shadow-2xs">
              "{automationDecision.reason}"
            </div>

            <div className="text-[10px] font-mono text-slate-500">
              Evaluated on ESP32 Core 1 RTOS Task
            </div>
          </div>

          {/* ZONE 5: IR COMMAND */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 flex flex-col justify-between">
            <div className="text-slate-500 text-xs font-mono font-bold flex items-center justify-between">
              <span className="text-blue-700">ZONE 5: IR ACTUATION</span>
              <Radio className="w-3.5 h-3.5 text-blue-600" />
            </div>

            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Command:</span>
                <span className="text-slate-900 font-bold text-[11px] truncate">{irCommand}</span>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200 text-[10px] text-blue-700 font-mono break-all shadow-2xs">
                {irHex}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-200">
              <span className="text-slate-500">Signal Status:</span>
              <span
                className={cn(
                  'font-bold text-[10px] px-1.5 py-0.5 rounded border',
                  irStatus === 'TRANSMITTED' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  irStatus === 'HOLDING' && 'bg-amber-50 text-amber-700 border-amber-200',
                  irStatus === 'STANDBY' && 'bg-slate-100 text-slate-600 border-slate-200',
                  irStatus === 'MANUAL_OVERRIDE' && 'bg-purple-50 text-purple-700 border-purple-200'
                )}
              >
                {irStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
