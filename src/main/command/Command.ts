import { Server } from "../storage/Server";
import { Permissions, GuildMember, Message } from "discord.js";
import { CommandResult } from "./CommandResult";

/** Base class of the Commands */
export abstract class Command {
    public NO_ARGUMENTS: string = "Oops! I received no arguments. Please try again.";
    public EMBED_COLOUR: string = "#125bd1";
    public NO_PERMISSIONS_COMMANDRESULT: CommandResult = new CommandResult(false, false);

    /**
     * Each command class must implement an execute method.
     * 
     * @param  {Server} server Server storage class
     * @param  {Message} message Discord Message from message event
     * @returns CommandResult
     */
    public abstract execute(server: Server,  message: Message): CommandResult;
    
    /**
     * This function checks if a given guildmember has the permissions required
     * 
     * @param  {Permissions} commandPermissions Permissions of the command
     * @param  {GuildMember} member GuildMember in question
     * @returns boolean
     */
    public hasPermissions(commandPermissions: Permissions, member: GuildMember): boolean {
        let commandPermissionsArr = commandPermissions.toArray();
        
        //Check if user permissions exist inside command permissions
        for(let permission of commandPermissionsArr) {
            if(!member.hasPermission(permission)) {
                return false;
            }
        }
        return true;
    }
}