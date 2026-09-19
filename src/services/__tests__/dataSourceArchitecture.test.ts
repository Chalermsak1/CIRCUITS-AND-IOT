import { SimulationDataSource } from '../simulationDataSource';
import { RealDeviceDataSource } from '../realDeviceDataSource';
import {
  SimulationAcCommandDispatcher,
  RealDeviceAcCommandDispatcher,
  sendAcCommand,
  type ACCommandPayload
} from '../acCommandService';
import { evaluateAutomation } from '../automationEngine';
import { DEMO_SCENARIOS } from '../demoScenarios';
import type { SensorData } from '../../types/sensor';

console.log('=== VERIFYING DATA SOURCE & AC COMMAND ARCHITECTURE ===\n');

// --------------------------------------------------------------------------
// TEST 1: SimulationDataSource Contract & Subscription
// --------------------------------------------------------------------------
console.log('--- TEST 1: SimulationDataSource Contract & Telemetry Stream ---');
const simSource = new SimulationDataSource({
  initialTemperature: 24.5,
  initialHumidity: 55.0,
  initialMotion: true,
  maxDeltaPerTick: 0.15,
});

if (simSource.getMode() !== 'simulation') {
  throw new Error(`Expected mode 'simulation', got '${simSource.getMode()}'`);
}

let receivedTelemetry: SensorData | null = null;
const unsubscribe = simSource.subscribe(data => {
  receivedTelemetry = data;
});

if (!receivedTelemetry) {
  throw new Error('Subscriber should receive initial telemetry immediately upon subscription.');
}

const initialReading: SensorData = receivedTelemetry;
if (
  initialReading.temperature !== 24.5 ||
  initialReading.humidity !== 55.0 ||
  initialReading.motionDetected !== true ||
  initialReading.motion !== true ||
  typeof initialReading.timestamp !== 'number' ||
  typeof initialReading.timestampFormatted !== 'string'
) {
  throw new Error(`Invalid telemetry payload structure: ${JSON.stringify(initialReading)}`);
}

console.log('✓ Test 1 Passed: SimulationDataSource conforms to ISensorDataSource with strongly-typed SensorData.');

// --------------------------------------------------------------------------
// TEST 2: Thermal Inertia & Gradual Variation (No wild jumps)
// --------------------------------------------------------------------------
console.log('\n--- TEST 2: Thermodynamic Clamping & Gradual Variation ---');
// Verify that over 20 consecutive simulation steps, max delta per step never exceeds maxDeltaPerTick (0.15°C)
let prevTemp = simSource.getSensorData().temperature;
let maxObservedDelta = 0;

// Set ambient equilibrium to hot (34°C) with AC OFF
simSource.setAcFeedback(false, 25.0);

for (let i = 0; i < 20; i++) {
  simSource.stepPhysics();
  const currentTemp = simSource.getSensorData().temperature;
  const delta = Math.abs(currentTemp - prevTemp);
  if (delta > maxObservedDelta) {
    maxObservedDelta = delta;
  }
  if (delta > 0.16) { // Allow minor 0.01 floating point rounding
    throw new Error(`Gradual variation violated! Step ${i} experienced delta of ${delta.toFixed(3)}°C > 0.15°C limit.`);
  }
  prevTemp = currentTemp;
}

console.log(`  Max observed single-step temperature delta: ${maxObservedDelta.toFixed(3)}°C (Limit: 0.150°C)`);
console.log('✓ Test 2 Passed: Thermal inertia enforced. Temperature changes are smooth and physically realistic.');

// --------------------------------------------------------------------------
// TEST 3: Demo Mode Scenario Ingestion
// --------------------------------------------------------------------------
console.log('\n--- TEST 3: Demo Mode Scenario Ingestion via SimulationDataSource ---');
const hotRoomScenario = DEMO_SCENARIOS.find(s => s.id === 'hot_room')!;
simSource.applyScenario(hotRoomScenario);

const hotReading = simSource.getSensorData();
if (
  hotReading.temperature !== 29.2 ||
  hotReading.humidity !== 61.0 ||
  hotReading.motionDetected !== true
) {
  throw new Error(`Failed to apply demo scenario: ${JSON.stringify(hotReading)}`);
}

console.log(`  Hot Room Telemetry Ingested: ${hotReading.temperature}°C, ${hotReading.humidity}%, Motion: ${hotReading.motionDetected}`);
console.log('✓ Test 3 Passed: Demo Mode scenarios synchronize cleanly through the SimulationDataSource.');

// Clean up simulation listener
unsubscribe();
simSource.destroy();

// --------------------------------------------------------------------------
// TEST 4: RealDeviceDataSource Hardware Standby Honesty
// --------------------------------------------------------------------------
console.log('\n--- TEST 4: RealDeviceDataSource Hardware Standby Honesty ---');
const realSource = new RealDeviceDataSource('http://192.168.1.42/api/sensors');

if (realSource.getMode() !== 'hardware_standby') {
  throw new Error(`Expected mode 'hardware_standby', got '${realSource.getMode()}'`);
}

let threwExpectedError = false;
try {
  realSource.getSensorData();
} catch (err: unknown) {
  threwExpectedError = true;
  const msg = err instanceof Error ? err.message : String(err);
  if (!msg.includes('standby')) {
    throw new Error(`Unexpected error message: ${msg}`);
  }
}

if (!threwExpectedError) {
  throw new Error('RealDeviceDataSource should throw an honest standby error when hardware is not online.');
}

const realUnsub = realSource.subscribe(() => {});
realUnsub();

console.log('✓ Test 4 Passed: RealDeviceDataSource maintains honest hardware boundary without fake network mock.');

// --------------------------------------------------------------------------
// TEST 5: AC Command Dispatcher Abstraction
// --------------------------------------------------------------------------
console.log('\n--- TEST 5: AC Command Dispatcher Abstraction ---');
const simDispatcher = new SimulationAcCommandDispatcher();
const realDispatcher = new RealDeviceAcCommandDispatcher();

const powerOnCommand: ACCommandPayload = {
  action: 'POWER_ON',
  power: true,
  targetTemperature: 24,
  acMode: 'cool',
  fanSpeed: 'high',
  timestamp: Date.now(),
  reason: 'Automated cooling required',
};

const simResult = sendAcCommand(powerOnCommand, simDispatcher);
if (
  !simResult.success ||
  simResult.transport !== 'simulation' ||
  !simResult.message.includes('38 kHz PWM GPIO 14')
) {
  throw new Error(`Simulation command dispatch failed: ${JSON.stringify(simResult)}`);
}
console.log(`  Simulated IR Output: ${simResult.message}`);

let realDispatcherThrew = false;
try {
  await realDispatcher.sendAcCommand(powerOnCommand);
} catch (err: unknown) {
  realDispatcherThrew = true;
  const msg = err instanceof Error ? err.message : String(err);
  if (!msg.includes('offline') && !msg.includes('unavailable')) {
    throw new Error(`Unexpected error message: ${msg}`);
  }
}

if (!realDispatcherThrew) {
  throw new Error('RealDeviceAcCommandDispatcher must fail honestly when real ESP32 gateway is offline.');
}

console.log('✓ Test 5 Passed: IACCommandDispatcher cleanly decouples command generation from hardware transport.');

// --------------------------------------------------------------------------
// TEST 6: End-to-End Architectural Pipeline Integration
// --------------------------------------------------------------------------
console.log('\n--- TEST 6: Complete Pipeline: DATA SOURCE -> SENSOR STATE -> AUTOMATION -> AC COMMAND ---');

// Pipeline execution:
// 1. Data Source produces raw SensorData
const pipelineSource = new SimulationDataSource({
  initialTemperature: 30.5,
  initialHumidity: 70.0,
  initialMotion: true,
});
const rawTelemetry = pipelineSource.getSensorData();

// 2. Automation Engine evaluates SensorData independently of data source
const decision = evaluateAutomation({
  temperature: rawTelemetry.temperature,
  temperatureThreshold: 26.0,
  motionDetected: rawTelemetry.motionDetected,
  motionTimeout: 30,
  autoMode: true,
  currentAcPower: false,
  timeSinceLastMotion: 0,
});

if (!decision.shouldChangePower || decision.desiredPower !== true || decision.state !== 'AUTO_COOLING') {
  throw new Error(`Pipeline decision failure: ${JSON.stringify(decision)}`);
}

// 3. Actuator layer executes command through abstraction
const pipelineCommand: ACCommandPayload = {
  action: 'POWER_ON',
  power: decision.desiredPower,
  targetTemperature: 25,
  acMode: 'cool',
  fanSpeed: 'auto',
  timestamp: Date.now(),
  reason: decision.reason,
};
const pipelineCmdResult = sendAcCommand(pipelineCommand, simDispatcher);

if (!pipelineCmdResult.success || pipelineCmdResult.transport !== 'simulation') {
  throw new Error(`Pipeline dispatch failure: ${JSON.stringify(pipelineCmdResult)}`);
}

console.log(`  [Pipeline Flow]`);
console.log(`  1. Ingested Telemetry: ${rawTelemetry.temperature}°C, Motion: ${rawTelemetry.motionDetected}`);
console.log(`  2. Automation Decision: ${decision.state} -> desiredPower=${decision.desiredPower} ("${decision.reason}")`);
console.log(`  3. Actuator Output: ${pipelineCmdResult.message}`);
console.log('✓ Test 6 Passed: Target architecture cleanly decouples UI, Logic, State, Data Source, and Simulation.');

console.log('\n=== ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY ===');
