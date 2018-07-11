const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const marketplaceCore = require('../adapter/marketplace_core_adapter');

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

    marketplaceCore.getAllObjects(req.token['accessToken'], language, machines, materials, (err, objects) => {

        if (err) {
            return next(err);
        }

        res.json(objects ? objects : [])

    })
});



module.exports = router;