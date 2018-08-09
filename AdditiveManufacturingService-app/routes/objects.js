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
    const language = 'en'; //TODO: Remove this as soon as we do have german translations;
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

router.get('/:object_id', validate({
    query: validation_schema.GetSingleObject_Query,
    body: validation_schema.Empty
}), function (req, res, next) {
    const language = 'en'; //TODO: Remove this as soon as we do have german translations;

    marketplaceCore.getObjectForId(req.token.accessToken, req.params['object_id'], language, (err, tdmObject) => {
        if (err) {
            next(err);
            return;
        }

        if (!tdmObject || !Object.keys(tdmObject).length) {
            return res.sendStatus(404);
        }

        res.json(tdmObject);
    });
});


router.get('/:id/binary', validate({
    query: validation_schema.GetBinary_Query,
    body: validation_schema.Empty
}), function (req, res, next) {
    marketplaceCore.downloadBinary(req.params['id'], req.query['offerId'], req, res, next);
});

router.post('/:id/binary', function (req, res, next) {
    marketplaceCore.uploadBinary(req.params['id'], req, res, next);
});

router.post('/', validate({
    query: validation_schema.Empty,
    body: validation_schema.SaveObject_Body
}), function (req, res, next) {

    const coreData = {};

    coreData.technologyDataName = req.body['title'];
    coreData.technologyData = req.body['encryptedKey'];
    coreData.technologyDataDescription = req.body['description'];
    coreData.technologyUUID = CONFIG.TECHNOLOGY_UUID;
    coreData.licenseFee = req.body['licenseFee'];
    coreData.componentList = req.body['components'];
    coreData.backgroundColor = req.body['backgroundColor'];
    coreData.image = req.body['image'];
    coreData.isFile = true;

    marketplaceCore.saveObject(req.token.accessToken, coreData, (err, objectId) => {

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