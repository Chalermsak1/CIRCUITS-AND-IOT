import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { getDeviceStatusStyle } from '../../types/device';
import { Activity, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SystemHealthSummaryProps {
  className?: string;
  showTitle?: boolean;
}

export const SystemHealthSummary: React.FC<SystemHealthSummaryProps> = ({
  className,
  showTitle = true,
}) => {
  const { systemHealth } = useSystem();

  const healthItems = [
    {
      id: 'esp32',
      name: systemHealth.esp32.name,
      status: systemHealth.esp32.status,
      detail: `${systemHealth.esp32.cpu} • ${systemHealth.esp32.uptime}`,
    },
    {
      id: 'dht22',
      name: systemHealth.dht22.name,
      status: systemHealth.dht22.status,
      detail: `${systemHealth.dht22.temperature.toFixed(1)}°C • ${systemHealth.dht22.humidity.toFixed(1)}%`,
    },
    {
      id: 'pir',
      name: systemHealth.pir.name,
      status: systemHealth.pir.status,
      detail: systemHealth.pir.motion,
    },
    {
      id: 'irTransmitter',
      name: systemHealth.irTransmitter.name,
      status: systemHealth.irTransmitter.status,
      detail: systemHealth.irTransmitter.lastCommand,
    },
    {
      id: 'wifi',
      name: systemHealth.wifi.name,
      status: systemHealth.wifi.status,
      detail: `${systemHealth.wifi.rssi} • ${systemHealth.wifi.connection}`,
    },
  ];

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3',
        className
      )}
    >
      {showTitle && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold font-mono text-slate-900 tracking-wider uppercase">
              SYSTEM HEALTH
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-50 border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>5 / 5 NODES OPERATIONAL</span>
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200">
              SIMULATED
            </span>
          </div>
        </div>
      )}

      {/* Compact Engineering Summary Grid / Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {healthItems.map(item => {
          const style = getDeviceStatusStyle(item.status);
          return (
            <div
              key={item.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn('text-xs shrink-0 select-none', style.textClass)}>
                  ●
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 truncate">
                  {item.name}
                </span>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase shrink-0',
                  style.badgeClass
                )}
              >
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
