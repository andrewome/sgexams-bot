/** JSON Serialiser class  */
class ServerJson {
    private bannedWords: string[];
    private serverId: string;
    private reportingChannelId: string | null;

    constructor(server: Server) {
        this.bannedWords = server.getBannedWords();
        this.serverId = server.getServerId();
        let reportingChannelId = server.getReportingChannelId();
        if(typeof reportingChannelId === "undefined") {
            this.reportingChannelId = null;
        } else {
            this.reportingChannelId = reportingChannelId;
        }
    }
}

/** This class represents a server object that the bot references from */
export class Server {
    private bannedWords: Set<string>;
    private serverId: string;
    private reportingChannelId: string | undefined;
    
    /** 
     * Constructor for server object
     * 
     * @param  {string[]} bannedWords string array of banned words
     * @param  {string} serverId server id
     * @param  {string} reportingChannelId? reporting channel id (if any)
     */
    constructor(bannedWords: string[], serverId: string, reportingChannelId?: string) {
        this.bannedWords = new Set<string>(bannedWords);
        this.serverId = serverId;
        this.reportingChannelId = reportingChannelId;
    }

    /** Getters and Setters */
    public addbannedWord(word: string): void {
        this.bannedWords.add(word);
    }

    public getBannedWords(): string[] {
        return Array.from(this.bannedWords);
    }

    public setReportingChannelId(id: string): void {
        this.reportingChannelId = id;
    }

    public getReportingChannelId(): string | undefined {
        return this.reportingChannelId;
    }

    public getServerId(): string {
        return this.serverId;
    }

    public removeBannedWord(word: string): void {
        if(!this.bannedWords.has(word)) {
            return;
        }
        this.bannedWords.delete(word);
    }

    /**
     * This function converts the server object to an object
     * that can be easily converted into a JSON object
     * 
     * @param  {Server} server Server object
     * @returns ServerJson 
     */
    static convertToJsonFriendly(server: Server): ServerJson {
        return new ServerJson(server);
    }

    /**
     * This function converts an object back into a server object
     * Used for deserialising.
     * 
     * @param  {any} obj  
     * @returns Server
     */
    static convertFromJsonFriendly(obj: any): Server {
        //Check attributes
        if(!(obj.hasOwnProperty("bannedWords") && 
             obj.hasOwnProperty("serverId") &&
             obj.hasOwnProperty("reportingChannelId"))) {
                throw new Error("Object is not valid");
        }

        let bannedWords = obj["bannedWords"];
        let serverId = obj["serverId"];
        let reportingChannelId = obj["reportingChannelId"];

        return new Server(bannedWords, serverId, reportingChannelId === null ? undefined : reportingChannelId);
    }
}