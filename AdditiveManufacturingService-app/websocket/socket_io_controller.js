/**
 * Created by beuttlerma on 08.02.17.
 *
 * Socket IO Server that provides a WS interface to subscribe on license updates.
 *
 * The client can a join a room, where the hsmId (cmdongleid) is used as room identifier.
 * After joining a certain room, the client gets a 'updateAvailable' event each time a new license update is available
 * for the subscribed hsmId.
 */

const logger = require('../global/logger');
const authentication = require('../services/authentication_service');
const licenseClient = require('./license_client');
// const protocol_service = require('../services/protocol_service');


function onIOLicenseConnect(socket) {
    logger.debug('Client for License Updates connected.' + socket.id);

    const protocol = {
        eventType: 'connection',
        timestamp: new Date().toISOString(),
        payload: {
            connected: true
        }
    };
    // protocol_service.createProtocolForClientId(socket.token.client.id, protocol);


    socket.on('room', function (hsmId) {
        logger.debug('Client joining license room: ' + hsmId);
        socket.join(hsmId);
        licenseClient.registerUpdates(hsmId)
    });
    socket.on('leave', function (hsmId) {
        logger.debug('Client joining license room: ' + hsmId);
        socket.leave(hsmId);
        licenseClient.unregisterUpdates(hsmId)
    });
    socket.on('disconnect', function () {
        logger.debug('Socket disconnected: ' + socket.id);
        const protocol = {
            eventType: 'connection',
            timestamp: new Date().toISOString(),
            payload: {
                connected: false
            }
        };
        // protocol_service.createProtocolForClientId(socket.token.client.id, protocol);
    });
}

module.exports = function (io) {
    const namespace = io.of('/licenses');

    // Enable bearer token security for websocket server
    namespace.use(authentication.ws_oAuth);
    namespace.on('connection', onIOLicenseConnect);
    registerLicenseEvents(namespace);

};

function registerLicenseEvents(namespace) {
    licenseClient.on('updateAvailable', function (offerId, hsmId) {
        namespace.to(hsmId).emit('updateAvailable', {hsmId: hsmId, offerId: offerId});
    })
}