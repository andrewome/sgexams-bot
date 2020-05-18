/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle, no-unused-expressions, class-methods-use-this */
import chai from 'chai';
import { Permissions } from 'discord.js';
import { Command } from '../../main/command/Command';
import { CommandResult } from '../../main/command/classes/CommandResult';
import { CommandArgs } from '../../main/command/classes/CommandArgs';

chai.should();

class CommandStub extends Command {
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        throw new Error('Method not implemented.');
    }
}

const command = new CommandStub();
describe('Command class test suite', (): void => {
    describe('hasPermissions method test', (): void => {
        it('sufficient permissions 1', (): void => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS']);
            const userPermissions = new Permissions(['ADMINISTRATOR']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.true;
        });
        it('sufficient permissions 2', (): void => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);
            const userPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.true;
        });
        it('sufficient permissions 3', (): void => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS']);
            const userPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.true;
        });
        it('insufficient permissions 1', (): void => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);
            const userPermissions = new Permissions(['KICK_MEMBERS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.false;
        });
        it('insufficient permissions 2', (): void => {
            const requiredPermissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_CHANNELS']);
            const userPermissions = new Permissions(['KICK_MEMBERS', 'MANAGE_CHANNELS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.false;
        });
        it('insufficient permissions 3', (): void => {
            const requiredPermissions = new Permissions(['ADMINISTRATOR']);
            const userPermissions = new Permissions(['KICK_MEMBERS', 'MANAGE_CHANNELS']);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.false;
        });
    });
});
