/**
 * Created by beuttlerma on 18.04.17.
 */


const self = {};


// ---- CONFIGURATION EXPORT ----

self.LOG_LEVEL = 'info';
self.HOST_SETTINGS = {
    MARKETPLACE_CORE: {
        PROTOCOL: 'http',
        HOST: 'localhost',
        PORT: 3002
    },
    OAUTH_SERVER: {
        PROTOCOL: 'http',
        HOST: 'localhost',
        PORT: 3006
    }
};
self.OAUTH_CREDENTIALS = {
    CLIENT_ID: '',
    CLIENT_SECRET: ''
};

self.TECHNOLOGY_UUID = 'adb4c297-45bd-437e-ac90-2aed14f6b882';
self.MACHINE_ATR_UUID = 'adb4c297-45bd-437e-ac90-fd6d0660d0f4';
self.MATERIAL_ATR_UUID = 'adb4c297-45bd-437e-ac90-19442dfd4eb8';

module.exports = self;