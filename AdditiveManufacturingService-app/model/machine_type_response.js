/**
 * Created by beuttlerma on 21.02.17.
 */

function MachineTypeResponse(id, name) {
    this.id = id;
    this.name = name;
}

/**
 *
 * @param jsonData
 * @returns {*}
 * @constructor
 */
MachineTypeResponse.CreateFromJSON = MachineTypeResponse.prototype.CreateFromJSON = function (jsonData) {

    if (!jsonData) {
        return null;
    }

    return new MachineTypeResponse(jsonData['id'], jsonData['name']);
};

module.exports = MachineTypeResponse;