/**
 * Created by beuttlerma on 21.02.17.
 */

function UserResponse(id, firstname, lastname) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
}

/**
 *
 * @param jsonData
 * @returns {*}
 * @constructor
 */
UserResponse.CreateFromCoreJSON = UserResponse.prototype.CreateFromCoreJSON = function (jsonData) {

    if (!jsonData) {
        return null;
    }

    return new UserResponse(
        jsonData['id'],
        jsonData['firstname'],
        jsonData['lastname']
    )
};

module.exports = UserResponse;