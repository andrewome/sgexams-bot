export class CommandResult {
    public shouldSaveServers: boolean;
    public shouldCheckMessage: boolean;

    constructor(shouldSaveServers: boolean, shouldCheckMessage: boolean) {
        this.shouldSaveServers = shouldSaveServers;
        this.shouldCheckMessage = shouldCheckMessage
    }
}