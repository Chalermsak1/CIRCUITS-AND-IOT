import React from 'react';
import { useSystem } from '../context/SystemContext';
import {
  Wifi,
  Radio,
  Sliders,
  Sparkles,
  CheckCircle2,
  Shield,
  Activity,
  ArrowRightLeft,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
} from 'lucide-react';
import { cn } from '../utils/cn';

export const WifiPage: React.FC = () => {
  const {
    configuredWifiNetworks,
    activeWifiNetwork,
    wifiAutoSwitch,
    setWifiAutoSwitch,
    wifiSwitchThreshold,
    setWifiSwitchThreshold,
    wifiSwitchCooldown,
    setWifiSwitchCooldown,
    activeWifiScenario,
    applyWifiScenario,
    switchWifiNetwork,
  } = useSystem();

  const getSignalIcon = (rssi: number) => {
    if (rssi >= -65) return <SignalHigh className="w-4 h-4 text-emerald-600" />;
    if (rssi >= -75) return <SignalMedium className="w-4 h-4 text-amber-600" />;
    if (rssi >= -85) return <SignalLow className="w-4 h-4 text-orange-600" />;
    return <Signal className="w-4 h-4 text-rose-600" />;
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'EXCELLENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'GOOD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FAIR':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & System Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              <Wifi className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-wide flex items-center gap-2 font-mono">
                WI-FI NETWORK MANAGER
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  802.11 b/g/n
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                ESP32 Wireless Interface, Signal Telemetry & Auto-Failover Controller
              </p>
            </div>
          </div>
        </div>

        {/* Global Connection Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">LINK:</span>
            <span className="text-emerald-700 font-bold">
              {activeWifiNetwork ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Wi-Fi Demo Scenarios Trigger Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              WI-FI DEMO SCENARIO INJECTOR
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Simulate network degradation & auto-failover
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Scenario 1: Stable */}
          <button
            onClick={() => applyWifiScenario('WIFI_STABLE')}
            className={cn(
              'p-3 rounded-lg border text-left font-mono transition-all',
              activeWifiScenario === 'WIFI_STABLE'
                ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-xs ring-1 ring-emerald-400/40'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-emerald-700">[WI-FI: STABLE]</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-emerald-800">
                -62 dBm
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Optimal Home_WiFi connection with strong signal & zero packet loss
            </p>
          </button>

          {/* Scenario 2: Degraded */}
          <button
            onClick={() => applyWifiScenario('WIFI_DEGRADED')}
            className={cn(
              'p-3 rounded-lg border text-left font-mono transition-all',
              activeWifiScenario === 'WIFI_DEGRADED'
                ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-xs ring-1 ring-amber-400/40'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-amber-700">[WI-FI: DEGRADED]</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200 text-amber-800">
                -79 dBm
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Home_WiFi drops below -75 dBm threshold. Countdown starts.
            </p>
          </button>

          {/* Scenario 3: Failover */}
          <button
            onClick={() => applyWifiScenario('WIFI_FAILOVER')}
            className={cn(
              'p-3 rounded-lg border text-left font-mono transition-all',
              activeWifiScenario === 'WIFI_FAILOVER'
                ? 'bg-blue-50 border-blue-300 text-slate-900 shadow-xs ring-1 ring-blue-400/40'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white'
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-blue-700">[WI-FI: FAILOVER]</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 border border-blue-200 text-blue-800">
                Lab_WiFi (-68 dBm)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Autonomous handover to Priority 2 network with event logged
            </p>
          </button>
        </div>
      </div>

      {/* 3. Active Network Card & Auto-Switch Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Network Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
                CURRENT ACTIVE CONNECTION
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              CONNECTED
            </span>
          </div>

          {activeWifiNetwork ? (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xl font-bold font-mono text-slate-900 flex items-center gap-2">
                    {activeWifiNetwork.ssid}
                    {getSignalIcon(activeWifiNetwork.rssi)}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    MAC / BSSID: {activeWifiNetwork.bssid}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={cn(
                      'text-xs font-mono font-bold px-2 py-0.5 rounded border inline-block',
                      getQualityBadge(activeWifiNetwork.signalQuality)
                    )}
                  >
                    {activeWifiNetwork.signalQuality} ({activeWifiNetwork.rssi} dBm)
                  </span>
                </div>
              </div>

              {/* RSSI Signal Bar Visualization */}
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>RSSI SIGNAL POWER</span>
                  <span className="text-slate-800 font-bold">{activeWifiNetwork.rssi} dBm</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      activeWifiNetwork.rssi >= -65
                        ? 'bg-emerald-500'
                        : activeWifiNetwork.rssi >= -75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    )}
                    style={{
                      width: `${Math.max(10, Math.min(100, (activeWifiNetwork.rssi + 100) * 2))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Network Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 font-mono text-xs">
                <div className="bg-slate-50 rounded p-2.5 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">CHANNEL</span>
                  <span className="text-slate-800 font-semibold">{activeWifiNetwork.channel} (2.4 GHz)</span>
                </div>
                <div className="bg-slate-50 rounded p-2.5 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">IP ADDRESS</span>
                  <span className="text-blue-600 font-semibold">{activeWifiNetwork.ipAddress}</span>
                </div>
                <div className="bg-slate-50 rounded p-2.5 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">GATEWAY</span>
                  <span className="text-slate-800 font-semibold">{activeWifiNetwork.gateway}</span>
                </div>
                <div className="bg-slate-50 rounded p-2.5 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">SECURITY</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {activeWifiNetwork.security}
                  </span>
                </div>
                <div className="bg-slate-50 rounded p-2.5 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">PRIORITY</span>
                  <span className="text-amber-700 font-semibold">Rank #{activeWifiNetwork.priority}</span>
                </div>
                <div className="bg-slate-50 rounded p-2.5 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">PACKET LOSS</span>
                  <span className="text-emerald-700 font-semibold">0.0% (Sim)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono">
              No active Wi-Fi connection.
            </div>
          )}
        </div>

        {/* Auto-Switch Configuration Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
                  AUTO-FAILOVER CONTROLLER
                </h3>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => setWifiAutoSwitch(!wifiAutoSwitch)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-full font-mono font-bold border transition-colors flex items-center gap-1.5',
                  wifiAutoSwitch
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                )}
              >
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    wifiAutoSwitch ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  )}
                />
                {wifiAutoSwitch ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Threshold Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600">Failover Signal Threshold:</span>
                  <span className="text-amber-600 font-bold">{wifiSwitchThreshold} dBm</span>
                </div>
                <input
                  type="range"
                  min="-85"
                  max="-60"
                  step="1"
                  value={wifiSwitchThreshold}
                  onChange={e => setWifiSwitchThreshold(Number(e.target.value))}
                  disabled={!wifiAutoSwitch}
                  className="w-full accent-amber-500 cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>-85 dBm (Weak)</span>
                  <span>-60 dBm (Strict)</span>
                </div>
              </div>

              {/* Cooldown Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600">Handover Cooldown:</span>
                  <span className="text-blue-600 font-bold">{wifiSwitchCooldown} seconds</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={wifiSwitchCooldown}
                  onChange={e => setWifiSwitchCooldown(Number(e.target.value))}
                  disabled={!wifiAutoSwitch}
                  className="w-full accent-blue-600 cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>10s (Fast)</span>
                  <span>60s (Cautious)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-blue-50/50 p-3 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
            <ArrowRightLeft className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              When active network RSSI drops below <span className="text-amber-700 font-mono font-semibold">{wifiSwitchThreshold} dBm</span> for longer than <span className="text-blue-700 font-mono font-semibold">{wifiSwitchCooldown}s</span>, the ESP32 automatically performs an asynchronous channel scan and roams to the highest-priority reachable AP.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Configured Networks Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              CONFIGURED ROAMING AP PROFILES
            </h3>
            <p className="text-xs text-slate-500">
              Stored ESP32 NVS Network Profiles ordered by failover priority
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Total Configured: {configuredWifiNetworks.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                <th className="py-2.5 px-3">PRIORITY</th>
                <th className="py-2.5 px-3">SSID</th>
                <th className="py-2.5 px-3">SIGNAL</th>
                <th className="py-2.5 px-3">SECURITY</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {configuredWifiNetworks.map(net => {
                const isActive = net.status === 'ACTIVE';
                return (
                  <tr key={net.ssid} className={cn('hover:bg-slate-50 transition-colors', isActive && 'bg-blue-50/40')}>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                        #{net.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {net.ssid}
                        {isActive && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{net.bssid}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {getSignalIcon(net.rssi)}
                        <span className="font-semibold text-slate-800">{net.rssi} dBm</span>
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded border',
                            getQualityBadge(net.signalQuality)
                          )}
                        >
                          {net.signalQuality}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {net.security}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1',
                          net.status === 'ACTIVE' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          net.status === 'AVAILABLE' && 'bg-blue-50 text-blue-700 border-blue-200',
                          net.status === 'WEAK' && 'bg-amber-50 text-amber-700 border-amber-200',
                          net.status === 'CONNECTING' && 'bg-purple-50 text-purple-700 border-purple-200'
                        )}
                      >
                        {net.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                        {net.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isActive ? (
                        <span className="text-slate-400 text-[11px] italic">In Use</span>
                      ) : (
                        <button
                          onClick={() => switchWifiNetwork(net.ssid)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-200 text-[11px] font-bold shadow-2xs transition-all"
                        >
                          Connect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

