import config from "./config";
import tmi from "tmi.js";

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [config.channelName],
});

client.connect();

/**
 * @param {import('p5')} p5
 */

export default function sketch(p5) {
  client.on("message", (channel, tags, message, self) => {
    console.log(message);
  });

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.draw = () => {
    p5.background(100);
  };
}
