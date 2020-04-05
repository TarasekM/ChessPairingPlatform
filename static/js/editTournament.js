async function result(route){
    var confirmation = confirm("Czy chcesz usunąć użytkownika?");
    if (confirmation){
        await $.post(route);
        location.reload();
    }
}
