import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import type { HistoryFilterCategory } from '../types/history';
import { getEventTypeBadgeStyle } from '../types/history';
import { History, Download, Trash2, Filter, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '../utils/cn';

const FILTER_OPTIONS: HistoryFilterCategory[] = [
  'ALL',
  'SENSOR',
  'AC EVENTS',
  'AUTOMATION',
  'NETWORK',
  'SYSTEM',
];

export const HistoryPage: React.FC = () => {
  const { systemEvents, clearEvents } = useSystem();
  const [activeFilter, setActiveFilter] = useState<HistoryFilterCategory>('ALL');

  // Strict data-driven filtering (Prompt Section 9)
  const filteredEvents = activeFilter === 'ALL'
    ? systemEvents
    : systemEvents.filter(e => e.category === activeFilter);

  // Category counts for badges
  const getCategoryCount = (cat: HistoryFilterCategory) => {
    if (cat === 'ALL') return systemEvents.length;
    return systemEvents.filter(e => e.category === cat).length;
  };

  const exportCSV = () => {
    const headers = 'ID,Timestamp,Type,Category,Level,Source,Temperature,Humidity,Motion,AC_Power,Mode,Fan_Speed,Message,Details\n';
    const rows = filteredEvents
      .map(e => {
        const temp = e.temperature !== undefined ? `${e.temperature.toFixed(1)}°C` : '';
        const hum = e.humidity !== undefined ? `${e.humidity.toFixed(1)}%` : '';
        const mot = e.motionDetected !== undefined ? (e.motionDetected ? 'DETECTED' : 'CLEAR') : '';
        const ac = e.acPower !== undefined ? (e.acPower ? 'ON' : 'OFF') : '';
        const mode = e.acMode ? `${e.acMode.toUpperCase()} ${e.targetTemperature || ''}°C`.trim() : '';
        const fan = e.fanSpeed ? e.fanSpeed.toUpperCase() : '';
        const details = e.details ? JSON.stringify(e.details).replace(/"/g, '""') : '';
        const msg = e.message.replace(/"/g, '""');

        return `"${e.id}","${e.timestamp}","${e.type}","${e.category}","${e.level}","${e.source}","${temp}","${hum}","${mot}","${ac}","${mode}","${fan}","${msg}","${details}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ac_automation_event_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            AUTOMATION DECISION & SYSTEM EVENT LOGS
          </h2>
          <p className="text-xs text-slate-500">
            Engineering audit trail of closed-loop automation triggers, sensor state transitions, and infrared burst records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs font-mono text-blue-700 shadow-2xs flex items-center gap-1.5 transition-all"
            title="Download CSV audit log"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={clearEvents}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-xs font-mono text-rose-700 shadow-2xs flex items-center gap-1.5 transition-all"
            title="Clear all recorded events"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* 2. Audit Trail Diagnostics Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">TRANSITION AUDIT STREAM</span>
          <span className="text-slate-400">•</span>
          <span className="text-blue-700 font-semibold">{filteredEvents.length} events matching filter</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>Edge-Triggered (Zero Duplicates)</span>
        </div>
      </div>

      {/* 3. Filter Tabs (Prompt Section 9) */}
      <div className="flex items-center gap-2 text-xs font-mono overflow-x-auto pb-1">
        <span className="text-slate-500 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {FILTER_OPTIONS.map(category => {
          const count = getCategoryCount(category);
          const isActive = activeFilter === category;
          return (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 uppercase',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
              )}
            >
              <span>{category}</span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px]',
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-500'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Desktop Engineering Table (Prompt Section 10: Suggested Columns) */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Temperature</th>
                <th className="py-3 px-3 text-right">Humidity</th>
                <th className="py-3 px-3 text-center">Motion</th>
                <th className="py-3 px-3 text-center">AC</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-4">Action / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-mono">
                    No events logged matching category &quot;{activeFilter}&quot;.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => {
                  const style = getEventTypeBadgeStyle(event.type);
                  return (
                    <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Timestamp */}
                      <td className="py-2.5 px-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                        {event.timestamp}
                      </td>

                      {/* 2. Type */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold uppercase border inline-flex items-center gap-1.5',
                            style.badgeClass
                          )}
                        >
                          <span className={cn('text-xs select-none', style.dotClass)}>●</span>
                          <span>{event.type}</span>
                        </span>
                      </td>

                      {/* 3. Temperature */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {event.temperature !== undefined ? (
                          <span className="text-amber-600 font-semibold">
                            {event.temperature.toFixed(1)} °C
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* 4. Humidity */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {event.humidity !== undefined ? (
                          <span className="text-blue-600 font-semibold">
                            {event.humidity.toFixed(1)} %
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* 5. Motion */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {event.motionDetected !== undefined ? (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                              event.motionDetected
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            )}
                          >
                            {event.motionDetected ? 'DETECTED' : 'CLEAR'}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* 6. AC */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {event.acPower !== undefined ? (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                              event.acPower
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            )}
                          >
                            {event.acPower ? 'ON' : 'OFF'}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* 7. Mode */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 text-[11px]">
                        {event.acMode ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            {event.acMode.toUpperCase()}{' '}
                            {event.targetTemperature ? `${event.targetTemperature}°C` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* 8. Action / Reason */}
                      <td className="py-2.5 px-4 text-slate-800 text-xs">
                        <div className="leading-snug">{event.message}</div>
                        {event.details?.reason && (
                          <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                            Reason: {event.details.reason}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Mobile Responsive Card Stack (Prompt Section 10: No Horizontal Scroll) */}
      <div className="md:hidden space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-400 font-mono text-xs border border-slate-200">
            No events logged matching category &quot;{activeFilter}&quot;.
          </div>
        ) : (
          filteredEvents.map(event => {
            const style = getEventTypeBadgeStyle(event.type);
            return (
              <div
                key={event.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5 font-mono text-xs"
              >
                {/* Top Row: Timestamp, Source, Type Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {event.timestamp}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      {event.source}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase border inline-flex items-center gap-1',
                      style.badgeClass
                    )}
                  >
                    <span className={cn('text-xs select-none', style.dotClass)}>●</span>
                    <span>{event.type}</span>
                  </span>
                </div>

                {/* Middle Row: Message & Reason */}
                <div className="text-slate-800 text-xs leading-relaxed">
                  {event.message}
                  {event.details?.reason && (
                    <div className="text-[11px] text-blue-700 font-medium mt-1">
                      Reason: {event.details.reason}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Telemetry Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-[10px]">
                  {event.temperature !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-medium">
                      T: {event.temperature.toFixed(1)}°C
                    </span>
                  )}
                  {event.humidity !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-medium">
                      RH: {event.humidity.toFixed(1)}%
                    </span>
                  )}
                  {event.motionDetected !== undefined && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded border font-semibold',
                        event.motionDetected
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      )}
                    >
                      PIR: {event.motionDetected ? 'DETECTED' : 'CLEAR'}
                    </span>
                  )}
                  {event.acPower !== undefined && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded border font-semibold',
                        event.acPower
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600'
                      )}
                    >
                      AC: {event.acPower ? 'ON' : 'OFF'}
                    </span>
                  )}
                  {event.acMode && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {event.acMode.toUpperCase()}{' '}
                      {event.targetTemperature ? `${event.targetTemperature}°C` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

