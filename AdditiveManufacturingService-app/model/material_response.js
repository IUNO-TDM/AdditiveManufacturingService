/**
 * Created by beuttlerma on 21.02.17.
 */

function MaterialResponse(id, name) {
    this.id = id;
    this.name = name;
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

    return new MaterialResponse(jsonData['id'], jsonData['name']);
};

module.exports = MaterialResponse;