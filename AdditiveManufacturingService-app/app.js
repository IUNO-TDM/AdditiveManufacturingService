const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const queryParser = require('express-query-int');
const bodyParser = require('body-parser');
const authentication = require('./services/authentication_service');
const contentTypeValidation = require('./services/content_type_validation');
const schemaValidation = require('./services/schema_validation');

const app = express();

app.use(logger('dev'));
app.use('/', contentTypeValidation);
app.use('/cmdongle', bodyParser.json({
    limit: '50mb'
}));
app.use('/', bodyParser.json({
    limit: '10kb'
}));
app.use(queryParser());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

// validated access token
app.use(authentication.oAuth);


app.use('/machines', require('./routes/machines'));
app.use('/materials', require('./routes/materials'));
app.use('/objects', require('./routes/objects'));

// parse schema validation errors
app.use(schemaValidation);


// Error handling
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
} else {
    app.use(function (err, req, res, next) {
        console.error(err);
        // Send error details to the client only when the status is 4XX
        if (err.status && err.status >= 400 && err.status < 500) {
            res.sendStatus(err.status);
        }
        else {
            res.status(500);
            res.send('Something broke!');
        }
    });
}

module.exports = app;
