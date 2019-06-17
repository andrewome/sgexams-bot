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

    /**
     * This function adds a word to the banned word list
     * 
     * @param  {string} word Word to be added
     * @returns boolean indicating if the add was a success
     */
    public addbannedWord(word: string): boolean {
        if(this.bannedWords.has(word)) {
            return false;
        } else {
            this.bannedWords.add(word);
            return true;
        }
    }

    /**
     * This function removes a word to the banned word list
     * 
     * @param  {string} word Word to be removed
     * @returns boolean indicating if the removal was a success
     */
    public removeBannedWord(word: string): boolean {
        if(!this.bannedWords.has(word)) {
            return false;
        } else {
            this.bannedWords.delete(word);
            return true;
        }
    }

    /** Getters and Setters */
    
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
    /**
     * Tests if server objects are the same.
     * 
     * @param  {Server} other
     */
    public equals(other: Server): boolean {
        if(this.getBannedWords.toString() !== other.getBannedWords.toString())
            return false;
        
        if(this.getReportingChannelId() !== other.getReportingChannelId())
            return false;
        
        if(this.getServerId() !== other.getServerId())
            return false;

        return true;
    }
}