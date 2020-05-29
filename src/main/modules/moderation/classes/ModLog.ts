import { ModActions } from './ModActions';

export interface ModLog {
  serverId: string;
  caseId: number;
  modId: string;
  userId: string;
  type: ModActions;
  reason: string | null;
  timeout: number | null;
  timestamp: number;
}
