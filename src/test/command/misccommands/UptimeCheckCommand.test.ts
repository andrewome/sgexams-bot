/* eslint-disable no-unused-expressions */
import { should } from 'chai';
import { MessageEmbed, Permissions } from 'discord.js';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { UptimeCheckCommand } from '../../../main/command/misccommands/UptimeCheckCommand';
import { Command } from '../../../main/command/Command';
import { Server } from '../../../main/storage/Server';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
const command = new UptimeCheckCommand();
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const { EMBED_TITLE } = UptimeCheckCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
);
});

describe('UptimeCheck Command Test Suite', (): void => {
    it('Execute test - 1000ms (1 second)', (): void => {
        const uptime = 1000;
        const expectedOutput
            = '0 days, 0 hours, 0 minutes and 1 second';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 60000ms (1 minute)', (): void => {
        const uptime = 60000;
        const expectedOutput
            = '0 days, 0 hours, 1 minute and 0 seconds';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 3600000ms (1 hour)', (): void => {
        const uptime = 3600000;
        const expectedOutput
            = '0 days, 1 hour, 0 minutes and 0 seconds';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 86400000ms (1 day)', (): void => {
        const uptime = 86400000;
        const expectedOutput
            = '1 day, 0 hours, 0 minutes and 0 seconds';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 864000000ms (10 days)', (): void => {
        const uptime = 864000000;
        const expectedOutput
            = '10 days, 0 hours, 0 minutes and 0 seconds';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 500ms (should round down)', (): void => {
        const uptime = 500;
        const expectedOutput
            = '0 days, 0 hours, 0 minutes and 0 seconds';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 999ms (should round down)', (): void => {
        const uptime = 999;
        const expectedOutput
            = '0 days, 0 hours, 0 minutes and 0 seconds';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 1001ms (1 second)', (): void => {
        const uptime = 1001;
        const expectedOutput
            = '0 days, 0 hours, 0 minutes and 1 second';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 61000ms (1 min, 1 second)', (): void => {
        const uptime = 61050;
        const expectedOutput
            = '0 days, 0 hours, 1 minute and 1 second';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 3661000ms (1 hour, 1 min, 1 second)', (): void => {
        const uptime = 3661000;
        const expectedOutput
            = '0 days, 1 hour, 1 minute and 1 second';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed, uptime);

        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Execute test - 90061000ms (1 day, 1 hour, 1 min, 1 second)', (): void => {
        const uptime = 90061000;
        const expectedOutput
            = '1 day, 1 hour, 1 minute and 1 second';

        const checkEmbed = (embed: MessageEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);

            // Check field value
            field.value.should.equals(expectedOutput);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        commandArgs.uptime = uptime;
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
});
