import {
  LayoutDashboard,
  Sliders,
  Thermometer,
  Cpu,
  Radio,
  Wifi,
  History,
  Settings,
} from 'lucide-react';
import type { PageId } from './Sidebar';
import { cn } from '../../utils/cn';

interface Props {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
}

export const BottomNav: React.FC<Props> = ({ activePage, onSelectPage }) => {
  const items: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'control', label: 'Control', icon: Sliders },
    { id: 'sensors', label: 'Sensors', icon: Thermometer },
    { id: 'devices', label: 'Devices', icon: Radio },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { id: 'system', label: 'Circuit', icon: Cpu },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 border-t border-slate-200 backdrop-blur-lg flex items-center px-1 z-40 overflow-x-auto no-scrollbar shadow-lg">
      <div className="flex items-center justify-between w-full min-w-[480px] px-1">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-lg text-[10px] font-mono transition-all',
                isActive
                  ? 'text-blue-700 font-bold bg-blue-50 border border-blue-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[50px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
