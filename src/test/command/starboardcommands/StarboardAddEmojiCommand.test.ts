/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import {
    MessageEmbed, Permissions, Collection, Emoji, MessageOptions,
} from 'discord.js';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings, SimplifiedEmoji } from '../../../main/storage/StarboardSettings';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { StarboardAddEmojiCommand } from '../../../main/command/starboardcommands/StarboardAddEmojiCommand';

should();

let server: Server;
let command: StarboardAddEmojiCommand;
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
const { EMOJI_NOT_FOUND } = StarboardAddEmojiCommand;
const { EMBED_TITLE } = StarboardAddEmojiCommand;
const { MAYBE_EMOJI_ALREADY_ADDED } = StarboardAddEmojiCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
    );
});

describe('StarboardAddEmojiCommand test suite', (): void => {
    it('No permission check', async (): Promise<void> => {
        command = new StarboardAddEmojiCommand([]);
        const checkEmbed = (msg: MessageOptions): void => {
            const embed = msg!.embeds![0];
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
/* BROKEN DUE TO UPDATE TO CHANNELMANGERS IN DISCORD.JS v12
    it('No arguments', (): void => {
        command = new StarboardAddEmojiCommand([]);

        const checkEmbed = (msg: MessageOptions): void => {
            const embed = msg!.embeds![0];
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
    it('Cannot find emoji', (): void => {
        command = new StarboardAddEmojiCommand(['does_not_exist']);

        const checkEmbed = (msg: MessageOptions): void => {
            const embed = msg!.embeds![0];
            embed.color!.should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(EMOJI_NOT_FOUND);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.emojis = emojis;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('Valid emoji', (): void => {
        const emoji = new SimplifiedEmoji('test', 'test');
        const msg = `✅Added Emoji: <:${emoji.name}:${emoji.id}>`;
        command = new StarboardAddEmojiCommand(['test']);

        const checkEmbed = (msg: MessageOptions): void => {
            const embed = msg!.embeds![0];
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
        serverEmojis[0].id.should.equals(emoji.id);
        serverEmojis[0].name.should.equals(emoji.name);
    });
    it('Add duplicate emoji', (): void => {
        const emoji = new SimplifiedEmoji('test', 'test');
        command = new StarboardAddEmojiCommand(['test']);
        server.starboardSettings.addEmoji(emoji);

        const checkEmbed = (msg: MessageOptions): void => {
            const embed = msg!.embeds![0];
            embed.color!.should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(MAYBE_EMOJI_ALREADY_ADDED);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.emojis = emojis;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;

        // Check server
        const serverEmojis = server.starboardSettings.getEmoji();
        serverEmojis.length.should.equals(1);
    });
*/
});
