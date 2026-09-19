import type { ACMode, FanSpeed } from './ac';

export type DemoScenarioId = 'normal_room' | 'hot_room' | 'empty_room';

export interface DemoScenario {
  id: DemoScenarioId;
  name: string;
  badgeLabel: string;
  description: string;
  temperature: number;      // °C
  humidity: number;         // %
  motionDetected: boolean;  // PIR detection
  autoMode: boolean;        // Auto Mode
  targetTemperature: number;// °C setpoint
  acMode: ACMode;           // cool, dry, fan, auto
  fanSpeed: FanSpeed;       // auto, low, med, high
  initialAcPower: boolean;  // Starting AC state for the scenario
  initialTimeSinceMotion: number; // Seconds
  expectedDecision: string;
  expectedAcPower: boolean;
  expectedReason: string;
  flowSteps: {
    stage: 'input' | 'process' | 'output';
    label: string;
    sublabel: string;
    active: boolean;
  }[];
}
