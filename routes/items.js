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
exports.findAll = function(req, res) {
    db.collection(collectionName, function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
}
exports.addItem = function(req, res) {
    var item = req.body;
    console.log('Adding item: ' + JSON.stringify(item));
    db.collection(collectionName, function(err, collection) {
        collection.insert(item, {safe: true}, function(err, result) {
            if (err) {
                res.send({'error': 'An error has occured'});
            }
            else {
                res.send(result[0]);
            }
        });
    })
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
exports.deleteItem = function(req, res) {
    var id = req.params.id;
    console.log('Deleting item: ' + id);
    db.collection(collectionName, function(err, collection) {
        collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function(err, result) {
            if (err) {
                res.send({'error': 'An error has occured - ' + err});
            }
            else {
                console.log('' + result + ' items deleted');
                res.send(req.body);
            }
        });
    });
}
