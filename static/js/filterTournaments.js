function filter(){
    var edit = $('#id')[0];
    var value = edit.value.toLowerCase();
    var lenValue = value.length;
    if (lenValue != 0){
        filterByValue(value, lenValue);
    }else{
        showAll();
    }
}

function filterByValue(value, lenValue){
    var cards = $('.card');
    for(i = 0; i < cards.length; i++){
        var card = cards[i];
        var cardBody = $(card).children('.card-body');
        var title = $(cardBody).children('.card-title')[0].innerHTML;
        title = title.substring(16).toLowerCase();
        var subTitle = title.substring(lenValue, 0);

        if(subTitle == value){
            $(card).css('display', 'flex')
        }else{
            $(card).css('display', 'none')
        }
    }
}

function showAll(){
    var cards = $('.card');
    for(let i in cards){
        var card = cards[i];
        $(card).css('display', 'flex')
    }
}