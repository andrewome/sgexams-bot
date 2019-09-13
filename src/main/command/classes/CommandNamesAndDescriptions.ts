export abstract class CommandNamesAndDescriptions {
    /** Message Checker Commands */
    public static readonly MSGCHECKER_LIST_WORDS_COMMAND_NAME = 'MsgCheckerListWords';

    public static readonly MSGCHECKER_LIST_WORDS_COMMAND_DESCRIPTION = 'Displays all blacklisted words.';

    public static readonly MSGCHECKER_ADD_WORD_COMMAND_NAME = 'MsgCheckerAddWords';

    public static readonly MSGCHECKER_ADD_WORD_COMMAND_DESCRIPTION = 'Add word(s) to the blacklist.';

    public static readonly MSGCHECKER_REMOVE_WORD_COMMAND_NAME = 'MsgCheckerRemoveWords';

    public static readonly MSGCHECKER_REMOVE_WORD_COMMAND_DESCRIPTION = 'Remove word(s) from the blacklist.';

    public static readonly MSGCHECKER_SET_REPORT_CHANNEL_COMMAND_NAME = 'MsgCheckerSetReportChannel';

    public static readonly MSGCHECKER_SET_REPORT_CHANNEL_COMMAND_DESCRIPTION
        = 'Sets the reporting channel to post incident reports for this server when blacklisted words are used.';

    public static readonly MSGCHECKER_GET_REPORT_CHANNEL_COMMAND_NAME = 'MsgCheckerGetReportChannel';

    public static readonly MSGCHECKER_GET_REPORT_CHANNEL_COMMAND_DESCRIPTION
        = 'Displays the reporting channel to post incident reports for this server when blacklisted words are used.';

    public static readonly MSGCHECKER_SET_RESPONSE_MESSAGE_COMMAND_NAME = 'MsgCheckerSetResponseMsg';

    public static readonly MSGCHECKER_SET_RESPONSE_MESSAGE_COMMAND_DESCRIPTION
        = 'Sets the response message to the user upon detection of blacklisted words for this server.';

    public static readonly MSGCHECKER_GET_RESPONSE_MESSAGE_COMMAND_NAME = 'MsgCheckerGetResponseMsg';

    public static readonly MSGCHECKER_GET_RESPONSE_MESSAGE_COMMAND_DESCRIPTION
        = 'Displays the response message to the user upon detection of blacklisted words for this server.';

    public static readonly MSGCHECKER_SET_DELETE_MESSAGE_COMMAND_NAME = 'MsgCheckerSetDeleteMsg';

    public static readonly MSGCHECKER_SET_DELETE_MESSAGE_COMMAND_DESCRIPTION
        = 'Sets whether the bot should delete instances of blacklisted words being used.';

    public static readonly MSGCHECKER_COMMANDS = [
        CommandNamesAndDescriptions.MSGCHECKER_LIST_WORDS_COMMAND_NAME,
        CommandNamesAndDescriptions.MSGCHECKER_ADD_WORD_COMMAND_NAME,
        CommandNamesAndDescriptions.MSGCHECKER_REMOVE_WORD_COMMAND_NAME,
        CommandNamesAndDescriptions.MSGCHECKER_SET_REPORT_CHANNEL_COMMAND_NAME,
        CommandNamesAndDescriptions.MSGCHECKER_GET_REPORT_CHANNEL_COMMAND_NAME,
        CommandNamesAndDescriptions.MSGCHECKER_SET_RESPONSE_MESSAGE_COMMAND_NAME,
        CommandNamesAndDescriptions.MSGCHECKER_GET_RESPONSE_MESSAGE_COMMAND_NAME,
        CommandNamesAndDescriptions.MSGCHECKER_SET_DELETE_MESSAGE_COMMAND_NAME,
    ];

    public static readonly MSGCHECKER_DESCRIPTIONS = [
        CommandNamesAndDescriptions.MSGCHECKER_LIST_WORDS_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.MSGCHECKER_ADD_WORD_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.MSGCHECKER_REMOVE_WORD_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.MSGCHECKER_SET_REPORT_CHANNEL_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.MSGCHECKER_GET_REPORT_CHANNEL_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.MSGCHECKER_SET_RESPONSE_MESSAGE_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.MSGCHECKER_GET_RESPONSE_MESSAGE_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.MSGCHECKER_SET_DELETE_MESSAGE_COMMAND_DESCRIPTION,
    ];

    public static readonly MSGCHECKER_COMMANDS_LOWERCASE = [
        CommandNamesAndDescriptions.MSGCHECKER_LIST_WORDS_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.MSGCHECKER_ADD_WORD_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.MSGCHECKER_REMOVE_WORD_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.MSGCHECKER_SET_REPORT_CHANNEL_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.MSGCHECKER_GET_REPORT_CHANNEL_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.MSGCHECKER_SET_RESPONSE_MESSAGE_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.MSGCHECKER_GET_RESPONSE_MESSAGE_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.MSGCHECKER_SET_DELETE_MESSAGE_COMMAND_NAME.toLowerCase(),
    ];

    /** Starboard Commands */
    public static readonly STARBOARD_SET_CHANNEL_COMMAND_NAME = 'StarboardSetChannel';

    public static readonly STARBOARD_SET_CHANNEL_COMMAND_DESCRIPTION
        = 'Sets the Starboard channel where the bot will star messages.'

    public static readonly STARBOARD_GET_CHANNEL_COMMAND_NAME = 'StarboardGetChannel';

    public static readonly STARBOARD_GET_CHANNEL_COMMAND_DESCRIPTION
        = 'Displays the currently set Starboard channel';

    public static readonly STARBOARD_SET_EMOJI_COMMAND_NAME = 'StarboardSetEmoji';

    public static readonly STARBOARD_SET_EMOJI_COMMAND_DESCRIPTION
        = 'Sets the Starboard emoji that the bot will look out for.';

    public static readonly STARBOARD_GET_EMOJI_COMMAND_NAME = 'StarboardGetEmoji';

    public static readonly STARBOARD_GET_EMOJI_COMMAND_DESCRIPTION
        = 'Displays the currently set Starboard emoji';

    public static readonly STARBOARD_SET_THRESHOLD_COMMAND_NAME = 'StarboardSetThreshold';

    public static readonly STARBOARD_SET_THRESHOLD_COMMAND_DESCRIPTION
        = 'Sets the emoji threshold for a message to be starred.'

    public static readonly STARBOARD_GET_THRESHOLD_COMMAND_NAME = 'StarboardGetThreshold';

    public static readonly STARBOARD_GET_THRESHOLD_COMMAND_DESCRIPTION
        = 'Displays the emoji threshold for a message to be starred.';

    public static readonly STARBOARD_COMMANDS = [
        CommandNamesAndDescriptions.STARBOARD_SET_CHANNEL_COMMAND_NAME,
        CommandNamesAndDescriptions.STARBOARD_GET_CHANNEL_COMMAND_NAME,
        CommandNamesAndDescriptions.STARBOARD_SET_EMOJI_COMMAND_NAME,
        CommandNamesAndDescriptions.STARBOARD_GET_EMOJI_COMMAND_NAME,
        CommandNamesAndDescriptions.STARBOARD_SET_THRESHOLD_COMMAND_NAME,
        CommandNamesAndDescriptions.STARBOARD_GET_THRESHOLD_COMMAND_NAME,
    ];

    public static readonly STARBOARD_DESCRIPTIONS = [
        CommandNamesAndDescriptions.STARBOARD_SET_CHANNEL_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.STARBOARD_GET_CHANNEL_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.STARBOARD_SET_EMOJI_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.STARBOARD_GET_EMOJI_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.STARBOARD_SET_THRESHOLD_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.STARBOARD_GET_THRESHOLD_COMMAND_DESCRIPTION,
    ];

    public static readonly STARBOARD_COMMANDS_LOWERCASE = [
        CommandNamesAndDescriptions.STARBOARD_SET_CHANNEL_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.STARBOARD_GET_CHANNEL_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.STARBOARD_SET_EMOJI_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.STARBOARD_GET_EMOJI_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.STARBOARD_SET_THRESHOLD_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.STARBOARD_GET_THRESHOLD_COMMAND_NAME.toLowerCase(),
    ];

    /** Misc Commands */
    public static readonly ROTATE_IMAGE_COMMAND_NAME = 'Rotate';

    public static readonly ROTATE_IMAGE_COMMAND_DESCRIPTION
        = 'Rotates an image by 90 degrees via reactions.';

    public static readonly STATUS_CHECK_COMMAND_NAME = 'Uptime';

    public static readonly STATUS_CHECK_COMMAND_DESCRIPTION = 
        'Returns how long the bot has been online for.';

    public static readonly MISC_COMMANDS = [
        CommandNamesAndDescriptions.ROTATE_IMAGE_COMMAND_NAME,
        CommandNamesAndDescriptions.STATUS_CHECK_COMMAND_NAME,
    ];

    public static readonly MISC_DESCRIPTIONS = [
        CommandNamesAndDescriptions.ROTATE_IMAGE_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.STATUS_CHECK_COMMAND_DESCRIPTION,
    ];

    public static readonly MISC_COMMANDS_LOWERCASE = [
        CommandNamesAndDescriptions.ROTATE_IMAGE_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.STATUS_CHECK_COMMAND_NAME.toLowerCase(),
    ];

    /** Help Commands */
    public static readonly HELP_COMMAND_NAME = 'Help';

    public static readonly HELP_COMMAND_DESCRIPTION
        = 'Displays all the available commands that this bot listens to.';

    public static readonly MSGCHECKER_HELP_COMMAND_NAME = 'MsgCheckerHelp';

    public static readonly MSGCHECKER_HELP_COMMAND_DESCRIPTION
        = 'Displays available commands for the Message Checker function.';

    public static readonly STARBOARD_HELP_COMMAND_NAME = 'StarboardHelp';

    public static readonly STARBOARD_HELP_COMMAND_DESCRIPTION
        = 'Displays available commands for the Starboard function.';

    public static readonly MISC_COMMAND_HELP_COMMAND_NAME = 'MiscHelp';

    public static readonly MISC_COMMAND_HELP_COMMAND_DESCRIPTION
        = 'Displays other Miscellaneous commands';

    public static readonly HELP_COMMANDS = [
        CommandNamesAndDescriptions.HELP_COMMAND_NAME,
        CommandNamesAndDescriptions.MSGCHECKER_HELP_COMMAND_NAME,
        CommandNamesAndDescriptions.STARBOARD_HELP_COMMAND_NAME,
        CommandNamesAndDescriptions.MISC_COMMAND_HELP_COMMAND_NAME,
    ];

    public static readonly HELP_DESCRIPTIONS = [
        CommandNamesAndDescriptions.HELP_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.MSGCHECKER_HELP_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.STARBOARD_HELP_COMMAND_DESCRIPTION,
        CommandNamesAndDescriptions.MISC_COMMAND_HELP_COMMAND_DESCRIPTION,
    ];

    public static readonly HELP_COMMANDS_LOWERCASE = [
        CommandNamesAndDescriptions.HELP_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.MSGCHECKER_HELP_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.STARBOARD_HELP_COMMAND_NAME.toLowerCase(),
        CommandNamesAndDescriptions.MISC_COMMAND_HELP_COMMAND_NAME.toLowerCase(),
    ];
}
    
