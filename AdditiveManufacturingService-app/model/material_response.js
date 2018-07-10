/**
 * Created by beuttlerma on 21.02.17.
 */

function MaterialResponse(id, name, description, color) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.color = color;
}

/**
 *
 * @param jsonData
 * @returns {*}
 * @constructor
 */
MaterialResponse.CreateFromJSON = MaterialResponse.prototype.CreateFromJSON = function (jsonData) {

    if (!jsonData) {
        return null;
    }

    return new MaterialResponse(
        jsonData['componentuuid'],
        jsonData['componentname'],
        jsonData['componentdescription'],
        jsonData['displaycolor']
    );
};

module.exports = MaterialResponse;