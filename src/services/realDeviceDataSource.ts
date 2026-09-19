import type { SensorData } from '../types/sensor';
import type { ISensorDataSource, DataSourceMode } from './dataSource';

/**
 * RealDeviceDataSource
 *
 * Clean architectural boundary for future real ESP32 integration.
 * In production hardware deployment, this class will ingest live telemetry
 * from an ESP32 microcontroller via HTTP REST (`GET /api/sensors`)
 * or MQTT topic (`iot/esp32/telemetry`).
 *
 * Hardware Honesty Guarantee:
 * - Standby mode: No fake network requests are dispatched.
 * - Does not claim physical hardware is connected when unconfigured.
 */
export class RealDeviceDataSource implements ISensorDataSource {
  private endpointUrl?: string;

  constructor(endpointUrl?: string) {
    this.endpointUrl = endpointUrl;
  }

  getMode(): DataSourceMode {
    return 'hardware_standby';
  }

  getSensorData(): SensorData {
    throw new Error(
      `[RealDeviceDataSource] Physical ESP32 hardware connection standby. Endpoint (${this.endpointUrl || 'unconfigured'}) is not online.`
    );
  }

  subscribe(_listener: (data: SensorData) => void): () => void {
    console.info(
      `[RealDeviceDataSource] Hardware telemetry subscriber registered in STANDBY mode. Awaiting physical ESP32 gateway: ${this.endpointUrl || 'localhost'}`
    );

    // Future implementation:
    // const socket = new WebSocket(this.endpointUrl || 'ws://192.168.1.42:81');
    // socket.onmessage = (event) => listener(JSON.parse(event.data));
    // return () => socket.close();

    // Void noop cleanup in standby
    return () => {};
  }
}
