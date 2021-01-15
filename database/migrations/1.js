const migrationStatements = [];

// Version 1: Add birthday table
migrationStatements.push(`CREATE TABLE birthdays (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    userId TEXT NOT NULL,
    day INT,
    month INT,
    PRIMARY KEY(serverId, userId)
)`);

migrationStatements.push(`CREATE TABLE birthdaySettings (
    serverId TEXT REFERENCES servers(serverId) ON DELETE CASCADE,
    channelId TEXT,
    lastAnnouncedDay INT,
    lastAnnouncedMonth INT,
    lastAnnouncedYear INT,
    PRIMARY KEY(serverId)
)`);

exports.migrationStatements = migrationStatements;
