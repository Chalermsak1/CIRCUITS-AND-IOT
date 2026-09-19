import { evaluateAutomation } from '../automationEngine';
import { DEMO_SCENARIOS } from '../demoScenarios';
import type { AutomationInputs } from '../../types/automation';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`[Assertion Error] ${msg}`);
  }
}

console.log('=== VERIFYING PRESENTATION DEMO SCENARIOS ===\n');

// 1. SCENARIO 1 — NORMAL ROOM
console.log('--- TEST: SCENARIO 1 — NORMAL ROOM ---');
const sc1 = DEMO_SCENARIOS.find(s => s.id === 'normal_room')!;
assert(sc1.temperature === 24.5, 'Scenario 1 temp must be 24.5°C');
assert(sc1.humidity === 55.0, 'Scenario 1 humidity must be 55%');
assert(sc1.motionDetected === true, 'Scenario 1 motion must be DETECTED');
assert(sc1.autoMode === true, 'Scenario 1 autoMode must be ENABLED');

const input1: AutomationInputs = {
  temperature: sc1.temperature,
  temperatureThreshold: 26.0,
  motionDetected: sc1.motionDetected,
  motionTimeout: 30,
  autoMode: sc1.autoMode,
  currentAcPower: false,
  timeSinceLastMotion: 0,
};
const res1 = evaluateAutomation(input1);
console.log('Scenario 1 Evaluation Result:', res1);
assert(res1.state === 'AUTO_IDLE', `Expected AUTO_IDLE, got ${res1.state}`);
assert(res1.desiredPower === false, 'Expected desiredPower = false (AC OFF)');
assert(res1.reason === 'Temperature is within the configured range.', `Reason mismatch: ${res1.reason}`);
console.log('✓ SCENARIO 1 (NORMAL ROOM) VERIFIED: AC OFF, AUTO_IDLE\n');

// 2. SCENARIO 2 — HOT ROOM
console.log('--- TEST: SCENARIO 2 — HOT ROOM ---');
const sc2 = DEMO_SCENARIOS.find(s => s.id === 'hot_room')!;
assert(sc2.temperature === 29.2, 'Scenario 2 temp must be 29.2°C');
assert(sc2.humidity === 61.0, 'Scenario 2 humidity must be 61%');
assert(sc2.motionDetected === true, 'Scenario 2 motion must be DETECTED');
assert(sc2.autoMode === true, 'Scenario 2 autoMode must be ENABLED');
assert(sc2.targetTemperature === 26, 'Scenario 2 target must be 26°C');
assert(sc2.acMode === 'cool', 'Scenario 2 mode must be COOL');
assert(sc2.fanSpeed === 'auto', 'Scenario 2 fan must be AUTO');

const input2: AutomationInputs = {
  temperature: sc2.temperature,
  temperatureThreshold: 26.0,
  motionDetected: sc2.motionDetected,
  motionTimeout: 30,
  autoMode: sc2.autoMode,
  currentAcPower: false,
  timeSinceLastMotion: 0,
};
const res2 = evaluateAutomation(input2);
console.log('Scenario 2 Evaluation Result:', res2);
assert(res2.state === 'AUTO_COOLING', `Expected AUTO_COOLING, got ${res2.state}`);
assert(res2.desiredPower === true, 'Expected desiredPower = true (AC ON)');
assert(res2.shouldChangePower === true, 'Expected shouldChangePower = true (triggers OFF -> ON command)');
assert(res2.reason === 'Temperature is above threshold and motion is detected.', `Reason mismatch: ${res2.reason}`);
console.log('✓ SCENARIO 2 (HOT ROOM) VERIFIED: AC ON, AUTO_COOLING\n');

// 3. SCENARIO 3 — EMPTY ROOM
console.log('--- TEST: SCENARIO 3 — EMPTY ROOM ---');
const sc3 = DEMO_SCENARIOS.find(s => s.id === 'empty_room')!;
assert(sc3.temperature === 27.5, 'Scenario 3 temp must be 27.5°C');
assert(sc3.humidity === 58.0, 'Scenario 3 humidity must be 58%');
assert(sc3.motionDetected === false, 'Scenario 3 motion must be NOT DETECTED');
assert(sc3.autoMode === true, 'Scenario 3 autoMode must be ENABLED');

// Phase 3A: Immediately upon vacancy (timeout not reached)
console.log('Phase 3A: Immediately upon vacancy (Inactivity clock = 5s < 30s)');
const input3Immediate: AutomationInputs = {
  temperature: sc3.temperature,
  temperatureThreshold: 26.0,
  motionDetected: sc3.motionDetected,
  motionTimeout: 30,
  autoMode: sc3.autoMode,
  currentAcPower: true, // AC was running when occupants were present
  timeSinceLastMotion: 5,
};
const res3Immediate = evaluateAutomation(input3Immediate);
console.log('Phase 3A Result:', res3Immediate);
assert(res3Immediate.state === 'AUTO_WAITING_FOR_TIMEOUT', `Expected AUTO_WAITING_FOR_TIMEOUT, got ${res3Immediate.state}`);
assert(res3Immediate.shouldChangePower === false, 'Expected shouldChangePower = false (must not immediately turn off)');
assert(res3Immediate.reason === 'No motion detected. Waiting for the configured timeout.', `Reason mismatch: ${res3Immediate.reason}`);
console.log('✓ Phase 3A VERIFIED: AUTO_WAITING_FOR_TIMEOUT\n');

// Phase 3B: After configured timeout (Inactivity clock = 31s >= 30s)
console.log('Phase 3B: After configured timeout (Inactivity clock = 31s >= 30s)');
const input3Timeout: AutomationInputs = {
  ...input3Immediate,
  timeSinceLastMotion: 31,
};
const res3Timeout = evaluateAutomation(input3Timeout);
console.log('Phase 3B Result:', res3Timeout);
assert(res3Timeout.state === 'AUTO_OFF_EMPTY', `Expected AUTO_OFF_EMPTY, got ${res3Timeout.state}`);
assert(res3Timeout.desiredPower === false, 'Expected desiredPower = false (AC OFF)');
assert(res3Timeout.shouldChangePower === true, 'Expected shouldChangePower = true (triggers ON -> OFF command)');
assert(res3Timeout.reason === 'No motion detected for the configured timeout.', `Reason mismatch: ${res3Timeout.reason}`);
console.log('✓ Phase 3B VERIFIED: AUTO_OFF_EMPTY, AC OFF\n');

// 4. RAPID SWITCHING TEST: NORMAL → HOT → EMPTY → NORMAL → HOT
console.log('--- TEST: RAPID SWITCHING CYCLES (NORMAL → HOT → EMPTY → NORMAL → HOT) ---');
const sequence = ['normal_room', 'hot_room', 'empty_room', 'normal_room', 'hot_room'] as const;
let simAcPower = false;

for (let i = 0; i < sequence.length; i++) {
  const scenarioId = sequence[i];
  const sc = DEMO_SCENARIOS.find(s => s.id === scenarioId)!;
  console.log(`Step ${i + 1}: Switching to ${sc.name}`);

  const input: AutomationInputs = {
    temperature: sc.temperature,
    temperatureThreshold: 26.0,
    motionDetected: sc.motionDetected,
    motionTimeout: 30,
    autoMode: sc.autoMode,
    currentAcPower: simAcPower,
    timeSinceLastMotion: sc.initialTimeSinceMotion,
  };

  const decision = evaluateAutomation(input);
  if (decision.shouldChangePower) {
    simAcPower = decision.desiredPower;
    console.log(`  -> Command Fired: AC Power transitions to ${simAcPower ? 'ON' : 'OFF'}`);
  } else {
    console.log(`  -> Maintained AC Power: ${simAcPower ? 'ON' : 'OFF'} (No command spam)`);
  }

  if (scenarioId === 'normal_room') {
    assert(decision.state === 'AUTO_IDLE', 'Must be AUTO_IDLE');
    assert(decision.desiredPower === false, 'AC must be OFF');
  } else if (scenarioId === 'hot_room') {
    assert(decision.state === 'AUTO_COOLING', 'Must be AUTO_COOLING');
    assert(decision.desiredPower === true, 'AC must be ON');
  } else if (scenarioId === 'empty_room') {
    assert(decision.state === 'AUTO_WAITING_FOR_TIMEOUT', 'Must be AUTO_WAITING_FOR_TIMEOUT');
  }
}

console.log('\n=== ALL PRESENTATION DEMO SCENARIO TESTS PASSED PERFECTLY ===');
