// -------------------------------------------------- //
// Module Dependencies
// -------------------------------------------------- //
var express = require('express');
var cookieParser = require('cookie-parser');
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var path = require('path');
var sys = require('util');
require('dotenv').config();
var app = express();

// -------------------------------------------------- //
// Variables
// -------------------------------------------------- //
var clientID = process.env.GENESYSCLOUD_CLIENT_ID;
var clientSecret = process.env.GENESYSCLOUD_CLIENT_SECRET;
var region = process.env.GENESYSCLOUD_REGION || 'mypurecloud.com.au';
var port = process.env.PORT || '3333';
var redirectPath = process.env.REDIRECT_PATH || '/redirect';
var hostPath = process.env.HOSTPATH || 'http://localhost';
var redirectURI = hostPath + ":" + port + redirectPath;

if (!(clientID && clientSecret)) {
    console.error('CLIENTID & CLIENT_SECRET are not correct.');
    process.exit(-1);
}

// -------------------------------------------------- //
// Express set-up and middleware
// -------------------------------------------------- //
app.set('port', port);
app.use(cookieParser()); // cookieParser middleware to work with cookies
app.use(express.static(__dirname + '/public'));

// -------------------------------------------------- //
// Routes
// -------------------------------------------------- //

app.get('/', function(req, res) {
    console.log("got here");
    res.redirect('/index.html');
});

app.get('/config', function(req, res) {
    console.log("getting config");
    res.send({
        region: region,
        clientId: clientID,
        redirectUri: redirectURI,
        authUrl: 'https://login.' + region + '/oauth/authorize'
    });
});

// This route is hit once Genesys Cloud redirects to our
// server after performing authentication
app.get('/redirect', function(req, res) {
    // get our authorization code
    authCode = req.query.code;
    console.log("Auth Code is: " + authCode);

    // Set up a request for an long-lived Access Token now that we have a code
    var requestObject = {
        'client_id': clientID,
        'redirect_uri': redirectURI,
        'client_secret': clientSecret,
        'code': authCode,
        'grant_type': 'authorization_code'
    };

    var token_request_header = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    // Build the post request for the OAuth endpoint
    var options = {
        method: 'POST',
        url: 'https://login.' + region + '/oauth/token',
        form: requestObject,
        headers: token_request_header
    };

    // Make the request
    request(options, function(error, response, body) {
        if (!error) {
            // We should receive  { access_token: ACCESS_TOKEN }
            // if everything went smoothly, so parse the token from the response
            body = JSON.parse(body);
            var accessToken = body.access_token;
            console.log('accessToken: ' + accessToken);

            // Set the token in cookies so the client can access it
            res.cookie('accessToken', accessToken, {});

            // Head back to the WDC page
            res.redirect('/index.html');
        } else {
            console.log(error);
        }
    });
});


// -------------------------------------------------- //
// Create and start our server
// -------------------------------------------------- //
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});