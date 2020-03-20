export class MessageCheckerSettings {
    private reportingChannelId: string | null;

    private responseMessage: string | null;

    private bannedWords: Set<string>;

    private deleteMessage: boolean;

    public constructor(reportingChannelId: string | null,
                       responseMessage: string | null,
                       bannedWords: string[] | null,
                       deleteMessage: boolean | null) {
        this.reportingChannelId = reportingChannelId;
        this.responseMessage = responseMessage;

        if (deleteMessage !== null) {
            this.deleteMessage = deleteMessage;
        } else {
            this.deleteMessage = false;
        }

        if (bannedWords !== null) {
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

    public setReportingChannelId(id: string | null): void {
        this.reportingChannelId = id;
    }

    public getReportingChannelId(): string | null {
        return this.reportingChannelId;
    }

    public setResponseMessage(responseMessage: string | null): void {
        this.responseMessage = responseMessage;
    }

    public getResponseMessage(): string | null {
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
    /* eslint-disable @typescript-eslint/no-explicit-any */
    public static convertToJsonFriendly(messageSettings: MessageCheckerSettings): any {
        const out: any = {};

        out.bannedWords = messageSettings.getBannedWords();
        out.deleteMessage = messageSettings.getDeleteMessage();
        out.reportingChannelId = messageSettings.getReportingChannelId();
        out.responseMessage = messageSettings.getResponseMessage();

        return out;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    /**
     * This function converts an object back into a server object
     * Used for deserialising.
     *
     * @param  {any} obj
     * @returns MessageCheckerSettings
     */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    public static convertFromJsonFriendly(obj: any): MessageCheckerSettings {
        // Check attributes
        if (!(obj.hasOwnProperty('bannedWords')
             && obj.hasOwnProperty('responseMessage')
             && obj.hasOwnProperty('reportingChannelId'))) {
            throw new Error('Object is not valid');
        }

        const {
            bannedWords, reportingChannelId,
            responseMessage, deleteMessage,
        } = obj;

        return new MessageCheckerSettings(
            reportingChannelId, responseMessage,
            bannedWords, deleteMessage,
        );
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
}
