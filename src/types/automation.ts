/**
 * Core Automation State Definitions
 */
export type AutomationState =
  | 'AUTO_IDLE'
  | 'AUTO_COOLING'
  | 'AUTO_WAITING_FOR_TIMEOUT'
  | 'AUTO_OFF_EMPTY'
  | 'MANUAL_CONTROL';

export type AutomationTrigger =
  | 'manual_mode'
  | 'temp_normal'
  | 'motion_cooling'
  | 'waiting_timeout'
  | 'empty_timeout';

export interface AutomationInputs {
  /** Ambient room temperature in Celsius from DHT22 */
  temperature: number;
  /** High temperature threshold in Celsius (e.g. 26.0°C) */
  temperatureThreshold: number;
  /** Current PIR motion detection signal: true = detected, false = clear */
  motionDetected: boolean;
  /** Inactivity timeout in seconds before AC powers down when vacant */
  motionTimeout: number;
  /** Whether the system is in Auto Mode (true) or Manual Mode (false) */
  autoMode: boolean;
  /** Current operating power state of the AC (true = ON, false = OFF) */
  currentAcPower: boolean;
  /** Number of seconds elapsed since motion was last detected */
  timeSinceLastMotion: number;
}

export interface AutomationDecision {
  /** Conceptual system automation state */
  state: AutomationState;
  /** Anti-spam guard: true ONLY if AC power must actually transition */
  shouldChangePower: boolean;
  /** Target AC power (true = ON, false = OFF) */
  desiredPower: boolean;
  /** Human-readable rationale for the decision */
  reason: string;
  /** Machine-readable trigger category */
  trigger: AutomationTrigger;
  /** Remaining seconds until empty room timeout triggers (when waiting) */
  timeRemaining: number;
}
