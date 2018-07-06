/**
 * Created by beuttlerma on 18.04.17.
 */


/**
 * To use a custom config file use the config_default as a template.
 * Save the custom config file in the same directory. All files starting with private* will be ignored by git.
 *
 * Set the file name as environment variable for TDM_AMS_CONFIG.
 *
 * If the custom config is missing any variables, the default variables will be used.
 * If no custom config is defined, the default configuration will be loaded.
 *
 * @returns {config}
 */

const ENV_NAME = 'TDM_AMS_CONFIG';
const config = require('./config_defaults');

if (process.env[ENV_NAME]) {
    console.info('Loading configuration file: ' + process.env[ENV_NAME]);

    try {
        const customConfig = require('./' + process.env[ENV_NAME]);
        // override default values from custom configuration
        for (let key in customConfig) {
            config[key] = customConfig[key];
        }
    }
    catch (err) {
        console.warn(err);
    }
}
else {
    console.warn('ENV Variable: ' + ENV_NAME + ' not specified. Loading defaults only.');
}

module.exports = config;
