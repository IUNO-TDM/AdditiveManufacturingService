const logger = require('../global/logger');


const MethodToContentTypeMapping = {
    GET: [''],
    HEAD: [''],
    POST: ['application/json', 'multipart/form-data'],
    PUT: ['application/json', 'image/png', 'image/jpeg', 'image/svg+xml'],
    DELETE: [],
    CONNECT: [],
    OPTIONS: [],
    TRACE: [],
    PATCH: []
};


module.exports = function (req, res, next) {
    const allowedTypes = MethodToContentTypeMapping[req.method];
    for (let i in allowedTypes) {
        if (allowedTypes[i] === '') {
            return next();
        }

        if (req.is(allowedTypes[i])) {
            return next();
        }
    }

    logger.info('[content_type_validation] Content-Type ' + req.headers['content-type'] + ' not accepted for method ' + req.method);

    return res.status(400).send('content-type not accepted');
};