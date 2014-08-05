function send(url, method, data) {
    $.ajax(url, {
        type: method,
        data: data ? JSON.stringify(data) : undefined, 
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    });
}
function createItem(text) {
    send('/items', 'POST', {text: text});
    refreshPage();
}
function removeItem(id) {
    send('/items/' + id, 'DELETE');
    refreshPage();
}
function updateItem(id, text) {
    send('/items/' + id, 'PUT', {text: text});
    refreshPage();
}
function removeAll() {
    send('/items/', 'DELETE');
    refreshPage();
}
function refreshPage() {
    window.location.href = window.location.href;
}
function showUpdate(id) {
    var area = $('.itemSubmission .submitText');
    var text = $("li[item-id='" + id + "'] .text").text();
    area.val($(this).parent().find('.text'));
    $('.itemSubmission .submitText').attr('updating', id).val(text);
    $('.itemSubmission .submit').slideUp();
    $('.itemSubmission .update').slideDown();
}
function closeUpdate() {
    $('.itemSubmission .submitText').val('').removeAttr('updating');
    $('.itemSubmission .submit').slideDown();
    $('.itemSubmission .update').slideUp();
}

$(function() {
    $('ul.items').on('click', '.remove', function() {
        var id = $(this).parent().attr("item-id");
        if (id) {
            removeItem(id);
        }
    })
    .on('click', '.update', function() {
        var id = $(this).parent().attr("item-id");
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
