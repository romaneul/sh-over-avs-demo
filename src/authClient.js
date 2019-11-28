"use strict";

const fs = require("fs").promises;
const axios = require("axios");
const hapi = require("@hapi/hapi");
const open = require("open");
const chalk = require("chalk");
const querystring = require("querystring");

module.exports = ({ clientId, clientSecret, scope, port, productId }) => {
  if (!clientId || !scope || !port || !productId) {
    throw new Error(
      "LWA Client ID, Scope, server port, and AVS Product ID are required."
    );
  }

  const redirectUri = `http://localhost:${port}/callback`;

  // Build LWA Authorization URL
  const buildAuthorizeUrl = () => {
    let avsScope = {
      "alexa:all": {
        productID: productId,
        productInstanceAttributes: {
          deviceSerialNumber: "xxx"
        }
      }
    };

    const data = {
      client_id: clientId,
      response_type: "code",
      scope: scope,
      redirect_uri: redirectUri,
      scope_data: JSON.stringify(avsScope)
    };
    const params = querystring.stringify(data);
    const authorizeUrl = `https://www.amazon.com/ap/oa?${params}`;
    return authorizeUrl;
  };

  // Exchange Auth Code for AccessToken
  const getToken = async code => {
    try {
      const request = {
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
        code
      };
      const url = `https://api.amazon.com/auth/o2/token`;
      const data = querystring.stringify(request);
      const res = await axios.post(url, data);

      // Add key with timestamp expires at
      res.data.expires_at = Date.now() + res.data.expires_in * 1000;
      return res.data;
    } catch (err) {
      console.log("error getting token", err);
      throw err;
    }
  };

  // Refresh AccessToken
  const refreshToken = async refreshToken => {
    try {
      const request = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      };
      const url = `https://api.amazon.com/auth/o2/token`;
      const data = querystring.stringify(request);
      const res = await axios.post(url, data);

      // Add key with timestamp expires at
      res.data.expires_at = Date.now() + res.data.expires_in * 1000;
      return res.data;
    } catch (err) {
      console.log("error getting token", err);
      throw err;
    }
  };

  // Write AccessToken to disk
  const saveToken = token => {
    return fs.writeFile("./.token", JSON.stringify(token));
  };

  // Read AccessToken from disk
  const readToken = () => {
    return fs.readFile("./.token", "utf-8").then(token => JSON.parse(token));
  };

  // Return valid AccessToken
  const getAccessToken = async () => {
    try {
      let token = await readToken();
      const refreshNeeded = Date.now() > token.expires_at;
      if (refreshNeeded) {
        console.log(chalk.gray("Refreshing AccessToken"));
        token = await refreshToken(token.refresh_token);
        await saveToken(token);
      }
      return token.access_token;
    } catch (err) {
      console.log(chalk.red("Error getting access token", err));
      throw err;
    }
  };

  // Start server and begin auth flow
  const executeAuthFlow = () => {
    return new Promise(async (resolve, reject) => {
      // Start local server for callback from LWA
      const server = hapi.server({
        port: port,
        host: "localhost"
      });

      // Setup callback route
      server.route({
        method: "GET",
        path: "/callback",
        handler: async request => {
          try {
            const code = request.query.code;
            const token = await getToken(code);
            await saveToken(token);
            resolve({ token });
            return `AVS SH Gateway setup complete. You can close this tab now.`;
          } catch (err) {
            reject(err);
          } finally {
            server.stop();
          }
        }
      });
      await server.start();

      const authorizeUrl = buildAuthorizeUrl();
      open(authorizeUrl);
    });
  };

  return {
    executeAuthFlow,
    getAccessToken
  };
};
