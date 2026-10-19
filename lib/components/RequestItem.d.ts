import { FC } from 'react';
import { NetworkLog } from '../types';
interface RequestItemProps {
    log: NetworkLog;
    onPress: (log: NetworkLog) => void;
}
export declare const RequestItem: FC<RequestItemProps>;
export {};
