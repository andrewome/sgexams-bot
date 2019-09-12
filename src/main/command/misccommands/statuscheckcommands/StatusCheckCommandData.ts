import { CommandArgs } from '../../classes/CommandArgs';

export class StatusCheckCommandData implements CommandArgs {
    public uptime: number;

    public constructor(uptime: number) {
        this.uptime = uptime;
    }
}