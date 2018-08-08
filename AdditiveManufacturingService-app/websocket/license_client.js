/**
 * Created by goergch on 09.03.17.
 *
 * This is a websocket client that registers on rooms on the marketplace core.
 *
 */

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const logger = require('../global/logger');
const io = require('socket.io-client');
const config = require('../config/config_loader');
const authServer = require('../adapter/auth_service_adapter');

const LicenseClient = function () {
    const self = this;
    this.registeredRooms = {};
    this.refreshTokenAndReconnect = function () {
        authServer.invalidateToken();
        authServer.getClientAccessToken(function (err, token) {
            if (err) {
                logger.warn(err);
            }
            if (self.socket) {
                self.socket.io.opts.extraHeaders = {
                    Authorization: 'Bearer ' + (token ? token.accessToken : '')
                };
                self.socket.io.disconnect();
                self.socket.connect();
            }
        });
    };
};

const license_client = new LicenseClient();
util.inherits(LicenseClient, EventEmitter);

license_client.socket = io.connect('http://' + config.HOST_SETTINGS.MARKETPLACE_CORE.HOST
    + ":" + config.HOST_SETTINGS.MARKETPLACE_CORE.PORT + "/licenses", {
    transports: ['websocket'],
    extraHeaders: {},
    autoConnect: false
});

license_client.socket.on('connect', function () {
    logger.info("[license_service] connected to license SocketIO at Marketplace");

    // register rooms on reconnect
    Object.keys(license_client.registeredRooms).forEach(function (room) {
        if (!room) {
            return;
        }
        logger.debug('[license_service] Re-Joining room: ' + room);
        license_client.socket.emit('room', room);
    });
});

license_client.socket.on('error', function (error) {
    logger.debug("[license_service] Error: " + error);

    license_client.refreshTokenAndReconnect();
});

license_client.socket.on('connect_failed', function (error) {
    logger.debug("[license_service] Connection Failed: " + error);
});

license_client.socket.on('connect_error', function (error) {
    logger.warn("[license_service] Connection Error: " + error);
});

license_client.socket.on('reconnect_error', function (error) {
    logger.debug("[license_service] Re-Connection Error: " + error);
});

license_client.socket.on('reconnect_attempt', function (number) {
    logger.debug("[license_service] Re-Connection attempt: " + number);
});

license_client.socket.on('disconnect', function () {
    logger.info("[license_service] disconnected from license SocketIO at Marketplace");
});

/**
 * updateAvailable events are directly passed to the registered clients. Via the license service.
 */
license_client.socket.on('updateAvailable', function (data) {
    logger.debug(`[license_client] received updateAvailable event for hsmid: ${data.hsmId} and offerid: ${data.offerId}`);
    license_client.emit('updateAvailable', data.offerId, data.hsmId);
});


license_client.registerUpdates = function (hsmId) {
    /**
     * The subscriptions for license updates are separated by the hsmId.
     */

    logger.debug(`[license_client] joining room: ${hsmId}`);

    if (!hsmId) {
        return;
    }

    license_client.registeredRooms[hsmId] = true;

    license_client.socket.emit('room', hsmId);
};

license_client.unregisterUpdates = function (hsmId) {

    logger.debug(`[license_client] leaving rooms ${hsmId}`);
    if (license_client.registeredRooms[hsmId]) {
        delete  license_client.registeredRooms[hsmId];
    }

    license_client.socket.emit('leave', hsmId);
};

license_client.socket.open();

module.exports = license_client;