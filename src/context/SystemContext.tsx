import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { SensorData, SensorReading, SensorHistoryItem } from '../types/sensor';
import type { ACState, ACMode, FanSpeed } from '../types/ac';
import type { AutomationDecision } from '../types/automation';
import type { SystemLogEvent } from '../types/history';
import { getEventCategory } from '../types/history';
import type { SystemHealthState, WifiNetwork, WifiScenarioId } from '../types/device';
import type { DemoScenarioId, DemoScenario } from '../types/demo';
import { evaluateAutomation } from '../services/automationEngine';
import { DEMO_SCENARIOS } from '../services/demoScenarios';
import { SimulationDataSource } from '../services/simulationDataSource';
import type { ISensorDataSource, DataSourceMode } from '../services/dataSource';
import {
  sendAcCommand,
  SimulationAcCommandDispatcher,
  type IACCommandDispatcher,
  type ACCommandPayload,
} from '../services/acCommandService';
import type {
  IrLearningStatus,
  LearnedIrCommand,
  CapturedIrCommand,
  IrTransmissionRecord,
} from '../types/ir';
import { DEFAULT_LEARNED_COMMANDS } from '../types/ir';

function formatUptime(totalSec: number): string {
  const hours = Math.floor(totalSec / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSec % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export const INITIAL_WIFI_NETWORKS: WifiNetwork[] = [
  {
    id: 'wifi-home',
    ssid: 'Home_WiFi',
    priority: 1,
    status: 'ACTIVE',
    rssi: -48,
    signalQuality: 'GOOD',
    bssid: '8C:AA:B5:14:7D:01',
    security: 'WPA2-PSK (AES)',
    channel: 6,
    ipAddress: '192.168.1.42',
    gateway: '192.168.1.1',
  },
  {
    id: 'wifi-lab',
    ssid: 'Lab_WiFi',
    priority: 2,
    status: 'AVAILABLE',
    rssi: -62,
    signalQuality: 'GOOD',
    bssid: '8C:AA:B5:14:7D:02',
    security: 'WPA2-PSK (AES)',
    channel: 11,
    ipAddress: '192.168.10.105',
    gateway: '192.168.10.1',
  },
  {
    id: 'wifi-backup',
    ssid: 'Backup_WiFi',
    priority: 3,
    status: 'WEAK',
    rssi: -82,
    signalQuality: 'WEAK',
    bssid: '8C:AA:B5:14:7D:03',
    security: 'WPA2-PSK (AES)',
    channel: 1,
    ipAddress: '192.168.4.15',
    gateway: '192.168.4.1',
  },
];

export interface SystemContextType {
  // Sensor Telemetry
  sensor: SensorReading;
  timeSinceLastMotion: number;
  sensorHistory: SensorHistoryItem[];

  // AC State
  acState: ACState;
  temperatureThreshold: number;
  motionTimeout: number;

  // Central Automation Engine
  automationDecision: AutomationDecision;

  // Presentation Demo Mode
  isDemoMode: boolean;
  activeScenarioId: DemoScenarioId | null;
  activeScenario: DemoScenario | null;
  liveSimulationActive: boolean;
  setLiveSimulationActive: (active: boolean) => void;
  applyDemoScenario: (id: DemoScenarioId) => void;
  exitDemoMode: () => void;
  fastForwardTimeout: () => void;

  // Manual Controls & Settings
  toggleAcPower: () => void;
  setAcPowerManual: (power: boolean) => void;
  setTargetTemperature: (temp: number) => void;
  setAcMode: (mode: ACMode) => void;
  setFanSpeed: (speed: FanSpeed) => void;
  toggleAutoMode: () => void;
  setAutoMode: (enabled: boolean) => void;
  setTemperatureThreshold: (threshold: number) => void;
  setMotionTimeout: (timeout: number) => void;
  triggerManualMotion: (detected: boolean) => void;
  setManualTemperature: (temp: number) => void;

  // Panasonic AC IR Learning & Control
  irLearningStatus: IrLearningStatus;
  learningProgressMessage: string;
  learnedCommands: LearnedIrCommand[];
  lastCapturedCommand: CapturedIrCommand | null;
  lastIrTransmission: IrTransmissionRecord;
  startIrLearning: (commandName?: string) => void;
  cancelIrLearning: () => void;
  replayIrCommand: (commandId: string) => void;

  // Centralized Typed Hardware Health
  systemHealth: SystemHealthState;

  // Wi-Fi Manager & Wireless Link
  activeWifiNetwork: WifiNetwork;
  configuredWifiNetworks: WifiNetwork[];
  wifiAutoSwitch: boolean;
  wifiSwitchThreshold: number;
  wifiSwitchCooldown: number;
  setWifiAutoSwitch: (enabled: boolean) => void;
  setWifiSwitchThreshold: (threshold: number) => void;
  setWifiSwitchCooldown: (cooldown: number) => void;
  activeWifiScenario: WifiScenarioId | null;
  applyWifiScenario: (scenario: WifiScenarioId) => void;
  resetWifiScenario: () => void;
  switchWifiNetwork: (ssid: string) => void;

  // History & Logs
  systemEvents: SystemLogEvent[];
  clearEvents: () => void;

  // Architecture Abstractions
  dataSourceMode: DataSourceMode;
  dataSource: ISensorDataSource;
  acDispatcher: IACCommandDispatcher;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // =========================================================================
  // 1. DATA SOURCE & ACTUATOR DISPATCHER ABSTRACTIONS
  // =========================================================================
  const [dataSource] = useState<SimulationDataSource>(() => new SimulationDataSource({
    initialTemperature: 24.5,
    initialHumidity: 55.0,
    initialMotion: true,
    maxDeltaPerTick: 0.15,
  }));

  const [acDispatcher] = useState<SimulationAcCommandDispatcher>(() => new SimulationAcCommandDispatcher());

  // =========================================================================
  // 2. SENSOR STATE (Ingested directly from ISensorDataSource)
  // =========================================================================
  const [sensorData, setSensorData] = useState<SensorData>(() => dataSource.getSensorData());
  const [timeSinceLastMotion, setTimeSinceLastMotion] = useState<number>(0);
  const [lastMotionTimestamp, setLastMotionTimestamp] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(9104); // 02:31:44 initial baseline

  const [sensorHistory, setSensorHistory] = useState<SensorHistoryItem[]>(() => {
    const now = new Date();
    const initial: SensorHistoryItem[] = [];
    for (let i = 10; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 10000);
      initial.push({
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        temperature: 24.5,
        humidity: 55.0,
        motion: true,
        acPower: false,
      });
    }
    return initial;
  });

  // =========================================================================
  // 3. AC & APPLICATION CONTROL STATE
  // =========================================================================
  const [acPower, setAcPower] = useState<boolean>(false);
  const [acMode, setAcModeState] = useState<ACMode>('cool');
  const [fanSpeed, setFanSpeedState] = useState<FanSpeed>('auto');
  const [targetTemperature, setTargetTemperatureState] = useState<number>(26);
  const [autoMode, setAutoModeState] = useState<boolean>(true);

  // Configured Thresholds (Default: 26.0°C, 30s timeout for demo visibility)
  const [temperatureThreshold, setTemperatureThresholdState] = useState<number>(26.0);
  const [motionTimeout, setMotionTimeoutState] = useState<number>(30);

  // Presentation Demo Mode
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeScenarioId, setActiveScenarioId] = useState<DemoScenarioId | null>('normal_room');
  const [liveSimulationActive, setLiveSimulationActive] = useState<boolean>(false);

  // Transition tracking refs
  const prevMotionRef = useRef<boolean>(sensorData.motionDetected);
  const lastAppliedScenarioRef = useRef<DemoScenarioId | null>('normal_room');
  const lastDispatchedPower = useRef<boolean>(acPower);

  // Value refs for stable subscriber callbacks
  const acModeRef = useRef<ACMode>(acMode);
  const fanSpeedRef = useRef<FanSpeed>(fanSpeed);
  const targetTemperatureRef = useRef<number>(targetTemperature);
  const acPowerRef = useRef<boolean>(acPower);

  useEffect(() => {
    acModeRef.current = acMode;
    fanSpeedRef.current = fanSpeed;
    targetTemperatureRef.current = targetTemperature;
    acPowerRef.current = acPower;
  }, [acMode, fanSpeed, targetTemperature, acPower]);

  // =========================================================================
  // 4. PANASONIC AC IR LEARNING & CONTROL STATE
  // =========================================================================
  const [learnedCommands] = useState<LearnedIrCommand[]>(DEFAULT_LEARNED_COMMANDS);

  const [irLearningStatus, setIrLearningStatus] = useState<IrLearningStatus>('READY');
  const [learningProgressMessage, setLearningProgressMessage] = useState<string>('');
  const [lastCapturedCommand, setLastCapturedCommand] = useState<CapturedIrCommand | null>({
    command: 'POWER ON',
    protocol: 'Panasonic',
    signalStatus: 'CAPTURED',
    capturedAt: '14:32:18',
    signalLength: '216 pulses (432 bytes, 38 kHz)',
    isSimulated: true,
  });

  const [lastIrTransmission, setLastIrTransmission] = useState<IrTransmissionRecord>({
    command: 'POWER ON',
    target: 'Panasonic AC',
    status: 'READY',
    timestamp: '14:32:20',
    detail: 'NEC/Panasonic 216 pulses',
  });

  const learningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (learningTimerRef.current) {
        clearTimeout(learningTimerRef.current);
      }
    };
  }, []);

  // =========================================================================
  // 5. SYSTEM EVENT AUDIT TRAIL
  // =========================================================================
  const [systemEvents, setSystemEvents] = useState<SystemLogEvent[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'DEVICE_STATUS_CHANGED',
      category: 'SYSTEM',
      level: 'info',
      source: 'hardware',
      message: 'ESP32 Wi-Fi station online (SSID: IoT-Engineering-Lab, IP: 192.168.1.42).',
      details: { previousStatus: 'OFFLINE', newStatus: 'ONLINE' },
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'DEVICE_STATUS_CHANGED',
      category: 'SYSTEM',
      level: 'success',
      source: 'hardware',
      message: 'DHT22 (GPIO 4) & PIR (GPIO 13) sensor interface operational.',
      details: { previousStatus: 'INITIALIZING', newStatus: 'ONLINE' },
    },
    {
      id: 'init-3',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'DEMO_SCENARIO_SELECTED',
      category: 'SYSTEM',
      level: 'info',
      source: 'demo',
      message: 'Demo scenario applied: NORMAL ROOM (Initial Presentation State)',
      temperature: 24.5,
      humidity: 55.0,
      motionDetected: true,
      acPower: false,
      acMode: 'cool',
      fanSpeed: 'auto',
      targetTemperature: 26,
      details: { scenarioId: 'normal_room' },
    },
  ]);

  type AddEventParams = Omit<SystemLogEvent, 'id' | 'timestamp' | 'category'>;

  const addEvent = useCallback((params: AddEventParams) => {
    const category = getEventCategory(params.type);
    const newEvent: SystemLogEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category,
      ...params,
    };
    setSystemEvents(prev => [newEvent, ...prev.slice(0, 99)]);
  }, []);

  // =========================================================================
  // 5.5. WI-FI MANAGER & DYNAMIC WIRELESS FAILOVER STATE
  // =========================================================================
  const [activeWifiScenario, setActiveWifiScenario] = useState<WifiScenarioId | null>(null);
  const [configuredWifiNetworks, setConfiguredWifiNetworks] = useState<WifiNetwork[]>(INITIAL_WIFI_NETWORKS);
  const [wifiAutoSwitch, setWifiAutoSwitch] = useState<boolean>(true);
  const [wifiSwitchThreshold, setWifiSwitchThreshold] = useState<number>(-70);
  const [wifiSwitchCooldown, setWifiSwitchCooldown] = useState<number>(30);

  const activeWifiNetwork = configuredWifiNetworks.find(n => n.status === 'ACTIVE') || configuredWifiNetworks[0];

  const applyWifiScenario = useCallback((scenario: WifiScenarioId) => {
    setActiveWifiScenario(scenario);

    if (scenario === 'WIFI_STABLE') {
      setConfiguredWifiNetworks([
        { ...INITIAL_WIFI_NETWORKS[0], status: 'ACTIVE', rssi: -48, signalQuality: 'GOOD' },
        { ...INITIAL_WIFI_NETWORKS[1], status: 'AVAILABLE', rssi: -62, signalQuality: 'GOOD' },
        { ...INITIAL_WIFI_NETWORKS[2], status: 'WEAK', rssi: -82, signalQuality: 'WEAK' },
      ]);
      addEvent({
        type: 'DEVICE_STATUS_CHANGED',
        source: 'hardware',
        level: 'success',
        message: 'Wi-Fi link stabilized on Home_WiFi (-48 dBm, Signal: GOOD).',
      });
    } else if (scenario === 'WIFI_DEGRADED') {
      setConfiguredWifiNetworks([
        { ...INITIAL_WIFI_NETWORKS[0], status: 'ACTIVE', rssi: -78, signalQuality: 'POOR' },
        { ...INITIAL_WIFI_NETWORKS[1], status: 'AVAILABLE', rssi: -62, signalQuality: 'GOOD' },
        { ...INITIAL_WIFI_NETWORKS[2], status: 'WEAK', rssi: -82, signalQuality: 'WEAK' },
      ]);
      addEvent({
        type: 'DEVICE_STATUS_CHANGED',
        source: 'hardware',
        level: 'warning',
        message: 'Wi-Fi link degraded on Home_WiFi: RSSI -78 dBm (below -70 dBm threshold). Failover pending...',
      });
    } else if (scenario === 'WIFI_FAILOVER') {
      setConfiguredWifiNetworks([
        { ...INITIAL_WIFI_NETWORKS[0], status: 'AVAILABLE', rssi: -84, signalQuality: 'POOR' },
        { ...INITIAL_WIFI_NETWORKS[1], status: 'ACTIVE', rssi: -55, signalQuality: 'GOOD' },
        { ...INITIAL_WIFI_NETWORKS[2], status: 'WEAK', rssi: -82, signalQuality: 'WEAK' },
      ]);
      addEvent({
        type: 'WIFI_FAILOVER',
        source: 'hardware',
        level: 'info',
        message: 'Wi-Fi Failover triggered: Switched from Home_WiFi (-78 dBm) to Lab_WiFi (-55 dBm, Priority 2).',
        details: { trigger: 'AUTO_SWITCH', state: 'CONNECTED' },
      });
    }
  }, [addEvent]);

  const resetWifiScenario = useCallback(() => {
    setActiveWifiScenario(null);
    setConfiguredWifiNetworks(INITIAL_WIFI_NETWORKS);
  }, []);

  const switchWifiNetwork = useCallback((ssid: string) => {
    setConfiguredWifiNetworks(prev =>
      prev.map(net => ({
        ...net,
        status: net.ssid === ssid ? 'ACTIVE' : (net.rssi <= -80 ? 'WEAK' : 'AVAILABLE'),
      }))
    );
    addEvent({
      type: 'DEVICE_STATUS_CHANGED',
      source: 'user',
      level: 'info',
      message: `Manual Wi-Fi switch: Connected to ${ssid}.`,
    });
  }, [addEvent]);

  // =========================================================================
  // 6. DATA SOURCE SUBSCRIPTION & THERMODYNAMIC FEEDBACK
  // =========================================================================
  useEffect(() => {
    const unsubscribe = dataSource.subscribe(data => {
      setSensorData(data);

      if (data.motionDetected !== prevMotionRef.current) {
        const isMotion = data.motionDetected;
        prevMotionRef.current = isMotion;

        if (isMotion) {
          setTimeSinceLastMotion(0);
          setLastMotionTimestamp(data.timestampFormatted);
          addEvent({
            type: 'MOTION_DETECTED',
            source: 'sensor',
            level: 'success',
            message: 'PIR motion sensor detected movement (Logic HIGH). Occupancy confirmed.',
            temperature: data.temperature,
            humidity: data.humidity,
            motionDetected: true,
            acPower: acPowerRef.current,
            acMode: acModeRef.current,
            fanSpeed: fanSpeedRef.current,
            targetTemperature: targetTemperatureRef.current,
          });
        } else {
          addEvent({
            type: 'MOTION_LOST',
            source: 'sensor',
            level: 'warning',
            message: 'PIR motion cleared (Logic LOW). Inactivity vacancy timer started.',
            temperature: data.temperature,
            humidity: data.humidity,
            motionDetected: false,
            acPower: acPowerRef.current,
            acMode: acModeRef.current,
            fanSpeed: fanSpeedRef.current,
            targetTemperature: targetTemperatureRef.current,
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dataSource, addEvent]);

  // Feed AC actuator state back to thermodynamic simulator
  useEffect(() => {
    dataSource.setAcFeedback(acPower, targetTemperature);
  }, [dataSource, acPower, targetTemperature]);

  // Sync unscripted drift with Demo Mode state
  useEffect(() => {
    dataSource.setDriftActive(liveSimulationActive && !isDemoMode);
  }, [dataSource, liveSimulationActive, isDemoMode]);

  // Inactivity and Uptime timers
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
      setTimeSinceLastMotion(prev => {
        if (sensorData.motionDetected) return 0;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sensorData.motionDetected]);

  // Time-series history buffer recording
  useEffect(() => {
    const historyInterval = setInterval(() => {
      setSensorHistory(prev => {
        const point: SensorHistoryItem = {
          time: sensorData.timestampFormatted,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          motion: sensorData.motionDetected,
          acPower,
        };
        return [...prev.slice(-29), point];
      });
    }, 3000);

    return () => clearInterval(historyInterval);
  }, [sensorData, acPower]);

  // Clean up data source on provider unmount
  useEffect(() => {
    return () => {
      dataSource.destroy();
    };
  }, [dataSource]);

  // =========================================================================
  // 7. CENTRAL AUTOMATION EVALUATION ENGINE
  // =========================================================================
  // Independent from Data Source: only inspects typed telemetry and configuration
  const automationDecision = evaluateAutomation({
    temperature: sensorData.temperature,
    temperatureThreshold,
    motionDetected: sensorData.motionDetected,
    motionTimeout,
    autoMode,
    currentAcPower: acPower,
    timeSinceLastMotion,
  });

  const lastLoggedState = useRef<string>(automationDecision.state);

  // Edge-triggered command emission via AC Command Abstraction
  useEffect(() => {
    if (automationDecision.shouldChangePower) {
      const nextPower = automationDecision.desiredPower;
      if (nextPower !== lastDispatchedPower.current) {
        const prevPower = lastDispatchedPower.current;
        lastDispatchedPower.current = nextPower;
        setAcPower(nextPower);

        // 1. Dispatch through centralized AC Command abstraction
        const cmdPayload: ACCommandPayload = {
          action: nextPower ? 'POWER_ON' : 'POWER_OFF',
          power: nextPower,
          targetTemperature,
          acMode,
          fanSpeed,
          timestamp: Date.now(),
          reason: automationDecision.reason,
        };
        const cmdResult = sendAcCommand(cmdPayload, acDispatcher);
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Update last IR transmission display
        setLastIrTransmission({
          command: nextPower ? 'POWER ON' : 'POWER OFF',
          target: 'Panasonic AC',
          status: 'SENT',
          timestamp: nowStr,
          detail: nextPower
            ? `${acMode.toUpperCase()} ${targetTemperature}°C • FAN ${fanSpeed.toUpperCase()}`
            : 'Compressor Standby',
        });

        // 2. Emit AUTO_ON or AUTO_OFF event
        if (nextPower && !prevPower) {
          addEvent({
            type: 'AUTO_ON',
            source: 'automation',
            level: 'success',
            message: automationDecision.reason,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            motionDetected: sensorData.motionDetected,
            acPower: true,
            acMode,
            fanSpeed,
            targetTemperature,
            details: { reason: automationDecision.reason, trigger: automationDecision.trigger },
          });
        } else if (!nextPower && prevPower) {
          addEvent({
            type: 'AUTO_OFF',
            source: 'automation',
            level: 'info',
            message: automationDecision.reason,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            motionDetected: sensorData.motionDetected,
            acPower: false,
            acMode,
            fanSpeed,
            targetTemperature,
            details: { reason: automationDecision.reason, trigger: automationDecision.trigger },
          });
        }

        // 3. Emit corresponding IR_COMMAND event
        const powerCmd = nextPower ? 'POWER ON' : 'POWER OFF';
        const irDetail = nextPower
          ? `${powerCmd}, ${acMode.toUpperCase()} ${targetTemperature}°C, FAN ${fanSpeed.toUpperCase()}`
          : powerCmd;

        const transportSuffix = typeof cmdResult === 'object' && 'transport' in cmdResult ? ` [${cmdResult.transport}]` : '';

        addEvent({
          type: 'IR_COMMAND',
          source: 'hardware',
          level: 'info',
          message: `Panasonic IR Carrier Burst (38 kHz PWM GPIO 14): ${irDetail}${transportSuffix}`,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          motionDetected: sensorData.motionDetected,
          acPower: nextPower,
          acMode,
          fanSpeed,
          targetTemperature,
          details: { trigger: 'AUTOMATION' },
        });
      }
    } else {
      lastDispatchedPower.current = acPower;
    }

    if (automationDecision.state !== lastLoggedState.current) {
      lastLoggedState.current = automationDecision.state;
    }
  }, [
    automationDecision,
    acPower,
    acMode,
    targetTemperature,
    fanSpeed,
    sensorData,
    acDispatcher,
    addEvent,
  ]);

  // =========================================================================
  // 8. PANASONIC IR LEARNING ACTIONS
  // =========================================================================
  const startIrLearning = useCallback((commandName: string = 'POWER ON') => {
    if (learningTimerRef.current) {
      clearTimeout(learningTimerRef.current);
    }
    setIrLearningStatus('LEARNING');
    setLearningProgressMessage('Waiting for remote signal...');

    learningTimerRef.current = setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setIrLearningStatus('CAPTURED');
      setLearningProgressMessage('IR SIGNAL CAPTURED');
      setLastCapturedCommand({
        command: commandName,
        protocol: 'Panasonic',
        signalStatus: 'CAPTURED',
        capturedAt: nowStr,
        signalLength: '216 pulses (432 bytes, 38 kHz)',
        isSimulated: true,
      });

      addEvent({
        type: 'IR_COMMAND',
        source: 'hardware',
        level: 'success',
        message: `Panasonic AC IR pattern captured: ${commandName} (216 pulses, 38 kHz PWM GPIO 15) [SIMULATED].`,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        motionDetected: sensorData.motionDetected,
        acPower,
        acMode,
        fanSpeed,
        targetTemperature,
        details: { trigger: 'IR_LEARN', unit: 'pulses', newValue: 216 },
      });

      learningTimerRef.current = setTimeout(() => {
        setIrLearningStatus('READY');
        setLearningProgressMessage('');
      }, 2500);
    }, 1500);
  }, [addEvent, sensorData, acPower, acMode, fanSpeed, targetTemperature]);

  const cancelIrLearning = useCallback(() => {
    if (learningTimerRef.current) {
      clearTimeout(learningTimerRef.current);
      learningTimerRef.current = null;
    }
    setIrLearningStatus('READY');
    setLearningProgressMessage('');
  }, []);

  const replayIrCommand = useCallback((commandId: string) => {
    const cmd = learnedCommands.find(c => c.id === commandId);
    if (!cmd) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (cmd.payloadSettings) {
      if (cmd.payloadSettings.power !== undefined) {
        setAcPower(cmd.payloadSettings.power);
        lastDispatchedPower.current = cmd.payloadSettings.power;
      }
      if (cmd.payloadSettings.mode) {
        setAcModeState(cmd.payloadSettings.mode);
      }
      if (cmd.payloadSettings.temp) {
        setTargetTemperatureState(cmd.payloadSettings.temp);
      }
      if (cmd.payloadSettings.fan) {
        setFanSpeedState(cmd.payloadSettings.fan);
      }
    }

    const nextPower = cmd.payloadSettings?.power ?? acPower;
    const nextTemp = cmd.payloadSettings?.temp ?? targetTemperature;
    const nextMode = cmd.payloadSettings?.mode ?? acMode;
    const nextFan = cmd.payloadSettings?.fan ?? fanSpeed;

    const cmdPayload: ACCommandPayload = {
      action: cmd.action === 'POWER_OFF' ? 'POWER_OFF' : 'POWER_ON',
      power: nextPower,
      targetTemperature: nextTemp,
      acMode: nextMode,
      fanSpeed: nextFan,
      timestamp: Date.now(),
      reason: `User replayed learned IR command: ${cmd.name}`,
    };
    sendAcCommand(cmdPayload, acDispatcher);

    setLastIrTransmission({
      command: cmd.name,
      target: 'Panasonic AC',
      status: 'SENT',
      timestamp: nowStr,
      detail: `${cmd.protocol} • ${cmd.pulseCount} pulses`,
    });

    addEvent({
      type: 'IR_COMMAND',
      source: 'hardware',
      level: 'info',
      message: `Replayed Panasonic IR command: ${cmd.name} (38 kHz Carrier, ${cmd.pulseCount} pulses) [SIMULATED].`,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      motionDetected: sensorData.motionDetected,
      acPower: nextPower,
      acMode: nextMode,
      fanSpeed: nextFan,
      targetTemperature: nextTemp,
      details: { trigger: 'MANUAL_REPLAY', transport: 'simulation' },
    });
  }, [learnedCommands, acPower, acMode, fanSpeed, targetTemperature, acDispatcher, sensorData, addEvent]);

  // =========================================================================
  // 9. MANUAL CONTROLS & SETTINGS (Dispatched through sendAcCommand)
  // =========================================================================
  const toggleAcPower = useCallback(() => {
    setAcPower(prev => {
      const next = !prev;
      lastDispatchedPower.current = next;
      const label = next ? 'ON' : 'OFF';
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const cmdPayload: ACCommandPayload = {
        action: next ? 'POWER_ON' : 'POWER_OFF',
        power: next,
        targetTemperature,
        acMode,
        fanSpeed,
        timestamp: Date.now(),
        reason: `User toggled AC power to ${label}`,
      };
      const cmdResult = sendAcCommand(cmdPayload, acDispatcher);
      const transportSuffix = typeof cmdResult === 'object' && 'transport' in cmdResult ? ` [${cmdResult.transport}]` : '';

      setLastIrTransmission({
        command: next ? 'POWER ON' : 'POWER OFF',
        target: 'Panasonic AC',
        status: 'SENT',
        timestamp: nowStr,
        detail: next ? `${acMode.toUpperCase()} ${targetTemperature}°C • FAN ${fanSpeed.toUpperCase()}` : 'Manual Off',
      });

      addEvent({
        type: 'MANUAL_CONTROL',
        source: 'user',
        level: 'warning',
        message: `User changed AC power to ${label}.`,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        motionDetected: sensorData.motionDetected,
        acPower: next,
        acMode,
        fanSpeed,
        targetTemperature,
        details: { previousValue: prev, newValue: next },
      });

      addEvent({
        type: 'IR_COMMAND',
        source: 'hardware',
        level: 'info',
        message: next
          ? `Panasonic IR Carrier Burst (38 kHz PWM GPIO 14): POWER ON, ${acMode.toUpperCase()} ${targetTemperature}°C, FAN ${fanSpeed.toUpperCase()}${transportSuffix}`
          : `Panasonic IR Carrier Burst (38 kHz PWM GPIO 14): POWER OFF${transportSuffix}`,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        motionDetected: sensorData.motionDetected,
        acPower: next,
        acMode,
        fanSpeed,
        targetTemperature,
      });

      return next;
    });
  }, [acDispatcher, addEvent, sensorData, acMode, fanSpeed, targetTemperature]);

  const setAcPowerManual = useCallback((power: boolean) => {
    setAcPower(prev => {
      if (prev === power) return prev;
      lastDispatchedPower.current = power;
      const label = power ? 'ON' : 'OFF';
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const cmdPayload: ACCommandPayload = {
        action: power ? 'POWER_ON' : 'POWER_OFF',
        power,
        targetTemperature,
        acMode,
        fanSpeed,
        timestamp: Date.now(),
        reason: `User set AC power to ${label}`,
      };
      const cmdResult = sendAcCommand(cmdPayload, acDispatcher);
      const transportSuffix = typeof cmdResult === 'object' && 'transport' in cmdResult ? ` [${cmdResult.transport}]` : '';

      setLastIrTransmission({
        command: power ? 'POWER ON' : 'POWER OFF',
        target: 'Panasonic AC',
        status: 'SENT',
        timestamp: nowStr,
        detail: power ? `${acMode.toUpperCase()} ${targetTemperature}°C • FAN ${fanSpeed.toUpperCase()}` : 'Manual Off',
      });

      addEvent({
        type: 'MANUAL_CONTROL',
        source: 'user',
        level: 'warning',
        message: `User set AC power to ${label}.`,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        motionDetected: sensorData.motionDetected,
        acPower: power,
        acMode,
        fanSpeed,
        targetTemperature,
        details: { previousValue: prev, newValue: power },
      });

      addEvent({
        type: 'IR_COMMAND',
        source: 'hardware',
        level: 'info',
        message: power
          ? `Panasonic IR Carrier Burst (38 kHz PWM GPIO 14): POWER ON, ${acMode.toUpperCase()} ${targetTemperature}°C, FAN ${fanSpeed.toUpperCase()}${transportSuffix}`
          : `Panasonic IR Carrier Burst (38 kHz PWM GPIO 14): POWER OFF${transportSuffix}`,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        motionDetected: sensorData.motionDetected,
        acPower: power,
        acMode,
        fanSpeed,
        targetTemperature,
      });

      return power;
    });
  }, [acDispatcher, addEvent, sensorData, acMode, fanSpeed, targetTemperature]);

  const toggleAutoMode = useCallback(() => {
    setAutoModeState(prev => {
      const next = !prev;
      addEvent({
        type: 'MANUAL_CONTROL',
        source: 'user',
        level: 'info',
        message: `Auto Mode ${next ? 'ENABLED' : 'DISABLED'}.`,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        motionDetected: sensorData.motionDetected,
        acPower,
        acMode,
        fanSpeed,
        targetTemperature,
        details: { previousValue: prev, newValue: next },
      });
      return next;
    });
  }, [addEvent, sensorData, acPower, acMode, fanSpeed, targetTemperature]);

  const setAutoMode = useCallback((enabled: boolean) => {
    setAutoModeState(prev => {
      if (prev !== enabled) {
        addEvent({
          type: 'MANUAL_CONTROL',
          source: 'user',
          level: 'info',
          message: `Auto Mode ${enabled ? 'ENABLED' : 'DISABLED'}.`,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          motionDetected: sensorData.motionDetected,
          acPower,
          acMode,
          fanSpeed,
          targetTemperature,
          details: { previousValue: prev, newValue: enabled },
        });
      }
      return enabled;
    });
  }, [addEvent, sensorData, acPower, acMode, fanSpeed, targetTemperature]);

  const setTargetTemperature = useCallback((temp: number) => {
    setTargetTemperatureState(prev => {
      if (prev !== temp) {
        addEvent({
          type: 'MANUAL_CONTROL',
          source: 'user',
          level: 'info',
          message: `User changed target temperature to ${temp}°C.`,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          motionDetected: sensorData.motionDetected,
          acPower,
          acMode,
          fanSpeed,
          targetTemperature: temp,
          details: { previousValue: prev, newValue: temp, unit: '°C' },
        });

        if (acPower) {
          const cmdPayload: ACCommandPayload = {
            action: 'SET_TARGET_TEMPERATURE',
            targetTemperature: temp,
            power: true,
            acMode,
            fanSpeed,
            timestamp: Date.now(),
          };
          const cmdResult = sendAcCommand(cmdPayload, acDispatcher);
          const transportSuffix = typeof cmdResult === 'object' && 'transport' in cmdResult ? ` [${cmdResult.transport}]` : '';

          setLastIrTransmission({
            command: `SET TEMP ${temp}°C`,
            target: 'Panasonic AC',
            status: 'SENT',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            detail: `${acMode.toUpperCase()} ${temp}°C • FAN ${fanSpeed.toUpperCase()}`,
          });

          addEvent({
            type: 'IR_COMMAND',
            source: 'hardware',
            level: 'info',
            message: `Panasonic IR Carrier Burst (38 kHz PWM GPIO 14): SET TEMP ${temp}°C (${acMode.toUpperCase()}, FAN ${fanSpeed.toUpperCase()})${transportSuffix}`,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            motionDetected: sensorData.motionDetected,
            acPower,
            acMode,
            fanSpeed,
            targetTemperature: temp,
          });
        }
      }
      return temp;
    });
  }, [acDispatcher, addEvent, sensorData, acPower, acMode, fanSpeed]);

  const setAcMode = useCallback((mode: ACMode) => {
    setAcModeState(prev => {
      if (prev !== mode) {
        addEvent({
          type: 'MANUAL_CONTROL',
          source: 'user',
          level: 'info',
          message: `User changed AC mode to ${mode.toUpperCase()}.`,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          motionDetected: sensorData.motionDetected,
          acPower,
          acMode: mode,
          fanSpeed,
          targetTemperature,
          details: { previousValue: prev, newValue: mode },
        });

        if (acPower) {
          const cmdPayload: ACCommandPayload = {
            action: 'SET_MODE',
            acMode: mode,
            targetTemperature,
            power: true,
            fanSpeed,
            timestamp: Date.now(),
          };
          const cmdResult = sendAcCommand(cmdPayload, acDispatcher);
          const transportSuffix = typeof cmdResult === 'object' && 'transport' in cmdResult ? ` [${cmdResult.transport}]` : '';

          setLastIrTransmission({
            command: `SET MODE ${mode.toUpperCase()}`,
            target: 'Panasonic AC',
            status: 'SENT',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            detail: `Mode: ${mode.toUpperCase()} • ${targetTemperature}°C`,
          });

          addEvent({
            type: 'IR_COMMAND',
            source: 'hardware',
            level: 'info',
            message: `Panasonic IR Carrier Burst (38 kHz PWM GPIO 14): SET MODE ${mode.toUpperCase()} (${targetTemperature}°C, FAN ${fanSpeed.toUpperCase()})${transportSuffix}`,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            motionDetected: sensorData.motionDetected,
            acPower,
            acMode: mode,
            fanSpeed,
            targetTemperature,
          });
        }
      }
      return mode;
    });
  }, [acDispatcher, addEvent, sensorData, acPower, targetTemperature, fanSpeed]);

  const setFanSpeed = useCallback((speed: FanSpeed) => {
    setFanSpeedState(prev => {
      if (prev !== speed) {
        addEvent({
          type: 'MANUAL_CONTROL',
          source: 'user',
          level: 'info',
          message: `User changed fan speed to ${speed.toUpperCase()}.`,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          motionDetected: sensorData.motionDetected,
          acPower,
          acMode,
          fanSpeed: speed,
          targetTemperature,
          details: { previousValue: prev, newValue: speed },
        });

        if (acPower) {
          const cmdPayload: ACCommandPayload = {
            action: 'SET_FAN_SPEED',
            fanSpeed: speed,
            targetTemperature,
            acMode,
            power: true,
            timestamp: Date.now(),
          };
          const cmdResult = sendAcCommand(cmdPayload, acDispatcher);
          const transportSuffix = typeof cmdResult === 'object' && 'transport' in cmdResult ? ` [${cmdResult.transport}]` : '';

          setLastIrTransmission({
            command: `SET FAN ${speed.toUpperCase()}`,
            target: 'Panasonic AC',
            status: 'SENT',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            detail: `Fan: ${speed.toUpperCase()}`,
          });

          addEvent({
            type: 'IR_COMMAND',
            source: 'hardware',
            level: 'info',
            message: `Panasonic IR Carrier Burst (38 kHz PWM GPIO 14): SET FAN ${speed.toUpperCase()} (${acMode.toUpperCase()}, ${targetTemperature}°C)${transportSuffix}`,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            motionDetected: sensorData.motionDetected,
            acPower,
            acMode,
            fanSpeed: speed,
            targetTemperature,
          });
        }
      }
      return speed;
    });
  }, [acDispatcher, addEvent, sensorData, acPower, acMode, targetTemperature]);

  // Delegated to SimulationDataSource
  const triggerManualMotion = useCallback((detected: boolean) => {
    dataSource.setManualMotion(detected);
  }, [dataSource]);

  // Delegated to SimulationDataSource
  const setManualTemperature = useCallback((temp: number) => {
    const rounded = Number(temp.toFixed(1));
    dataSource.setManualTemperature(rounded);
    addEvent({
      type: 'SENSOR_UPDATE',
      source: 'user',
      level: 'info',
      message: `DHT22 ambient temperature manually adjusted to ${rounded.toFixed(1)}°C.`,
      temperature: rounded,
      humidity: sensorData.humidity,
      motionDetected: sensorData.motionDetected,
      acPower,
      acMode,
      fanSpeed,
      targetTemperature,
    });
  }, [dataSource, addEvent, sensorData, acPower, acMode, fanSpeed, targetTemperature]);

  const setTemperatureThreshold = useCallback((newThreshold: number) => {
    setTemperatureThresholdState(prev => {
      if (prev !== newThreshold) {
        addEvent({
          type: 'THRESHOLD_CHANGED',
          source: 'user',
          level: 'info',
          message: `Temperature threshold changed from ${prev.toFixed(1)}°C to ${newThreshold.toFixed(1)}°C.`,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          motionDetected: sensorData.motionDetected,
          acPower,
          details: { previousValue: prev, newValue: newThreshold, unit: '°C' },
        });
      }
      return newThreshold;
    });
  }, [addEvent, sensorData, acPower]);

  const setMotionTimeout = useCallback((newTimeout: number) => {
    setMotionTimeoutState(prev => {
      if (prev !== newTimeout) {
        addEvent({
          type: 'TIMEOUT_CHANGED',
          source: 'user',
          level: 'info',
          message: `Motion vacancy timeout changed from ${prev}s to ${newTimeout}s.`,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          motionDetected: sensorData.motionDetected,
          acPower,
          details: { previousValue: prev, newValue: newTimeout, unit: 's' },
        });
      }
      return newTimeout;
    });
  }, [addEvent, sensorData, acPower]);

  // =========================================================================
  // 10. PRESENTATION DEMO MODE CONTROLLER
  // =========================================================================
  const applyDemoScenario = useCallback((id: DemoScenarioId) => {
    const scenario = DEMO_SCENARIOS.find(s => s.id === id);
    if (!scenario) return;

    const isDifferent = id !== lastAppliedScenarioRef.current;
    lastAppliedScenarioRef.current = id;

    setIsDemoMode(true);
    setActiveScenarioId(id);
    setLiveSimulationActive(false);

    // 1. DATA SOURCE: Apply scenario baseline telemetry
    dataSource.applyScenario(scenario);

    // 2. Scenario AC settings
    setAutoModeState(scenario.autoMode);
    setTargetTemperatureState(scenario.targetTemperature);
    setAcModeState(scenario.acMode);
    setFanSpeedState(scenario.fanSpeed);
    setTimeSinceLastMotion(scenario.initialTimeSinceMotion);
    if (scenario.motionDetected) {
      setLastMotionTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }

    setAcPower(scenario.initialAcPower);
    lastDispatchedPower.current = scenario.initialAcPower;

    // Synchronize Panasonic IR transmission state with Demo Mode
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (id === 'hot_room') {
      setLastIrTransmission({
        command: 'POWER ON',
        target: 'Panasonic AC',
        status: 'SENT',
        timestamp: nowStr,
        detail: 'COOL 26°C • FAN AUTO',
      });
    } else if (id === 'normal_room') {
      setLastIrTransmission(prev => ({
        ...prev,
        status: 'READY',
        detail: 'Normal Comfort (No IR trigger needed)',
      }));
    } else if (id === 'empty_room') {
      setLastIrTransmission({
        command: 'STANDBY',
        target: 'Panasonic AC',
        status: 'WAITING',
        timestamp: nowStr,
        detail: 'Inactivity vacancy countdown active',
      });
    }

    if (isDifferent) {
      addEvent({
        type: 'DEMO_SCENARIO_SELECTED',
        source: 'demo',
        level: 'info',
        message: `Demo scenario applied: ${scenario.name} (T: ${scenario.temperature}°C, RH: ${scenario.humidity}%, Motion: ${scenario.motionDetected ? 'DETECTED' : 'CLEAR'})`,
        temperature: scenario.temperature,
        humidity: scenario.humidity,
        motionDetected: scenario.motionDetected,
        acPower: scenario.initialAcPower,
        acMode: scenario.acMode,
        fanSpeed: scenario.fanSpeed,
        targetTemperature: scenario.targetTemperature,
        details: { scenarioId: id, reason: scenario.expectedDecision },
      });
    }
  }, [dataSource, addEvent]);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setActiveScenarioId(null);
    lastAppliedScenarioRef.current = null;
    setLiveSimulationActive(true);
    addEvent({
      type: 'DEMO_SCENARIO_SELECTED',
      source: 'demo',
      level: 'info',
      message: 'Exited Demo Mode. Resumed Live Simulation drift.',
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      motionDetected: sensorData.motionDetected,
      acPower,
    });
  }, [addEvent, sensorData, acPower]);

  const fastForwardTimeout = useCallback(() => {
    setTimeSinceLastMotion(motionTimeout + 2);
    addEvent({
      type: 'DEMO_SCENARIO_SELECTED',
      source: 'demo',
      level: 'warning',
      message: `[DEMO FAST-FORWARD] Advanced vacancy clock to ${motionTimeout + 2}s (Timeout ${motionTimeout}s reached).`,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      motionDetected: false,
      acPower,
      details: { trigger: 'FAST_FORWARD' },
    });
  }, [motionTimeout, addEvent, sensorData, acPower]);

  const clearEvents = useCallback(() => {
    setSystemEvents([]);
  }, []);

  const activeScenario = activeScenarioId
    ? DEMO_SCENARIOS.find(s => s.id === activeScenarioId) || null
    : null;

  // =========================================================================
  // 11. CENTRALIZED TYPE-SAFE SYSTEM HEALTH MODEL
  // =========================================================================
  const systemHealth: SystemHealthState = {
    esp32: {
      name: 'ESP32',
      status: 'ONLINE',
      cpu: '240 MHz',
      ipAddress: '192.168.1.42',
      wifiRssi: `${activeWifiNetwork.rssi} dBm`,
      uptime: formatUptime(uptimeSeconds),
      firmware: 'v1.0.0',
      lastSeen: `${(uptimeSeconds % 4) + 1} sec ago`,
      isSimulated: true,
    },
    dht22: {
      name: 'DHT22',
      status: 'ONLINE',
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      lastUpdate: sensorData.timestampFormatted,
      isSimulated: true,
    },
    pir: {
      name: 'PIR',
      status: 'ONLINE',
      motion: sensorData.motionDetected ? 'DETECTED' : 'NOT DETECTED',
      lastMotion: lastMotionTimestamp,
      timeout: motionTimeout,
      isSimulated: true,
    },
    irTransmitter: {
      name: 'IR TRANSMITTER',
      status: 'READY',
      lastCommand: acPower ? 'POWER ON' : 'POWER OFF',
      mode: acMode.toUpperCase(),
      target: targetTemperature,
      fan: fanSpeed.toUpperCase(),
      isSimulated: true,
    },
    wifi: {
      name: 'Wi-Fi',
      status: activeWifiNetwork.signalQuality === 'POOR' ? 'WARNING' : 'CONNECTED',
      rssi: `${activeWifiNetwork.rssi} dBm`,
      connection: activeWifiNetwork.signalQuality === 'POOR' ? 'DEGRADED' : 'STABLE',
      ssid: activeWifiNetwork.ssid,
      isSimulated: true,
    },
  };

  const sensor: SensorReading = {
    temperature: sensorData.temperature,
    humidity: sensorData.humidity,
    motionDetected: sensorData.motionDetected,
    motion: sensorData.motionDetected,
    timestamp: sensorData.timestamp,
    timestampFormatted: sensorData.timestampFormatted,
  };

  const acState: ACState = {
    acPower,
    acMode,
    fanSpeed,
    targetTemperature,
    autoMode,
  };

  return (
    <SystemContext.Provider
      value={{
        sensor,
        timeSinceLastMotion,
        sensorHistory,
        acState,
        temperatureThreshold,
        motionTimeout,
        automationDecision,
        isDemoMode,
        activeScenarioId,
        activeScenario,
        liveSimulationActive,
        setLiveSimulationActive,
        applyDemoScenario,
        exitDemoMode,
        fastForwardTimeout,
        toggleAcPower,
        setAcPowerManual,
        setTargetTemperature,
        setAcMode,
        setFanSpeed,
        toggleAutoMode,
        setAutoMode,
        setTemperatureThreshold,
        setMotionTimeout,
        triggerManualMotion,
        setManualTemperature,
        irLearningStatus,
        learningProgressMessage,
        learnedCommands,
        lastCapturedCommand,
        lastIrTransmission,
        startIrLearning,
        cancelIrLearning,
        replayIrCommand,
        systemHealth,
        activeWifiNetwork,
        configuredWifiNetworks,
        wifiAutoSwitch,
        wifiSwitchThreshold,
        wifiSwitchCooldown,
        setWifiAutoSwitch,
        setWifiSwitchThreshold,
        setWifiSwitchCooldown,
        activeWifiScenario,
        applyWifiScenario,
        resetWifiScenario,
        switchWifiNetwork,
        systemEvents,
        clearEvents,
        dataSourceMode: dataSource.getMode(),
        dataSource,
        acDispatcher,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
