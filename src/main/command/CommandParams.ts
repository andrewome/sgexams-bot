import { ListCommandsCommand } from './generalcommands/ListCommandsCommand';
import { MsgCheckerAddWordCommand } from './messagecheckercommands/MsgCheckerAddWordCommand';
import { MsgCheckerGetReportChannelCommand } from './messagecheckercommands/MsgCheckerGetReportChannelCommand';
import { MsgCheckerGetResponseMessageCommand } from './messagecheckercommands/MsgCheckerGetResponseMessageCommand';
import { MsgCheckerListWordsCommand } from './messagecheckercommands/MsgCheckerListWordsCommand';
import { MsgCheckerRemoveWordCommand } from './messagecheckercommands/MsgCheckerRemoveWordCommand';
import { MsgCheckerSetDeleteMessageCommand } from './messagecheckercommands/MsgCheckerSetDeleteMessageCommand';
import { MsgCheckerSetResponseMessageCommand } from './messagecheckercommands/MsgCheckerSetResponseMessageCommand';
import { GetStarboardChannelCommand } from './starboardcommands/GetStarboardChannelCommand';
import { GetStarboardEmojiCommand } from './starboardcommands/GetStarboardEmojiCommand';
import { GetStarboardThresholdCommand } from './starboardcommands/GetStarboardThresholdCommand';
import { SetStarboardThresholdCommand } from './starboardcommands/SetStarboardThresholdCommand';
import { MsgCheckerSetReportChannelCommand } from './messagecheckercommands/MsgCheckerSetReportChannelCommand';
import { SetStarboardChannelCommand } from './starboardcommands/SetStarboardChannelCommand';
import { SetStarboardEmojiCommand } from './starboardcommands/SetStarboardEmojiCommand';
import { RotateImageCommand } from './rotateimagecommands/RotateImageCommand';

export class CommandParams {
    /** Default params: server, memberperms, messageReply */
    public static requiresDefaults = [
        // General Commands
        ListCommandsCommand.name,
        // Message Checker Commands
        MsgCheckerAddWordCommand.name,
        MsgCheckerGetReportChannelCommand.name,
        MsgCheckerGetResponseMessageCommand.name,
        MsgCheckerListWordsCommand.name,
        MsgCheckerRemoveWordCommand.name,
        MsgCheckerSetDeleteMessageCommand.name,
        MsgCheckerSetResponseMessageCommand.name,
        // Starboard Commands
        GetStarboardChannelCommand.name,
        GetStarboardEmojiCommand.name,
        GetStarboardThresholdCommand.name,
        SetStarboardThresholdCommand.name,
    ]

    /** Requires Collection of Channels from Guild on top of defaults */
    public static requiresChannels = [
        // Message Checker Commands
        MsgCheckerSetReportChannelCommand.name,
        // Starboard Commands
        SetStarboardChannelCommand.name,
    ]

    /** Requires Collection of Emojis from Guild on top of defaults */
    public static requiresEmojis = [
        SetStarboardEmojiCommand.name,
    ]

    /** Requires Channel and userId invoker on top of defaults */
    public static requiresRotateImageData = [
        RotateImageCommand.name,
    ]
}
