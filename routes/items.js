var mongo = require('mongodb');

var BSON = mongo.BSONPure;
var server = new mongo.Server('localhost', 27017, {auto_reconnect: true});
var db = new mongo.Db('testdb', server);
var collectionName = 'testcollection';
var io = null;

exports.setIo = function(i) {
    io = i;
}

db.open(function(err, db) {
    if (!err) {
        db.collection(collectionName, {strict: true}, function(err, collection) {
            if (err) {
                console.log("Could not find 'testcollection'");
            }
        });
    }
})

exports.findById = function(req, res) {
    var id = req.params.id;
    db.collection(collectionName, function(err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
}
function findAll(callback) {
    db.collection(collectionName, function(err, collection) {
        if (err && typeof(callback) === "function") {
            callback(err, null);
            return;
        }
        collection.find().toArray(function(err, items) {
            if (typeof(callback) === "function") {
                callback(err, items);
            }
        });
    });
}
exports.findAll = function(req, res) {
    findAll(function(err, items) {
        res.send(items);
    });
}

function addItem(item, callback) {
    item._timestamp = (new Date()).getTime();
    db.collection(collectionName, function(err, collection) {
        collection.insert(item, {safe: true}, function(err, result) {
            if (typeof(callback) === "function") {
                callback(err, result);
            }
            if (io) {
                io.emit('items', result[0]);
            }
        });
    })
}
function deleteItem(id, callback) {
    db.collection(collectionName, function(err, collection) {
        if (err && typeof(callback) === "function") {
            callback(err, null);
            return;
        }
        var objId = {'_id': new BSON.ObjectID(id)};
        collection.remove(objId, {safe: true}, function(err, result) {
            if (io) {
                io.emit('removeItems', [id]);
            }
            if (typeof(callback) === "function") {
                callback(err, result);
            }
        });
    });
}
function mergeObjects(dest, obj1, obj2) {
    for (var prop in obj1) {
        dest[prop] = obj1[prop];
    }
    for (var prop in obj2) {
        dest[prop] = obj2[prop];
    }
}
function updateItem(id, item, callback) {
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
            mergeObjects(merged, origItem, item);
            collection.update(objId, merged, {safe: true}, function(err, result) {
                if (typeof(callback) === "function") {
                    callback(err, result);
                }
                if (!err && io) {
                    io.emit('updateItems', [merged]);
                }
            });
        });
    });
}
function deleteAll(callback) {
    db.dropCollection(collectionName, function(err, result) {
        if (typeof(callback) === "function") {
            callback(err, result);
        }
        if (!err) {
            io.emit('removeAll');
        }
    });
}
exports.addItem = function(req, res) {
    var item = req.body;
    addItem(item, function(err, result) {
        if (err) {
            res.send({'error': 'An error has occured'});
        }
        else {
            res.send(result[0]);
        }
    });
}
exports.updateItem = function(req, res) {
    var id = req.params.id;
    var item = req.body;
    updateItem(id, item, function(err, result) {
        if (err) {
            console.log('Error updating item: ' + err);
            res.send({'error': 'An error has occured'});
        }
        else {
            console.log('' + result + ' items updated');
            res.send(item);
        }
    });
}

exports.deleteItem = function(req, res) {
    var id = req.params.id;
    deleteItem(id, function(err, result) {
        if (err) {
            res.send({'error': 'An error has occured - ' + err});
        }
        else {
            console.log('' + result + ' items deleted');
            res.send(req.body);
        }
    });
}
exports.deleteAll = function(req, res) {
    deleteAll(function(err, result) {
        if (err) {
            res.send("Error dropping table: " + err);
        }
        else {
            res.send("Dropped collection: " + result);
        }
    });
}

exports.socketConnect = function(socket) {
    findAll(function(err, items) {
        socket.emit('items', items);
    });
}
exports.socketAdd = function(socket, data) {
    addItem(data, function(err, result) {
        if (err) {
            socket.emit('error', 'Unable to add item: ' + err);
        }
    });
}
exports.socketDelete = function(socket, id) {
    deleteItem(id, function(err, result) {
        if (err) {
            console.log("Error deleting items: " + err);
            socket.emit('error', 'Unable to delete item: ' + err);
        }
    });
}
exports.socketUpdate = function(socket, data) {
    var id = data["id"];
    var item = data["item"];
    updateItem(id, item, function(err, result) {
        if (err) {
            socket.emit('error', 'Update to update item: ' + err);
        }
    });
}
