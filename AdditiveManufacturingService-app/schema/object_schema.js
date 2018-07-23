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
        productCodes: {
            type: 'array',
            minItems: 1,
            maxItems: 100,
            uniqueItems: true,
            items: {
                type: 'integer',
                minimum: 1000,
                maximum: 1000000
            },
            additionalItems: false
        },
        lang: languageProperty
    },
    required: ['materials', 'machines', 'lang'],
    additionalProperties: false
};

self.GetBinary_Query = {
    type: 'object',
    properties: {
        offerId: {
            type: 'string',
            format: 'uuid'
        }
    },
    required: ['offerId'],
    additionalProperties: false
};

self.SaveObject_Body = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
            minLength: 5,
            maxLength: 200
        },
        placeholder: {
            type: 'string',
            format: 'uuid'
        },
        description: {
            type: 'string',
            minLength: 1,
            maxLength: 1000
        },
        licenseFee: {
            type: 'integer',
            maximum: Number.MAX_SAFE_INTEGER
        },
        components: {
            type: 'array',
            minLength: 1,
            maxLength: 10,
            items: {
                type: 'string',
                format: 'uuid'
            },
            additionalItems: false
        },
        backgroundColor: {
            type: 'string',
            maxLength: 9,
            pattern: '^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$'
        },
        image: {
            type: 'string',
            maxLength: 10000
        }
    },
    required: ['title', 'placeholder', 'description', 'licenseFee', 'components'],
    additionalProperties: false
};


module.exports = self;