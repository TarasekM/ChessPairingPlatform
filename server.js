var express = require('express');
var path = require('path');
const bent = require('bent');
var bodyParser = require('body-parser');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var app = express();
// parse application/json
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.static(__dirname + '/static'));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

var port = 3000
var apiURL = 'http://localhost:64936/';
var endpoints = {
    'createTournament': 'api/TournamentModels'
};

app.get('/', function(req, res){
    res.render('index');
});

app.get('/CreateTournament', function(req, res){
        res.render('createTournament');
});

const post = bent(apiURL, 'POST', 'json', 200);

app.post('/postTournament', urlencodedParser, async(req, res) =>{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiURL + endpoints.createTournament, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                res.redirect('/')
            } else {
                res.send(xhr.status)
            }
        }
    };
    xhr.onerror = function (e) {
    console.error(xhr.statusText);
    };
    xhr.send(
        JSON.stringify({
            Title: req.body.Title,
            PairingSystem: req.body.PairingSystem,
            Date: req.body.Date
            }
        )
    );

});


app.get('/tournament', function(req, res){ 
    
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

app.listen(port, () => console.log(`Listening on port ${port}!`))