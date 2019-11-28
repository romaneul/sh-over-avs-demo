#!/usr/bin/env node
"use strict";

const chalk = require("chalk");
const dotenv = require("dotenv");
const authClient = require("../src/authClient");

// Read settings
dotenv.config();

const config = {
  clientId: process.env.LWA_CLIENT_ID,
  clientSecret: process.env.LWA_CLIENT_SECRET,
  scope: process.env.LWA_SCOPE,
  port: process.env.LWA_REDIRECT_PORT,
  productId: process.env.AVS_PRODUCT_ID
};

const main = async () => {
  try {
    const auth = authClient(config);
    await auth.executeAuthFlow();
    console.log(
      chalk.bold("You have successfully registered your AVS SH Gateway.")
    );
  } catch (err) {
    console.log(chalk.red("Login failed.", err));
  }
};
main();
