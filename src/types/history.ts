export type SystemEventType =
  | 'SENSOR_UPDATE'
  | 'MOTION_DETECTED'
  | 'MOTION_LOST'
  | 'AUTO_ON'
  | 'AUTO_OFF'
  | 'IR_COMMAND'
  | 'MANUAL_CONTROL'
  | 'THRESHOLD_CHANGED'
  | 'TIMEOUT_CHANGED'
  | 'DEMO_SCENARIO_SELECTED'
  | 'DEVICE_STATUS_CHANGED'
  | 'WIFI_FAILOVER';

export type EventCategory =
  | 'SENSOR'
  | 'AC EVENTS'
  | 'AUTOMATION'
  | 'NETWORK'
  | 'SYSTEM';

export type HistoryFilterCategory =
  | 'ALL'
  | EventCategory;

export type EventSource = 'automation' | 'sensor' | 'user' | 'demo' | 'hardware';
export type EventLevel = 'info' | 'success' | 'warning' | 'error';

export interface SystemLogEventDetails {
  previousValue?: number | string | boolean;
  newValue?: number | string | boolean;
  previousStatus?: string;
  newStatus?: string;
  deviceName?: string;
  reason?: string;
  trigger?: string;
  scenarioId?: string;
  unit?: string;
  state?: string;
  transport?: string;
}

export interface SystemLogEvent {
  id: string;
  timestamp: string;
  type: SystemEventType;
  category: EventCategory;
  level: EventLevel;
  source: EventSource;
  message: string;
  temperature?: number;
  humidity?: number;
  motionDetected?: boolean;
  acPower?: boolean;
  acMode?: string;
  fanSpeed?: string;
  targetTemperature?: number;
  details?: SystemLogEventDetails;
}

/**
 * Maps a system event type to its respective filter category.
 */
export function getEventCategory(
  type: SystemEventType
): EventCategory {
  switch (type) {
    case 'SENSOR_UPDATE':
    case 'MOTION_DETECTED':
    case 'MOTION_LOST':
      return 'SENSOR';
    case 'IR_COMMAND':
    case 'MANUAL_CONTROL':
      return 'AC EVENTS';
    case 'AUTO_ON':
    case 'AUTO_OFF':
      return 'AUTOMATION';
    case 'WIFI_FAILOVER':
      return 'NETWORK';
    case 'THRESHOLD_CHANGED':
    case 'TIMEOUT_CHANGED':
    case 'DEMO_SCENARIO_SELECTED':
    case 'DEVICE_STATUS_CHANGED':
      return 'SYSTEM';
  }
}

/**
 * Color and styling tokens for each event type (Light Theme).
 */
export function getEventTypeBadgeStyle(type: SystemEventType): {
  badgeClass: string;
  dotClass: string;
} {
  switch (type) {
    case 'AUTO_ON':
    case 'MOTION_DETECTED':
      return {
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'text-emerald-500',
      };
    case 'AUTO_OFF':
    case 'IR_COMMAND':
      return {
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'text-blue-500',
      };
    case 'WIFI_FAILOVER':
      return {
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        dotClass: 'text-purple-500',
      };
    case 'MOTION_LOST':
    case 'MANUAL_CONTROL':
      return {
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'text-amber-500',
      };
    case 'THRESHOLD_CHANGED':
    case 'TIMEOUT_CHANGED':
    case 'DEMO_SCENARIO_SELECTED':
    case 'DEVICE_STATUS_CHANGED':
    case 'SENSOR_UPDATE':
    default:
      return {
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        dotClass: 'text-slate-500',
      };
  }
}

