import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import {
  Radio,
  Play,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Power,
  Waves,
  History,
  Layers,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const PanasonicIrControlSection: React.FC = () => {
  const {
    acState,
    irLearningStatus,
    learningProgressMessage,
    learnedCommands,
    lastCapturedCommand,
    lastIrTransmission,
    startIrLearning,
    cancelIrLearning,
    replayIrCommand,
    systemEvents,
  } = useSystem();

  const [selectedLearnCmd, setSelectedLearnCmd] = useState<string>('POWER ON');

  // Filter IR Command Events from the centralized system history
  const irEvents = systemEvents
    .filter(e => e.type === 'IR_COMMAND')
    .slice(0, 5);

  const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
    READY: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    LEARNING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    CAPTURED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    ERROR: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    NOT_CONNECTED: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  };

  const currentStatusStyle = statusColorMap[irLearningStatus] || statusColorMap.READY;

  return (
    <div className="space-y-6">
      {/* 0. Section Title & Hardware Honesty Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-wide font-mono">
              PANASONIC AC IR LEARNING & CONTROL
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              38 kHz Carrier
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Capture, decode, persist, and replay Panasonic remote control infrared carrier signals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>STANDBY FOR ESP32 HW</span>
          </span>
          <span className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
            SIMULATED
          </span>
        </div>
      </div>

      {/* 1. Top Row: Status Card, Live AC Synchronized State, Last Transmission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: IR Learning Status (Section 1) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase font-mono text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600" />
                IR LEARNING STATUS
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase shadow-2xs',
                  currentStatusStyle.bg,
                  currentStatusStyle.text,
                  currentStatusStyle.border
                )}
              >
                {irLearningStatus}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 text-xs font-mono shadow-2xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Target Device:</span>
                <span className="text-slate-900 font-semibold">Panasonic AC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">IR Receiver:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  CONNECTED (GPIO 15)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Capture:</span>
                <span className="text-blue-700 font-medium">
                  {lastCapturedCommand ? lastCapturedCommand.capturedAt : 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-200 pt-2">
            <span>Demodulator: VS1838B</span>
            <span>Protocol: Panasonic 216</span>
          </div>
        </div>

        {/* Card 2: Synchronized Panasonic AC State Display (Section 5) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase font-mono text-slate-900 flex items-center gap-2">
                <Power className="w-4 h-4 text-emerald-600" />
                PANASONIC AC (CURRENT STATE)
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase shadow-2xs',
                  acState.acPower
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                )}
              >
                {acState.acPower ? 'RUNNING' : 'STANDBY'}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 text-xs font-mono shadow-2xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Power:</span>
                <span
                  className={cn(
                    'font-bold',
                    acState.acPower ? 'text-emerald-700' : 'text-slate-500'
                  )}
                >
                  {acState.acPower ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Operating Mode:</span>
                <span className="text-blue-700 font-semibold uppercase">
                  {acState.acMode}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Set Temperature:</span>
                <span className="text-slate-900 font-bold text-sm">
                  {acState.targetTemperature} °C
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Blower Fan:</span>
                <span className="text-slate-700 font-semibold uppercase">
                  {acState.fanSpeed}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-200 pt-2">
            <span>Sync: Single Source of Truth</span>
            <span>Mode: {acState.autoMode ? 'AUTO' : 'MANUAL'}</span>
          </div>
        </div>

        {/* Card 3: Last IR Transmission (Section 7) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase font-mono text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                LAST IR COMMAND (TRANSMISSION)
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase shadow-2xs',
                  lastIrTransmission.status === 'SENT'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : lastIrTransmission.status === 'WAITING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                )}
              >
                {lastIrTransmission.status}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 text-xs font-mono shadow-2xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Command:</span>
                <span className="text-slate-900 font-bold">{lastIrTransmission.command}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Target Device:</span>
                <span className="text-blue-700 font-semibold">{lastIrTransmission.target}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-semibold">{lastIrTransmission.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Time:</span>
                <span className="text-slate-700">{lastIrTransmission.timestamp}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-200 pt-2">
            <span>Transmitter: GPIO 14 (38 kHz)</span>
            <span className="truncate max-w-[140px] text-right">{lastIrTransmission.detail || 'Ready'}</span>
          </div>
        </div>
      </div>

      {/* 2. Visual IR Signal Flow Diagram (Section 6) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase font-mono text-slate-900 flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-600" />
            IR SIGNAL ARCHITECTURE & FLOW PIPELINE
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            End-to-End Demodulation & Replay Chain
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
          <div className="hidden lg:flex items-center justify-between gap-2 font-mono text-xs text-center">
            {/* Step 1 */}
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
              <div className="text-[10px] text-slate-400 uppercase">Input</div>
              <div className="text-slate-900 font-bold mt-1 text-xs">PANASONIC REMOTE</div>
              <div className="text-[10px] text-slate-500 mt-0.5">38 kHz Infrared</div>
            </div>

            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />

            {/* Step 2 */}
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
              <div className="text-[10px] text-slate-400 uppercase">Hardware Demod</div>
              <div className="text-blue-700 font-bold mt-1 text-xs">IR RECEIVER</div>
              <div className="text-[10px] text-slate-500 mt-0.5">VS1838B (GPIO 15)</div>
            </div>

            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />

            {/* Step 3 */}
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
              <div className="text-[10px] text-slate-400 uppercase">Data Representation</div>
              <div className="text-purple-700 font-bold mt-1 text-xs">LEARNED SIGNAL</div>
              <div className="text-[10px] text-slate-500 mt-0.5">216 Pulses Stored</div>
            </div>

            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />

            {/* Step 4 */}
            <div className="flex-1 bg-white border border-blue-200 rounded-lg p-3 shadow-2xs">
              <div className="text-[10px] text-blue-600 uppercase font-semibold">Edge Processor</div>
              <div className="text-slate-900 font-bold mt-1 text-xs">ESP32</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Decision Engine</div>
            </div>

            <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />

            {/* Step 5 */}
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
              <div className="text-[10px] text-slate-400 uppercase">Modulator</div>
              <div className="text-emerald-700 font-bold mt-1 text-xs">IR TRANSMITTER</div>
              <div className="text-[10px] text-slate-500 mt-0.5">BC548 + 940nm LED</div>
            </div>

            <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />

            {/* Step 6 */}
            <div className="flex-1 bg-white border border-emerald-200 rounded-lg p-3 shadow-2xs">
              <div className="text-[10px] text-emerald-700 uppercase font-semibold">Actuator Target</div>
              <div className="text-emerald-700 font-bold mt-1 text-xs">AIR CONDITIONER</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Cooling Setpoint</div>
            </div>
          </div>

          {/* Vertical layout for mobile/tablet (< 1024px) */}
          <div className="flex lg:hidden flex-col items-center space-y-2 font-mono text-xs text-center">
            <div className="w-full bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
              <span className="text-slate-900 font-bold">1. PANASONIC REMOTE</span>
              <span className="text-[10px] text-slate-500 block">38 kHz Infrared Signal</span>
            </div>
            <ArrowDown className="w-4 h-4 text-blue-600" />
            <div className="w-full bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
              <span className="text-blue-700 font-bold">2. IR RECEIVER (VS1838B GPIO 15)</span>
            </div>
            <ArrowDown className="w-4 h-4 text-blue-600" />
            <div className="w-full bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
              <span className="text-purple-700 font-bold">3. LEARNED SIGNAL (216 Pulses)</span>
            </div>
            <ArrowDown className="w-4 h-4 text-blue-600" />
            <div className="w-full bg-white border border-blue-200 rounded-lg p-2.5 shadow-2xs">
              <span className="text-slate-900 font-bold">4. ESP32 MICROCONTROLLER</span>
            </div>
            <ArrowDown className="w-4 h-4 text-emerald-600" />
            <div className="w-full bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
              <span className="text-emerald-700 font-bold">5. IR TRANSMITTER (38 kHz Carrier GPIO 14)</span>
            </div>
            <ArrowDown className="w-4 h-4 text-emerald-600" />
            <div className="w-full bg-white border border-emerald-200 rounded-lg p-2.5 shadow-2xs">
              <span className="text-emerald-700 font-bold">6. AIR CONDITIONER (Panasonic Unit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Learning Console & Last Captured Command (Sections 2 & 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Interactive Learn Command Action (Section 2) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase font-mono text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              SIMULATED IR CAPTURE INTERFACE
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Interactive Test Mode
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Aim a Panasonic remote at the demodulating receiver and click Start Learning. The system will record the timing pulses and store the carrier profile.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-slate-600 shrink-0">
                Command to capture:
              </label>
              <select
                value={selectedLearnCmd}
                onChange={e => setSelectedLearnCmd(e.target.value)}
                disabled={irLearningStatus === 'LEARNING'}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 flex-1 shadow-2xs"
              >
                <option value="POWER ON">POWER ON</option>
                <option value="POWER OFF">POWER OFF</option>
                <option value="COOL 25°C">COOL 25°C</option>
                <option value="COOL 26°C">COOL 26°C</option>
                <option value="COOL 27°C">COOL 27°C</option>
                <option value="FAN AUTO">FAN AUTO</option>
              </select>
            </div>

            {/* Learning button & progress */}
            <div className="pt-2">
              {irLearningStatus === 'LEARNING' ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2 shadow-2xs">
                  <div className="flex items-center justify-center gap-2 text-amber-800 font-mono text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <span>{learningProgressMessage}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Listening for 38 kHz NEC carrier burst on GPIO 15...
                  </p>
                  <button
                    onClick={cancelIrLearning}
                    className="mt-1 px-3 py-1 text-[11px] font-mono rounded bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : irLearningStatus === 'CAPTURED' ? (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-1 shadow-2xs">
                  <div className="flex items-center justify-center gap-2 text-blue-800 font-mono text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>{learningProgressMessage}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono">
                    Pattern mapped: 216 pulses saved to memory buffer
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => startIrLearning(selectedLearnCmd)}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>START LEARNING [{selectedLearnCmd}]</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Last Captured Command (Section 3) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase font-mono text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              LAST CAPTURED COMMAND
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
              SIMULATED
            </span>
          </div>

          {lastCapturedCommand ? (
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 text-xs font-mono shadow-2xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Command:</span>
                <span className="text-slate-900 font-bold">{lastCapturedCommand.command}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Protocol:</span>
                <span className="text-blue-700 font-semibold">{lastCapturedCommand.protocol}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Signal Status:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lastCapturedCommand.signalStatus}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Captured At:</span>
                <span className="text-slate-700">{lastCapturedCommand.capturedAt}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Signal Length:</span>
                <span className="text-amber-700 font-semibold">{lastCapturedCommand.signalLength}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 font-mono text-xs">
              No command captured yet. Click "Start Learning" to capture.
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-mono">
            * Note: Stored profile includes leader pulse (3500µs mark + 1750µs space) + 216 data bits.
          </div>
        </div>
      </div>

      {/* 4. Learned Commands List (Section 4) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h4 className="text-xs font-bold uppercase font-mono text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              LEARNED PANASONIC COMMANDS LIBRARY ({learnedCommands.length})
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Available pre-recorded IR carrier frames ready for replay dispatch
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Carrier: 38 kHz NEC Standard
          </span>
        </div>

        {/* Responsive Table for Desktop / Tablet */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                <th className="py-2.5 px-3">COMMAND NAME</th>
                <th className="py-2.5 px-3">PROTOCOL</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">SIGNAL LENGTH</th>
                <th className="py-2.5 px-3">LAST LEARNED</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {learnedCommands.map(cmd => (
                <tr key={cmd.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{cmd.name}</span>
                  </td>
                  <td className="py-3 px-3 text-blue-700">{cmd.protocol}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      {cmd.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{cmd.pulseCount} pulses</td>
                  <td className="py-3 px-3 text-slate-500">{cmd.lastLearnedTime}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => replayIrCommand(cmd.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1.5 ml-auto transition-all shadow-2xs"
                      title="Transmit IR carrier burst"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>REPLAY</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List for Viewports < 640px (Section 11) */}
        <div className="sm:hidden space-y-2.5">
          {learnedCommands.map(cmd => (
            <div
              key={cmd.id}
              className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 font-mono text-xs shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {cmd.name}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  {cmd.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Protocol: {cmd.protocol} ({cmd.pulseCount}p)</span>
                <span>{cmd.lastLearnedTime}</span>
              </div>
              <button
                onClick={() => replayIrCommand(cmd.id)}
                className="w-full py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>REPLAY IR COMMAND</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. IR Command History (Section 8) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase font-mono text-slate-900">
              IR TRANSMISSION & REPLAY AUDIT TRAIL
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Integrated with System Event Log
          </span>
        </div>

        {/* Table for Desktop / Tablet */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                <th className="py-2 px-3">TIMESTAMP</th>
                <th className="py-2 px-3">COMMAND / SIGNAL</th>
                <th className="py-2 px-3">TARGET</th>
                <th className="py-2 px-3">STATUS</th>
                <th className="py-2 px-3">CARRIER MODULATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {irEvents.length > 0 ? (
                irEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500">{evt.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {evt.acPower !== undefined ? (evt.acPower ? 'POWER ON' : 'POWER OFF') : evt.message.slice(0, 24)}
                    </td>
                    <td className="py-2.5 px-3 text-blue-700">Panasonic AC</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        SENT
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-xs">
                      {evt.message}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    No IR commands dispatched in current session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View for Viewports < 640px */}
        <div className="sm:hidden space-y-2">
          {irEvents.map(evt => (
            <div
              key={evt.id}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-xs space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {evt.acPower !== undefined ? (evt.acPower ? 'POWER ON' : 'POWER OFF') : 'IR BURST'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  SENT
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Target: Panasonic AC</span>
                <span>{evt.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
