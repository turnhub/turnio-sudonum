const TurnIntegration = require("@turnio/integration");
const request = require("request");
const debug = require("debug")("turn:sudonum");

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
        debug("Menu callback received");
        request.post(
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
            debug(`Call to ${message.from} initiated`);
          }
        );
        return { ok: "call initiated" };
      }
    }
  ])
  .serve();

module.exports = app;
