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