async function result(route){
    var confirmation = confirm("Czy chcesz usunąć użytkownika?");
    if (confirmation){
        await $.post(route);
        reload();
    }
}

function reload(){
    location.reload(true);
}