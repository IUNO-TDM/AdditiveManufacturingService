/**
 * Created by beuttlerma on 09.02.17.
 */

const self = {};

self.OfferRequest_Body = {
    type: 'object',
    properties: {
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    dataId: {
                        type: 'string',
                        format: 'uuid'
                    },
                    amount: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100
                    }
                },
                required: ['dataId', 'amount'],
                additionalProperties: false
            },
            additionalItems: false,
            minItems: 1
        },
        hsmId: {
            type: 'string',
            pattern: '[3-9]-[0-9]{7}$'
        }
    },
    required: ['items', 'hsmId'],
    additionalProperties: false
};

self.Empty = {
    type: 'object',
    properties: {},
    additionalProperties: false
};

self.RequestLicenseUpdateBody = {
    type: 'object',
    properties: {
        hsmId: {
            type: 'string',
            pattern: '[3-9]-[0-9]{7}$'
        }
    },
    required: ['hsmId'],
    additionalProperties: false
};

module.exports = self;