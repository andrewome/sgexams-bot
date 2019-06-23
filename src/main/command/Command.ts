import { Server } from "../storage/Server";
import { Permissions, Message, RichEmbed } from "discord.js";
import { CommandResult } from "./classes/CommandResult";

/** Base class of the Commands */
export abstract class Command {
    static NO_ARGUMENTS = "Oops! I received no arguments. Please try again.";
    static EMBED_DEFAULT_COLOUR = "125bd1";
    static EMBED_ERROR_COLOUR = "ff0000";
    static ERROR_EMBED_TITLE = "❌ Error";
    static THIS_METHOD_SHOULD_NOT_BE_CALLED = "This Method should not be called.";

    public NO_PERMISSIONS_COMMANDRESULT = new CommandResult(false, true);

    /**
     * Each command class must implement an execute method.
     * 
     * @param  {Server} server Server storage class
     * @param  {Message} message Discord Message from message event
     * @returns CommandResult
     */
    public abstract execute(server: Server,  message: Message): CommandResult;

    /**
     * Generates the embed to be sent back to the user
     * Made this a thing just for unit testing because
     * of the difficulty of mocking the Discord library
     * classes.
     * 
     * @param  {any} ...args
     * @returns RichEmbed
     */
    public abstract generateEmbed(...args: any): RichEmbed;
    
    /**
     * Sets server settings (if any) during a command
     * Same as generateEmbed, made it a thing because
     * unit testing.
     * 
     * @param  {Server} server
     * @param  {any} ...args
     * @returns void
     */
    public abstract changeServerSettings(server: Server, ...args: any): void;

    /**
     * This function checks if a given guildmember has the permissions required
     * 
     * @param  {Permissions} commandPermissions Permissions of the command
     * @param  {Permissions} userPermissions Permissions of the user
     * @returns boolean
     */
    public hasPermissions(commandPermissions: Permissions, userPermissions: Permissions): boolean {
        //Check if user permissions exist inside command permissions
        if(!userPermissions.has(commandPermissions)) {
                return false;
        }
        return true;
    }
}