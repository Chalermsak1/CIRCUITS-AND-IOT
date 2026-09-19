import React from 'react';
import { useSystem } from '../context/SystemContext';
import {
  Thermometer,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '../utils/cn';

export const SensorsPage: React.FC = () => {
  const {
    sensor,
    timeSinceLastMotion,
    motionTimeout,
    temperatureThreshold,
    triggerManualMotion,
    setManualTemperature,
  } = useSystem();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-wide flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-600" />
          SENSOR DIAGNOSTICS & TELEMETRY
        </h2>
        <p className="text-xs text-slate-500">
          Hardware telemetry, pin mapping, signal integrity, and test overrides
        </p>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sensor 1: DHT22 */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  DHT22 / AM2302 SENSOR
                </h3>
                <p className="text-xs text-slate-500">
                  Digital Temperature & Humidity (Single-Bus GPIO 4)
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-2xs">
              CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500">Current Reading</div>
              <div className="text-2xl font-bold font-mono-data text-slate-900 mt-1">
                {sensor.temperature.toFixed(1)} °C
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Accuracy: ±0.5°C
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500">Relative Humidity</div>
              <div className="text-2xl font-bold font-mono-data text-blue-700 mt-1">
                {sensor.humidity.toFixed(1)} %
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Accuracy: ±2-5% RH
              </div>
            </div>
          </div>

          {/* Interactive Temperature Injection Slider */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex justify-between text-xs">
              <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                Live Temperature Injection Override
              </span>
              <span className="font-mono text-blue-700 font-bold">
                {sensor.temperature.toFixed(1)}°C
              </span>
            </div>
            <input
              type="range"
              min="18.0"
              max="35.0"
              step="0.1"
              value={sensor.temperature}
              onChange={e => setManualTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>18°C</span>
              <span className="text-amber-700 font-bold">Threshold: {temperatureThreshold}°C</span>
              <span>35°C</span>
            </div>
          </div>
        </div>

        {/* Sensor 2: PIR Motion Sensor */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-2xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  PIR MOTION DETECTOR (HC-SR501)
                </h3>
                <p className="text-xs text-slate-500">
                  Pyroelectric Infrared Sensor (Digital In GPIO 13)
                </p>
              </div>
            </div>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-mono rounded-full border font-semibold shadow-2xs',
                sensor.motion
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              )}
            >
              {sensor.motion ? 'MOTION ACTIVE' : 'NO MOTION'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500">Signal State</div>
              <div
                className={cn(
                  'text-xl font-bold font-mono-data mt-1',
                  sensor.motion ? 'text-emerald-700' : 'text-slate-500'
                )}
              >
                {sensor.motion ? 'LOGIC HIGH (1)' : 'LOGIC LOW (0)'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Detection angle: 120°
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500">Inactivity Counter</div>
              <div className="text-xl font-bold font-mono-data text-slate-900 mt-1">
                {timeSinceLastMotion} <span className="text-xs font-normal text-slate-500">sec</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Limit: {motionTimeout}s
              </div>
            </div>
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => triggerManualMotion(true)}
              className={cn(
                'flex-1 py-3 rounded-lg border text-xs font-bold font-mono transition-all shadow-2xs',
                sensor.motion
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              )}
            >
              SIMULATE OCCUPANCY (MOTION ON)
            </button>
            <button
              onClick={() => triggerManualMotion(false)}
              className={cn(
                'flex-1 py-3 rounded-lg border text-xs font-bold font-mono transition-all shadow-2xs',
                !sensor.motion
                  ? 'bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              )}
            >
              SIMULATE VACANT (MOTION OFF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
