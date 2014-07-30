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
socket.on('error', function(data) {
    console.error("Socket error: ", data);
});
socket.on('updateItems', function(data) {
    console.log("Update items: ", data);
    //$("ul.items [data-id='" + data"'")
});
socket.on('removeItems', function(data) {
    console.log("Remove items: ", data);
    $("ul.items [data-id='" + data + "'").slideUp(400).fadeOut(400, function() {
        $(this).remove();
    });
});

function processItem(item) {
    var el = $("<li data-id='" + item._id + "'>" + JSON.stringify(item) + "</li>");
    el.append("<input type='button' class='remove' value='Remove'/>");
    el.appendTo("ul.items").hide().fadeIn();
}

function createItem() {
    socket.emit('addItem', {'notcrazy': 'notdata'});
}
function removeItem(id) {
    socket.emit('removeItem', id);
}
function updateItem(id) {
    socket.emit('updateItem', {id: id, data: {more: 'asd'}});
}
function removeAll() {
    $.get("/drop", function(resp) {
        console.log("Dropped:" , resp);
    });
}

$(function() {
    $('ul.items').on('click', '.remove', function() {
        var id = $(this).parent().attr("data-id");
        if (id) {
            removeItem(id);
        }
    });
 });
