/**
 * Created by beuttlerma on 21.02.17.
 */

function MachineResponse(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
}

/**
 *
 * @param jsonData
 * @returns {*}
 * @constructor
 */
MachineResponse.CreateFromJSON = MachineResponse.prototype.CreateFromJSON = function (jsonData) {

    if (!jsonData) {
        return null;
    }

    return new MachineResponse(jsonData['componentuuid'], jsonData['componentname'], jsonData['componentdescription']);
};

module.exports = MachineResponse;