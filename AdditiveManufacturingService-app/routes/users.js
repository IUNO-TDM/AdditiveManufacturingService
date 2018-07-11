const express = require('express');
const router = express.Router();
const logger = require('../global/logger');
const oAuthServer = require('../adapter/auth_service_adapter');
const helper = require('../services/helper_service');

const {Validator, ValidationError} = require('express-json-validator-middleware');
const validator = new Validator({allErrors: true});
const validate = validator.validate;
const validation_schema = require('../schema/users_schema');

router.get('/:id', validate({
    query: validation_schema.Empty,
    body: validation_schema.Empty
}), function (req, res, next) {

    oAuthServer.getUserForId(req.params['id'], req.token.accessToken, function (err, user) {
        if (err) {
            next(err);
            return;
        }

        if (!user || !Object.keys(user).length) {
            res.sendStatus(404);
            return;
        }

        res.json(user);
    });

});

router.get('/:id/image', validate({
    query: validation_schema.Empty,
    body: validation_schema.Empty
}), function (req, res, next) {

    oAuthServer.getImageForUser(req.params['id'], req.token.accessToken, function (err, data) {
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