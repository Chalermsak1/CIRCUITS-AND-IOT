export type ACMode = 'cool' | 'dry' | 'fan' | 'auto';
export type FanSpeed = 'auto' | 'low' | 'medium' | 'high';

export interface ACState {
  acPower: boolean;
  acMode: ACMode;
  fanSpeed: FanSpeed;
  targetTemperature: number;
  autoMode: boolean;
}
