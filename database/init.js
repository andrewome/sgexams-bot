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

initStatements.push(`
create TABLE moderationActions (
    caseID INTEGER PRIMARY KEY AUTOINCREMENT,
    userID CHARACTER(18) NOT NULL,
    moderatorID CHARACTER(18) NOT NULL,
    action CHARACTER NOT NULL,
    reason NVARCHAR
)`);

initStatements.push(`
create TABLE warnCounts (
    userID CHARACTER(18) NOT NULL UNIQUE,
    warnCount INTEGER NOT NULL
)`);

exports.initStatements = initStatements;
exports.initDb = (db) => {
    for (const initStatement of initStatements)
        db.prepare(initStatement).run();
};