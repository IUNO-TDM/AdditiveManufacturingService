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

        if (!err && jsonData) {
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

        if (!err && jsonData) {
            materialComponents = jsonData.map(component => {

                //TODO: Remove this later (when the  attributes are also returned from the core) #217
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

self.getAllObjects = function (accessToken, language, machines, materials, productCodes, onlyPurchased, callback) {


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
            components: machines ? machines.concat(materials ? materials : []) : materials ? materials : [],
            lang: language,
            technology: CONFIG.TECHNOLOGY_UUID,
            productCodes: productCodes,
            purchased: onlyPurchased
        }
    );

    options.headers.authorization = 'Bearer ' + accessToken;


    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        let objects;

        if (!err && jsonData) {
            objects = jsonData.map(tdmObject => {
                return mapper.mapObject(tdmObject);
            });
        }

        callback(err, objects);
    });

};

self.saveObject = function (accessToken, objectData, callback) {
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
    options.headers.authorization = 'Bearer ' + accessToken;

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

self.updateImageForObject = function (objectId, req, res, next) {
    const uri = `${CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL}://`
        + `${CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST}:`
        + `${CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT}/technologydata/`
        + `${objectId}/image`;

    req.pipe(
        request(uri, (err, pipeResponse) => {
            if (err) {
                return next(err)
            }

            res.sendStatus(pipeResponse.statusCode);
        }));
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

self.uploadBinary = function (objectId, req, res, next) {
    const uri = `${CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL}://`
        + `${CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST}:`
        + `${CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT}/technologydata/`
        + `${objectId}/file`;
    req.pipe(
        request(uri, (err, pipeResponse) => {
            if (err) {
                return next(err)
            }

            res.sendStatus(pipeResponse.statusCode);
        }));
};

self.downloadBinary = function (objectId, offerId, req, res, next) {
    const options = buildOptionsForRequest(
        'GET',
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PROTOCOL,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.HOST,
        CONFIG.HOST_SETTINGS.MARKETPLACE_CORE.PORT,
        `/technologydata/${objectId}/content`,
        {}
    );
    options.headers.authorization = 'Bearer ' + req.token['accessToken'];

    request(options)
        .on('error', (err) => {
            logger.warn('[marketplace_core_adapter] error on binary download');
            next(err);
        }).pipe(res);
};

self.requestForLicenseUpdate = function (accessToken, offerId, hsmId, callback) {
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
        `/offers/${offerId}/request_license_update`,
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;
    options.body = {
        hsmId: hsmId
    };

    request(options, (e, r, jsonData) => {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);
        callback(err);
    });
};

self.getObjectForId = function (accessToken, objectId, language, callback) {
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
        `/technologydata/${objectId}`,
        {
            lang: language
        }
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    request(options, function (e, r, jsonData) {

        const err = logger.logRequestAndResponse(e, options, r, jsonData);

        let tdmObject;
        if (helper.isObject(jsonData)) {
            tdmObject = mapper.mapObject(jsonData);
        }

        callback(err, tdmObject);
    });
};

module.exports = self;