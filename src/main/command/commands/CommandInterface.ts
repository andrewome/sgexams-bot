import { Server } from "../../storage/Server";
import { Message } from "discord.js";

export interface CommandInterface {
    execute(server: Server, message: Message): void;
}