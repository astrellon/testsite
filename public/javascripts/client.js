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
    if (!$.isArray(data)) {
        data = [data];
    }
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var id = item._id;
        $("ul.items [data-id='" + id + "']>.item").html(item.text);
    }
});
socket.on('removeItems', function(data) {
    console.log("Remove items: ", data);
    $("ul.items [data-id='" + data + "'").slideUp(400).fadeOut(400, function() {
        $(this).remove();
    });
});
socket.on('removeAll', function() {
    $('ul.items [data-id]').slideUp(400).fadeOut(400, function() {
        $(this).remove();
    });
});

var buttonTemplate = doT.template('<input type="button" class="{{=it.klass}}" value="{{=it.value}}"/>');
var itemTemplate = doT.template('<li data-id="{{=it.id}}"><span class="item">{{=it.text}}</span></li>');
function processItem(item) {
    var el = $(itemTemplate({id: item._id, text: item.text}));
    el.append(buttonTemplate({klass: 'remove', value: 'Remove'}));
    el.append(buttonTemplate({klass: 'update', value: 'Update'}));
    el.appendTo("ul.items").hide().fadeIn();
}

function createItem(text) {
    socket.emit('addItem', {text: text});
}
function removeItem(id) {
    socket.emit('removeItem', id);
}
function updateItem(id, text) {
    socket.emit('updateItem', {id: id, item: {text: text}});
}
function showUpdate(id) {
    $('.itemSubmission .submitText').attr('updating', id).val()
    $('.itemSubmission .submit').slideUp();
    $('.itemSubmission .update').slideDown();
}
function closeUpdate() {
    $('.itemSubmission .submitText').removeAttr('updating');
    $('.itemSubmission .submit').slideDown();
    $('.itemSubmission .update').slideUp();
}
function removeAll() {
    $.get("/drop", function(resp) {
        console.log("Dropped:" , resp);
    });
}

$(function() {
    var tempFn = doT.template("<div>Yo {{=it.name}}</div>");
    $("#header").append(tempFn({name: 'Melli'}));
    $('ul.items').on('click', '.remove', function() {
        var id = $(this).parent().attr("data-id");
        if (id) {
            removeItem(id);
        }
    })
    .on('click', '.update', function() {
        var id = $(this).parent().attr("data-id");
        if (id) {
            showUpdate(id);
        }
    });

    $('.itemSubmission .submit').click(function() {
        var field = $(this).closest('.itemSubmission').find('.submitText');
        var submitText = field.val();
        field.val('');
        createItem(submitText);
    });

    $('.itemSubmission').on('click', 'input.update', function() {
        var area = $('.itemSubmission .submitText');
        var id = area.attr('updating');
        if (!id) {
            closeUpdate();
            return;
        }
        updateItem(id, area.val());
        closeUpdate();
    })
    .on('click', 'input.cancel', function() {
        closeUpdate();
    });

 });
