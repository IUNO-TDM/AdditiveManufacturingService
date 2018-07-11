/**
 * Created by beuttlerma on 09.02.17.
 */

const self = {};

const languageProperty = {
    type: 'string',
    enum: ['de', 'en']
};

self.Empty = {
    type: 'object',
    properties: {},
    additionalProperties: false
};

self.Object_Query = {
    type: 'object',
    properties: {
        materials: {
            type: 'array',
            items: {
                type: 'string',
                format: 'uuid'
            },
            additionalItems: false
        },
        machines: {
            type: 'array',
            items: {
                type: 'string',
                format: 'uuid'
            },
            additionalItems: false
        },
        lang: languageProperty
    },
    required: ['materials', 'machines' ,'lang'],
    additionalProperties: false
};

module.exports = self;