"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNetworkStore = void 0;
const zustand_1 = require("zustand");
const DEFAULT_MAX_LOGS = 50;
const MAX_LOGS_LIMIT = 1000;
const clampMaxLogs = (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return DEFAULT_MAX_LOGS;
    }
    return Math.min(Math.max(Math.floor(value), 1), MAX_LOGS_LIMIT);
};
const normalizeRedactKeys = (keys) => Array.isArray(keys)
    ? keys
        .filter((k) => typeof k === 'string')
        .map(k => k.trim().toLowerCase())
        .filter(Boolean)
    : [];
const signature = (items) => items.map(String).join('\u0001');
const createNetworkStore = () => (0, zustand_1.create)((set, get) => ({
    logs: [],
    isEnabled: true,
    showFloatingButton: true,
    isPaused: false,
    isModalVisible: false,
    selectedLogId: null,
    filter: 'ALL',
    searchQuery: '',
    redactKeys: [],
    responseFormatter: undefined,
    ignoreUrls: [],
    maxLogs: DEFAULT_MAX_LOGS,
    addRequest: req => {
        const state = get();
        if (!state.isEnabled || state.isPaused) {
            return '';
        }
        const id = req.id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const sentTime = req.sentTime ?? Date.now();
        const newLog = {
            ...req,
            id,
            sentTime,
            status: 'pending',
        };
        set(current => {
            const updatedLogs = [newLog, ...current.logs];
            return {
                logs: updatedLogs.length > current.maxLogs
                    ? updatedLogs.slice(0, current.maxLogs)
                    : updatedLogs,
            };
        });
        return id;
    },
    updateResponse: (id, res) => {
        if (!id || !get().isEnabled) {
            return;
        }
        set(state => {
            const index = state.logs.findIndex(log => log.id === id);
            if (index === -1) {
                return state;
            }
            const isError = Boolean(res.error) || res.statusCode >= 400 || res.statusCode === 0;
            const logs = state.logs.slice();
            logs[index] = {
                ...logs[index],
                response: res,
                status: isError ? 'error' : 'success',
            };
            return { logs };
        });
    },
    clearLogs: () => set({ logs: [], selectedLogId: null }),
    setModalVisible: visible => set({ isModalVisible: visible }),
    setSelectedLogId: id => set({ selectedLogId: id }),
    setFilter: filter => set({ filter }),
    setSearchQuery: query => set({ searchQuery: query }),
    setEnabled: enabled => set({ isEnabled: enabled }),
    setShowFloatingButton: visible => set({ showFloatingButton: visible }),
    setConfig: config => set(state => {
        const next = {};
        if ('redactKeys' in config) {
            const keys = normalizeRedactKeys(config.redactKeys);
            if (signature(keys) !== signature(state.redactKeys)) {
                next.redactKeys = keys;
            }
        }
        if ('responseFormatter' in config && config.responseFormatter !== state.responseFormatter) {
            next.responseFormatter = config.responseFormatter;
        }
        if ('ignoreUrls' in config) {
            const patterns = Array.isArray(config.ignoreUrls) ? config.ignoreUrls : [];
            if (signature(patterns) !== signature(state.ignoreUrls)) {
                next.ignoreUrls = patterns;
            }
        }
        if ('maxLogs' in config) {
            const maxLogs = clampMaxLogs(config.maxLogs);
            if (maxLogs !== state.maxLogs) {
                next.maxLogs = maxLogs;
                if (state.logs.length > maxLogs) {
                    next.logs = state.logs.slice(0, maxLogs);
                }
            }
        }
        return Object.keys(next).length > 0 ? next : state;
    }),
    togglePause: () => set(state => ({ isPaused: !state.isPaused })),
}));
// Singleton across duplicated package copies (monorepos) and module re-evaluation (Fast Refresh),
// so global interceptors and the UI always share the same store.
const STORE_KEY = Symbol.for('react-native-requests-inspector.store.v2');
const storeHost = globalThis;
exports.useNetworkStore = storeHost[STORE_KEY] ?? (storeHost[STORE_KEY] = createNetworkStore());
