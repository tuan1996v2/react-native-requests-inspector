import { FilterType, NetworkLog, RequestDetails, ResponseDetails } from './types';
interface NetworkState {
    logs: NetworkLog[];
    isEnabled: boolean;
    isPaused: boolean;
    isModalVisible: boolean;
    selectedLogId: string | null;
    filter: FilterType;
    searchQuery: string;
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
    togglePause: () => void;
}
export declare const useNetworkStore: import("zustand").UseBoundStore<import("zustand").StoreApi<NetworkState>>;
export {};
