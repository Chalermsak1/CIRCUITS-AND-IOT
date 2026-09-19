import type { SensorData } from '../types/sensor';

export type DataSourceMode = 'simulation' | 'hardware_standby';

/**
 * Universal Data Source interface for sensor telemetry.
 *
 * Implemented by:
 * - SimulationDataSource: local thermodynamic and occupancy emulation
 * - RealDeviceDataSource: future physical ESP32 gateway endpoint (HTTP / MQTT)
 */
export interface ISensorDataSource {
  /**
   * Retrieves the current snapshot of sensor telemetry.
   */
  getSensorData(): SensorData;

  /**
   * Subscribes to telemetry updates emitted by the data source.
   * @param listener Callback invoked whenever new telemetry is acquired.
   * @returns Cleanup function to unsubscribe.
   */
  subscribe(listener: (data: SensorData) => void): () => void;

  /**
   * Identifies the current operational mode of the data source.
   */
  getMode(): DataSourceMode;
}
