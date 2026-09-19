import React from 'react';
import { useSystem } from '../../context/SystemContext';
import {
  Thermometer,
  Activity,
  Cpu,
  Radio,
  Wifi,
  Monitor,
  ArrowRight,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
  className?: string;
}

export const SystemDataFlowDiagram: React.FC<Props> = ({ className }) => {
  const {
    sensor,
    acState,
    automationDecision,
    systemHealth,
    activeWifiNetwork,
    learnedCommands,
  } = useSystem();
  const esp32 = systemHealth.esp32;

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase font-mono">
              SYSTEM DATA FLOW ARCHITECTURE
            </h3>
            <p className="text-xs text-slate-500">
              End-to-End IoT Telemetry, Decision Pipeline & Actuation Flow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-blue-700 font-semibold">Live Field Bus</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Closed-Loop IR Loop</span>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="space-y-6">
        {/* Physical Actuation Pipeline: DHT22 & PIR -> Sensor Interface -> ESP32 -> Decision & IR -> Panasonic AC */}
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
            <span className="text-amber-700">PIPELINE 1:</span>
            <span>PHYSICAL SENSING &amp; IR ACTUATION PATH</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* 1. Dual Sensors Node */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 relative group hover:border-blue-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2">
                <span className="font-bold text-slate-900">SENSORS</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  READY
                </span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {/* DHT22 */}
                <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span className="text-slate-700">DHT22</span>
                  </div>
                  <span className="text-slate-900 font-bold">{sensor.temperature.toFixed(1)}°C</span>
                </div>
                {/* PIR */}
                <div className="flex items-center justify-between bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-slate-700">PIR</span>
                  </div>
                  <span className={cn('font-bold', sensor.motion ? 'text-emerald-700' : 'text-slate-500')}>
                    {sensor.motion ? 'HIGH' : 'LOW'}
                  </span>
                </div>
              </div>
            </div>

            {/* Arrow Desktop */}
            <div className="hidden md:flex flex-col items-center justify-center text-blue-600">
              <div className="text-[9px] font-mono text-slate-400 mb-0.5">GPIO 4, 13</div>
              <div className="relative flex items-center justify-center w-full">
                <div className="h-0.5 w-full bg-slate-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-data-flow" />
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 -ml-1 shrink-0" />
              </div>
            </div>
            {/* Arrow Mobile */}
            <div className="flex md:hidden justify-center text-blue-600 py-1">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* 2. ESP32 Microcontroller Node */}
            <div className="bg-slate-50 rounded-lg p-3 border border-blue-200 relative group shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2">
                <span className="font-bold text-blue-800 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  ESP32 MCU
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  CORE 0/1
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">CPU Clock:</span>
                  <span className="text-slate-900 font-bold">{esp32.cpu}</span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">Decision:</span>
                  <span className="text-amber-700 font-bold">{automationDecision.state}</span>
                </div>
                <div className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  Tick: 1000ms loop
                </div>
              </div>
            </div>

            {/* Arrow Desktop */}
            <div className="hidden md:flex flex-col items-center justify-center text-blue-600">
              <div className="text-[9px] font-mono text-slate-400 mb-0.5">GPIO 14 (IR)</div>
              <div className="relative flex items-center justify-center w-full">
                <div className="h-0.5 w-full bg-slate-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-data-flow" />
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 -ml-1 shrink-0" />
              </div>
            </div>
            {/* Arrow Mobile */}
            <div className="flex md:hidden justify-center text-blue-600 py-1">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* 3. IR Transmitter & Panasonic AC Node */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 relative group hover:border-emerald-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  IR DRIVER → AC
                </span>
                <span
                  className={cn(
                    'text-[9px] px-1 py-0.5 rounded font-bold border',
                    acState.acPower
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  )}
                >
                  {acState.acPower ? 'AC ON' : 'AC OFF'}
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">Carrier:</span>
                  <span className="text-slate-900 font-bold">38 kHz</span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">IR Code:</span>
                  <span className="text-blue-700 font-bold">{learnedCommands.length} Learned</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  Target: {acState.targetTemperature}°C ({acState.fanSpeed})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry & Network Pipeline: ESP32 -> Wi-Fi 802.11 b/g/n -> Web Dashboard */}
        <div className="pt-3 border-t border-slate-200">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
            <span className="text-blue-700">PIPELINE 2:</span>
            <span>WIRELESS TELEMETRY &amp; REAL-TIME WEB DASHBOARD</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* 1. ESP32 Wireless Transceiver */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  ESP32 Wi-Fi
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  STA MODE
                </span>
              </div>
              <div className="font-mono text-xs space-y-1">
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">SSID:</span>
                  <span className="text-slate-900 font-bold truncate max-w-[90px]">
                    {activeWifiNetwork ? activeWifiNetwork.ssid : 'Home_WiFi'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">Signal:</span>
                  <span className="text-blue-700 font-bold">
                    {activeWifiNetwork ? `${activeWifiNetwork.rssi} dBm` : '-65 dBm'}
                  </span>
                </div>
              </div>
            </div>

            {/* Arrow Desktop */}
            <div className="hidden md:flex flex-col items-center justify-center text-blue-600">
              <div className="text-[9px] font-mono text-slate-400 mb-0.5">802.11 b/g/n</div>
              <div className="relative flex items-center justify-center w-full">
                <div className="h-0.5 w-full bg-slate-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-data-flow" />
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 -ml-1 shrink-0" />
              </div>
            </div>
            {/* Arrow Mobile */}
            <div className="flex md:hidden justify-center text-blue-600 py-1">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* 2. Wi-Fi Access Point / Router Node */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-blue-600" />
                  WLAN ROUTER
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  DHCP OK
                </span>
              </div>
              <div className="font-mono text-xs space-y-1">
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">Gateway:</span>
                  <span className="text-slate-900 font-bold">{activeWifiNetwork?.gateway ?? '192.168.1.1'}</span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">Security:</span>
                  <span className="text-emerald-700 font-bold">{activeWifiNetwork ? activeWifiNetwork.security : 'WPA2-PSK'}</span>
                </div>
              </div>
            </div>

            {/* Arrow Desktop */}
            <div className="hidden md:flex flex-col items-center justify-center text-blue-600">
              <div className="text-[9px] font-mono text-slate-400 mb-0.5">HTTP / WebSocket</div>
              <div className="relative flex items-center justify-center w-full">
                <div className="h-0.5 w-full bg-slate-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-data-flow" />
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 -ml-1 shrink-0" />
              </div>
            </div>
            {/* Arrow Mobile */}
            <div className="flex md:hidden justify-center text-blue-600 py-1">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* 3. React Web Dashboard Client Node */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-blue-600" />
                  WEB DASHBOARD
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="font-mono text-xs space-y-1">
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">Stack:</span>
                  <span className="text-blue-700 font-bold">React 19 + TS</span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-bold">Synced (Live)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
