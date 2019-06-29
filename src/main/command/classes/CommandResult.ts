export class CommandResult {
    public shouldSaveServers: boolean;

    public shouldCheckMessage: boolean;

    public constructor(shouldSaveServers: boolean, shouldCheckMessage: boolean) {
        this.shouldSaveServers = shouldSaveServers;
        this.shouldCheckMessage = shouldCheckMessage;
    }
}
