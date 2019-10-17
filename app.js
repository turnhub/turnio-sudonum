const TurnIntegration = require("@turnio/integration");
const request = require("request");
const debug = require("debug")("turn:sudonum");
const moment = require("moment");

const callLog = {};

const app = new TurnIntegration(process.env.SECRET)
  .context("Phone Call", "table", ({ messages } = body) => {
    if (messages.length == 0) {
      return {
        "Can be called": "Maybe",
        "Last Called At": "Never"
      };
    } else {
      const message = messages[0];
      const lastCall = callLog[message.from];
      return {
        "Can be called?": message.from.startsWith("27") ? "Yes" : "No",
        "Last Called At": lastCall
          ? moment.duration(moment().diff(lastCall)).humanize()
          : "Never"
      };
    }
  })
  .action(message => [
    {
      description: "Set up a call",
      payload: {
        really: "yes"
      },
      callback: ({ message, option, payload: { really } }, resp) => {
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
            callLog[message.from] = moment.now();
          }
        );
        // Notify the frontend to refresh the context so we
        // update the "Last Called At"
        resp.setHeader("X-Turn-Integration-Refresh", "true");
        return { ok: "call initiated" };
      }
    }
  ])
  .serve();

module.exports = app;
