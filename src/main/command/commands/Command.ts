import { Server } from "../../storage/Server";
import { CommandInterface } from "./CommandInterface";
import { Permissions, GuildMember, Message } from "discord.js";

/** Base class of the Commands */
export class Command implements CommandInterface {
    public execute(server: Server,  message: Message): void {
        throw new Error("This method is not meant to be called");
    }
    
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