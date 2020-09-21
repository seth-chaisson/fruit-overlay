import config from "./config";
import tmi from "tmi.js";
import { Howl, Howler } from "howler";

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
  names = new Map(),
  splatSfx,
  highScores = [],
  scoreImg;

export default function sketch(p5) {
  client.on("message", (channel, tags, message, self) => {
    let target = fruitList.findIndex(
      (e) => message.trim().toLowerCase() === e.name
    );

    if (target !== -1) {
      console.log("target:" + target);
      fruitList[target].velocity.x = 0;
      fruitList[target].velocity.y = 0;

      splatSfx.play();

      let key = Date.now();
      names.set(key, {
        userName: tags.username,
        x: fruitList[target].position.x,
        y: fruitList[target].position.y,
      });

      setTimeout(
        (name) => {
          names.delete(name);
        },
        config.splatTimeout,
        key
      );

      fruitList = fruitList
        .slice(0, target)
        .concat(fruitList.slice(target + 1));
      //update  high scorelist
      let playerIndex = highScores.findIndex(
        (e) => e.userName === tags.username
      );

      if (playerIndex === -1) {
        highScores.push({ userName: tags.username, score: 1 });
      } else {
        highScores[playerIndex] = {
          userName: highScores[playerIndex].userName,
          score: highScores[playerIndex].score + 1,
        };
      }
    }
  });

  p5.preload = () => {
    splatSfx = new Howl({ src: ["../images/splat.wav"] });

    font = p5.loadFont("../images/Roboto-Black.ttf");
    splatImg = p5.loadImage("../images/splat.png");

    scoreImg = p5.loadImage("../images/scorebackground.png");

    img.push(p5.loadImage("../images/orange.png"));
    imgName.push("orange");
    img.push(p5.loadImage("../images/grapes.png"));
    imgName.push("grapes");
    img.push(p5.loadImage("../images/peach.png"));
    imgName.push("peach");
    img.push(p5.loadImage("../images/pineapple.png"));
    imgName.push("pineapple");
    img.push(p5.loadImage("../images/pomagranate.png"));
    imgName.push("pomegranate");
    img.push(p5.loadImage("../images/watermelon.png"));
    imgName.push("watermelon");
  };

  p5.setup = async () => {
    p5.frameRate(60);
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.textFont(font);
    p5.textSize(config.fontSize);
    p5.textAlign(p5.CENTER, p5.TOP);

    setInterval(() => {
      if (fruitList.length >= config.maxFruits) return;
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

    //draw usernames on hit fruits
    names.forEach((point, key) => {
      p5.image(splatImg, point.x, point.y);
      p5.fill(0);
      p5.stroke(10);
      p5.text(point.userName, point.x + 100, point.y);
      p5.fill(255);
      p5.stroke(5);
      p5.text(point.userName, point.x + 100, point.y);
    });
    //draw/update fruits
    fruitList.forEach((e) => {
      e.update();
      e.draw();
    });

    // draw scoreboard
    if (highScores.length > 0) {
      let sbPos = { x: (p5.windowWidth / 3) * 2, y: p5.windowHeight / 2 };
      let sbCenterx =
        (p5.windowWidth / 3) * 2 +
        (p5.windowWidth - (p5.windowWidth / 3) * 2) / 2;
      p5.image(scoreImg, sbPos.x, sbPos.y);

      p5.fill(0);
      p5.stroke(10);
      p5.text("HIGH SCORES", sbCenterx, sbPos.y);
      p5.fill(255);
      p5.stroke(5);
      p5.text("HIGH SCORES", sbCenterx, sbPos.y);

      highScores = highScores.sort((a, b) => {
        return -1 * (a.score - b.score);
      });

      for (let x = 0; x < 5; x++) {
        if (x >= highScores.length) break;

        p5.fill(0);
        p5.stroke(10);
        p5.text(
          `${highScores[x].score} -- ${highScores[x].userName}`,
          sbCenterx,
          sbPos.y + 50 + x * 40
        );
        p5.fill(255);
        p5.stroke(5);
        p5.text(
          `${highScores[x].score} -- ${highScores[x].userName}`,
          sbCenterx,
          sbPos.y + 50 + x * 40
        );
      }
    }
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
