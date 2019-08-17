/* eslint-disable @typescript-eslint/no-unused-vars, no-restricted-syntax, no-unused-expressions */
import { should } from 'chai';
import { RichEmbed, Permissions } from 'discord.js';
import { MsgCheckerListWordsCommand } from '../../../main/command/messagecheckercommands/MsgCheckerListWordsCommand';
import { Command } from '../../../main/command/Command';
import { Server } from '../../../main/storage/Server';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';

should();

const command = new MsgCheckerListWordsCommand();
let server: Server;
const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { EMBED_TITLE } = MsgCheckerListWordsCommand;
const { NO_WORDS_FOUND } = MsgCheckerListWordsCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(),
        new StarboardSettings(null, null, null),
);
});

describe('ListCommandsCommand test suite', (): void => {
    it('Embed should show all bannedWords', (): void => {
        // Set banned words
        const bannedWords = ['word1', 'word2', 'word3'];
        for (const word of bannedWords) {
            server.messageCheckerSettings.addbannedWord(word);
        }

        const checkEmbed = (embed: RichEmbed): void => {
            // Get output string
            let output = '';
            for (const word of bannedWords) {
                output += `${word}\n`;
            }

            // Check colour
            embed.color!.toString(16).should.equal(EMBED_DEFAULT_COLOUR);

            // Check field
            embed.fields!.length.should.be.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(output);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Embed should show if no bannedWords', (): void => {
        const checkEmbed = (embed: RichEmbed): void => {
            // Check colour
            embed.color!.toString(16).should.equal(EMBED_DEFAULT_COLOUR);

            // Check field
            embed.fields!.length.should.be.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NO_WORDS_FOUND);
        };

        const commandResult = command.execute(server, adminPerms, checkEmbed);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
});
