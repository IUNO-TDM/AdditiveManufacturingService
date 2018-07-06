/**
 * Created by beuttlerma on 07.02.17.
 */

const self = {};
const request = require('request');

const logger = require('../global/logger');
const CONFIG = require('../config/config_loader');
const helper = require('../services/helper_service');
const MachineType = require('../model/machine_type_response');
const Material = require('../model/material_response');


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

self.getAllMachineTypes = function (accessToken, language, callback) {
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
            technology: CONFIG.TECHNOLOGY_UUID,
            attributes: ['machine_type']
        }
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);
        const machineTypes = [];

        if (helper.isArray(jsonData)) {
            jsonData.forEach(function (entry) {
                machineTypes.push(MachineType.CreateFromJSON(entry));
            });
        }

        callback(err, machineTypes);
    });
};

self.getAllMaterials = function (accessToken, language, callback) {
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
            technology: CONFIG.TECHNOLOGY_UUID,
            attributes: ['material']
        }
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    request(options, function (e, r, jsonData) {
        const err = logger.logRequestAndResponse(e, options, r, jsonData);
        const materials = [];

        if (helper.isArray(jsonData)) {
            jsonData.forEach(function (entry) {
                materials.push(Material.CreateFromJSON(entry));
            });
        }

        callback(err, materials);
    });
};


module.exports = self;