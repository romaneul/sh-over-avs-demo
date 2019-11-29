# Prerquisetes:

- Node v12.11 (node -v)
- Alexa Mobile App (iOS or Android)
- Amazon developer account

# Create AVS Device

- Go to  https://developer.amazon.com/alexa/console/avs/products/new & 
- In Step 1/2: 
  - Select "Applicaton with Alexa built-in
  - Fill out all mandatory fields
- In Step 2/2:
  - Create a new Security Profile
  - Add http://localhost:8080/callback to Allowed return URLs

# Configure AVS Client

1. `git clone https://github.com/romaneul/sh-over-avs-demo.git`
2. `cd sh-over-avs-demo`
3. `npm install`
4. Update the `.env` file:
   ```
   LWA_CLIENT_ID=<LWA Client ID from your Security Profile>
   LWA_CLIENT_SECRET=<LWA Client Secret from your Security Profile>
   LWA_SCOPE="alexa:all"
   LWA_REDIRECT_PORT=8080
   AVS_PRODUCT_ID=<Your AVS Product ID>
   AVS_ENDPOINT=https://alexa.eu.gateway.devices.a2z.com
   ```
5. Run `node bin/login.js`
   - Login with your Amazon account (use the same account in the Alexa app)
6. node bin/avs-sh-gateway.js



# Explore the AVS SH Client
- Run a Proactive Discovery 
- Control device via voice
- Control device via app
- view change state report

* Add brigthness controller
* Add Endpoint health

* add thermostat device

* add event handler for brightness controller
