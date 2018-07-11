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

        const machineComponents = jsonData.map(component => {

            //TODO: Remove this later (when the core attributes are also returned from the core)
            component['attributelist'] = [{
                attributeuuid: CONFIG.MACHINE_ATR_UUID,
                attributename: 'machine'
            }];

            return mapper.mapComponent(component);
        });

        callback(err, machineComponents);
    });
};

self.getAllMaterials = function (accessToken, language, callback) {

    getComponents(accessToken, language, [CONFIG.MATERIAL_ATR_UUID], (err, jsonData) => {

        const materialComponents = jsonData.map(component => {

            //TODO: Remove this later (when the core attributes are also returned from the core)
            component['attributelist'] = [{
                attributeuuid: CONFIG.MATERIAL_ATR_UUID,
                attributename: 'material'
            }];

            return mapper.mapComponent(component);
        });

        callback(err, materialComponents);
    });
};


module.exports = self;