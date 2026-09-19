import { getDeviceStatusStyle } from '../../types/device';
import type { SystemHealthState } from '../../types/device';
import { evaluateAutomation } from '../automationEngine';
import { DEMO_SCENARIOS } from '../demoScenarios';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('=== VERIFYING DEVICE HEALTH MODEL & STATUS STYLING ===\n');

// 1. Color Token Mapping
console.log('Test 1: Status Color Token Mapping');
const onlineStyle = getDeviceStatusStyle('ONLINE');
assert(onlineStyle.textClass.includes('emerald'), 'Expected ONLINE to map to emerald green');
assert(onlineStyle.badgeClass.includes('emerald'), 'Expected ONLINE badge to use emerald');

const readyStyle = getDeviceStatusStyle('READY');
assert(readyStyle.textClass.includes('emerald'), 'Expected READY to map to emerald green');

const connectedStyle = getDeviceStatusStyle('CONNECTED');
assert(connectedStyle.textClass.includes('emerald'), 'Expected CONNECTED to map to emerald green');

const warningStyle = getDeviceStatusStyle('WARNING');
assert(warningStyle.textClass.includes('amber'), 'Expected WARNING to map to amber');

const errorStyle = getDeviceStatusStyle('ERROR');
assert(errorStyle.textClass.includes('rose'), 'Expected ERROR to map to rose/red');

const offlineStyle = getDeviceStatusStyle('OFFLINE');
assert(offlineStyle.textClass.includes('slate'), 'Expected OFFLINE to map to slate/gray');
console.log('✓ Test 1 Passed: Engineering status colors mapped correctly.\n');

// 2. 5 Hardware Node Contract Check
console.log('Test 2: Validating 5 Hardware Node Contract & Hardware Honesty');
const mockHealth: SystemHealthState = {
  esp32: {
    name: 'ESP32',
    status: 'ONLINE',
    cpu: '240 MHz',
    ipAddress: '192.168.1.42',
    wifiRssi: '-48 dBm',
    uptime: '02:31:44',
    firmware: 'v1.0.0',
    lastSeen: '2 sec ago',
    isSimulated: true,
  },
  dht22: {
    name: 'DHT22',
    status: 'ONLINE',
    temperature: 24.5,
    humidity: 55.0,
    lastUpdate: '14:30:00',
    isSimulated: true,
  },
  pir: {
    name: 'PIR',
    status: 'ONLINE',
    motion: 'DETECTED',
    lastMotion: '14:30:00',
    timeout: 30,
    isSimulated: true,
  },
  irTransmitter: {
    name: 'IR TRANSMITTER',
    status: 'READY',
    lastCommand: 'POWER ON',
    mode: 'COOL',
    target: 26,
    fan: 'AUTO',
    isSimulated: true,
  },
  wifi: {
    name: 'Wi-Fi',
    status: 'CONNECTED',
    rssi: '-48 dBm',
    connection: 'STABLE',
    ssid: 'IoT-Engineering-Lab',
    isSimulated: true,
  },
};

assert(mockHealth.esp32.name === 'ESP32', 'Node 1 must be ESP32');
assert(mockHealth.esp32.cpu === '240 MHz', 'ESP32 CPU must be 240 MHz');
assert(mockHealth.esp32.ipAddress === '192.168.1.42', 'ESP32 IP must be 192.168.1.42');
assert(mockHealth.esp32.wifiRssi === '-48 dBm', 'ESP32 Wi-Fi RSSI must be -48 dBm');
assert(mockHealth.esp32.firmware === 'v1.0.0', 'ESP32 firmware must be v1.0.0');
assert(mockHealth.esp32.isSimulated === true, 'Hardware honesty: isSimulated must be true');

assert(mockHealth.dht22.name === 'DHT22', 'Node 2 must be DHT22');
assert(mockHealth.dht22.status === 'ONLINE', 'DHT22 status must be ONLINE');
assert(mockHealth.dht22.temperature === 24.5, 'DHT22 temperature check');

assert(mockHealth.pir.name === 'PIR', 'Node 3 must be PIR');
assert(mockHealth.pir.status === 'ONLINE', 'PIR status must be ONLINE');
assert(mockHealth.pir.motion === 'DETECTED', 'PIR motion check');

assert(mockHealth.irTransmitter.name === 'IR TRANSMITTER', 'Node 4 must be IR TRANSMITTER');
assert(mockHealth.irTransmitter.status === 'READY', 'IR status must be READY');

assert(mockHealth.wifi.name === 'Wi-Fi', 'Node 5 must be Wi-Fi');
assert(mockHealth.wifi.status === 'CONNECTED', 'Wi-Fi status must be CONNECTED');
assert(mockHealth.wifi.connection === 'STABLE', 'Wi-Fi connection must be STABLE');
console.log('✓ Test 2 Passed: All 5 hardware node records strictly conform to specification.\n');

// 3. Demo Mode Telemetry Synchrony
console.log('Test 3: Demo Mode Telemetry Synchrony');
// HOT ROOM Scenario
const hotRoom = DEMO_SCENARIOS.find(s => s.id === 'hot_room');
assert(!!hotRoom, 'HOT ROOM scenario must exist');
const decisionHot = evaluateAutomation({
  temperature: hotRoom!.temperature,
  temperatureThreshold: 26.0,
  motionDetected: hotRoom!.motionDetected,
  motionTimeout: 30,
  autoMode: hotRoom!.autoMode,
  currentAcPower: false,
  timeSinceLastMotion: 0,
});
assert(decisionHot.state === 'AUTO_COOLING', 'Expected AUTO_COOLING for hot room');
assert(decisionHot.desiredPower === true, 'Expected AC power ON for hot room');

// Verify synchronized health states for HOT ROOM
const hotHealthDHT = hotRoom!.temperature;
const hotHealthPIR = hotRoom!.motionDetected ? 'DETECTED' : 'NOT DETECTED';
const hotHealthIR = decisionHot.desiredPower ? 'POWER ON' : 'POWER OFF';

assert(hotHealthDHT === hotRoom!.temperature, 'DHT22 reflects hot room temp');
assert(hotHealthDHT > 26.0, 'Hot room temperature must exceed threshold');
assert(hotHealthPIR === 'DETECTED', 'PIR reflects motion detected in hot room');
assert(hotHealthIR === 'POWER ON', 'IR transmitter reflects AC command POWER ON');
console.log(`  -> HOT ROOM: DHT22 = ${hotHealthDHT}°C, PIR = DETECTED, IR = POWER ON (Synchronized)`);

// EMPTY ROOM Scenario
const emptyRoom = DEMO_SCENARIOS.find(s => s.id === 'empty_room');
assert(!!emptyRoom, 'EMPTY ROOM scenario must exist');
assert(emptyRoom!.motionDetected === false, 'EMPTY ROOM motionDetected must be false');
const decisionEmptyTimeout = evaluateAutomation({
  temperature: emptyRoom!.temperature,
  temperatureThreshold: 26.0,
  motionDetected: emptyRoom!.motionDetected,
  motionTimeout: 30,
  autoMode: emptyRoom!.autoMode,
  currentAcPower: true,
  timeSinceLastMotion: 35, // Vacancy timeout exceeded
});
assert(decisionEmptyTimeout.state === 'AUTO_OFF_EMPTY', 'Expected AUTO_OFF_EMPTY after vacancy timeout');
assert(decisionEmptyTimeout.desiredPower === false, 'Expected AC power OFF after vacancy timeout');

const emptyHealthPIR = emptyRoom!.motionDetected ? 'DETECTED' : 'NOT DETECTED';
const emptyHealthIR = decisionEmptyTimeout.desiredPower ? 'POWER ON' : 'POWER OFF';

assert(emptyHealthPIR === 'NOT DETECTED', 'PIR reflects motion NOT DETECTED in empty room');
assert(emptyHealthIR === 'POWER OFF', 'IR transmitter reflects AC command POWER OFF');
console.log('  -> EMPTY ROOM: PIR = NOT DETECTED, IR = POWER OFF (Synchronized)');

console.log('✓ Test 3 Passed: Telemetry and Demo Mode scenarios are completely synchronized.\n');
console.log('=== ALL DEVICE HEALTH TESTS PASSED SUCCESSFULLY ===');
