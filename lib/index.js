const TurnIntegration = require("@turnio/integration");

const request = require("request");

const debug = require("debug")("turn:sudonum");

const moment = require("moment"); // this will likely always be empty if running
// in a serverless environment


const callLog = {};
const app = new TurnIntegration(process.env.SECRET).context("Phone Call", "table", ({
  chat,
  messages
} = body) => {
  const recentInbounds = messages.filter(m => m._vnd.v1.direction == "inbound");
  const lastInbound = recentInbounds[0];
  const lastCall = callLog[lastInbound.from];
  return {
    "Can be called?": lastInbound.from.startsWith("27") ? "Yes" : "No",
    "Last Called At": lastCall ? moment.duration(moment().diff(lastCall)).humanize() : "Never"
  };
}).action(({
  chat,
  messages
}) => [{
  description: "Set up a call",
  payload: {
    really: "yes"
  },
  callback: ({
    message,
    option,
    payload: {
      really
    }
  }, resp) => {
    debug("Menu callback received");
    request.post("https://api.sudonum.com/v2/voice-call/", {
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
    }, function (err, httpResponse, body) {
      debug({
        err,
        httpResponse,
        body
      });
      debug(`Call to ${message.from} initiated`);
      callLog[message.from] = moment.now();
    }); // Notify the frontend to refresh the context so we
    // update the "Last Called At"

    resp.setHeader("X-Turn-Integration-Refresh", "true");
    return {
      ok: "call initiated"
    };
  }
}]).serve();
module.exports = {
  app
};