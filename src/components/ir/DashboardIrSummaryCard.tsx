import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { Radio, ArrowRight, Layers, Play } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DashboardIrSummaryCardProps {
  className?: string;
  onNavigateToControl?: () => void;
}

export const DashboardIrSummaryCard: React.FC<DashboardIrSummaryCardProps> = ({
  className,
  onNavigateToControl,
}) => {
  const {
    irLearningStatus,
    learnedCommands,
    lastIrTransmission,
    replayIrCommand,
  } = useSystem();

  const handleNavigate = () => {
    if (onNavigateToControl) {
      onNavigateToControl();
    } else {
      window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'control' }));
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 border border-slate-200 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-sm',
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between text-slate-500 text-xs pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold font-mono text-slate-900 text-xs tracking-wide">
              IR CONTROL — Panasonic AC
            </h4>
            <span className="text-[10px] text-blue-600 font-mono font-semibold">
              Protocol: Panasonic AC (38 kHz)
            </span>
          </div>
        </div>
        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-100 text-slate-600 border border-slate-200">
          SIMULATED
        </span>
      </div>

      {/* Summary Info Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block">Receiver:</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected (GPIO 15)
          </span>
        </div>

        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block">IR Learning:</span>
          <span
            className={cn(
              'font-bold flex items-center gap-1 mt-0.5',
              irLearningStatus === 'LEARNING' ? 'text-amber-700' : 'text-blue-700'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                irLearningStatus === 'LEARNING' ? 'bg-amber-500 animate-ping' : 'bg-blue-500'
              )}
            />
            {irLearningStatus}
          </span>
        </div>
      </div>

      {/* Last Transmission Display */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1 font-mono text-xs shadow-2xs">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Last Transmission:</span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase',
              lastIrTransmission.status === 'SENT'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            )}
          >
            {lastIrTransmission.status}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-900 font-bold">{lastIrTransmission.command}</span>
          <span className="text-[10px] text-slate-500">{lastIrTransmission.timestamp}</span>
        </div>
      </div>

      {/* Learned Commands Quick Chips & Count */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-600" />
            <span>Learned Commands:</span>
          </span>
          <span className="text-purple-700 font-bold">
            {learnedCommands.length} Stored
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {learnedCommands.slice(0, 5).map(cmd => (
            <button
              key={cmd.id}
              onClick={() => replayIrCommand(cmd.id)}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[10px] font-mono text-slate-700 hover:text-blue-700 transition-all flex items-center gap-1 shadow-2xs"
              title={`Replay ${cmd.name}`}
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>{cmd.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Direct Jump to IR Control Page Action */}
      <button
        onClick={handleNavigate}
        className="w-full py-2 px-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100/70 text-blue-700 hover:text-blue-900 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
      >
        <span>Open IR Control & Learning Console</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

