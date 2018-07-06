/**
 * Created by beuttlerma on 21.02.17.
 */

function ObjectResponse(id, name, description, components, compatibility, authorId, licenseFee) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.components = components;
    this.compatibility = compatibility;
    this.authorId = authorId;
    this.licenseFee = licenseFee;
}

/**
 *
 * @param jsonData
 * @returns {*}
 * @constructor
 */
ObjectResponse.prototype.CreateFromCoreJSON = function (jsonData) {

    if (!jsonData) {
        return null;
    }

    return new ObjectResponse();
};

module.exports = ObjectResponse;