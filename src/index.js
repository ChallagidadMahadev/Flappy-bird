///<reference path='../typings/phaser.d.ts' />
import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      // gravity: { y: 200 },
      debug: true,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const VELOCITY = 200;

const PIPE_RENDER = 4;
const pipeVerticleDistanceRange = [150, 250];
let upperPipe = null
let lowerPipe = null;

let pipeHorizontalDistance = 0;

let flapVelocity = 250;

const initialBirdPos = {
  x: config.width / 10,
  y: config.height / 2,
};
let bird = null;

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("bird", "assets/bird.png");
  this.load.image("pipe", "assets/pipe.png");
}
function create() {
  this.add.image(0, 0, "sky").setOrigin(0, 0);
  bird = this.physics.add
    .sprite(initialBirdPos.x, initialBirdPos.y, "bird")
    .setOrigin(0, 0);
  bird.body.gravity.y = 400;


  for (let i = 0; i < PIPE_RENDER; i++) {
    pipeHorizontalDistance += 400;

    let pipeVerticleDistance = Phaser.Math.Between(
      ...pipeVerticleDistanceRange
    );
    let pipeVerticlePosition = Phaser.Math.Between(
      20,
      config.height - 20 - pipeVerticleDistance
    );

    upperPipe = this.physics.add.sprite(pipeHorizontalDistance,pipeVerticlePosition,'pipe').setOrigin(0,1)
    lowerPipe = this.physics.add
      .sprite(upperPipe.x, upperPipe.y+pipeVerticleDistance, "pipe")
      .setOrigin(0, 0);
    upperPipe.body.velocity.x = -200;
    lowerPipe.body.velocity.x = -200;
  }
  this.input.on("pointerdown", flap);
  this.input.keyboard.on("keydown-SPACE", flap);
}

function flap() {
  bird.body.velocity.y = -flapVelocity;
}
function restartBirdPosition() {
  bird.x = initialBirdPos.x;
  bird.y = initialBirdPos.y;
  bird.body.velocity.y = 0;
}
function update() {
  if (bird.y > config.height || bird.y < -bird.y) {
    restartBirdPosition();
  }
  // if (bird.x >= config.width - bird.width) {
  //   bird.body.velocity.x = -VELOCITY;
  // } else if (bird.x <= 0) {
  //   bird.body.velocity.x = VELOCITY;
  // }
}
new Phaser.Game(config);
