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
`CREATE TABLE moderationActions (
    serverId VARCHAR(30),
    caseId INTEGER,
    id VARCHAR(30),
    modId VARCHAR(30),
    action VARCHAR(5),
    reason VARCHAR(50),
    PRIMARY KEY(serverId, caseId, id)
)`)

// ModerationCounts table
initStatements.push(
`CREATE TABLE moderationCounts (
    serverId VARCHAR(30),
    id VARCHAR(30),
    warnCounts INTEGER,
    kickCounts INTEGER,
    banCounts INTEGER,
    muteCounts INTEGER,
    PRIMARY KEY(serverId, id)
)`)

exports.initStatements = initStatements;
exports.initDb = (db) => {
    for (const initStatement of initStatements)
        db.prepare(initStatement).run();
};