/**
 * Created by beuttlerma on 02.06.17.
 */


const logger = require('../global/logger');
const CONFIG = require('../config/config_loader');
const request = require('request');
const helper = require('../services/helper_service');
const UserResponse = require('../model/user_response');

const self = {};

function buildOptionsForRequest(method, protocol, host, port, path, qs) {

    return {
        method: method,
        url: protocol + '://' + host + ':' + port + path,
        qs: qs,
        json: true,
        headers: {
            'Authorization': 'Basic ' + new Buffer(CONFIG.OAUTH_CREDENTIALS.CLIENT_ID + ':' + CONFIG.OAUTH_CREDENTIALS.CLIENT_SECRET).toString('base64')
        }
    }
}

self.validateToken = function (token, callback) {
    let isValid = false;

    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not regis§tered');
        }
    }

    const options = buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PROTOCOL,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.HOST,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PORT,
        '/tokeninfo',
        {
            access_token: token
        }
    );

    request(options, function (e, r, tokenInfo) {
        const err = logger.logRequestAndResponse(e, options, r, tokenInfo);

        if (err) {
            return callback(err);
        }

        if (!tokenInfo) {
            logger.warn('[auth_service_adapter] missing token info in auth server response');
            return callback(null, false);
        }

        isValid = true;
        if (!(new Date(tokenInfo.accessTokenExpiresAt) > new Date())) {
            logger.info('[auth_service_adapter] Invalid token: Accesstoken expired');
            isValid = false;
        }

        callback(err, isValid, tokenInfo)
    });


};

self.getUserForId = function (userId, accessToken, callback) {
    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    const options = buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PROTOCOL,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.HOST,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PORT,
        '/users/' + userId,
        {}
    );

    options.headers.authorization = 'Bearer ' + accessToken;

    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        let user;

        if (jsonData && helper.isObject(jsonData)) {
            user = UserResponse.CreateFromCoreJSON(jsonData);
        }

        callback(err, user);
    });
};

self.getImageForUser = function (userId, accessToken, callback) {
    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    const options = buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PROTOCOL,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.HOST,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PORT,
        '/users/' + userId + '/image',
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;
    options.encoding = null;

    request(options, function (e, r, imageBuffer) {
        const err = logger.logRequestAndResponse(e, options, r, imageBuffer);

        callback(err, {
            imageBuffer: imageBuffer,
            contentType: r ? r.headers['content-type'] : null
        });
    });
};

self.getClientAccessToken = function (callback) {

    // Only request new access token if the old has expired
    if (self.token && new Date(self.token.accessTokenExpiresAt) > new Date()) {
        return callback(null, self.token);
    }

    logger.info('Requesting new access token from the oauth server');

    if (typeof(callback) !== 'function') {
        callback = function (err, data) {
            logger.warn('Callback not handled by caller');
        };
    }

    const options = buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PROTOCOL,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.HOST,
        CONFIG.HOST_SETTINGS.OAUTH_SERVER.PORT,
        '/oauth/token',
        {}
    );

    options.form = {
        grant_type: 'client_credentials'
    };

    request(options, function (e, r, jsonData) {
        logger.debug('Response from OAUTH Server: ' + JSON.stringify(jsonData));
        if (e) {
            logger.crit(e);

            callback(e);
            return;
        }

        if (r && r.statusCode !== 200) {
            const err = {
                status: r.statusCode,
                message: jsonData
            };
            logger.warn(err);
            callback(err);

            return;
        }

        self.token = jsonData.access_token;
        callback(null, self.token);
    });

};

self.invalidateToken = function () {

    self.token = null;

};

module.exports = self;