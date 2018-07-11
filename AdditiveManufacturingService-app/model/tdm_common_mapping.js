const tdmCommon = require('tdm-common');
const _ = require('lodash');
const CONFIG = require('../config/config_loader');

const self = {};

self.mapComponent = function (json) {
    let component = new tdmCommon.TdmComponent();

    component.name = json['componentname'];
    component.description = json['componentdescription'];
    component.id = json['componentuuid'];
    component.displayColor = json['displaycolor'];
    component.attributes = json['attributes'] ? json['attributes'].map(attribute => {
        return self.mapAttribute(attribute);
    }) : null;

    return component;
};

self.mapAttribute = function (json) {

    const attribute = new tdmCommon.TdmAttribute();
    attribute.id = json['attributeuuid'];
    attribute.name = json['attributename'];

    return attribute
};

self.mapObject = function (json) {

    const tdmObject = new tdmCommon.TdmObjectPrinterObject();

    tdmObject.id = json['technologydatauuid']
    tdmObject.name = json['technologydataname'];
    tdmObject.description = json['technologydatadescription'];
    tdmObject.licenseFee = json['licensefee'];
    tdmObject.productCode = json['productcode'];
    tdmObject.backgroundColor = json['backgroundcolor'];
    tdmObject.components = json['componentlist'].map(component => {
        return self.mapComponent(component);
    });
    tdmObject.materials = _.filter(tdmObject.components, component => _.filter(component.attributes, attribute => attribute.name === 'material').length > 0);
    tdmObject.machines = _.filter(tdmObject.components, component => _.filter(component.attributes, attribute => attribute.name === 'machine').length > 0);
    tdmObject.technology = new tdmCommon.TdmTechnology();
    tdmObject.technology.id = CONFIG.TECHNOLOGY_UUID;

    return tdmObject;

};

self.mapUser = function (json) {

    const tdmUser = new tdmCommon.TdmUser();

    tdmUser.id = json['id'];
    tdmUser.firstname = json['firstname'];
    tdmUser.lastname = json['lastname'];
    tdmUser.username = json['username'];
    tdmUser.userEmail = json['userEmail'];

    return tdmUser;

};

module.exports = self;