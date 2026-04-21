'use strict';

// Load .env early (no-op when env vars are already set by the platform)
require('dotenv').config();

const express = require('express');
const dynamoDbConnect = require('../common/nosql/dynamoDb/index');

const app = express();

// ---------------------------------------------------------------------------
// Lazy, cached initialisation
//
// Vercel invokes this module once per cold-start.  We connect to the database
// and register all Express middleware/routes on the first request, then reuse
// the same configured app for every subsequent request in the same instance.
// ---------------------------------------------------------------------------
let setupDone = false;
let setupPromise = null;

function ensureSetup() {
    if (setupDone) return Promise.resolve();
    if (!setupPromise) {
        setupPromise = dynamoDbConnect
            .init()
            .then(() => {
                require('../web/middleware')(app);
                setupDone = true;
            });
    }
    return setupPromise;
}

// Vercel expects the export to be a Node.js request-handler function.
module.exports = async (req, res) => {
    try {
        await ensureSetup();
        app(req, res);
    } catch (err) {
        console.error('Initialization error:', err);
        res.status(500).json({ error: 'Service initialization failed' });
    }
};
