import type { ACMode, FanSpeed } from './ac';

export type IrLearningStatus = 'READY' | 'LEARNING' | 'CAPTURED' | 'ERROR' | 'NOT_CONNECTED';
export type IrTransmissionStatus = 'SENT' | 'READY' | 'FAILED' | 'WAITING';

export interface LearnedIrCommand {
  id: string;
  name: string;               // e.g. "POWER ON", "COOL 26°C", "FAN AUTO"
  protocol: string;           // "Panasonic"
  status: 'Learned' | 'Pending' | 'READY';
  lastLearnedTime: string;    // e.g. "14:32:18"
  pulseCount: number;         // e.g. 216 pulses (Panasonic AC 216-pulse standard)
  carrierFrequency?: string;  // e.g. "38 kHz"
  action: 'POWER_ON' | 'POWER_OFF' | 'SET_TEMP' | 'SET_MODE' | 'SET_FAN';
  payloadSettings?: {
    power?: boolean;
    mode?: ACMode;
    temp?: number;
    fan?: FanSpeed;
  };
}

export interface CapturedIrCommand {
  command: string;            // e.g. "POWER ON"
  protocol: string;           // "Panasonic"
  signalStatus: 'CAPTURED';
  capturedAt: string;         // e.g. "14:32:18"
  signalLength: string;       // e.g. "216 pulses (432 bytes, 38 kHz)"
  carrierFrequency?: string;  // e.g. "38 kHz"
  pulseCount?: number;
  isSimulated?: boolean;
}

export interface IrTransmissionRecord {
  command: string;            // e.g. "POWER ON"
  target: string;             // "Panasonic AC"
  status: IrTransmissionStatus;
  timestamp: string;          // e.g. "14:32:20"
  detail?: string;            // e.g. "COOL 26°C • FAN AUTO"
}

export const DEFAULT_LEARNED_COMMANDS: LearnedIrCommand[] = [
  {
    id: 'panasonic-pwr-on',
    name: 'POWER ON',
    protocol: 'Panasonic',
    status: 'READY',
    lastLearnedTime: '14:32:18',
    pulseCount: 216,
    carrierFrequency: '38 kHz',
    action: 'POWER_ON',
    payloadSettings: { power: true },
  },
  {
    id: 'panasonic-pwr-off',
    name: 'POWER OFF',
    protocol: 'Panasonic',
    status: 'READY',
    lastLearnedTime: '14:30:10',
    pulseCount: 216,
    carrierFrequency: '38 kHz',
    action: 'POWER_OFF',
    payloadSettings: { power: false },
  },
  {
    id: 'panasonic-cool-26',
    name: 'COOL 26°C',
    protocol: 'Panasonic',
    status: 'READY',
    lastLearnedTime: '14:28:45',
    pulseCount: 216,
    carrierFrequency: '38 kHz',
    action: 'SET_TEMP',
    payloadSettings: { power: true, mode: 'cool', temp: 26 },
  },
  {
    id: 'panasonic-cool-27',
    name: 'COOL 27°C',
    protocol: 'Panasonic',
    status: 'READY',
    lastLearnedTime: '14:25:20',
    pulseCount: 216,
    carrierFrequency: '38 kHz',
    action: 'SET_TEMP',
    payloadSettings: { power: true, mode: 'cool', temp: 27 },
  },
  {
    id: 'panasonic-fan-auto',
    name: 'FAN AUTO',
    protocol: 'Panasonic',
    status: 'READY',
    lastLearnedTime: '14:22:04',
    pulseCount: 216,
    carrierFrequency: '38 kHz',
    action: 'SET_FAN',
    payloadSettings: { power: true, fan: 'auto' },
  },
];
