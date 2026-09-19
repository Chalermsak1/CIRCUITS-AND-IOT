import React from 'react';
import { useSystem } from '../context/SystemContext';
import { SystemHealthSummary } from '../components/devices/SystemHealthSummary';
import { getDeviceStatusStyle } from '../types/device';
import {
  Cpu,
  Thermometer,
  Activity,
  Send,
  Wifi,
  Radio,
  Info,
  Layers,
} from 'lucide-react';
import { cn } from '../utils/cn';

export const DevicesPage: React.FC = () => {
  const { systemHealth, timeSinceLastMotion } = useSystem();
  const { esp32, dht22, pir, irTransmitter, wifi } = systemHealth;

  const esp32Style = getDeviceStatusStyle(esp32.status);
  const dht22Style = getDeviceStatusStyle(dht22.status);
  const pirStyle = getDeviceStatusStyle(pir.status);
  const irStyle = getDeviceStatusStyle(irTransmitter.status);
  const wifiStyle = getDeviceStatusStyle(wifi.status);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            CONNECTED IOT HARDWARE NODES & SYSTEM HEALTH
          </h2>
          <p className="text-xs text-slate-500">
            Microcontroller peripheral bus, sensor telemetry, IR modulation, and wireless link status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-md bg-white text-emerald-700 border border-emerald-200 shadow-2xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            NODE STATUS: 5 / 5 OPERATIONAL
          </span>
        </div>
      </div>

      {/* 2. Hardware Honesty Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 shadow-2xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 uppercase tracking-wider font-mono text-[11px]">
              SIMULATED HARDWARE TELEMETRY
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-100 text-blue-700 border border-blue-200">
              DEMO / EMULATION
            </span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            The values below reflect simulated device telemetry synchronized with the active application state (DHT22 sensor, PIR motion, IR actuator, and 2.4 GHz Wi-Fi). No physical ESP32 hardware is currently connected.
          </p>
        </div>
      </div>

      {/* 3. Section 8: Compact System Health Summary */}
      <SystemHealthSummary />

      {/* 4. Detailed Hardware Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Node 1: ESP32 Microcontroller */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide">
                      {esp32.name}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                      SIMULATED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Dual-Core Xtensa LX6 (240 MHz)
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase',
                  esp32Style.badgeClass
                )}
              >
                {esp32.status}
              </span>
            </div>

            {/* Field Table */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">CPU:</span>
                <span className="text-slate-800 font-semibold">{esp32.cpu}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">IP Address:</span>
                <span className="text-blue-600 font-semibold">{esp32.ipAddress}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Wi-Fi RSSI:</span>
                <span className="text-emerald-600 font-semibold">{esp32.wifiRssi}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Uptime:</span>
                <span className="text-slate-800 font-semibold">{esp32.uptime}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Firmware:</span>
                <span className="text-slate-700 font-semibold">{esp32.firmware}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Last Seen:</span>
                <span className="text-slate-700">{esp32.lastSeen}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-100">
            <span>SRAM: 320 KB</span>
            <span>Flash: 4 MB SPI</span>
          </div>
        </div>

        {/* Node 2: DHT22 Sensor */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-amber-200 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-600">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide">
                      {dht22.name}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                      SIMULATED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Digital Temperature & Humidity (AM2302)
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase',
                  dht22Style.badgeClass
                )}
              >
                {dht22.status}
              </span>
            </div>

            {/* Field Table */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Temperature:</span>
                <span className="text-amber-600 font-semibold text-sm">
                  {dht22.temperature.toFixed(1)} °C
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Humidity:</span>
                <span className="text-blue-600 font-semibold text-sm">
                  {dht22.humidity.toFixed(1)} %
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Last Update:</span>
                <span className="text-slate-700">{dht22.lastUpdate}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-100">
            <span>Bus: GPIO 4 (1-Wire)</span>
            <span>Rate: 0.5 Hz (2.0s)</span>
          </div>
        </div>

        {/* Node 3: PIR Motion Sensor */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-200 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide">
                      {pir.name}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                      SIMULATED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pyroelectric Infrared Sensor (HC-SR501)
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase',
                  pirStyle.badgeClass
                )}
              >
                {pir.status}
              </span>
            </div>

            {/* Field Table */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Motion:</span>
                <span
                  className={cn(
                    'font-bold px-2 py-0.5 rounded text-[11px]',
                    pir.motion === 'DETECTED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  )}
                >
                  {pir.motion}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Last Motion:</span>
                <span className="text-slate-800 font-semibold">{pir.lastMotion}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Timeout:</span>
                <span className="text-blue-600 font-semibold">{pir.timeout} s</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-100">
            <span>Bus: GPIO 13 (Digital)</span>
            <span>Idle Clock: {timeSinceLastMotion}s</span>
          </div>
        </div>

        {/* Node 4: IR Transmitter */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide">
                      {irTransmitter.name}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                      SIMULATED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    940nm Infrared Modulation Driver
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase',
                  irStyle.badgeClass
                )}
              >
                {irTransmitter.status}
              </span>
            </div>

            {/* Field Table */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Last Command:</span>
                <span
                  className={cn(
                    'font-bold px-2 py-0.5 rounded text-[11px]',
                    irTransmitter.lastCommand.includes('ON')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  )}
                >
                  {irTransmitter.lastCommand}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Mode:</span>
                <span className="text-blue-600 font-semibold">{irTransmitter.mode}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Target:</span>
                <span className="text-slate-800 font-semibold">
                  {irTransmitter.target} °C
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Fan:</span>
                <span className="text-slate-800 font-semibold">{irTransmitter.fan}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-100">
            <span>Carrier: 38 kHz (GPIO 14)</span>
            <span>Protocol: Panasonic AC</span>
          </div>
        </div>

        {/* Node 5: Wi-Fi Interface */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-sky-200 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-50 border border-sky-100 text-sky-600">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide">
                      {wifi.name}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                      SIMULATED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    802.11 b/g/n 2.4 GHz Station Mode
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase',
                  wifiStyle.badgeClass
                )}
              >
                {wifi.status}
              </span>
            </div>

            {/* Field Table */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Connection:</span>
                <span className="text-emerald-600 font-semibold">{wifi.connection}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">RSSI:</span>
                <span className="text-slate-800 font-semibold">{wifi.rssi}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">SSID:</span>
                <span className="text-blue-600 font-semibold">{wifi.ssid}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-100">
            <span>Band: 2.4 GHz (Ch 6)</span>
            <span>Sec: WPA2-PSK (AES)</span>
          </div>
        </div>

        {/* Supplementary Node: Microcontroller Bus Architecture */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide">
                    GPIO PIN MAP
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Physical Wiring & Signal Interfaces
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase bg-slate-100 text-slate-600 border-slate-200">
                CIRCUIT REF
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">GPIO 4</span>
                <span className="text-amber-600 font-medium">DHT22 Data (Single-Bus)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">GPIO 13</span>
                <span className="text-emerald-600 font-medium">PIR Motion In (Active HIGH)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">GPIO 14</span>
                <span className="text-blue-600 font-medium">IR LED Mod (38 kHz PWM)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">3V3 / GND</span>
                <span className="text-slate-700 font-medium">Regulated 3.3V DC Rail</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-100">
            <span>Logic: 3.3V TTL</span>
            <span>Bus Isolation: Validated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

