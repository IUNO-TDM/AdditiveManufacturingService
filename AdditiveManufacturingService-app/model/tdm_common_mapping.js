const tdmCommon = require('tdm-common');
const _ = require('lodash');
const CONFIG = require('../config/config_loader');

const self = {};

self.mapComponent = function (json) {

    if (!json) {
        return null;
    }

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

    if (!json) {
        return null;
    }

    const attribute = new tdmCommon.TdmAttribute();
    attribute.id = json['attributeuuid'];
    attribute.name = json['attributename'];

    return attribute
};

self.mapObject = function (json) {

    if (!json) {
        return null;
    }

    const tdmObject = new tdmCommon.TdmObjectPrinterObject();

    tdmObject.id = json['technologydatauuid']
    tdmObject.name = json['technologydataname'];
    tdmObject.description = json['technologydatadescription'];
    tdmObject.licenseFee = json['licensefee'];
    tdmObject.productCode = json['productcode'];
    tdmObject.backgroundColor = json['backgroundcolor'];
    tdmObject.components = json['componentlist'] ? json['componentlist'].map(component => {
        return self.mapComponent(component);
    }) : null;

    // sort materials and machines in separate properties. remove all other components
    tdmObject.materials = _.filter(tdmObject.components, component => _.filter(component.attributes, attribute => attribute.name === 'material').length > 0);
    tdmObject.machines = _.filter(tdmObject.components, component => _.filter(component.attributes, attribute => attribute.name === 'machine').length > 0);
    tdmObject.components = undefined;

    tdmObject.technology = new tdmCommon.TdmTechnology();
    tdmObject.technology.id = CONFIG.TECHNOLOGY_UUID;

    return tdmObject;

};

self.mapUser = function (json) {

    if (!json) {
        return null;
    }

    json.__proto__ = tdmCommon.TdmUser.prototype;

    return json;

};

self.mapOffer = function (json) {

    if (!json) {
        return null;
    }
    const tdmOffer = new tdmCommon.TdmPaymentOffer();

    tdmOffer.id = json['id'];
    if (json['invoice']) {
        tdmOffer.invoice = new tdmCommon.TdmPaymentInvoice();
        tdmOffer.invoice.expiration = json['invoice']['expiration'];
        if (json['invoice']['transfers']) {
            tdmOffer.invoice.transfers = json['invoice']['transfers'].map(transfer => {
                const tdmTransfer = new tdmCommon.TdmPaymentTransfer();
                tdmTransfer.address = transfer['address'];
                tdmTransfer.coin = transfer['coin'];

                return tdmTransfer;
            });
        }
    }
    tdmOffer.bip21 = json['bip21'];

    return tdmOffer;
};

module.exports = self;