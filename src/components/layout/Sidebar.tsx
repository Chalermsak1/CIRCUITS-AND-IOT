import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  Thermometer,
  Cpu,
  History,
  Radio,
  Wifi,
  Settings,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { cn } from '../../utils/cn';

export type PageId =
  | 'dashboard'
  | 'control'
  | 'sensors'
  | 'system'
  | 'history'
  | 'devices'
  | 'wifi'
  | 'settings';

interface Props {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'control', label: 'Control', icon: Sliders },
  { id: 'sensors', label: 'Sensors', icon: Thermometer },
  { id: 'system', label: 'System', icon: Cpu },
  { id: 'history', label: 'History', icon: History },
  { id: 'devices', label: 'Devices', icon: Radio },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<Props> = ({ activePage, onSelectPage }) => {
  const { activeWifiNetwork } = useSystem();

  return (
    <aside className="w-60 border-r border-slate-200 bg-white hidden md:flex flex-col justify-between p-3.5 shrink-0 select-none shadow-2xs">
      <div className="space-y-1">
        {/* Top Header */}
        <div className="px-3 pb-3 mb-2 border-b border-slate-200">
          <h2 className="text-xs font-bold font-mono text-slate-900 tracking-wide uppercase">
            AUTOMATIC AC CONTROL
          </h2>
          <span className="text-[10px] font-mono text-blue-600 font-semibold block mt-0.5">
            ESP32 / IoT SYSTEM
          </span>
        </div>

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 font-mono">
          NAVIGATION
        </div>

        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600' : 'text-slate-400')} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Section: System Status & Wi-Fi Status */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">System Status</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ONLINE
          </span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/80">
          <span className="text-slate-500 text-[11px]">Wi-Fi</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            CONNECTED
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
          <span className="truncate max-w-[100px] font-medium text-slate-700">{activeWifiNetwork.ssid}</span>
          <span className="font-mono">{activeWifiNetwork.rssi} dBm</span>
        </div>
      </div>
    </aside>
  );
};
