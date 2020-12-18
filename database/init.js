/* eslint-disable */
const Database = require('better-sqlite3');
const initStatements = [];

// Servers table
initStatements.push(
`CREATE TABLE servers (
    serverId TEXT NOT NULL,
    PRIMARY KEY(serverId) 
);`)

// MessageCheckerSettings table
initStatements.push(
`CREATE TABLE messageCheckerSettings (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    reportingChannelId TEXT,
    responseMessage TEXT,
    deleteMessage boolean,
    PRIMARY KEY(serverId)
);`)

// MessageCheckerSettings bannedWords table
initStatements.push(
`CREATE TABLE messageCheckerBannedWords (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    word TEXT,
    PRIMARY KEY(serverId, word)
);`)

// StarboardSettings table
initStatements.push(
`CREATE TABLE starboardSettings (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    channel TEXT,
    threshold INT,
    PRIMARY KEY(serverId)
)`)

// StarboardSettings emoji table
initStatements.push(
`CREATE TABLE starboardEmojis (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    id TEXT,
    name TEXT,
    PRIMARY KEY(serverId, id)
)`)

// ModerationLogs table
initStatements.push(
`CREATE TABLE moderationLogs (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    caseId INTEGER NOT NULL,
    modId TEXT NOT NULL,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    reason TEXT,
    timeout INT,
    timestamp INT NOT NULL,
    PRIMARY KEY(serverId, caseId)
)`)

// Timeouts
initStatements.push(
`CREATE TABLE moderationTimeouts (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER NOT NULL,
    timerId INTEGER NOT NULL,
    PRIMARY KEY(serverId, userId, type)
)`)

initStatements.push(
`CREATE TABLE moderationSettings (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    channelId TEXT,
    muteRoleId TEXT,
    PRIMARY KEY(serverId)
)`)

initStatements.push(
`CREATE TABLE moderationWarnSettings (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    numWarns INTEGER NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER,
    PRIMARY KEY(serverId, numWarns)
)`)

exports.initStatements = initStatements;
exports.initDb = (db) => {
    for (const initStatement of initStatements)
        db.prepare(initStatement).run();
};
