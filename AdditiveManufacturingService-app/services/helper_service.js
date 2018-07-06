/**
 * Created by beuttlerma on 09.03.16.
 */

const self = {
    clone: function clone(a) {
        return JSON.parse(JSON.stringify(a));
    },
    isObject: function isObject(a) {
        return (!!a) && (a.constructor === Object);
    },
    isArray: function isArray(a) {
        return (!!a) && (a.constructor === Array);
    }
};

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */

self.shuffleArray = function (a) {
    let j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }

    return a;
};


module.exports = self;