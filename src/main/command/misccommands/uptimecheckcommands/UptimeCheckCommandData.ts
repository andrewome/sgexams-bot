import { CommandArgs } from '../../classes/CommandArgs';

export class UptimeCheckCommandData implements CommandArgs {
    public uptime: number;

    public constructor(uptime: number) {
        this.uptime = uptime;
    }
}