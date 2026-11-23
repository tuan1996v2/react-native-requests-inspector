import React, { FC, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { FloatingButton } from './components/FloatingButton';
import { RequestsInspectorModal } from './components/RequestsInspectorModal';
import {
  disableGlobalNetworkLogging,
  enableGlobalNetworkLogging,
  isGlobalNetworkLoggingEnabled,
} from './interceptor';
import { useNetworkStore } from './networkStore';
import { RequestsInspectorConfig, RequestsInspectorProps } from './types';

export const RequestsInspector: FC<RequestsInspectorProps> = ({
  children,
  enabled = true,
  showFloatingButton = true,
  interceptGlobalNetwork = false,
  redactKeys,
  responseFormatter,
  ignoreUrls,
  maxLogs,
}) => {
  useEffect(() => {
    useNetworkStore.getState().setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    useNetworkStore.getState().setShowFloatingButton(showFloatingButton);
  }, [showFloatingButton]);

  // The store compares by content, so inline arrays (`redactKeys={['password']}`) cause no churn
  useEffect(() => {
    useNetworkStore.getState().setConfig({ redactKeys, responseFormatter, ignoreUrls, maxLogs });
  }, [redactKeys, responseFormatter, ignoreUrls, maxLogs]);

  useEffect(() => {
    if (!enabled || !interceptGlobalNetwork) {
      return undefined;
    }
    // Don't tear down a global logger the app enabled itself (e.g. in index.js)
    const ownedByApp = isGlobalNetworkLoggingEnabled();
    enableGlobalNetworkLogging();
    return () => {
      if (!ownedByApp) {
        disableGlobalNetworkLogging();
      }
    };
  }, [enabled, interceptGlobalNetwork]);

  // {children} keeps the same position in the tree whatever `enabled` is, so toggling it
  // never remounts the app; the overlay is mounted as a sibling only when enabled.
  return (
    <View style={styles.container}>
      {children}
      {enabled ? (
        <>
          {showFloatingButton ? <FloatingButton /> : null}
          <RequestsInspectorModal />
        </>
      ) : null}
    </View>
  );
};

export const showInspector = (): void => {
  useNetworkStore.getState().setModalVisible(true);
};

export const hideInspector = (): void => {
  useNetworkStore.getState().setSelectedLogId(null);
  useNetworkStore.getState().setModalVisible(false);
};

export const clearLogs = (): void => {
  useNetworkStore.getState().clearLogs();
};

/** Imperative config (partial merge), e.g. before <RequestsInspector> mounts. */
export const configureRequestsInspector = (config: RequestsInspectorConfig): void => {
  useNetworkStore.getState().setConfig(config);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { copyToClipboard, extractAuthToken } from './clipboardHelper';
export { generateCurlCommand } from './curlHelper';
export type {
  AxiosLikeError,
  AxiosLikeInstance,
  AxiosLikeRequestConfig,
  AxiosLikeResponse,
} from './interceptor';
export {
  attachRequestsInspector,
  disableGlobalNetworkLogging,
  enableGlobalNetworkLogging,
  isGlobalNetworkLoggingEnabled,
  requestsInspectorAxiosInterceptor,
  requestsInspectorFetch,
} from './interceptor';
export { useNetworkStore } from './networkStore';
export * from './types';
export { useSafeDeviceInsets } from './utils/safeArea';
