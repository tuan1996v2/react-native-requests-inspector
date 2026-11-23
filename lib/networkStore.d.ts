import { FilterType, NetworkLog, RequestDetails, RequestsInspectorConfig, ResponseDetails, ResponseFormatter } from './types';
interface NetworkState {
    logs: NetworkLog[];
    isEnabled: boolean;
    showFloatingButton: boolean;
    isPaused: boolean;
    isModalVisible: boolean;
    selectedLogId: string | null;
    filter: FilterType;
    searchQuery: string;
    redactKeys: string[];
    responseFormatter?: ResponseFormatter;
    ignoreUrls: (string | RegExp)[];
    maxLogs: number;
    addRequest: (req: Omit<RequestDetails, 'id' | 'sentTime'> & {
        id?: string;
        sentTime?: number;
    }) => string;
    updateResponse: (id: string, res: ResponseDetails) => void;
    clearLogs: () => void;
    setModalVisible: (visible: boolean) => void;
    setSelectedLogId: (id: string | null) => void;
    setFilter: (filter: FilterType) => void;
    setSearchQuery: (query: string) => void;
    setEnabled: (enabled: boolean) => void;
    setShowFloatingButton: (visible: boolean) => void;
    /** Partial merge: only keys present in `config` are updated. */
    setConfig: (config: RequestsInspectorConfig) => void;
    togglePause: () => void;
}
declare const createNetworkStore: () => import("zustand").UseBoundStore<import("zustand").StoreApi<NetworkState>>;
type NetworkStore = ReturnType<typeof createNetworkStore>;
export declare const useNetworkStore: NetworkStore;
export {};
