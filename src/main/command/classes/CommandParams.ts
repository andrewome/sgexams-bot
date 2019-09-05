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

    /** Requires Channel and userId invoker on top of defaults */
    public static requiresRotateImageData = [
        RotateImageCommand.name,
    ]
}
