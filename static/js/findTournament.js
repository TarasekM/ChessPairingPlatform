async function result(route){
    var confirmation = confirm("Czy chcesz usunąć turniej?");
    if (confirmation){
        await $.post(route);
        location.reload();
    }
}
