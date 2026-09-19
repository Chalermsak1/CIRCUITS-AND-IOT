import { evaluateAutomation } from '../automationEngine';
import type { AutomationInputs } from '../../types/automation';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- Running Automation Engine Unit Tests ---\n');

// CASE 1: Temperature <= threshold, motion = true, auto = true
console.log('Test Case 1: Cool room with motion (Auto ON)');
const case1: AutomationInputs = {
  temperature: 24.5,
  temperatureThreshold: 26.0,
  motionDetected: true,
  motionTimeout: 60,
  autoMode: true,
  currentAcPower: false,
  timeSinceLastMotion: 0,
};
const res1 = evaluateAutomation(case1);
console.log('Result 1:', res1);
assert(res1.state === 'AUTO_IDLE', `Expected AUTO_IDLE, got ${res1.state}`);
assert(res1.desiredPower === false, 'Expected desiredPower = false');
assert(res1.shouldChangePower === false, 'Expected shouldChangePower = false (already OFF)');
console.log('✓ CASE 1 PASSED\n');

// CASE 1b: Transition from ON to OFF when room cools down
console.log('Test Case 1b: Room cools down while AC was ON');
const case1b: AutomationInputs = { ...case1, currentAcPower: true };
const res1b = evaluateAutomation(case1b);
assert(res1b.state === 'AUTO_IDLE', 'Expected AUTO_IDLE');
assert(res1b.desiredPower === false, 'Expected desiredPower = false');
assert(res1b.shouldChangePower === true, 'Expected shouldChangePower = true (OFF command needed)');
console.log('✓ CASE 1b PASSED\n');

// CASE 2: Temperature > threshold, motion = true, auto = true
console.log('Test Case 2: Hot room with motion (Auto ON)');
const case2: AutomationInputs = {
  temperature: 29.2,
  temperatureThreshold: 26.0,
  motionDetected: true,
  motionTimeout: 60,
  autoMode: true,
  currentAcPower: false,
  timeSinceLastMotion: 0,
};
const res2 = evaluateAutomation(case2);
console.log('Result 2:', res2);
assert(res2.state === 'AUTO_COOLING', `Expected AUTO_COOLING, got ${res2.state}`);
assert(res2.desiredPower === true, 'Expected desiredPower = true');
assert(res2.shouldChangePower === true, 'Expected shouldChangePower = true (transition OFF -> ON)');
console.log('✓ CASE 2 PASSED\n');

// CASE 2b: Anti-spam: Hot room with motion, already ON
console.log('Test Case 2b: Anti-spam check (Hot room, already ON)');
const case2b: AutomationInputs = { ...case2, currentAcPower: true };
const res2b = evaluateAutomation(case2b);
assert(res2b.state === 'AUTO_COOLING', 'Expected AUTO_COOLING');
assert(res2b.desiredPower === true, 'Expected desiredPower = true');
assert(res2b.shouldChangePower === false, 'Expected shouldChangePower = false (anti-spam active)');
console.log('✓ CASE 2b PASSED (Anti-spam prevented duplicate ON)\n');

// CASE 3: Temperature > threshold, motion = false, timeout not reached
console.log('Test Case 3: Hot room without motion, within timeout window');
const case3: AutomationInputs = {
  temperature: 29.2,
  temperatureThreshold: 26.0,
  motionDetected: false,
  motionTimeout: 60,
  autoMode: true,
  currentAcPower: true,
  timeSinceLastMotion: 25, // 25s < 60s
};
const res3 = evaluateAutomation(case3);
console.log('Result 3:', res3);
assert(res3.state === 'AUTO_WAITING_FOR_TIMEOUT', `Expected AUTO_WAITING_FOR_TIMEOUT, got ${res3.state}`);
assert(res3.shouldChangePower === false, 'Expected shouldChangePower = false (no immediate transition)');
assert(res3.desiredPower === true, 'Expected desiredPower to maintain currentAcPower');
assert(res3.timeRemaining === 35, `Expected timeRemaining = 35, got ${res3.timeRemaining}`);
console.log('✓ CASE 3 PASSED\n');

// CASE 4: Temperature > threshold, motion = false, timeout reached
console.log('Test Case 4: Empty room, timeout reached');
const case4: AutomationInputs = {
  temperature: 29.2,
  temperatureThreshold: 26.0,
  motionDetected: false,
  motionTimeout: 60,
  autoMode: true,
  currentAcPower: true,
  timeSinceLastMotion: 65, // 65s >= 60s
};
const res4 = evaluateAutomation(case4);
console.log('Result 4:', res4);
assert(res4.state === 'AUTO_OFF_EMPTY', `Expected AUTO_OFF_EMPTY, got ${res4.state}`);
assert(res4.desiredPower === false, 'Expected desiredPower = false');
assert(res4.shouldChangePower === true, 'Expected shouldChangePower = true (transition ON -> OFF)');
console.log('✓ CASE 4 PASSED\n');

// CASE 4b: Anti-spam: Empty room, already OFF
console.log('Test Case 4b: Anti-spam check (Empty room, already OFF)');
const case4b: AutomationInputs = { ...case4, currentAcPower: false };
const res4b = evaluateAutomation(case4b);
assert(res4b.state === 'AUTO_OFF_EMPTY', 'Expected AUTO_OFF_EMPTY');
assert(res4b.desiredPower === false, 'Expected desiredPower = false');
assert(res4b.shouldChangePower === false, 'Expected shouldChangePower = false (anti-spam active)');
console.log('✓ CASE 4b PASSED (Anti-spam prevented duplicate OFF)\n');

// CASE 5: Temperature > threshold, motion = true, Auto mode = false (Manual Mode)
console.log('Test Case 5: Manual control mode (Auto Mode = false)');
const case5: AutomationInputs = {
  temperature: 29.2,
  temperatureThreshold: 26.0,
  motionDetected: true,
  motionTimeout: 60,
  autoMode: false,
  currentAcPower: false,
  timeSinceLastMotion: 0,
};
const res5 = evaluateAutomation(case5);
console.log('Result 5:', res5);
assert(res5.state === 'MANUAL_CONTROL', `Expected MANUAL_CONTROL, got ${res5.state}`);
assert(res5.shouldChangePower === false, 'Expected shouldChangePower = false (no automatic change in manual mode)');
assert(res5.desiredPower === false, 'Expected desiredPower to match currentAcPower');
console.log('✓ CASE 5 PASSED\n');

console.log('=== ALL 5 CORE SPECIFICATION CASES + ANTI-SPAM VERIFIED SUCCESSFULLY ===');
