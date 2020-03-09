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
var endpoints = {
    'tournament': 'api/TournamentModels',
    'players': 'api/PlayerModels',
    'highscore': '/highscore'

};

var tournamentSystems = ['Kołowy', 'Szwajcarski', 'Pucharowy']

app.get('/', function(req, res){
    res.render('index');
});

app.get('/CreateTournament', function(req, res){
        res.render('createTournament', { tournamentSystems: tournamentSystems });
});

app.post('/postTournament', urlencodedParser, async(req, res) =>{
    
    redirect = '/editTournament'
    data = JSON.stringify({
                Title: req.body.Title,
                PairingSystem: req.body.PairingSystem,
                Date: req.body.Date
                }
            )
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
                });
            }else{
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send();
}

app.post('/putTournament', urlencodedParser, function(req, res){ 
    url = apiURL + endpoints.tournament + "/" + req.query.id
    data = JSON.stringify(req.body)
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
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
});

app.post('/editPlayerName', urlencodedParser, (req,res)=>{
    var data = req.body
    var url = (apiURL + endpoints.players + "/" + req.query.playerID
            + '?Name=' + data.Name)
    var tournamentID = req.query.tournamentID
    var redirect = '/editTournament' + '?id=' + tournamentID

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 204) {
                res.redirect(redirect)
            } else {
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send();
});

app.post('/postPlayer', urlencodedParser, async(req, res) => {
    var tournamentId = req.query.id
    redirect = '/editTournament' + '?id=' + tournamentId
    data = req.body
    url = (apiURL + endpoints.players +
           '/' + req.query.id + '?Name=' + data.Name);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                res.redirect(redirect)
            } else {
                res.sendStatus(xhr.status)
            }
        }
    };
    xhr.send();
});

app.get('/standings', (req, res)=>{
    var tournamentID = req.query.id
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
                });
            } else {
                res.sendStatus(xhr.status);
            }
        }
    };
    xhr.send();
});

app.get('/FindTournament', function(req, res){
    res.render('findTournament');
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
                res.send(xhr.status)
            }
        }
    };
    xhr.send(data);
}

function substringDate(date){
    return date.substring(0, 10);
}

app.listen(port, () => console.log(`Listening on port ${port}!`))