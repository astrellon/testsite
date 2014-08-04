function createItem(text) {
    $.post('/items', {text: text}, null, "json");
    //socket.emit('addItem', {text: text});
}
function removeItem(id) {
    //socket.emit('removeItem', id);
}
function updateItem(id, text) {
    //socket.emit('updateItem', {id: id, item: {text: text}});
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
