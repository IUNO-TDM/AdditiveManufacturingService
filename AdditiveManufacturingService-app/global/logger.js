/**
 * Created by beuttlerma on 02.12.16.
 *
 * Example usage:
 *  var logger = require('../global/logger');
 *  logger.debug('Foo');
 */
const winston = require('winston');
const config = require('../config/config_loader');

// Set up logger
const customColors = {
    trace: 'white',
    debug: 'green',
    info: 'green',
    warn: 'yellow',
    crit: 'red',
    fatal: 'red'
};

const logger = new (winston.Logger)({
    colors: customColors,
    levels: {
        fatal: 1,
        crit: 2,
        warn: 3,
        info: 4,
        debug: 5,
        trace: 6
    },
    transports: [
        new (winston.transports.Console)({
            level: config.LOG_LEVEL,
            colorize: true,
            timestamp: true
        })
        // new (winston.transports.File)({ filename: 'somefile.log' })
    ]
});

winston.addColors(customColors);

//Logging wrapper, to remove "unknown function" warnings
const origLog = logger.log;
logger.log = function (level, msg) {
    if (arguments.length > 2) {
        for (let i = 2; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    if (!msg) {
        msg = level;
        level = 'info';
    }
    origLog.call(logger, level, msg);
};

const origFatal = logger.fatal;
logger.fatal = function (msg) {
    if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origFatal.call(logger, msg);
};

const origCrit = logger.crit;
logger.crit = function (msg) {
    if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origCrit.call(logger, msg);
};

const origWarn = logger.warn;
logger.warn = function (msg) {
    if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origWarn.call(logger, msg);
};

const origInfo = logger.info;
logger.info = function (msg) {
    if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origInfo.call(logger, msg);
};

const origDebug = logger.debug;
logger.debug = function (msg) {
    if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
            msg += ' ' + JSON.stringify(arguments[i]);
        }
    }
    origDebug.call(logger, msg);
};

// Always log the error trace when tracing
const origTrace = logger.trace;
logger.trace = function (msg) {
    var objType = Object.prototype.toString.call(msg);
    if (objType === '[object Error]') {
        origTrace.call(logger, msg);
    } else {
        if (arguments.length > 1) {
            for (let i = 1; i < arguments.length; i++) {
                msg += ' ' + JSON.stringify(arguments[i]);
            }
        }
        origTrace.call(logger, new Error(msg));
    }
};


// Custom log method for request responses
logger.logRequestAndResponse = function (err, options, res, data) {

    const loggerOutput = {};
    let e = null;

    if (options) {
        loggerOutput.options = options;
    }

    if (res) {
        loggerOutput.statusCode = res.statusCode;
        loggerOutput.statusMessage = res.statusMessage;
    }

    if (data) {
        loggerOutput.data = data;
    }

    if (err) {
        loggerOutput.err = err;
        logger.crit(loggerOutput);
        e = new Error(JSON.stringify(loggerOutput, null, 4));
        if (err.statusCode) {
            e.status = res.statusCode;
        }
    }
    else if (res && res.statusCode >= 400 && res.statusCode !== 404) {
        logger.warn(loggerOutput);
        if (res.body) {
            e = new Error(JSON.stringify(res.body));
        }
        else {
            e = new Error(res.statusMessage);
        }
        e.status = res.statusCode;
    }
    else {
        logger.debug(loggerOutput);
    }


    return e;
};

module.exports = logger;