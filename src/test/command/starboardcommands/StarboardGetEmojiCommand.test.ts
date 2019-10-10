/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-expressions */
import { should } from 'chai';
import { Permissions, RichEmbed } from 'discord.js';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { StarboardSettings, SimplifiedEmoji } from '../../../main/storage/StarboardSettings';
import { StarboardGetEmojiCommand } from '../../../main/command/starboardcommands/StarboardGetEmojiCommand';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
const adminPerms = new Permissions(['ADMINISTRATOR']);
const command = new StarboardGetEmojiCommand();
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { EMOJI_NOT_SET } = StarboardGetEmojiCommand;
const { EMBED_TITLE } = StarboardGetEmojiCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

describe('GetStarboardChannelCommand class test suite', (): void => {
    it('No permission check', (): void => {
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
    it('Emoji not set', (): void => {
        const checkEmbed = (embed: RichEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(EMOJI_NOT_SET);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Emoji set', (): void => {
        const emoji = new SimplifiedEmoji('test', 'test');
        server.starboardSettings.setEmoji(emoji);

        const checkEmbed = (embed: RichEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(`Starboard emoji is currently set to <:${emoji.name}:${emoji.id}>.`);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
});
