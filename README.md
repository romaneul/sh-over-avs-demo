# Prerequisites:

- Node v12.11 (node -v)
- Alexa Mobile App (iOS or Android)
- Amazon developer account

# Create your AVS Device

- Go to  https://developer.amazon.com/alexa/console/avs/products/new 
- In Step 1/2: 
  - Select "Application with Alexa built-in"
  - Fill out all mandatory fields
  ![](https://github.com/romaneul/sh-over-avs-demo/blob/master/img/avs_setup_1.png)
- In Step 2/2:
  - Create a new Security Profile
  - Add `http://localhost:8080/callback` to the `Allowed return URLs`
    ![](https://github.com/romaneul/sh-over-avs-demo/blob/master/img/avs_setup_2.png)

# Configure the AVS Client

1. Run `git clone https://github.com/romaneul/sh-over-avs-demo.git`
2. `cd sh-over-avs-demo`
3. `npm install`
4. Update the `.env` file:
   ```
   LWA_CLIENT_ID=<LWA Client ID from your Security Profile>
   LWA_CLIENT_SECRET=<LWA Client Secret from your Security Profile>
   LWA_SCOPE="alexa:all"
   LWA_REDIRECT_PORT=8080
   AVS_PRODUCT_ID=<Your AVS Product ID>
   AVS_ENDPOINT=<Select appropriate endpoint from the link below; e.g. https://alexa.eu.gateway.devices.a2z.com>
   ```
   **Select the appropriate `AVS_ENDPOINT` from [here](https://developer.amazon.com/docs/alexa-voice-service/api-overview.html#endpoints).**
5. Run `node bin/login.js`
   - Login with your Amazon account (use the same account in the Alexa app)


# Exercises 

1. Explore the AVS SH Client Code [10 Minutes]
- `authClient.js` implements the LWA logic and Token management
- `avsClient.js` manages the HTTP2 connection for AVS
- `/events` contains a set of Alexa Smart Home Events


2. Discover and Control a Light device [5 Minutes]
- Run `node bin/avs-sh-gateway.js` to start the AVS SH Client
- Run a Proactive Discovery - this will send the Event `events/discovery.json`
- Control device via voice: "Alexa, turn on living room"
- Control device via app


3. Change the Light device [5 Minutes]
- Change the FriendlyName in `events/discovery.json`
- Re-run Discovery
- Control the device with the new name

4. Extend the Light device [10 Minutes]
- Add a BrightnessController: https://developer.amazon.com/docs/device-apis/alexa-brightnesscontroller.html
- Add a EndpointHealth: https://developer.amazon.com/docs/device-apis/alexa-endpointhealth.html 

5. Add a Thermostat device [10 Minutes]
- Extent the `endpoints` array in `events/discovery.json`
- Add a ThermostatController https://developer.amazon.com/docs/device-apis/alexa-thermostatcontroller.html

6.  Challenge: Add a device with Range or Mode Controller
- https://developer.amazon.com/docs/device-apis/alexa-rangecontroller.html
- https://developer.amazon.com/docs/device-apis/alexa-modecontroller.html



