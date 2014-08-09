exports.mergeObjects = function(dest, obj1, obj2) {
    for (var prop in obj1) {
        dest[prop] = obj1[prop];
    }
    for (var prop in obj2) {
        dest[prop] = obj2[prop];
    }
}

