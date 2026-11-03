import { useCallback, useEffect, useState } from "react";
import { getDesktopUpdaterBridge } from "../desktopUpdaterBridge";

const defaultState = {
  phase: "idle",
  currentVersion: null,
  availableVersion: null,
  percent: 0,
  message: null,
};

export function useDesktopUpdater() {
  const bridge = getDesktopUpdaterBridge();
  const enabled = Boolean(bridge);
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    if (!bridge) return undefined;

    let unsub = () => {};
    bridge.getState().then((s) => {
      if (s) setState((prev) => ({ ...prev, ...s }));
    });

    unsub = bridge.onStateChange((next) => {
      setState((prev) => ({ ...prev, ...next }));
    });

    return unsub;
  }, [bridge]);

  const checkForUpdates = useCallback(async () => {
    if (!bridge) return null;
    const next = await bridge.checkForUpdates();
    if (next) setState((prev) => ({ ...prev, ...next }));
    return next;
  }, [bridge]);

  const downloadUpdate = useCallback(async () => {
    if (!bridge) return null;
    const next = await bridge.downloadUpdate();
    if (next) setState((prev) => ({ ...prev, ...next }));
    return next;
  }, [bridge]);

  return {
    enabled,
    state,
    checkForUpdates,
    downloadUpdate,
  };
}
