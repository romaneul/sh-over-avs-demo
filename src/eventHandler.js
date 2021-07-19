const fs = require("fs").promises;
const { v4: uuidv4 } = require('uuid');
const chalk = require("chalk");

const eventFolder = "events";

const directiveEventMapping = {
  "Alexa.Discovery.Discover": "discovery",
  "Alexa.ReportState": "stateReport",
  "Alexa.ChangeReport": "changeReport",
  "Alexa.PowerController.TurnOn": "turnOn",
  "Alexa.PowerController.TurnOff": "turnOff"
};

// Public interface
module.exports = {
  getEvent: getEvent,
  directiveResponder: createResponse
};

// Get Event Message by Event name (e.g. "Alexa.Discovery.Discover")
async function getEvent(eventName) {
  let response = await readEventMessage(eventName);
  response.event.header.messageId = uuidv4();
  return response;
}

// Directive hd
async function createResponse(directiveMessage) {
  // Destruct directive
  const {
    directive: {
      header: { name, namespace }
    }
  } = directiveMessage;

  // Log to console
  console.log(chalk.bold.green("\n\n Incoming Directive:", name, namespace));
  console.log(chalk.green(JSON.stringify(directiveMessage)));

  let response = await readEventMessage(`${namespace}.${name}`);
  // Update Endpoint ID
  response.event.endpoint.endpointId =
    directiveMessage.directive.endpoint.endpointId;

  // Update Correlation Token
  response.event.header.correlationToken =
    directiveMessage.directive.header.correlationToken;

  // Update Message ID
  response.event.header.messageId = uuidv4();

  // Set time stamps to Now
  response.context.properties.forEach(property => {
    property.timeOfSample = new Date().toISOString();
  });

  console.log(chalk.bold.yellow("\n Sending Response Event:"));
  return response;
}

async function readEventMessage(name) {
  const fileName = directiveEventMapping[name];
  return fs
    .readFile(`./src/${eventFolder}/${fileName}.json`, "utf-8")
    .then(eventMessage => JSON.parse(eventMessage))
    .catch(() => {
      throw new Error("No mapping file");
    });
}
