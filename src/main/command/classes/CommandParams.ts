import { HelpCommand } from '../helpcommands/HelpCommand';
import { MsgCheckerAddWordCommand } from '../messagecheckercommands/MsgCheckerAddWordCommand';
import { MsgCheckerGetReportChannelCommand } from '../messagecheckercommands/MsgCheckerGetReportChannelCommand';
import { MsgCheckerGetResponseMessageCommand } from '../messagecheckercommands/MsgCheckerGetResponseMessageCommand';
import { MsgCheckerListWordsCommand } from '../messagecheckercommands/MsgCheckerListWordsCommand';
import { MsgCheckerRemoveWordCommand } from '../messagecheckercommands/MsgCheckerRemoveWordCommand';
import { MsgCheckerSetDeleteMessageCommand } from '../messagecheckercommands/MsgCheckerSetDeleteMessageCommand';
import { MsgCheckerSetResponseMessageCommand } from '../messagecheckercommands/MsgCheckerSetResponseMessageCommand';
import { StarboardGetChannelCommand } from '../starboardcommands/StarboardGetChannelCommand';
import { StarboardGetEmojiCommand } from '../starboardcommands/StarboardGetEmojiCommand';
import { StarboardGetThresholdCommand } from '../starboardcommands/StarboardGetThresholdCommand';
import { StarboardSetThresholdCommand } from '../starboardcommands/StarboardSetThresholdCommand';
import { MsgCheckerSetReportChannelCommand } from '../messagecheckercommands/MsgCheckerSetReportChannelCommand';
import { StarboardSetChannelCommand } from '../starboardcommands/StarboardSetChannelCommand';
import { StarboardSetEmojiCommand } from '../starboardcommands/StarboardSetEmojiCommand';
import { RotateImageCommand } from '../rotateimagecommands/RotateImageCommand';
import { MsgCheckerHelpCommand } from '../helpcommands/MsgCheckerHelpCommand';
import { StarboardHelpCommand } from '../helpcommands/StarboardHelpCommand';
import { RotateImageHelpCommand } from '../helpcommands/RotateImageHelpCommand';
import { StatusCheckCommand } from '../statuscheckcommands/StatusCheckCommand';

export enum CommandType {
    requiresDefault,
    requiresChannels,
    requiresEmojis,
    requiresRotateImageData
}

export abstract class CommandParams {
    /** Default params: server, memberperms, messageReply */
    public static requiresDefaults = [
        // Message Checker Commands
        MsgCheckerAddWordCommand.name,
        MsgCheckerGetReportChannelCommand.name,
        MsgCheckerGetResponseMessageCommand.name,
        MsgCheckerListWordsCommand.name,
        MsgCheckerRemoveWordCommand.name,
        MsgCheckerSetDeleteMessageCommand.name,
        MsgCheckerSetResponseMessageCommand.name,
        // Starboard Commands
        StarboardGetChannelCommand.name,
        StarboardGetEmojiCommand.name,
        StarboardGetThresholdCommand.name,
        StarboardSetThresholdCommand.name,
        // Help Commands
        HelpCommand.name,
        MsgCheckerHelpCommand.name,
        StarboardHelpCommand.name,
        RotateImageHelpCommand.name,
    ]

    /** Requires Collection of Channels from Guild on top of defaults */
    public static requiresChannels = [
        // Message Checker Commands
        MsgCheckerSetReportChannelCommand.name,
        // Starboard Commands
        StarboardSetChannelCommand.name,
    ]

    /** Requires Collection of Emojis from Guild on top of defaults */
    public static requiresEmojis = [
        StarboardSetEmojiCommand.name,
    ]

    /** Requires Channel and userId on top of defaults */
    public static requiresRotateImageData = [
        RotateImageCommand.name,
    ]

    /** Requires Status Check Wrapper*/
    public static requiresStatusCheckData = [
        StatusCheckCommand.name,
    ]
    public static checkCommandType(type: string): CommandType {
        if (this.requiresDefaults.includes(type)) {
            return CommandType.requiresDefault;
        }

        if (this.requiresChannels.includes(type)) {
            return CommandType.requiresChannels;
        }

        if (this.requiresEmojis.includes(type)) {
            return CommandType.requiresEmojis;
        }

        if (this.requiresRotateImageData.includes(type)) {
            return CommandType.requiresRotateImageData;
        }

        if (this.requiresStatusCheckData.includes(type)){
            return CommandType.requiresStatusCheckData;
        }

        throw new Error(`Command ${type} does not exist in CommandParams!`);
    }
}
