/**
 * Created by beuttlerma on 07.02.17.
 */

const self = {};
const request = require('request');

const logger = require('../global/logger');
const CONFIG = require('../config/config_loader');
const helper = require('../services/helper_service');
const mapper = require('../model/tdm_common_mapping');


function buildOptionsForRequest(method, protocol, host, port, path, qs) {

    return {
        method: method,
        url: protocol + '://' + host + ':' + port + path,
        qs: qs,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    }
}

function getComponents(accessToken, language, attributes, callback) {
    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    const options = buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        '/components',
        {
            lang: language,
            technologies: [CONFIG.TECHNOLOGY_UUID],
            attributes: attributes
        }
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        callback(err, jsonData);
    });
}

self.getAllMachines = function (accessToken, language, callback) {

    getComponents(accessToken, language, [CONFIG.MACHINE_ATR_UUID], (err, jsonData) => {

        if (err) {
            return callback(err);
        }

        let machineComponents;

        if (jsonData) {
            machineComponents = jsonData.map(component => {

                //TODO: Remove this later (when the core attributes are also returned from the core)
                component['attributelist'] = [{
                    attributeuuid: CONFIG.MACHINE_ATR_UUID,
                    attributename: 'machine'
                }];

                return mapper.mapComponent(component);
            });
        }

        callback(err, machineComponents);
    });
};

self.getAllMaterials = function (accessToken, language, callback) {

    getComponents(accessToken, language, [CONFIG.MATERIAL_ATR_UUID], (err, jsonData) => {

        if (err) {
            return callback(err);
        }

        let materialComponents;

        if (jsonData) {
            materialComponents = jsonData.map(component => {

                //TODO: Remove this later (when the core attributes are also returned from the core)
                component['attributes'] = [{
                    attributeuuid: CONFIG.MATERIAL_ATR_UUID,
                    attributename: 'material'
                }];

                return mapper.mapComponent(component);
            });
        }

        callback(err, materialComponents);
    });
};

self.getAllObjects = function (accessToken, language, machines, materials, productCodes, callback) {


    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    const options = buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        '/technologydata',
        {
            components: machines.concat(materials),
            lang: language,
            technology: CONFIG.TECHNOLOGY_UUID,
            productCodes: productCodes
        }
    );

    options.headers.authorization = 'Bearer ' + accessToken;


    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        let objects;

        if (jsonData) {
            objects = jsonData.map(tdmObject => {
                return mapper.mapObject(tdmObject);
            });
        }

        callback(err, objects);
    });

};

self.getBinaryForObjectWithId = function (accessToken, objectId, offerId, callback) {
    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    const options = buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        `/technologydata/${objectId}/content`,
        {
            offerId: offerId
        }
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    request(options, function (e, r, binary) {

        const err = logger.logRequestAndResponse(e, options, r, binary);

        callback(err, binary);
    });
};

self.saveObject = function (token, objectData, callback) {
    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    const options = buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        '/technologydata',
        {}
    );
    options.headers.authorization = 'Bearer ' + token.accessToken;

    options.body = objectData;

    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        if (err) {
            return callback(err);
        }
        let objectId = null;

        if (r.headers['location']) {
            objectId = r.headers['location'].substr(r.headers['location'].lastIndexOf('/') + 1)
        }

        callback(err, objectId);
    });
};

self.getImageForObject = function (accessToken, objectid, callback) {
    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    const options = buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        '/technologydata/' + objectid + '/image',
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;
    options.encoding = null;

    request(options, function (e, r, data) {
        const err = logger.logRequestAndResponse(e, options, r, data);

        callback(err, {
            imageBuffer: data,
            contentType: r ? r.headers['content-type'] : null
        });
    });
};

self.createOfferForRequest = function (accessToken, offerRequest, callback) {
    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    const options = buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        '/offers',
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;
    options.body = offerRequest;

    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        if (err) {
            return callback(err);
        }
        const offer = mapper.mapOffer(jsonData);

        callback(err, offer);
    });
};

self.getLicenseUpdate = function (hsmId, context, accessToken, callback) {
    if (typeof(callback) !== 'function') {
        return logger.info('[marketplace_core_adapter] Callback not registered');
    }

    if (!hsmId || !context) {
        return logger.info('[marketplace_core_adapter] missing function arguments');
    }

    const options = buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        '/cmdongle/' + hsmId + '/update',
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    options.body = {
        RAC: context
    };

    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        let rau = null;
        let isOutOfDate = false;
        if (jsonData) {
            rau = jsonData['RAU'];
            isOutOfDate = jsonData['isOutOfDate']
        }

        callback(err, rau, isOutOfDate);
    });

};

self.confirmLicenseUpdate = function (hsmId, context, accessToken, callback) {
    if (typeof(callback) !== 'function') {
        return logger.info('[marketplace_core_adapter] Callback not registered');
    }

    if (!hsmId || !context) {
        return logger.info('[marketplace_core_adapter] missing function arguments');
    }

    const options = buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        '/cmdongle/' + hsmId + '/update/confirm',
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    options.body = {
        RAC: context
    };

    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        let rau = null;
        let isOutOfDate = false;
        if (jsonData) {
            rau = jsonData['RAU'];
            isOutOfDate = jsonData['isOutOfDate']
        }

        callback(err, rau, isOutOfDate);
    });
};

self.createProtocolForClientId = function (accessToken, clientId, protocol, callback) {
    if (typeof(callback) !== 'function') {

        callback = function () {
            logger.info('Callback not registered');
        }
    }

    const options = buildOptionsForRequest(
        'POST',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        '/protocols/' + clientId,
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;
    options.body = protocol;

    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);
        callback(err, jsonData);
    });
};

module.exports = self;