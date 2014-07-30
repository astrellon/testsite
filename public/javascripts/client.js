// connect to the socket server
var socket = io('http://localhost');

// if we get an "info" emit from the socket server then console.log the data we recive
socket.on('items', function (data) {
    console.log('Items: ', data);
    if ($.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            processItem(data[i]);
        }
    }
    else {
        processItem(data);
    }
});

function processItem(item) {
    $("<li>" + JSON.stringify(item) + "</li>").appendTo("ul.items").hide().fadeIn();
}

function createItem() {
    socket.emit('addItem', {'notcrazy': 'notdata'});
}
function removeAll() {
    $.get("/drop", function(resp) {
        console.log("Dropped:" , resp);
    });
}
