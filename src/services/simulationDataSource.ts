import type { SensorData } from '../types/sensor';
import type { ISensorDataSource, DataSourceMode } from './dataSource';
import type { DemoScenario } from '../types/demo';

export interface SimulationConfig {
  initialTemperature?: number;
  initialHumidity?: number;
  initialMotion?: boolean;
  ambientEquilibriumTemp?: number;
  driftIntervalMs?: number;
  maxDeltaPerTick?: number;
}

/**
 * SimulationDataSource
 *
 * Emulates physical DHT22 (single-bus) and PIR (passive infrared) sensors
 * running in a realistic thermodynamic closed loop.
 *
 * Key Engineering Principles:
 * - Thermal Inertia: Temperature transitions are gradual and clamped (max 0.15°C per interval).
 * - Avoids unrealistic swings (e.g., 25°C -> 34°C -> 18°C in seconds is strictly prohibited).
 * - Demo Mode Integration: Snaps baseline environmental state without creating an alternative automation engine.
 */
export class SimulationDataSource implements ISensorDataSource {
  private temperature: number;
  private humidity: number;
  private motionDetected: boolean;
  private listeners: Set<(data: SensorData) => void> = new Set();
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isDriftActive: boolean = false;
  private acPower: boolean = false;
  private targetTemperature: number = 26.0;
  private ambientEquilibriumTemp: number = 29.5;
  private maxDeltaPerTick: number = 0.15;
  private driftIntervalMs: number = 2500;

  constructor(config?: SimulationConfig) {
    this.temperature = config?.initialTemperature ?? 24.5;
    this.humidity = config?.initialHumidity ?? 55.0;
    this.motionDetected = config?.initialMotion ?? true;

    if (config?.ambientEquilibriumTemp !== undefined) {
      this.ambientEquilibriumTemp = config.ambientEquilibriumTemp;
    }
    if (config?.maxDeltaPerTick !== undefined) {
      this.maxDeltaPerTick = config.maxDeltaPerTick;
    }
    if (config?.driftIntervalMs !== undefined) {
      this.driftIntervalMs = config.driftIntervalMs;
    }
  }

  getMode(): DataSourceMode {
    return 'simulation';
  }

  getSensorData(): SensorData {
    const now = Date.now();
    return {
      temperature: this.temperature,
      humidity: this.humidity,
      motionDetected: this.motionDetected,
      motion: this.motionDetected,
      timestamp: now,
      timestampFormatted: new Date(now).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  }

  subscribe(listener: (data: SensorData) => void): () => void {
    this.listeners.add(listener);
    // Provide initial telemetry reading immediately upon connection
    listener(this.getSensorData());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const data = this.getSensorData();
    this.listeners.forEach(listener => listener(data));
  }

  /**
   * Supplies feedback from the actuator layer:
   * When AC is active, room drifts toward target temperature.
   * When AC is inactive, ambient heat warms room toward equilibrium.
   */
  setAcFeedback(acPower: boolean, targetTemperature: number) {
    this.acPower = acPower;
    this.targetTemperature = targetTemperature;
  }

  /**
   * Toggles background thermodynamic drift.
   */
  setDriftActive(active: boolean) {
    this.isDriftActive = active;
    if (active && !this.timerId) {
      this.startDriftTimer();
    } else if (!active && this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  isDrifting(): boolean {
    return this.isDriftActive;
  }

  /**
   * Advances simulation physics by one step.
   * Strictly clamps delta to ensure gradual variation.
   */
  stepPhysics() {
    // 1. Temperature Calculation with Thermal Resistance
    const target = this.acPower ? this.targetTemperature : this.ambientEquilibriumTemp;
    const diff = target - this.temperature;
    // Gradual approach: 5% delta plus micro-fluctuations (jitter <= 0.04°C)
    const rawDelta = diff * 0.05 + (Math.random() - 0.5) * 0.06;
    const maxAllowedSteps = Math.max(1, Math.floor(this.maxDeltaPerTick * 10));
    const stepCount = Math.min(maxAllowedSteps, Math.round(Math.abs(rawDelta) * 10));
    const step = (Math.sign(rawDelta) * stepCount) / 10;
    this.temperature = Number(Math.max(18.0, Math.min(36.0, this.temperature + step)).toFixed(1));

    // 2. Humidity Physics (Cooling causes gradual slight dehumidification)
    const humTarget = this.acPower ? 50.0 : 60.0;
    const humDiff = humTarget - this.humidity;
    const rawHumDelta = humDiff * 0.04 + (Math.random() - 0.5) * 0.25;
    const humStep = (Math.sign(rawHumDelta) * Math.min(5, Math.round(Math.abs(rawHumDelta) * 10))) / 10;
    this.humidity = Number(Math.max(30.0, Math.min(95.0, this.humidity + humStep)).toFixed(1));

    // 3. Motion state fluctuation (10% probability during unscripted live drift)
    if (Math.random() < 0.10) {
      this.motionDetected = !this.motionDetected;
    }

    this.notify();
  }

  private startDriftTimer() {
    this.timerId = setInterval(() => {
      if (this.isDriftActive) {
        this.stepPhysics();
      }
    }, this.driftIntervalMs);
  }

  /**
   * Demo Mode Integration:
   * Synchronizes baseline sensor physics with the chosen evaluation scenario.
   */
  applyScenario(scenario: DemoScenario) {
    this.temperature = scenario.temperature;
    this.humidity = scenario.humidity;
    this.motionDetected = scenario.motionDetected;
    this.setDriftActive(false);
    this.notify();
  }

  /**
   * Diagnostic manual test overrides
   */
  setManualTemperature(temp: number) {
    this.temperature = Number(temp.toFixed(1));
    this.notify();
  }

  setManualMotion(detected: boolean) {
    this.motionDetected = detected;
    this.notify();
  }

  destroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.listeners.clear();
  }
}
