const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const marketplaceCore = require('../adapter/marketplace_core_adapter');


const Validator = require('express-json-validator-middleware').Validator;
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/materials_schema');

router.get('/', validate({
    query: validation_schema.Material_Query,
    body: validation_schema.Empty
}), function (req, res, next) {
    const language = 'en'; //TODO: Remove this as soon as we do have german translations;

    marketplaceCore.getAllMaterials(req.token['accessToken'], language, (err, materials) => {

        if (err) {
            return next(err);
        }

        res.json(materials ? materials : [])
    })

});


module.exports = router;