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
import { SetStarboardEmojiCommand } from '../../../main/command/starboardcommands/SetStarboardEmojiCommand';

should();

let server: Server;
let command: SetStarboardEmojiCommand;
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
const { EMOJI_NOT_FOUND } = SetStarboardEmojiCommand;
const { EMBED_TITLE } = SetStarboardEmojiCommand;
const { EMOJI_RESETTED } = SetStarboardEmojiCommand;
const { EMOJIID_CANNOT_BE_UNDEFINED } = SetStarboardEmojiCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

describe('SetReportChannelCommand test suite', (): void => {
    it('Reset emoji', (): void => {
        const emoji = new SimplifiedEmoji('test', 'test');
        server.starboardSettings.setEmoji(emoji);
        command = new SetStarboardEmojiCommand([]);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(EMOJI_RESETTED);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed, channels, emojis);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        (server.starboardSettings.getChannel() === null).should.be.true;
    });
    it('Cannot find emoji', (): void => {
        command = new SetStarboardEmojiCommand(['does_not_exist']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_ERROR_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(EMOJI_NOT_FOUND);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed, channels, emojis);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Valid emoji', (): void => {
        const emoji = new SimplifiedEmoji('test', 'test');
        const msg = `Starboard Emoji set to <:${emoji.name}:${emoji.id}>.`;
        command = new SetStarboardEmojiCommand(['test']);

        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(msg);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed, channels, emojis);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.true;

        // Check server
        server.starboardSettings.getEmoji()!.id.should.equals(emoji.id);
        server.starboardSettings.getEmoji()!.name.should.equals(emoji.name);
    });
});
