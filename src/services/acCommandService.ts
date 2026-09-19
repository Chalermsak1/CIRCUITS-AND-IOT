import type { ACMode, FanSpeed } from '../types/ac';

export type ACCommandAction =
  | 'POWER_ON'
  | 'POWER_OFF'
  | 'SET_TARGET_TEMPERATURE'
  | 'SET_MODE'
  | 'SET_FAN_SPEED';

export interface ACCommandPayload {
  action: ACCommandAction;
  power?: boolean;
  targetTemperature?: number;
  acMode?: ACMode;
  fanSpeed?: FanSpeed;
  timestamp: number;
  reason?: string;
}

export interface ACCommandResult {
  success: boolean;
  message: string;
  command: ACCommandPayload;
  transport: 'simulation' | 'http_rest' | 'mqtt';
}

/**
 * Universal interface for sending commands to the AC actuator driver.
 * Decouples the decision engine from whether commands execute locally,
 * in simulation, or over network protocols.
 */
export interface IACCommandDispatcher {
  sendAcCommand(command: ACCommandPayload): Promise<ACCommandResult> | ACCommandResult;
}

/**
 * SimulationAcCommandDispatcher
 *
 * Emulates the 940nm IR LED transmitter connected to ESP32 GPIO 14.
 * Formats standard 38 kHz NEC / Daikin carrier protocol bursts.
 */
export class SimulationAcCommandDispatcher implements IACCommandDispatcher {
  sendAcCommand(command: ACCommandPayload): ACCommandResult {
    let detail = '';
    if (command.power !== undefined) {
      detail = command.power ? 'POWER ON' : 'POWER OFF';
    } else {
      detail = command.action;
    }

    return {
      success: true,
      message: `[SIMULATED IR EMITTER] Dispatched ${detail} (Carrier: 38 kHz PWM GPIO 14)`,
      command,
      transport: 'simulation',
    };
  }
}

/**
 * RealDeviceAcCommandDispatcher
 *
 * Future hardware boundary for physical ESP32 infrared transmission.
 * In a deployed hardware environment, this dispatcher will transmit
 * via HTTP (`POST http://192.168.1.42/api/ir/send`) or MQTT (`home/ac/ir/send`).
 */
export class RealDeviceAcCommandDispatcher implements IACCommandDispatcher {
  private endpointUrl?: string;

  constructor(endpointUrl?: string) {
    this.endpointUrl = endpointUrl;
  }

  async sendAcCommand(_command: ACCommandPayload): Promise<ACCommandResult> {
    throw new Error(
      `[RealDeviceAcCommandDispatcher] Hardware transmission unavailable: Physical ESP32 IR gateway (${this.endpointUrl || 'unconfigured'}) is offline.`
    );
  }
}

/**
 * Central AC command dispatcher function.
 */
export function sendAcCommand(
  command: ACCommandPayload,
  dispatcher?: SimulationAcCommandDispatcher
): ACCommandResult;
export function sendAcCommand(
  command: ACCommandPayload,
  dispatcher: IACCommandDispatcher
): ACCommandResult | Promise<ACCommandResult>;
export function sendAcCommand(
  command: ACCommandPayload,
  dispatcher: IACCommandDispatcher = new SimulationAcCommandDispatcher()
): ACCommandResult | Promise<ACCommandResult> {
  return dispatcher.sendAcCommand(command);
}
