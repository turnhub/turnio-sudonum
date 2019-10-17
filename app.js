const TurnIntegration = require("@turnio/integration");
const request = require("request");

console.log({ env: process.env });

const app = new TurnIntegration(process.env.SECRET)
  .context("Language", "table", message => ({
    Language: "English",
    Confidence: "Very high"
  }))
  .context("A list of things", "ordered-list", message => [
    "first item",
    "second item",
    "third item"
  ])
  .action(message => [
    {
      description: "Set up a call",
      payload: {
        really: "yes"
      },
      callback: ({ message, option, payload: { really } }) => {
        console.log({ message, option, really });
        return request.post(
          "https://api.sudonum.com/v2/voice-call/",
          {
            headers: {
              Authorization: `Token ${process.env.SUDONUM_API_TOKEN}`
            },
            form: {
              caller_number: process.env.OPERATOR_NUMBER,
              destination_number: message.from,
              caller_clid: message.from,
              features: "group_pickup_hunt",
              destination_clid: process.env.CALL_FROM
            }
          },
          function(err, httpResponse, body) {
            console.log({ err, httpResponse, body });
          }
        );
      }
    }
  ])
  .serve();

module.exports = app;
