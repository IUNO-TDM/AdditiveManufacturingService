/**
 * Created by beuttlerma on 08.02.17.
 */

const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const marketplaceCore = require('../adapter/marketplace_core_adapter');

const Validator = require('express-json-validator-middleware').Validator;
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/offer_schema');


router.post('/', validate({
    body: validation_schema.OfferRequest_Body,
    query: validation_schema.Empty
}), function (req, res, next) {

    marketplaceCore.createOfferForRequest(req.token.accessToken, req.body, (err, offer) => {
        if (err) {
            return next(err);
        }

        const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.set('Location', fullUrl + '/' + offer.id);
        res.status(201);
        res.json(offer);
    });
});

module.exports = router;