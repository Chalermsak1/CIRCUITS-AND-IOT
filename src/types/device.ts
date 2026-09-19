export type DeviceStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'WARNING'
  | 'ERROR'
  | 'READY'
  | 'CONNECTED';

export interface ESP32DeviceHealth {
  name: 'ESP32';
  status: DeviceStatus;
  cpu: string;            // '240 MHz'
  ipAddress: string;      // '192.168.1.42'
  wifiRssi: string;       // '-48 dBm'
  uptime: string;         // '02:31:44'
  firmware: string;       // 'v1.0.0'
  lastSeen: string;       // '2 sec ago'
  isSimulated: boolean;
}

export interface DHT22DeviceHealth {
  name: 'DHT22';
  status: DeviceStatus;
  temperature: number;    // current system temperature
  humidity: number;       // current system humidity
  lastUpdate: string;     // dynamic simulated timestamp
  isSimulated: boolean;
}

export interface PIRDeviceHealth {
  name: 'PIR';
  status: DeviceStatus;
  motion: 'DETECTED' | 'NOT DETECTED';
  lastMotion: string;     // timestamp
  timeout: number;        // configured timeout in seconds
  isSimulated: boolean;
}

export interface IRTransmitterDeviceHealth {
  name: 'IR TRANSMITTER';
  status: DeviceStatus;
  lastCommand: string;    // 'POWER ON' | 'POWER OFF'
  mode: string;           // 'COOL'
  target: number;         // 26
  fan: string;            // 'AUTO'
  isSimulated: boolean;
}

export interface WiFiDeviceHealth {
  name: 'Wi-Fi';
  status: DeviceStatus;
  rssi: string;           // '-48 dBm'
  connection: string;     // 'STABLE'
  ssid: string;           // 'IoT-Engineering-Lab'
  isSimulated: boolean;
}

export type WifiSignalQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK' | 'POOR';

export interface WifiNetwork {
  id: string;
  ssid: string;
  priority: number;
  status: 'ACTIVE' | 'AVAILABLE' | 'WEAK' | 'CONNECTING';
  rssi: number; // e.g. -48
  signalQuality: WifiSignalQuality;
  bssid: string;
  security: string;
  channel: number;
  ipAddress?: string;
  gateway?: string;
}

export type WifiScenarioId = 'WIFI_STABLE' | 'WIFI_DEGRADED' | 'WIFI_FAILOVER';

export interface SystemHealthState {
  esp32: ESP32DeviceHealth;
  dht22: DHT22DeviceHealth;
  pir: PIRDeviceHealth;
  irTransmitter: IRTransmitterDeviceHealth;
  wifi: WiFiDeviceHealth;
}

export interface SystemHealthSummaryItem {
  id: string;
  name: string;
  status: DeviceStatus;
  detail: string;
}

export interface DeviceStatusStyle {
  dotClass: string;
  badgeClass: string;
  textClass: string;
  borderClass: string;
}

/**
 * Standardized status colors:
 * GREEN  = healthy / active (ONLINE, READY, CONNECTED)
 * AMBER  = warning (WARNING)
 * RED    = error (ERROR)
 * BLUE   = informational
 * GRAY   = offline / disabled (OFFLINE)
 */
export function getDeviceStatusStyle(status: DeviceStatus): DeviceStatusStyle {
  switch (status) {
    case 'ONLINE':
    case 'READY':
    case 'CONNECTED':
      return {
        dotClass: 'bg-emerald-500 text-emerald-600',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs font-semibold',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
      };
    case 'WARNING':
      return {
        dotClass: 'bg-amber-500 text-amber-600',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs font-semibold',
        textClass: 'text-amber-700',
        borderClass: 'border-amber-200',
      };
    case 'ERROR':
      return {
        dotClass: 'bg-rose-500 text-rose-600',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs font-semibold',
        textClass: 'text-rose-700',
        borderClass: 'border-rose-200',
      };
    case 'OFFLINE':
      return {
        dotClass: 'bg-slate-400 text-slate-500',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 font-semibold',
        textClass: 'text-slate-500',
        borderClass: 'border-slate-200',
      };
    default:
      return {
        dotClass: 'bg-blue-500 text-blue-600',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs font-semibold',
        textClass: 'text-blue-700',
        borderClass: 'border-blue-200',
      };
  }
}
