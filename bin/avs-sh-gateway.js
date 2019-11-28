#!/usr/bin/env node
"use strict";

const chalk = require("chalk");
const dotenv = require("dotenv");
const inquirer = require("inquirer");
const authClient = require("../src/authClient");
const avsClient = require("../src/avsClient");
const eventHandler = require("../src/eventHandler");

// read settings
dotenv.config();

const config = {
  clientId: process.env.LWA_CLIENT_ID,
  clientSecret: process.env.LWA_CLIENT_SECRET,
  scope: process.env.LWA_SCOPE,
  port: process.env.LWA_REDIRECT_PORT,
  productId: process.env.AVS_PRODUCT_ID,
  avsEndpoint: process.env.AVS_ENDPOINT
};

const askQuestions = () => {
  const questions = [
    {
      type: "list",
      name: "action",
      message: "Which event do you want to send?",
      choices: [
        { name: "Proactive Discovery", value: "discovery" },
        { name: "Proactive State Update", value: "stateUpdate" }
      ]
    }
  ];
  return inquirer.prompt(questions);
};

const main = async () => {
  try {
    const auth = authClient(config);
    const avs = avsClient(auth, config.avsEndpoint);

    // Connect to AVS and attach Directive<>EventResponse mapping
    await avs.connectToAvs(eventHandler.directiveResponder);

    // Display interactive CLI
    while (0 < 1) {
      const answer = await askQuestions();

      // Send Discovery
      if (answer.action === "discovery") {
        console.log("\n" + chalk.gray("Sending Discovery Event"));
        const discoveryEvent = await eventHandler.getEvent(
          "Alexa.Discovery.Discover"
        );
        await avs.sendEvent(discoveryEvent);
      }

      // Send Proactive State Update
      if (answer.action === "stateUpdate") {
        console.log("\n" + chalk.gray("Sending ChangeReport Event"));
        const changeReportEvent = await eventHandler.getEvent(
          "Alexa.ChangeReport"
        );
        await avs.sendEvent(changeReportEvent);
      }
    }
  } catch (err) {
    console.log(chalk.red(err));
  }
};

main();
