import { FC } from 'react';
import { NetworkLog } from '../types';
interface RequestDetailViewProps {
    log: NetworkLog;
    onBack: () => void;
}
export declare const RequestDetailView: FC<RequestDetailViewProps>;
export {};
