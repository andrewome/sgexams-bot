import { ModActions } from './ModActions';

export interface ModerationTimeout {
    serverId: string;

    userId: string;

    type: ModActions;

    startTime: number;

    endTime: number;

    timerId: number;
}
