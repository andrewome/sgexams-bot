/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle, no-unused-expressions, class-methods-use-this */
import chai from 'chai';
import { PermissionsBitField, PermissionFlagsBits } from 'discord.js';
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
            const requiredPermissions = new PermissionsBitField([PermissionFlagsBits.KickMembers]);
            const userPermissions = new PermissionsBitField([PermissionFlagsBits.Administrator]);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.true;
        });
        it('sufficient permissions 2', (): void => {
            const requiredPermissions
                = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers]);
            const userPermissions
                = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers]);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.true;
        });
        it('sufficient permissions 3', (): void => {
            const requiredPermissions = new PermissionsBitField([PermissionFlagsBits.KickMembers]);
            const userPermissions
                = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers]);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.true;
        });
        it('insufficient permissions 1', (): void => {
            const requiredPermissions
                = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers]);
            const userPermissions = new PermissionsBitField([PermissionFlagsBits.KickMembers]);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.false;
        });
        it('insufficient permissions 2', (): void => {
            const requiredPermissions = new PermissionsBitField([
                PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers, PermissionFlagsBits.ManageChannels,
            ]);
            const userPermissions
                = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.ManageChannels]);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.false;
        });
        it('insufficient permissions 3', (): void => {
            const requiredPermissions = new PermissionsBitField([PermissionFlagsBits.Administrator]);
            const userPermissions
                = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.ManageChannels]);
            command.hasPermissions(requiredPermissions, userPermissions).should.be.false;
        });
    });

    describe('hasAnyPermissions method test', (): void => {
        const setA
            = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers]);
        const setB = new PermissionsBitField([PermissionFlagsBits.ModerateMembers]);

        it('satisfies first set only', (): void => {
            const userPermissions
                = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers]);
            command.hasAnyPermissions([setA, setB], userPermissions).should.be.true;
        });
        it('satisfies second set only', (): void => {
            const userPermissions = new PermissionsBitField([PermissionFlagsBits.ModerateMembers]);
            command.hasAnyPermissions([setA, setB], userPermissions).should.be.true;
        });
        it('satisfies both sets', (): void => {
            const userPermissions = new PermissionsBitField([
                PermissionFlagsBits.KickMembers, PermissionFlagsBits.BanMembers,
                PermissionFlagsBits.ModerateMembers,
            ]);
            command.hasAnyPermissions([setA, setB], userPermissions).should.be.true;
        });
        it('satisfies neither set', (): void => {
            const userPermissions = new PermissionsBitField([PermissionFlagsBits.KickMembers]);
            command.hasAnyPermissions([setA, setB], userPermissions).should.be.false;
        });
        it('satisfies only part of a set (not enough)', (): void => {
            const userPermissions
                = new PermissionsBitField([PermissionFlagsBits.KickMembers, PermissionFlagsBits.ManageChannels]);
            command.hasAnyPermissions([setA, setB], userPermissions).should.be.false;
        });
    });
});
