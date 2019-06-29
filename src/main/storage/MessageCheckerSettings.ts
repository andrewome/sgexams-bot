export class MessageCheckerSettings {
    private reportingChannelId: string | undefined;

    private responseMessage: string | undefined;

    private bannedWords: Set<string>;

    private deleteMessage: boolean;

    public constructor(reportingChannelId?: string,
        responseMessage?: string,
        bannedWords?: string[],
        deleteMessage?: boolean) {
        this.reportingChannelId = reportingChannelId;
        this.responseMessage = responseMessage;

        if (deleteMessage !== undefined) {
            this.deleteMessage = deleteMessage;
        } else {
            this.deleteMessage = false;
        }

        if (bannedWords !== undefined) {
            this.bannedWords = new Set<string>(bannedWords);
        } else {
            this.bannedWords = new Set<string>();
        }
    }

    /**
     * This function adds a word to the banned word list
     *
     * @param  {string} word Word to be added
     * @returns boolean indicating if the add was a success
     */
    public addbannedWord(word: string): boolean {
        if (this.bannedWords.has(word)) {
            return false;
        }
        this.bannedWords.add(word);
        return true;
    }

    /**
     * This function removes a word to the banned word list
     *
     * @param  {string} word Word to be removed
     * @returns boolean indicating if the removal was a success
     */
    public removeBannedWord(word: string): boolean {
        if (!this.bannedWords.has(word)) {
            return false;
        }
        this.bannedWords.delete(word);
        return true;
    }

    /**
     * Tests if messagesettings objects are the same.
     *
     * @param  {MessageCheckerSettings} other
     */
    public equals(other: MessageCheckerSettings): boolean {
        if (this.getBannedWords.toString() !== other.getBannedWords.toString()) return false;

        if (this.getReportingChannelId() !== other.getReportingChannelId()) return false;

        if (this.getResponseMessage() !== other.getResponseMessage()) return false;

        return true;
    }

    /** Getters and Setters */

    public getBannedWords(): string[] {
        return Array.from(this.bannedWords);
    }

    public setReportingChannelId(id: string | undefined): void {
        this.reportingChannelId = id;
    }

    public getReportingChannelId(): string | undefined {
        return this.reportingChannelId;
    }

    public setResponseMessage(responseMessage: string | undefined): void {
        this.responseMessage = responseMessage;
    }

    public getResponseMessage(): string | undefined {
        return this.responseMessage;
    }

    public setDeleteMessage(bool: boolean): void {
        this.deleteMessage = bool;
    }

    public getDeleteMessage(): boolean {
        return this.deleteMessage;
    }

    /**
     * This function converts the MessageSettings object to an
     * object that can be easily converted into a JSON object
     *
     * @param  {MessageCheckerSettings} messageSettings
     * @returns any
     */
    public static convertToJsonFriendly(messageSettings: MessageCheckerSettings): any {
        const out: any = {};

        out.bannedWords = messageSettings.getBannedWords();
        out.deleteMessage = messageSettings.getDeleteMessage();
        const reportingChannelId = messageSettings.getReportingChannelId();
        if (reportingChannelId === undefined) {
            out.reportingChannelId = null;
        } else {
            out.reportingChannelId = reportingChannelId;
        }

        const responseMessage = messageSettings.getResponseMessage();
        if (responseMessage === undefined) {
            out.responseMessage = null;
        } else {
            out.responseMessage = responseMessage;
        }

        return out;
    }

    /**
     * This function converts an object back into a server object
     * Used for deserialising.
     *
     * @param  {any} obj
     * @returns MessageCheckerSettings
     */
    public static convertFromJsonFriendly(obj: any): MessageCheckerSettings {
        // Check attributes
        if (!(obj.hasOwnProperty('bannedWords')
             && obj.hasOwnProperty('responseMessage')
             && obj.hasOwnProperty('reportingChannelId'))) {
            throw new Error('Object is not valid');
        }

        const { bannedWords } = obj;
        let { reportingChannelId } = obj;
        let { responseMessage } = obj;
        const { deleteMessage } = obj;

        if (reportingChannelId === null) reportingChannelId = undefined;

        if (responseMessage === null) responseMessage = undefined;

        return new MessageCheckerSettings(reportingChannelId,
            responseMessage,
            bannedWords,
            deleteMessage);
    }
}
