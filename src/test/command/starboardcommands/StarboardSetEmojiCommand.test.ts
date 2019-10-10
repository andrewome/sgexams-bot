/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle, no-unused-expressions */
import { should } from 'chai';
import {
 RichEmbed, Permissions, Collection, Channel, Client, Emoji, Guild,
} from 'discord.js';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings, SimplifiedEmoji } from '../../../main/storage/StarboardSettings';
import { StarboardSetEmojiCommand } from '../../../main/command/starboardcommands/StarboardSetEmojiCommand';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
let command: StarboardSetEmojiCommand;
const emojis = new Collection<string, Emoji>();
const channels = new Collection<string, Channel>();
// Setting up mock emojis.
const emoji_ = new Emoji(
    new Guild(new Client(), { emojis: [] }),
    {},
);
emoji_.name = 'test';
emoji_.id = 'test';
emojis.set(emoji_.id, emoji_);

const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { ERROR_EMBED_TITLE } = Command;
const { NO_ARGUMENTS } = Command;
const { EMOJI_NOT_FOUND } = StarboardSetEmojiCommand;
const { EMBED_TITLE } = StarboardSetEmojiCommand;
const { EMOJI_RESETTED } = StarboardSetEmojiCommand;
const { EMOJIID_CANNOT_BE_UNDEFINED } = StarboardSetEmojiCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

describe('StarboardSetEmojiCommand test suite', (): void => {
    it('No permission check', (): void => {
        command = new StarboardSetEmojiCommand([]);
        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(Command.EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(Command.ERROR_EMBED_TITLE);
            field.value.should.equals(Command.NO_PERMISSIONS_MSG);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Reset emoji', (): void => {
        const emoji = new SimplifiedEmoji('test', 'test');
        server.starboardSettings.setEmoji(emoji);
        command = new StarboardSetEmojiCommand([]);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(EMOJI_RESETTED);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.emojis = emojis;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        (server.starboardSettings.getChannel() === null).should.be.true;
    });
    it('Cannot find emoji', (): void => {
        command = new StarboardSetEmojiCommand(['does_not_exist']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
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
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Valid emoji', (): void => {
        const emoji = new SimplifiedEmoji('test', 'test');
        const msg = `Starboard Emoji set to <:${emoji.name}:${emoji.id}>.`;
        command = new StarboardSetEmojiCommand(['test']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        commandArgs.emojis = emojis;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        server.starboardSettings.getEmoji()!.id.should.equals(emoji.id);
        server.starboardSettings.getEmoji()!.name.should.equals(emoji.name);
    });
});
