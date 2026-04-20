(function () {
    'use strict';
    require('dotenv').config();
    const _ = require('lodash');
    const path = require('path');
    let CONST = require('./../common/constant/basic.json');
    let CONF_ALL = require('./all.json');
    let CONF_DEV = require('./development.json');
    let CONF_PROD = require('./production.json');
    let CONF;

    if (_.isUndefined(process.env.NODE_ENV)) {
        process.env.NODE_ENV = CONST.ENV.DEVELOPMENT;
    }

    switch (process.env.NODE_ENV) {
        case CONST.ENV.PRODUCTION:
            CONF = Object.assign(Object.assign(CONST, CONF_ALL), CONF_PROD);
            break;
        case CONST.ENV.DEVELOPMENT:
            CONF = Object.assign(Object.assign(CONST, CONF_ALL), CONF_DEV);
            break;
        case CONST.ENV.STAGING:
            CONF = Object.assign(Object.assign(CONST, CONF_ALL), CONF_STAG);
            break;
    }

    CONF.LOGGER.DATA_PATH = path.join(__dirname, '/../log/' + CONF.LOGGER.DATA_PATH);
    CONF.LOGGER.INFO_PATH = path.join(__dirname, '/../log/' + CONF.LOGGER.INFO_PATH);
    CONF.LOGGER.ERROR_PATH = path.join(__dirname, '/../log/' + CONF.LOGGER.ERROR_PATH);
    CONF.LOGGER.CRITICAL_PATH = path.join(__dirname, '/../log/' + CONF.LOGGER.CRITICAL_PATH);

    // Override MAIL config from environment variables (keep JSON only as fallback)
    CONF.MAIL = {
        HOST: process.env.MAIL_HOST || CONF.MAIL.HOST,
        PORT: parseInt(process.env.MAIL_PORT) || CONF.MAIL.PORT,
        SECURE: process.env.MAIL_SECURE === 'true' || CONF.MAIL.SECURE,
        MAILID: process.env.MAIL_ID || CONF.MAIL.MAILID,
        PASSWORD: process.env.MAIL_PASSWORD || '',
    };

    //For getting directory and db path to store in
    CONF.UPLOADS = {
        ROOT_PATH: path.join(__dirname, '/..'),
        DEFAULT: path.join(__dirname, '/../uploads/'),
        DIR_PATH_ICONS: path.join(__dirname, '/../uploads/icons/'),
        DIR_PATH_SUPPORT_TICKET: path.join(__dirname, '/../uploads/support-ticket/'),
        DIR_PATH_SPLIT_PAYMENT_PICTURE: path.join(__dirname, '/../uploads/split-payment/'),
        DIR_PATH_IMAGES: path.join(__dirname, '/../uploads/images/'),
        DIR_PATH_VIDEOS: path.join(__dirname, '/../uploads/videos/'),
        DIR_PATH_DOCUMENTS: path.join(__dirname, '/../uploads/documents/'),
        DB_PATH_ICONS: 'uploads/',
        DB_PATH_PHOTOS: 'uploads/photos/',
        DB_PATH_VIDEOS: 'uploads/videos/',
        DB_PATH_DOCUMENTS: 'uploads/documents/'
    };

    // JWT / auth – must be set via environment variables in production
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.JWT_TOKEN_KEY) {
            throw new Error('JWT_TOKEN_KEY environment variable is required in production');
        }
        if (!process.env.COOKIE_PRIVATE_KEY) {
            throw new Error('COOKIE_PRIVATE_KEY environment variable is required in production');
        }
    }
    CONF.JWTTOKENKEY = process.env.JWT_TOKEN_KEY || 'change-me-in-production';
    CONF.JWTTOKENALLOWACCESS = {};
    CONF.JWTTIMEOUT = 0;
    CONF.COOKIE_PRIVATE_KEY = process.env.COOKIE_PRIVATE_KEY || 'change-me-in-production';
    CONF.NODE_ENV = process.env.NODE_ENV;

    // AWS / S3
    CONF.AWS = {
        REGION: process.env.AWS_REGION || 'eu-north-1',
        S3_BUCKET: process.env.AWS_S3_BUCKET || 'desicefilesupload',
    };

    // Akahu (NZ open banking)
    CONF.AKAHU = {
        APP_TOKEN: process.env.AKAHU_APP_TOKEN || '',
        APP_SECRET: process.env.AKAHU_APP_SECRET || '',
    };

    module.exports = CONF;
})();