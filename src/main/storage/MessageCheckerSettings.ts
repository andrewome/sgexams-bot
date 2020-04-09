import { DatabaseConnection } from '../DatabaseConnection';

export interface MessageCheckerSettingsObj {
    bannedWords: string[];
    deleteMessage: boolean;
    reportingChannelId: string | null;
    responseMessage: string | null;
}

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
     * Adds a list of words to the banned words list
     *
     * @param  {string[]} words List of words to be added
     * @returns object comprising 2 lists, one of words added and one of words not added
     */
    public addBannedWords(serverId: string, words: string[]): {
        wordsAdded: string[];
        wordsNotAdded: string[];
    } {
        const wordsAdded = [];
        const wordsNotAdded = [];
        for (const word of words) {
            if (this.bannedWords.has(word)) {
                wordsNotAdded.push(word);
            } else {
                this.bannedWords.add(word);
                wordsAdded.push(word);
            }
        }
        this.insertBannedWordsToDb(serverId, wordsAdded);
        return { wordsAdded, wordsNotAdded };
    }

    /**
     * Removes a list of words from the banned words list
     *
     * @param  {string[]} words List of words to be removed
     * @returns object comprising 2 lists, one of words removed and one of words not removed
     */
    public removeBannedWords(serverId: string, words: string[]): {
        wordsRemoved: string[];
        wordsNotRemoved: string[];
    } {
        const wordsRemoved = [];
        const wordsNotRemoved = [];
        for (const word of words) {
            if (this.bannedWords.has(word)) {
                this.bannedWords.delete(word);
                wordsRemoved.push(word);
            } else {
                wordsNotRemoved.push(word);
            }
        }
        this.deleteBannedWordsFromDb(serverId, wordsRemoved);
        return { wordsRemoved, wordsNotRemoved };
    }

    private insertBannedWordsToDb(serverId: string, bannedWords: string[]): void {
        const db = DatabaseConnection.connect();
        const insert = db.prepare(
            'INSERT INTO messageCheckerBannedWords (serverId, word) VALUES (?, ?)',
        );
        for (const word of bannedWords)
            insert.run(serverId, word);
        db.close();
    }

    private deleteBannedWordsFromDb(serverId: string, bannedWords: string[]): void {
        const db = DatabaseConnection.connect();
        const del = db.prepare(
            'DELETE FROM messageCheckerBannedWords WHERE serverId = (?) AND word = (?)',
        );
        for (const word of bannedWords)
            del.run(serverId, word);
        db.close();
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

    public setReportingChannelId(
        { serverId, id }: { serverId: string; id: string | null },
    ): void {
        this.reportingChannelId = id;
        MessageCheckerSettings.updateReportingChannelIdInDb({ serverId, id });
    }

    private static updateReportingChannelIdInDb(
        { serverId, id }: { serverId: string; id: string | null },
    ): void {
        const db = DatabaseConnection.connect();
        const update = db.prepare(
            'UPDATE messageCheckerSettings SET reportingChannelId = (?) WHERE serverId = (?)',
        );
        update.run(id, serverId);
        db.close();
    }

    public getReportingChannelId(): string | null {
        return this.reportingChannelId;
    }

    public setResponseMessage(
        { serverId, responseMessage }:
        { serverId: string; responseMessage: string | null },
    ): void {
        this.responseMessage = responseMessage;
        MessageCheckerSettings.updateResponseMessageInDb({
            serverId,
            responseMessage,
        });
    }

    private static updateResponseMessageInDb(
        { serverId, responseMessage }:
        { serverId: string; responseMessage: string | null },
    ): void {
        const db = DatabaseConnection.connect();
        const update = db.prepare(
            'UPDATE messageCheckerSettings SET responseMessage = (?) WHERE serverId = (?)',
        );
        update.run(responseMessage, serverId);
        db.close();
    }

    public getResponseMessage(): string | null {
        return this.responseMessage;
    }

    public setDeleteMessage(
        { serverId, bool }: { serverId: string; bool: boolean },
    ): void {
        this.deleteMessage = bool;
        MessageCheckerSettings.updateDeleteMessageInDb({ serverId, bool });
    }

    private static updateDeleteMessageInDb(
        { serverId, bool }: { serverId: string; bool: boolean },
    ): void {
        const db = DatabaseConnection.connect();
        const update = db.prepare(
            'UPDATE messageCheckerSettings SET deleteMessage = (?) WHERE serverId = (?)',
        );
        update.run(bool ? 1 : 0, serverId);
        db.close();
    }

    public getDeleteMessage(): boolean {
        return this.deleteMessage;
    }

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
