'use strict';

const { PrismaClient } = require('@prisma/client');

// Prisma 7.x no longer reads the database URL from schema.prisma.
// The connection string must be supplied via `datasourceUrl` here (runtime)
// and via `prisma.config.ts` for CLI commands (migrate, generate, studio).
// See: https://pris.ly/d/prisma7-client-config

// Singleton pattern: reuse the same PrismaClient instance across modules.
// In development, prevent multiple instances from being created due to
// hot-reloading (e.g. nodemon).
let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
    });
} else {
    if (!global.__prisma) {
        global.__prisma = new PrismaClient({
            datasourceUrl: process.env.DATABASE_URL,
            log: ['warn', 'error'],
        });
    }
    prisma = global.__prisma;
}

module.exports = prisma;
