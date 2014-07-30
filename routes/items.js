var mongo = require('mongodb');

var BSON = mongo.BSONPure;
var server = new mongo.Server('localhost', 27017, {auto_reconnect: true});
var db = new mongo.Db('testdb', server);
var collectionName = 'testcollection';

db.open(function(err, db) {
    if (!err) {
        console.log("Connected to database");
        db.collection(collectionName, {strict: true}, function(err, collection) {
            if (err) {
                console.log("Could not find 'testcollection'");
            }
        });
    }
})

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Get item by: ' + id);
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
        });
    })
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
    console.log('Updating item: ', id);
    console.log(JSON.stringify(item));
    db.collection(collectionName, function(err, collection) {
        collection.update({'_id': new BSON.ObjectID(id)}, item, {safe: true}, function(err, result) {
            if (err) {
                console.log('Error updating item: ' + err);
                res.send({'error': 'An error has occured'});
            }
            else {
                console.log('' + result + ' items updated');
                res.send(item);
            }
        });
    });
}

function deleteItem(id, callback) {
    console.log('Deleting item: ' + id);
    db.collection(collectionName, function(err, collection) {
        if (typeof(callback) === "function") {
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
    db.dropCollection(collectionName, function(err, result) {
        if (err) {
            res.send("Error dropping table: " + err);
        }
        else {
            res.send("Dropped collection: " + result);
        }
    });
}

exports.socketConnect = function(io, socket) {
    findAll(function(err, items) {
        console.log("EMITTING ITEMS TO CLIENT: ", items);
        socket.emit('items', items);
    });
}
exports.socketAdd = function(io, socket, data) {
    console.log("Adding new item via socket: ", data);
    addItem(data, function(err, result) {
        if (err) {
            socket.emit('error', 'Unable to add item');
        }
        else {
            io.emit('items', result[0]);
        }
    });
}
