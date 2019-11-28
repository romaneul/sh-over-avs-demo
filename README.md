# Prerquisetes:

1. Node v12.11 (node -v)
2. Alexa Mobile App (iOS or Android)
3. Amazon developer account

# Create AVS Device

1. https://developer.amazon.com/alexa/console/avs/products/new

- Step 1: Fill out all mandatory fields; Note down the Product ID
- Step 2:
  - Create a new Security Profile
  - Add http://localhost:8080/callback to Allowed return URLs

# Configure AVS Client

1. git clone https://github.com/romaneul/sh-over-avs.git
2. cd sh-over-avs
3. npm install
4. touch .env. Enter the following

   LWA_CLIENT_ID=amzn1.application-oa2-client.202f36b586644824be13f61d9520a602
   LWA_CLIENT_SECRET=c69f4043928c433b513c3c0426b34d4c5abb2fe6954bb0f58e884c3281fe3dab
   LWA_SCOPE="alexa:all"
   LWA_REDIRECT_PORT=8080
   AVS_PRODUCT_ID=123456
   AVS_ENDPOINT=https://alexa.eu.gateway.devices.a2z.com

5. node bin/login.js
   - Login with your Amazon account (use same account in the Alexa app)
6. node bin/avs-sh-gateway.js

# Exercises

- discover device
- Control device via voice
- Control device via app
- view change state report

* Add brigthness controller
* Add Endpoint health

* add thermostat device

* add event handler for brightness controller
