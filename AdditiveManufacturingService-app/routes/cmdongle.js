const express = require('express');
const router = express.Router();

const Validator = require('express-json-validator-middleware').Validator;
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/cmdongle_schema');

const marketplaceCore = require('../adapter/marketplace_core_adapter');

router.post('/:hsmId/update', validate({
    query: validation_schema.Empty,
    body: validation_schema.LicenseUpdate_Body
}), function (req, res, next) {

    const hsmId = req.params['hsmId'];
    const racBuffer = req.body.RAC;

    marketplaceCore.getLicenseUpdate(hsmId, racBuffer, req.token.accessToken, (err, rauBuffer, isOutOfDate) => {
        if (err) {
            return next(err);
        }

        res.json({
            RAU: rauBuffer,
            isOutOfDate: isOutOfDate
        });
    });

});

router.post('/:hsmId/update/confirm', validate({
    query: validation_schema.Empty,
    body: validation_schema.LicenseUpdate_Body
}), function (req, res, next) {


    const hsmId = req.params['hsmId'];
    const racBuffer = req.body.RAC;

    marketplaceCore.confirmLicenseUpdate(hsmId, racBuffer, req.token.accessToken, (err) => {
        if (err) {
            return next(err);
        }

        res.sendStatus(200);
    });

});

module.exports = router;