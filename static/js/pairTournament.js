function scoreListener(){
    var defaultValue = "---";
    var scores = $("select");
    var nextRoundButton = $("#nextRoundButton");
    for (let i in scores){
        if (scores[i].value == defaultValue)
        {
            nextRoundButton.prop("disabled", true);
            return null;
        }
    }
    nextRoundButton.prop("disabled", false);
    return null;
}

function nextRound(){
    var data = getScoreData();
    var id = $('#id')[0].value;
    var url = "http://localhost:3000/sendScores?id=" + id;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                window.location.href = xhr.responseText;
            } else {
            }
        }
    };
    xhr.send(data);
}

function getScoreData(){
    var scores = $("select");
    var data = [];
    for(i = 0; i < scores.length; i++){
        var score = parseScore(scores[i].value);
        var white = $('#white' + i)[0].value;
        var black = $('#black' + i)[0].value;
        var pairData = {
            "white" :
            {
                "id": white,
                "score": score[0]            
            },
            "black":{
                "id": black,
                "score": score[1]
            }
        };
        data.push(pairData);
    }
    return JSON.stringify(data); 
}

function parseScore(score){
    var out = score.replace(" ", "").split("-")
    return out;
}