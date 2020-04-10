var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var methodOverride = require('method-override');
var app = express();

// parse application/json
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(__dirname + '/static'));
// serve put requests
app.use(methodOverride('_method'));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

var port = 3000
var apiURL = 'http://localhost:64936/';
var pairingUrl = "/pairTournament"

var endpoints = {
    'tournament': 'api/TournamentModels',
    'players': 'api/PlayerModels',
    'highscore': '/highscore',
    'pair': '/pair',
    'setScores': '/setScores'

};

var pointsOptions = ['1 - 0', '0.5 - 0.5', '0 - 1']
var tournamentSystems = ['Kołowy', 'Szwajcarski', 'Pucharowy']

app.get('/', function(req, res){
    res.render('index');
});

app.get('/CreateTournament', function(req, res){
        res.render('createTournament', { tournamentSystems: tournamentSystems });
});

app.post('/postTournament', urlencodedParser, async(req, res) =>{
    
    redirect = '/editTournament'
    data = JSON.stringify(req.body)
    url = apiURL + endpoints.tournament
    postXHRRequest(url, data, redirect, res);
});

app.get('/editTournament', async(req, res) =>{
    var url = apiURL + endpoints.tournament + "/" + req.query.id
    var playersUrl = apiURL + endpoints.players + "/" + req.query.id
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", playersUrl, true);

    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200){
                players = JSON.parse(xhr.responseText)
                sendDataToEdit(res, url, players)
            }else{
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send();
});

async function sendDataToEdit(res, url, players){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200){
                tournamentData = JSON.parse(xhr.responseText)
                var optionValue = tournamentData.pairingSystem
                res.render('editTournament', {
                    tournamentSystems: tournamentSystems, 
                    optionValue: optionValue,
                    date: substringDate(tournamentData.date),
                    players: players,
                    pairingUrl: pairingUrl,
                    tournamentID: tournamentData.id
                });
            }else{
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send();
}

app.post('/putTournament', urlencodedParser, function(req, res){ 
    var tournamentID = req.query.id;
    var redirect = '/editTournament' + '?id=' + tournamentID
    var url = apiURL + endpoints.tournament + "/" + tournamentID;
    var data = JSON.stringify(req.body)
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                res.redirect(redirect);
            } else {
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send(data);
});

app.post('/editPlayerName', urlencodedParser, (req,res)=>{
    var data = JSON.stringify(req.body);
    var url = (apiURL + endpoints.players + "/" + req.query.playerID)
    var tournamentID = req.query.tournamentID
    var redirect = '/editTournament' + '?id=' + tournamentID

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");    
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                res.redirect(redirect)
            } else {
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send(data);
});

app.post('/postPlayer', urlencodedParser, async(req, res) => {
    var tournamentId = req.query.id
    redirect = '/editTournament' + '?id=' + tournamentId
    data = JSON.stringify(req.body);
    url = (apiURL + endpoints.players + '/' + req.query.id);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                res.redirect(redirect)
            } else {
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send(data);
});

app.post('/deletePlayer', (req, res)=>{
    var playerID = req.query.playerID;
    var tournamentID = req.query.tournamentID;
    var url = (
            apiURL + endpoints.players +
            '/' + tournamentID +
            '/' + playerID
        );

    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url, true);
    xhr.setRequestHeader("Content-Type", "application-x-www-form-urlencoded");
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            res.sendStatus(xhr.status)
        }
    };
    xhr.send();
});

app.get('/standings', (req, res)=>{
    var tournamentID = req.query.id;
    var url = (apiURL + endpoints.tournament + '/' +
               tournamentID + endpoints.highscore);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(this.responseText)
                res.render('standings', { 
                    data: data,
                    tournamentID: tournamentID,
                    pairingUrl: pairingUrl
                });
            } else {
                res.sendStatus(xhr.status);
            }
        }
    };
    xhr.send();
});

app.get('/pairTournament', (req, res)=>{
    var tournamentID = req.query.id
    var tournamentDataURL = (apiURL + endpoints.tournament +
        "/" + tournamentID);
    var url = (apiURL + endpoints.tournament + '/' +
               tournamentID + endpoints.pair);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", tournamentDataURL, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var tournamentData = JSON.parse(this.responseText)
                sendPairingsToRes(res, url, tournamentData);
            } else {
                res.sendStatus(xhr.status);
            }
        }
    };
    xhr.send();
});

function sendPairingsToRes(res, url, tournamentData){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var pairings = JSON.parse(this.responseText)
                res.render("pairings",
                    { 
                        tournamentData: tournamentData,
                        pairings: pairings,
                        pairingUrl: pairingUrl,
                        pointsOptions: pointsOptions,
                        tournamentID: tournamentData.id
                    });
            } else {
                res.sendStatus(xhr.status);
            }
        }
    };
    xhr.send();
}

app.post('/sendScores', jsonParser, async(req, res)=>{
    var tournamentID = req.query.id;
    var redirect = '/standings' + '?id=' + tournamentID
    var scores = JSON.stringify(req.body);
    var url = (apiURL + endpoints.tournament + "/" +
               tournamentID + endpoints.setScores);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                res.send(redirect);
            } else {
                res.sendStatus(xhr.status);
            }
        }
    };
    xhr.send(scores);
});

app.get('/FindTournament', function(req, res){
    var url = apiURL + endpoints.tournament;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200){
                tournaments = JSON.parse(xhr.responseText)
                res.render('findTournament', {
                    tournaments: tournaments
                });
            }else{
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send();
});

app.post('/deleteTournament', (req, res)=>{
    var tournamentID = req.query.id;
    var url = (
            apiURL + endpoints.tournament +
            '/' + tournamentID
        );
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url, true);
    xhr.setRequestHeader("Content-Type", "application-x-www-form-urlencoded");
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            res.sendStatus(xhr.status)
        }
    };
    xhr.send();
});

app.get('/Info', function(req, res){
    res.render('info');
});

app.get('/Contact', function(req, res){
    res.render('contact');
});

function postXHRRequest(url, data, redirect_point, res){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                responseText = JSON.parse(this.responseText) 
                res.redirect(redirect_point + '?id=' + responseText.id)
            } else {
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send(data);
}

function substringDate(date){
    return date.substring(0, 10);
}

app.listen(port, () => console.log(`Listening on port ${port}!`))