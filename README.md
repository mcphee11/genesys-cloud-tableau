# genesys-cloud-tableau
Genesys Cloud Tableau web connector example built apon the https://github.com/tableau/webdataconnector examples. I also recommend getting this via "git clone" as there is the full Tableau SDK as well as a Simulator test tool that is very nice to use when building out and testing your connector.

This current example uses "Authorization code" grant to OAuth2 to your Genesys Cloud ORG environment. The first thing you will need to do is to get a ClientID and Secret for this OAuth2 type from your Genesys Cloud ORG with the ability to connect to the API endpoint you require for example the Scope of Analytics or Users. This will also need to have a redirect to the Node JS server url: "http://locahost:3333/redirect"

![](/docs/images/screenShot1.png?raw=true)

You will then need to configure the "client_id" & "client_secret" to your own as well as the ORG location. These are located in a ".env" file that is part of the ".gitignore", I have included a sample of this file called ".env_SAMPLE". You will need to copy this file and rename it to ".env" so the code can get the configuration. In my example im based in Australia so i have used "mypurecloud.com.au" if your in a different region this will need to be changed.

![](/docs/images/screenShot2.png?raw=true)

Once you have Created your OAuth, configured and renamed the ".env_SAMPLE" file to ".env" you can now install and run the connector. First you need to have "npm" installed. Then from this directory run "npm install" once the installation of required items is complete run "npm start". This will start the webserver.

In "Tableau Deaktop" go to a new "web connector" under "To Server > More". Here you will need to enter in the url of the webserver you have started in my eample "http://localhost:3333/index.html"

![](/docs/images/screenShot3.png?raw=true)

If you are not currently authenticaed in the session you will need to click on the "Genesys Cloud" image to get re-directed to the OAuth login screen to gain a token for the session.

![](/docs/images/screenShots4.png?raw=true)

Once you have entered in correct Genesys Cloud OAuth credentials NOTE: ensure you have configured the correct region so when you get redirected to the login you are logging into the correct region where your ORG is located. In my example im using the "/api/v2/analytics/conversations/aggregates/query" endpoint so I has configured this JSON payload with the query except for the "interval" range. I have made this part of the UI configuration to make it easier to select the date range through the web connector UI. This also enables a template that you can use to move more parts into the UI configuration for your use case if you wish to. To then progess click the "Get Data" button to load the Schema into Tableau.

![](/docs/images/screenShots5.png?raw=true)

Now that you have the Schema in Tableau that you created in the web connector, Click on the "Update now" button to getData requiest into the Tableau UI. From here you can move to the "sheet" view as you normally would or how ever else you wish to use this web connector data.

![](/docs/images/screenShot6.png?raw=true)

You now have data from Genesys Cloud inside Tableau Desktop. From here you can create your own schemas as well as endpoint queries to suite you needs.