const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const marketplaceCore = require('../adapter/marketplace_core_adapter');
const helper = require('../services/helper_service');
const CONFIG = require('../config/config_loader');

const Validator = require('express-json-validator-middleware').Validator;
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/object_schema');

router.get('/', validate({
    query: validation_schema.Object_Query,
    body: validation_schema.Empty
}), function (req, res, next) {
    const language = req.query['lang'] || 'en';
    const machines = req.query['machines'];
    const materials = req.query['materials'];
    const productCodes = req.query['productCodes'];

    marketplaceCore.getAllObjects(req.token['accessToken'], language, machines, materials, productCodes, (err, objects) => {

        if (err) {
            return next(err);
        }

        res.json(objects ? objects : [])

    })
});

router.get('/:id/binary', validate({
    query: validation_schema.GetBinary_Query,
    body: validation_schema.Empty
}), function (req, res, next) {
    marketplaceCore.getBinaryForObjectWithId(req.token['accessToken'], req.params['id'], req.query['offerId'], (err, binary) => {
        if (err) {
            if (err.statusCode >= 500) {
                return next(err);
            }
            return res.sendStatus(err.statusCode);
        }

        res.json(binary);
    });
});

router.post('/', validate({
    query: validation_schema.Empty,
    body: validation_schema.SaveObject_Body
}), function (req, res, next) {

    const coreData = {};

    coreData.technologyDataName = req.body['title'];
    coreData.technologyData = req.body['encryptedBinary'];
    coreData.technologyDataDescription = req.body['description'];
    coreData.technologyUUID = CONFIG.TECHNOLOGY_UUID;
    coreData.licenseFee = req.body['licenseFee'];
    coreData.componentList = req.body['components'];
    coreData.backgroundColor = req.body['backgroundColor'];
    coreData.image = req.body['image'];

    marketplaceCore.saveObject(req.user.token, coreData, (err, objectId) => {

        if (err) {
            if (err.statusCode === 409) {
                res.status(409);
                return res.send('Already exists');
            }
            return next(err);
        }

        const fullUrl = helper.buildFullUrlFromRequest(req);
        res.set('Location', fullUrl + 'objects/' + objectId);
        res.status(201);
        res.send('' + objectId);
    });
});

router.get('/:id/image', validate({
    query: validation_schema.Empty,
    body: validation_schema.Empty
}), function (req, res, next) {
    marketplaceCore.getImageForObject(req.token.accessToken, req.params['id'], (err, data) => {
        if (err) {
            next(err);
            return;
        }

        if (!data) {
            res.sendStatus(404);
            return;
        }

        res.set('Content-Type', data.contentType);
        res.send(data.imageBuffer);
    });
});


module.exports = router;