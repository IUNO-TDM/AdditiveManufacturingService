const tdmCommon = require('tdm-common');

const self = {};

self.mapComponent = function (json) {
    let component = new tdmCommon.TdmComponent();

    component.name = json['componentname'];
    component.description = json['componentdescription'];
    component.id = json['componentuuid'];
    component.color = json['displaycolor'];
    component.attributes = [json['attributelist'].map(attribute => {
        return self.mapAttribute(attribute);
    })];

    return component;
};

self.mapAttribute = function(json) {

    const attribute = new tdmCommon.TdmAttribute();
    attribute.id = json['attributeuuid'];
    attribute.name = json['attributename'];

    return attribute
};


module.exports = self;