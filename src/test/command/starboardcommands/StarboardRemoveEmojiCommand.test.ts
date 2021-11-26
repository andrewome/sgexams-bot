/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import {
    MessageEmbed, Permissions, Collection, Emoji,
} from 'discord.js';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings, SimplifiedEmoji } from '../../../main/storage/StarboardSettings';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { StarboardRemoveEmojiCommand } from '../../../main/command/starboardcommands/StarboardRemoveEmojiCommand';

should();

let server: Server;
let command: StarboardRemoveEmojiCommand;
const emojis = new Collection<string, Emoji>();

/* BROKEN DUE TO UPDATE TO MANAGERS IN DISCORD.JS v12
// Setting up mock emojis.
const emoji_ = new Emoji(
    new Guild(new Client(), { emojis: [] }),
    {},
);
emoji_.name = 'test';
emoji_.id = 'test';
emojis.set(emoji_.id, emoji_);
*/

const adminPerms = new Permissions(['ADMINISTRATOR']);
const { EMBED_DEFAULT_COLOUR } = Command;
const { EMBED_ERROR_COLOUR } = Command;
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { MAYBE_EMOJI_NOT_INSIDE } = StarboardRemoveEmojiCommand;
const { EMBED_TITLE } = StarboardRemoveEmojiCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
    );
});

describe('StarboardAddEmojiCommand test suite', (): void => {
    it('No permission check', async (): Promise<void> => {
        command = new StarboardRemoveEmojiCommand([]);
        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.should.equals(Command.EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(Command.ERROR_EMBED_TITLE);
            field.value.should.equals(Command.NO_PERMISSIONS_MSG);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: new Permissions([]),
            messageReply: checkEmbed,
        };
        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
/* BROKEN DUE TO UPDATE TO MANAGERS IN DISCORD.JS v12
    it('No arguments', (): void => {
        command = new StarboardRemoveEmojiCommand([]);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(ERROR_EMBED_TITLE);
            field.value.should.equals(NO_ARGUMENTS);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.emojis = emojis;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;

        // Check server
        (server.starboardSettings.getChannel() === null).should.be.true;
    });
    it('Removing valid emoji', (): void => {
        const emoji = new SimplifiedEmoji('test', 'test');
        const msg = `✅Removed Emoji: <:${emoji.name}:${emoji.id}>`;
        server.starboardSettings.addEmoji(emoji);
        command = new StarboardRemoveEmojiCommand(['test']);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.emojis = emojis;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.false;

        // Check server
        const serverEmojis = server.starboardSettings.getEmoji();
        serverEmojis.length.should.equals(0);
    });
    it('Remove non existent emoji', (): void => {
        command = new StarboardRemoveEmojiCommand(['test']);

        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(MAYBE_EMOJI_NOT_INSIDE);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.emojis = emojis;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
*/
});
