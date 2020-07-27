// This config gets the important strings needed to
// connect to the Genesys Cloud API and OAuth service
//
// Storing these here is insecure for a public app
// These are being pulled form a file ".env" in the node.js
// directory that is part of the .gitignore
var config = {};
async function getConfig() {
    const response = await fetch('/config');
    console.log(response);
    return response.json();
}

// Called when web page first loads and when
// the OAuth flow returns to the page
//
// This function parses the access token in the URI if available
// It also adds a link to the Genesys Cloud connect button
$(document).ready(function() {
    var accessToken = Cookies.get("accessToken");
    var hasAuth = accessToken && accessToken.length > 0;
    updateUIWithAuthState(hasAuth);

    $("#connectbutton").click(async function() {
        config = await getConfig();
        var obj = {
            start: $('#start-date-one').val().trim(),
            end: $('#end-date-one').val().trim(),
            region: config.region,
            clientId: config.clientId,
            authUrl: config.authUrl,
            redirectUri: config.redirectUri
        };
        tableau.connectionData = obj; //JSON.stringify(dateObj);
        doAuthRedirect();
    });

    $("#getdatabutton").click(async function() {
        config = await getConfig();
        var obj = {
            start: $('#start-date-one').val().trim(),
            end: $('#end-date-one').val().trim(),
            region: config.region,
            clientId: config.clientId,
            authUrl: config.authUrl,
            redirectUri: config.redirectUri
        };
        tableau.connectionData = obj; //JSON.stringify(dateObj);
        tableau.connectionName = "Genesys Cloud Data";
        tableau.submit();
    });
});

// An on-click function for the connect to Genesys Cloud button,
// This will redirect the user to a Genesys Cloud login
function doAuthRedirect() {
    var appId = tableau.connectionData.clientId;
    if (tableau.authPurpose === tableau.authPurposeEnum.ephemerel) {
        appId = tableau.connectionData.clientId; // This should be Desktop
    } else if (tableau.authPurpose === tableau.authPurposeEnum.enduring) {
        appId = tableau.connectionData.clientId; // This should be the Tableau Server appID
    }

    var url = tableau.connectionData.authUrl + '?response_type=code&client_id=' + appId +
        '&redirect_uri=' + tableau.connectionData.redirectUri;
    window.location.href = url;
}

// This function toggles the label shown depending
// on whether or not the user has been authenticated
function updateUIWithAuthState(hasAuth) {
    if (hasAuth) {
        $(".notsignedin").css('display', 'none');
        $(".signedin").css('display', 'block');
    } else {
        $(".notsignedin").css('display', 'block');
        $(".signedin").css('display', 'none');
    }
}

//------------- Tableau WDC code -------------//
// Create tableau connector, should be called first
var myConnector = tableau.makeConnector();

// Init function for connector, called during every phase but
// only called when running inside the simulator or tableau
myConnector.init = function(initCallback) {
    tableau.authType = tableau.authTypeEnum.custom;

    // If we are in the auth phase we only want to show the UI needed for auth
    if (tableau.phase == tableau.phaseEnum.authPhase) {
        $("#getdatabutton").css('display', 'none');
    }

    if (tableau.phase == tableau.phaseEnum.gatherDataPhase) {
        // If the API that WDC is using has an endpoint that checks
        // the validity of an access token, that could be used here.
        // Then the WDC can call tableau.abortForAuth if that access token
        // is invalid.
    }

    var accessToken = Cookies.get("accessToken");
    console.log("Access token is '" + accessToken + "'");
    var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length > 0;
    updateUIWithAuthState(hasAuth);

    initCallback();

    // If we are not in the data gathering phase, we want to store the token
    // This allows us to access the token in the data gathering phase
    if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
        if (hasAuth) {
            tableau.password = accessToken;

            if (tableau.phase == tableau.phaseEnum.authPhase) {
                // Auto-submit here if we are in the auth phase
                tableau.submit()
            }

            return;
        }
    }
};

// Declare the data to Tableau that we are returning from Genesys Cloud
myConnector.getSchema = function(schemaCallback) {
    console.log("getSchema")
    var schema = [];
    var col1 = { id: "conversationId", dataType: "string" };
    var col2 = { id: "mediaType", dataType: "string" };
    var cols = [col1, col2];
    var tableInfo = {
        id: "GenesysCloud",
        columns: cols
    }
    schema.push(tableInfo);
    schemaCallback(schema);
};

// This function actually make the Genesys Cloud API call and
// parses the results and passes them back to Tableau
myConnector.getData = function(table, doneCallback) {
    var dataToReturn = [];
    var hasMoreData = false;
    var accessToken = tableau.password;

    //The Genesys Cloud Data Query....
    console.log(tableau.connectionData.start);
    console.log(tableau.connectionData.end);
    var xhr = $.ajax({
        url: "https://api." + tableau.connectionData.region + "/api/v2/analytics/conversations/aggregates/query",
        type: "POST",
        contentType: "application/json",
        data: "{\"interval\": \"" + tableau.connectionData.start + "/" + tableau.connectionData.end + "\", \"timeZone\": \"Australia/Melbourne\", \"groupBy\": [\"conversationId\"], \"metrics\": [\"nConnected\"]}",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'bearer ' + accessToken);
        },
        success: function(data) {
            console.log(data)
            if (data) {
                var root = data.results;
                var ii;
                for (ii = 0; ii < root.length; ++ii) {
                    var venue = {
                        'conversationId': root[ii].group.conversationId,
                        'mediaType': root[ii].group.mediaType
                    };
                    dataToReturn.push(venue);
                }

                table.appendRows(dataToReturn);
                doneCallback();
            } else {
                tableau.abortWithError("No results found");
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
            // WDC should do more granular error checking here
            // or on the server side.  This is just a sample of new API.
            tableau.abortForAuth("Invalid Access Token");
        }
    });
};

// Register the tableau connector, call this last
tableau.registerConnector(myConnector);