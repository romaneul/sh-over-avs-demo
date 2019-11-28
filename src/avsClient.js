const http2 = require("http2");
const chalk = require("chalk");

module.exports = (authClient, avsEndpoint) => {
  if (!authClient) {
    throw new Error("AVS client requires an instance of the authClient");
  }

  const apiVersion = `v20160207`;
  let clientSession;

  const {
    HTTP2_HEADER_METHOD,
    HTTP2_METHOD_POST,
    HTTP2_METHOD_GET,
    HTTP2_HEADER_SCHEME,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_AUTHORIZATION,
    HTTP2_HEADER_CONTENT_TYPE,
    HTTP2_HEADER_STATUS
  } = http2.constants;

  // Connect to the AVS endpoint and start an HTTP2 client session
  function getHttp2ClientSession() {
    if (!clientSession) {
      const client = http2.connect(avsEndpoint);
      client.on("error", err => console.error("ERROR", err));
      clientSession = client;
    }
    return clientSession;
  }

  // Establish down channel => GET stream to /${apiVersion}/directives
  const establishHttp2DownChannel = async directiveHandler => {
    const accessToken = await authClient.getAccessToken();

    // Create Http2Stream
    const clientSession = getHttp2ClientSession();
    let req = clientSession.request({
      [HTTP2_HEADER_METHOD]: HTTP2_METHOD_GET,
      [HTTP2_HEADER_SCHEME]: "https",
      [HTTP2_HEADER_PATH]: `/${apiVersion}/directives`,
      [HTTP2_HEADER_AUTHORIZATION]: "Bearer " + accessToken
    });

    // Process incoming messages
    req.on("data", async data => {
      // Very basic Directive parser
      let directiveData = data.toString().split("\r\n");

      // Attach Directive handler
      if (directiveData[0].indexOf("application/json") > -1) {
        try {
          let responseEvent = await directiveHandler(
            JSON.parse(directiveData[2])
          );
          sendEvent(responseEvent);
        } catch (error) {
          console.log();
        }
      }
    });

    req.on("response", headers => {
      const status = headers[HTTP2_HEADER_STATUS];
      if (status !== 200) {
        throw new Error("Cannot establish down channel. Status code" + status);
      }
      //boundary = headers["content-type"].split(";")[1].split("=")[1];
    });

    // Setup Ping to maintain Downchannel when idle
    setupPing(clientSession);
    console.log(chalk.gray("Downchannel established.\n"));
    return req;
  };

  // Embed Event message into multipart body
  const createMultipartMessageEvent = event => {
    let multipartBody = `--xxx
    Content-Disposition: form-data; name="metadata"
    Content-Type: application/json; charset=UTF-8

    ${JSON.stringify(event)}
    `;
    return [multipartBody];
  };

  // Create stream to /${apiVersion}/events
  const createEventStream = (buffersArray, accessToken) => {
    return new Promise((resolve, reject) => {
      const clientSession = getHttp2ClientSession();

      let req = clientSession.request({
        [HTTP2_HEADER_METHOD]: HTTP2_METHOD_POST,
        [HTTP2_HEADER_SCHEME]: "https",
        [HTTP2_HEADER_PATH]: `/${apiVersion}/events`,
        [HTTP2_HEADER_AUTHORIZATION]: "Bearer " + accessToken,
        [HTTP2_HEADER_CONTENT_TYPE]: "multipart/form-data; boundary=xxx"
      });

      // Attach handler for response event
      req.on("response", headers => {
        console.log(
          chalk.gray("Event sent: " + headers[HTTP2_HEADER_STATUS] + "\n")
        );
        req.on("end", () => {
          resolve();
        });
      });

      // Send Event
      req.setEncoding("utf8");
      buffersArray.forEach(buffer => {
        req.write(buffer);
      });

      // End Stream
      req.end();
    });
  };

  // Send Event message to AVS endpoint
  const sendEvent = async event => {
    console.log(chalk.yellow(JSON.stringify(event)));
    const accessToken = await authClient.getAccessToken();
    let streamArray = createMultipartMessageEvent(event);
    await createEventStream(streamArray, accessToken);
    return;
  };

  // Setup Ping to maintain Downchannel
  const setupPing = clientSession => {
    setInterval(() => {
      clientSession.ping(Buffer.from("abcdefgh"), (err, duration, payload) => {
        if (err) {
          console.log(chalk.red("Ping failed", err));
          return;
        }
        console.log(
          chalk.gray(`\n\nPing acknowledged in ${duration} milliseconds`)
        );
      });
    }, 120000); // Set ping to 3 minutes
    console.log(chalk.gray("Ping for Downchannel set to <5 minutes."));
  };

  // Connect to AVS
  const connectToAvs = async directiveHandler => {
    return new Promise(async (resolve, reject) => {
      try {
        await establishHttp2DownChannel(directiveHandler);
        resolve();
      } catch (error) {
        console.log(chalk.red("[ERROR]", error));
        reject();
      }
    });
  };

  // Public interface
  return {
    connectToAvs,
    sendEvent
  };
};
