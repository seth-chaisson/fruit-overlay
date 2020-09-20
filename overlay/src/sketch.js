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

let img = [],
  currentTime = 0,
  fruitList = [];

export default function sketch(p5) {
  client.on("message", (channel, tags, message, self) => {
    console.log(message);
  });

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight);

    img.push(p5.loadImage("../images/orange.png"));
    fruitList.push(new fruit(img[0], p5));
    img.push(p5.loadImage("../images/grapes.png"));
    fruitList.push(new fruit(img[1], p5));
    img.push(p5.loadImage("../images/peach.png"));
    fruitList.push(new fruit(img[2], p5));
    img.push(p5.loadImage("../images/pineapple.png"));
    fruitList.push(new fruit(img[3], p5));
    img.push(p5.loadImage("../images/pomagranate.png"));
    fruitList.push(new fruit(img[4], p5));
    img.push(p5.loadImage("../images/watermelon.png"));
    fruitList.push(new fruit(img[5], p5));

    //console.log(fruitList[0].velocity);

    console.log(fruitList[0].position);
  };

  p5.draw = () => {
    p5.clear();

    fruitList.forEach((e) => {
      e.update();
      e.draw();
    });
  };
}

class fruit {
  image = null;
  position = { x: 0, y: 0 };
  p = null;
  velocity = { x: 0, y: 0 };
  constructor(img, p) {
    this.p = p;
    this.image = img;

    this.position.x = Math.floor((p.windowWidth - 200) * Math.random());
    this.position.y = Math.floor((p.windowHeight - 200) * Math.random());
    console.log(this.position.x + "   " + this.position.y);
    this.velocity.x =
      Math.floor(config.maxVelocity * Math.random() * 2) - config.maxVelocity;
    this.velocity.y =
      Math.floor(config.maxVelocity * Math.random() * 2) - config.maxVelocity;
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (
      this.position.x > this.p.windowWidth - this.image.width / 2 ||
      this.position.x < 0
    ) {
      this.velocity.x = -this.velocity.x;
    }
    if (
      this.position.y > this.p.windowHeight - this.image.height / 2 ||
      this.position.y < 0
    )
      this.velocity.y = -this.velocity.y;
  }

  draw() {
    this.p.image(
      this.image,
      this.position.x,
      this.position.y,
      this.image.width / 2,
      this.image.height / 2
    );
  }
}
