'use strict';

const prisma = require('../../common/db/prismaClient');

let dbConnect = {};

dbConnect.init = function () {
    return prisma.$connect()
        .then(() => {
            console.log('Database connected (PostgreSQL via Prisma).');
        });
};

dbConnect.getConn = function () {
    return prisma;
};

module.exports = dbConnect;
