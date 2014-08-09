exports.init = function(mongoDb, callback) {

}

exports.findById = function(db, collectionName, id, callback) {
    if (typeof(callback) !== "function") {
        console.log("Cannot find by id '" + id + "' without a callback");
        return;
    }
    db.collection(collectionName, function(err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(id)}, function(err, item) {
            callback(err, item);
        });
    });
}
exports.findAll = function(db, collectionName, callback) {
    if (typeof(callback) !== "function") {
        console.log("Cannot find all without a callback");
        return;
    }
    db.collection(collectionName, function(err, collection) {
        if (err) {
            callback(err, null);
            return;
        }
        collection.find().toArray(function(err, items) {
            callback(err, items);
        });
    });
}
exports.addItem = function(db, collectionName, item, callback) {
    item._timestamp = (new Date()).getTime();
    db.collection(collectionName, function(err, collection) {
        collection.insert(item, {safe: true}, function(err, result) {
            if (typeof(callback) === "function") {
                callback(err, result);
            }
        });
    })
}
exports.deleteItem = function(db, collectionName, id, callback) {
    db.collection(collectionName, function(err, collection) {
        if (err && typeof(callback) === "function") {
            callback(err, null);
            return;
        }
        var objId = {'_id': new BSON.ObjectID(id)};
        collection.remove(objId, {safe: true}, function(err, result) {
            if (typeof(callback) === "function") {
                callback(err, result);
            }
        });
    });
}
exports.updateItem = function(db, collectionName, id, item, callback) {
    db.collection(collectionName, function(err, collection) {
        if (err) {
            if (typeof(callback) === "function") {
                callback(err, null);
            }
            return;
        }
        var objId = {'_id': new BSON.ObjectID(id)};
        collection.findOne({'_id': new BSON.ObjectID(id)}, function(err, origItem) {
            if (err) {
                if (typeof(callback) === "function") {
                    callback(err, null);
                }
                return;
            }
            var merged = {};
            utils.mergeObjects(merged, origItem, item);
            collection.update(objId, merged, {safe: true}, function(err, result) {
                if (typeof(callback) === "function") {
                    callback(err, result);
                }
            });
        });
    });
}
exports.deleteAll = function(db, collectionName, callback) {
    db.dropCollection(collectionName, function(err, result) {
        if (typeof(callback) === "function") {
            callback(err, result);
        }
    });
}
