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
  fruitList = [],
  imgName = [],
  explosionList = [],
  splatImg,
  font,
  names = new Map();

export default function sketch(p5) {
  client.on("message", (channel, tags, message, self) => {
    let target = fruitList.findIndex(
      (e) => message.trim().toLowerCase() === e.name
    );

    if (target !== -1) {
      console.log("target:" + target);
      fruitList[target].velocity.x = 0;
      fruitList[target].velocity.y = 0;
      fruitList[target].image = splatImg;

      names.set(tags.username, {
        x: fruitList[target].position.x,
        y: fruitList[target].position.y,
      });

      setTimeout(
        (fruitIndex, name) => {
          fruitList = fruitList
            .slice(0, fruitIndex)
            .concat(fruitList.slice(fruitIndex + 1));
          names.delete(name);
        },
        config.splatTimeout,
        target,
        tags.username
      );
    }
  });

  p5.preload = () => {
    font = p5.loadFont("../images/Roboto-Black.ttf");
    splatImg = p5.loadImage("../images/splat.png");

    img.push(p5.loadImage("../images/orange.png"));
    imgName.push("orange");
    // fruitList.push(new fruit(img[0], p5, imgName[0]));
    img.push(p5.loadImage("../images/grapes.png"));
    imgName.push("grapes");
    // fruitList.push(new fruit(img[1], p5, imgName[1]));
    img.push(p5.loadImage("../images/peach.png"));
    imgName.push("peach");
    // fruitList.push(new fruit(img[2], p5, imgName[2]));
    img.push(p5.loadImage("../images/pineapple.png"));
    imgName.push("pineapple");
    // fruitList.push(new fruit(img[3], p5, imgName[3]));
    img.push(p5.loadImage("../images/pomagranate.png"));
    imgName.push("pomagranate");
    // fruitList.push(new fruit(img[4], p5, imgName[4]));
    img.push(p5.loadImage("../images/watermelon.png"));
    imgName.push("watermelon");
    // fruitList.push(new fruit(img[5], p5, imgName[5]));
  };

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.textFont(font);
    p5.textSize(config.fontSize);
    p5.textAlign(p5.CENTER, p5.CENTER);

    setInterval(() => {
      if (fruitList >= config.maxFruits) return;
      let randomFruit = Math.floor(img.length * Math.random());
      fruitList.push(new fruit(img[randomFruit], p5, imgName[randomFruit]));
    }, (60 * 1000) / config.fruitSpawnRate);
  };

  p5.mousePressed = () => {
    let randomFruit = Math.floor(img.length * Math.random());

    fruitList.push(new fruit(img[randomFruit], p5, imgName[randomFruit]));
    fruitList[fruitList.length - 1].position.x = p5.mouseX;
    fruitList[fruitList.length - 1].position.y = p5.mouseY;
  };

  p5.draw = () => {
    p5.clear();

    names.forEach((point, name) => {
      p5.fill(0);
      p5.stroke(10);
      p5.text(name, point.x, point.y);
      p5.fill(255);
      p5.stroke(5);
      p5.text(name, point.x, point.y);
    });

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
  name = "";

  constructor(img, p, n) {
    this.p = p;
    this.image = img;
    this.name = n;

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
