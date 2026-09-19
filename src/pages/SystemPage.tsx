import React from 'react';
import { useSystem } from '../context/SystemContext';
import { PresentationDemoBar } from '../components/demo/PresentationDemoBar';
import {
  Cpu,
  Activity,
  Thermometer,
  Globe,
  Monitor,
  Power,
  ArrowDown,
  Waves,
} from 'lucide-react';
import { cn } from '../utils/cn';

export const SystemPage: React.FC = () => {
  const { sensor, acState, automationDecision } = useSystem();

  const isCoolingActive = automationDecision.state === 'AUTO_COOLING' || acState.acPower;

  return (
    <div className="space-y-6">
      {/* Top Demo Bar for quick presentation switching */}
      <PresentationDemoBar />

      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-wide flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          CIRCUIT & SYSTEM ARCHITECTURE
        </h2>
        <p className="text-xs text-slate-500">
          Hardware schematic, signal processing path, ESP32 decision logic, and telemetry pipelines
        </p>
      </div>

      {/* Interactive System Flow Diagram */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            PHYSICAL SIGNAL FLOW & CIRCUIT TELEMETRY
          </h3>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-50 text-blue-700 border border-slate-200 shadow-2xs font-semibold">
            Pipeline Status: {isCoolingActive ? 'ACTIVE COOLING LOOP' : 'MONITORING STANDBY'}
          </span>
        </div>

        {/* CSS Diagram with Subtle Engineering Animation */}
        <div className="flex flex-col items-center space-y-5 max-w-2xl mx-auto py-2">
          {/* Level 1: Sensors */}
          <div className="grid grid-cols-2 gap-6 w-full">
            {/* DHT22 */}
            <div
              className={cn(
                'rounded-xl p-4 flex items-center gap-3 transition-all duration-300',
                sensor.temperature > 26.0
                  ? 'bg-amber-50/80 border border-amber-300 shadow-xs'
                  : 'bg-slate-50 border border-slate-200'
              )}
            >
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1.5">
                  <span>DHT22</span>
                  {sensor.temperature > 26.0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-bold">HOT</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">Temp + Humidity</div>
                <div className="text-xs font-mono text-amber-700 font-bold mt-0.5">
                  {sensor.temperature.toFixed(1)}°C | {sensor.humidity.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* PIR */}
            <div
              className={cn(
                'rounded-xl p-4 flex items-center gap-3 transition-all duration-300',
                sensor.motion
                  ? 'bg-emerald-50/80 border border-emerald-300 shadow-xs'
                  : 'bg-slate-50 border border-slate-200'
              )}
            >
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                <Activity className={cn('w-5 h-5', sensor.motion && 'animate-pulse')} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1.5">
                  <span>PIR HC-SR501</span>
                  <span
                    className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded font-bold border',
                      sensor.motion
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    )}
                  >
                    {sensor.motion ? 'HIGH' : 'LOW'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Motion Detection</div>
                <div
                  className={cn(
                    'text-xs font-mono font-bold mt-0.5',
                    sensor.motion ? 'text-emerald-700' : 'text-slate-400'
                  )}
                >
                  {sensor.motion ? 'DETECTED' : 'CLEAR'}
                </div>
              </div>
            </div>
          </div>

          <ArrowDown className={cn('w-5 h-5 transition-colors', isCoolingActive ? 'text-blue-600' : 'text-slate-400')} />

          {/* Level 2: Sensor Interface */}
          <div
            className={cn(
              'w-full rounded-xl p-3 text-center transition-all duration-300',
              isCoolingActive
                ? 'bg-blue-50/60 border border-blue-200 shadow-xs'
                : 'bg-slate-50 border border-slate-200'
            )}
          >
            <div className="text-xs font-mono font-bold text-slate-800">
              SENSOR INTERFACE & LEVEL SHIFTING
            </div>
            <div className="text-[11px] text-slate-500">
              Single-Bus Pull-Up 4.7kΩ (DHT22) + Digital 3.3V Buffer (PIR)
            </div>
          </div>

          <ArrowDown className={cn('w-5 h-5 transition-colors', isCoolingActive ? 'text-blue-600' : 'text-slate-400')} />

          {/* Level 3: ESP32 Central Controller */}
          <div
            className={cn(
              'w-full rounded-xl p-5 text-center relative overflow-hidden transition-all duration-300',
              isCoolingActive
                ? 'bg-blue-50 border border-blue-300 shadow-md ring-1 ring-blue-400/30'
                : 'bg-slate-50 border border-slate-200'
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Cpu className={cn('w-5 h-5 text-blue-600', isCoolingActive && 'animate-pulse')} />
              <span className="text-sm font-bold font-mono text-slate-900">
                ESP32 MICROCONTROLLER
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Xtensa 32-bit LX6 @ 240MHz • FreeRTOS
            </div>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded bg-white border border-blue-200 text-xs font-mono text-blue-800 shadow-2xs">
              <span className="text-slate-500">Decision State:</span>
              <span className="font-bold text-blue-700">{automationDecision.state}</span>
            </div>
          </div>

          {/* Fork: Left -> Decision / IR Driver -> AC, Right -> Wi-Fi -> Dashboard */}
          <div className="grid grid-cols-2 gap-6 w-full">
            {/* Left Branch: Decision Logic -> IR Driver -> AC */}
            <div className="flex flex-col items-center space-y-4">
              <ArrowDown className={cn('w-5 h-5 transition-colors', isCoolingActive ? 'text-blue-600' : 'text-slate-400')} />

              <div
                className={cn(
                  'w-full rounded-xl p-3 text-center transition-all duration-300',
                  isCoolingActive
                    ? 'bg-white border border-blue-300 shadow-xs'
                    : 'bg-slate-50 border border-slate-200'
                )}
              >
                <div className="text-xs font-mono font-bold text-slate-800">
                  DECISION LOGIC
                </div>
                <div className="text-[11px] text-slate-500">
                  evaluateAutomation() Engine
                </div>
                <div
                  className={cn(
                    'text-[10px] font-mono mt-1 font-bold',
                    automationDecision.desiredPower ? 'text-emerald-700' : 'text-slate-500'
                  )}
                >
                  Target: {automationDecision.desiredPower ? 'AC ON' : 'AC OFF'}
                </div>
              </div>

              <ArrowDown className={cn('w-5 h-5 transition-colors', isCoolingActive ? 'text-emerald-600' : 'text-slate-400')} />

              {/* IR Driver Circuit */}
              <div
                className={cn(
                  'w-full rounded-xl p-3 text-center transition-all duration-300',
                  acState.acPower
                    ? 'bg-emerald-50 border border-emerald-300 shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-500'
                )}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-slate-800">
                  <Waves className={cn('w-3.5 h-3.5', acState.acPower ? 'text-emerald-600 animate-pulse' : 'text-slate-400')} />
                  <span>IR DRIVER CIRCUIT</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  38kHz Carrier (BC548 NPN + 940nm IR LED)
                </div>
                <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-semibold">
                  {acState.acPower ? '● MODULATION ACTIVE' : '○ Standby'}
                </div>
              </div>

              <ArrowDown className={cn('w-5 h-5 transition-colors', acState.acPower ? 'text-emerald-600' : 'text-slate-400')} />

              {/* Air Conditioner Unit */}
              <div
                className={cn(
                  'w-full border rounded-xl p-4 text-center transition-all duration-300',
                  acState.acPower
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm ring-1 ring-emerald-400/40'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                )}
              >
                <Power className={cn('w-6 h-6 mx-auto mb-1', acState.acPower ? 'text-emerald-600 animate-pulse' : 'text-slate-400')} />
                <div className="text-xs font-bold font-mono">AIR CONDITIONER</div>
                <div className="text-xs font-mono font-bold mt-1">
                  POWER: {acState.acPower ? 'ON (RUNNING)' : 'OFF (STANDBY)'}
                </div>
                {acState.acPower && (
                  <div className="text-[10px] text-emerald-700 font-mono mt-1 font-semibold">
                    COOL {acState.targetTemperature}°C • FAN {acState.fanSpeed.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Right Branch: Wi-Fi -> Internet -> Web Dashboard */}
            <div className="flex flex-col items-center space-y-4">
              <ArrowDown className="w-5 h-5 text-blue-500" />

              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <div className="text-xs font-mono font-bold text-slate-800">
                  WI-FI SUBSYSTEM
                </div>
                <div className="text-[11px] text-slate-500">
                  802.11 b/g/n Interface (Channel 6)
                </div>
              </div>

              <ArrowDown className="w-5 h-5 text-blue-500" />

              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <div className="text-xs font-mono font-bold text-slate-800 flex items-center justify-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  INTERNET / HTTP GATEWAY
                </div>
                <div className="text-[11px] text-slate-500">
                  REST Telemetry & WebSocket Stream
                </div>
              </div>

              <ArrowDown className="w-5 h-5 text-blue-500" />

              <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-center text-blue-800 shadow-2xs">
                <Monitor className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <div className="text-xs font-bold font-mono">WEB DASHBOARD</div>
                <div className="text-xs font-mono mt-1 text-slate-600">
                  React 19 + TypeScript IoT Console
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Presentation Architecture Cheat Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-700 uppercase">
            <Thermometer className="w-4 h-4" />
            <span>1. Sensor Acquisition Stage</span>
          </div>
          <p className="text-xs text-slate-600">
            DHT22 samples humidity and temperature every 2 seconds. The PIR detects IR radiation changes caused by human body heat.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 uppercase">
            <Cpu className="w-4 h-4" />
            <span>2. Edge Decision Processing</span>
          </div>
          <p className="text-xs text-slate-600">
            The ESP32 processes Rule C (Hot + Occupied) and Rule E (Vacancy Timeout) locally with zero cloud latency.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 uppercase">
            <Power className="w-4 h-4" />
            <span>3. Actuation &amp; Web Telemetry</span>
          </div>
          <p className="text-xs text-slate-600">
            BC548 transistor modulates a 38kHz NEC code to the AC while Wi-Fi transmits live telemetry packets to this web dashboard.
          </p>
        </div>
      </div>

      {/* Bill of Materials (BOM) Specification Table (Section 19) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              ENGINEERING BILL OF MATERIALS (BOM) &amp; PINOUT MAPPING
            </h3>
            <p className="text-xs text-slate-500">
              Complete hardware component specification, pin connections, and circuit functions
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Design Rev 1.4
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                <th className="py-2.5 px-3">COMPONENT</th>
                <th className="py-2.5 px-3">SPECIFICATION</th>
                <th className="py-2.5 px-3">PIN / BUS</th>
                <th className="py-2.5 px-3">PURPOSE</th>
                <th className="py-2.5 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">ESP32 DevKit V1</td>
                <td className="py-2.5 px-3 text-slate-600">30-pin, 240 MHz Xtensa Dual-Core</td>
                <td className="py-2.5 px-3 text-blue-600 font-semibold">Central MCU</td>
                <td className="py-2.5 px-3 text-slate-600">Logic engine, Wi-Fi web socket, FreeRTOS controller</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    VERIFIED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">DHT22 / AM2302</td>
                <td className="py-2.5 px-3 text-slate-600">-40 to 80°C (±0.5°C), 0-100% RH</td>
                <td className="py-2.5 px-3 text-amber-600 font-semibold">GPIO 4 (1-Wire)</td>
                <td className="py-2.5 px-3 text-slate-600">Ambient temperature &amp; relative humidity sensing</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    VERIFIED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">PIR HC-SR501</td>
                <td className="py-2.5 px-3 text-slate-600">Pyroelectric infrared, 120° cone, 7m</td>
                <td className="py-2.5 px-3 text-emerald-600 font-semibold">GPIO 13 (Digital In)</td>
                <td className="py-2.5 px-3 text-slate-600">Human presence / occupancy motion detection</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    VERIFIED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">IR Transmitter LED</td>
                <td className="py-2.5 px-3 text-slate-600">940nm infrared emitter diode, 38 kHz</td>
                <td className="py-2.5 px-3 text-blue-600 font-semibold">GPIO 14 (LEDC PWM)</td>
                <td className="py-2.5 px-3 text-slate-600">Panasonic AC remote control emulation</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    VERIFIED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">NPN Transistor</td>
                <td className="py-2.5 px-3 text-slate-600">BC548 / 2N2222 (Vceo 40V, 500mA)</td>
                <td className="py-2.5 px-3 text-slate-600">Base via 1kΩ to GPIO 14</td>
                <td className="py-2.5 px-3 text-slate-600">High-current IR LED modulation switch (5V rail)</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    VERIFIED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">Pull-up Resistor</td>
                <td className="py-2.5 px-3 text-slate-600">4.7 kΩ ±1% metal film</td>
                <td className="py-2.5 px-3 text-slate-600">GPIO 4 to 3.3V DC</td>
                <td className="py-2.5 px-3 text-slate-600">DHT22 single-bus line passive pull-up</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    VERIFIED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">Current Limit Resistor</td>
                <td className="py-2.5 px-3 text-slate-600">220 Ω ±5% carbon film</td>
                <td className="py-2.5 px-3 text-slate-600">5V rail to IR Anode</td>
                <td className="py-2.5 px-3 text-slate-600">Limits burst forward current through 940nm IR LED</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    VERIFIED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

