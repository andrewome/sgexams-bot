/* eslint-disable */
const Database = require('better-sqlite3');
const initStatements = [];

// Servers table
initStatements.push(
`CREATE TABLE servers (
    serverId VARCHAR(30) NOT NULL,
    PRIMARY KEY(serverId) 
);`)

// MessageCheckerSettings table
initStatements.push(
`CREATE TABLE messageCheckerSettings (
    serverId VARCHAR(30) REFERENCES servers(serverId) ON DELETE CASCADE,
    reportingChannelId VARCHAR(30),
    responseMessage VARCHAR(2000),
    deleteMessage boolean,
    PRIMARY KEY(serverId)
);`)

// MessageCheckerSettings bannedWords table
initStatements.push(
`CREATE TABLE messageCheckerBannedWords (
    serverId VARCHAR(30) REFERENCES servers(serverId) ON DELETE CASCADE,
    word VARCHAR(30),
    PRIMARY KEY(serverId, word)
);`)

// StarboardSettings table
initStatements.push(
`CREATE TABLE starboardSettings (
    serverId VARCHAR(30) REFERENCES servers(serverId) ON DELETE CASCADE,
    channel VARCHAR(30),
    threshold INT,
    PRIMARY KEY(serverId)
)`)

// StarboardSettings emoji table
initStatements.push(
`CREATE TABLE starboardEmojis (
    serverId VARCHAR(30) REFERENCES servers(serverId) ON DELETE CASCADE,
    id VARCHAR(30),
    name VARCHAR(30),
    PRIMARY KEY(serverId, id)
)`)

// ModerationActions table
initStatements.push(
`CREATE TABLE moderationLogs (
    serverId VARCHAR NOT NULL,
    caseId INTEGER NOT NULL,
    modId VARCHAR NOT NULL,
    userId VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    reason TEXT,
    timeout INTEGER,
    timestamp INTEGER NOT NULL,
    PRIMARY KEY(serverId, caseId)
)`)

// Timeouts
initStatements.push(
`CREATE TABLE moderationTimeouts (
    serverId VARCHAR NOT NULL,
    userId VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    endTime INTEGER NOT NULL,
    timerId INTEGER NOT NULL,
    PRIMARY KEY(serverId, userId, type)
)`)

exports.initStatements = initStatements;
exports.initDb = (db) => {
    for (const initStatement of initStatements)
        db.prepare(initStatement).run();
};