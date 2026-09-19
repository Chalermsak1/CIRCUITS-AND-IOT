import type { AutomationInputs, AutomationDecision } from '../types/automation';

/**
 * Pure, centralized decision function for the Automatic Air Conditioner Control System.
 *
 * Implements conceptual state transitions:
 *  - MANUAL_CONTROL: autoMode is disabled (Rule A)
 *  - AUTO_IDLE: temperature <= threshold (Rule B)
 *  - AUTO_COOLING: temperature > threshold & motion detected (Rule C)
 *  - AUTO_WAITING_FOR_TIMEOUT: temperature > threshold & motion absent & timeout not reached (Rule D)
 *  - AUTO_OFF_EMPTY: motion absent & timeout elapsed (Rule E)
 *
 * Anti-Spam Guarantee:
 *  `shouldChangePower` is strictly computed via edge-detection (`desiredPower !== currentAcPower`).
 *  Commands are never spammed continuously when the system remains in the same operating condition.
 */
export function evaluateAutomation(inputs: AutomationInputs): AutomationDecision {
  const {
    temperature,
    temperatureThreshold,
    motionDetected,
    motionTimeout,
    autoMode,
    currentAcPower,
    timeSinceLastMotion,
  } = inputs;

  // RULE A — Automatic mode disabled
  if (!autoMode) {
    return {
      state: 'MANUAL_CONTROL',
      shouldChangePower: false,
      desiredPower: currentAcPower,
      reason: 'Automatic mode is disabled.',
      trigger: 'manual_mode',
      timeRemaining: 0,
    };
  }

  // RULE B — Temperature below or equal to threshold
  if (temperature <= temperatureThreshold) {
    const desiredPower = false;
    return {
      state: 'AUTO_IDLE',
      // Only emit command when transitioning from ON to OFF
      shouldChangePower: currentAcPower !== desiredPower,
      desiredPower,
      reason: 'Temperature is within the configured range.',
      trigger: 'temp_normal',
      timeRemaining: 0,
    };
  }

  // From here on: autoMode === true AND temperature > temperatureThreshold (Hot room)

  // RULE C — Hot room + occupancy
  if (motionDetected) {
    const desiredPower = true;
    return {
      state: 'AUTO_COOLING',
      // Only emit command when transitioning from OFF to ON
      shouldChangePower: currentAcPower !== desiredPower,
      desiredPower,
      reason: 'Temperature is above threshold and motion is detected.',
      trigger: 'motion_cooling',
      timeRemaining: motionTimeout,
    };
  }

  // From here on: autoMode === true AND temperature > temperatureThreshold AND motionDetected === false

  // RULE D — Hot room + no motion (timeout NOT yet elapsed)
  if (timeSinceLastMotion < motionTimeout) {
    const remaining = Math.max(0, Math.ceil(motionTimeout - timeSinceLastMotion));
    return {
      state: 'AUTO_WAITING_FOR_TIMEOUT',
      // Maintain current power while waiting; do NOT change power immediately
      shouldChangePower: false,
      desiredPower: currentAcPower,
      reason: 'No motion detected. Waiting for the configured timeout.',
      trigger: 'waiting_timeout',
      timeRemaining: remaining,
    };
  }

  // RULE E — Empty room timeout reached
  const desiredPower = false;
  return {
    state: 'AUTO_OFF_EMPTY',
    // Only emit command when transitioning from ON to OFF
    shouldChangePower: currentAcPower !== desiredPower,
    desiredPower,
    reason: 'No motion detected for the configured timeout.',
    trigger: 'empty_timeout',
    timeRemaining: 0,
  };
}
