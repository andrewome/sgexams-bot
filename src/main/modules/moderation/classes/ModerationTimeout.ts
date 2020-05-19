import { ModActions } from './ModActions';

export interface ModerationTimeout {
    serverId: string;

    userId: string;

    type: ModActions;

    endTime: number;

    timerId: number;
}
