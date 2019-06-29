import chai from 'chai';
import { Permissions, RichEmbed, Message } from 'discord.js';
import { Command } from '../../main/command/Command';
import { Server } from '../../main/storage/Server';
import { CommandResult } from '../../main/command/classes/CommandResult';

chai.should();

class CommandStub extends Command {
    public execute(server: Server, message: Message): CommandResult {
        throw new Error('Method not implemented.');
    }

    public generateEmbed(...args: any): RichEmbed {
        throw new Error('Method not implemented.');
    }

    public changeServerSettings(server: Server, ...args: any): void {
        throw new Error('Method not implemented.');
    }
}

const command = new CommandStub();
describe('Command class test suite', () => {
    describe('hasPermissions method test', () => {
        it('sufficient permissions 1', () => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS']);
            const userPermissions = new Permissions(['ADMINISTRATOR']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.true;
        });
        it('sufficient permissions 2', () => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);
            const userPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.true;
        });
        it('sufficient permissions 3', () => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS']);
            const userPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.true;
        });
        it('insufficient permissions 1', () => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);
            const userPermissions = new Permissions(['KICK_MEMBERS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.false;
        });
        it('insufficient permissions 2', () => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS']);
            const userPermissions = new Permissions(['KICK_MEMBERS', 'MANAGE_CHANNELS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.false;
        });
        it('insufficient permissions 3', () => {
            const requiredPermissions = new Permissions(['ADMINISTRATOR']);
            const userPermissions = new Permissions(['KICK_MEMBERS', 'MANAGE_CHANNELS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.false;
        });
    });
});
