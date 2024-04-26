import BaseScene from "./BaseScene";

const PIPE_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

    this.bird = null;
    this.pipes = null;

    this.flapVelocity = 300;
    this.score = 0;
    this.scoreText = "";
    this.isPause = false;
    this.currentDifficulty = "easy";
    this.difficulties = {
      easy: {
        
        pipeHorizontalDistanceRange: [300, 350],
        pipeVerticleDistanceRange: [150, 200],
      },
      normal: {
        pipeHorizontalDistanceRange: [280, 330],
        pipeVerticleDistanceRange: [140, 190],
      },
      hard: {
        pipeHorizontalDistanceRange: [250, 310],
        pipeVerticleDistanceRange: [120, 170],
      },
    };
  }

  create() {
    this.currentDifficulty = 'easy'
    super.create();
    this.createPipes();
    this.createBird();
    this.createColliders();
    this.createScore();
    this.createPause();

    this.handleInputs();
    this.listenToEvents();
    this.anims.create({
      key:'fly',
      frames:this.anims.generateFrameNumbers('bird',{start:8,end:15}),
      frameRate:8,
      repeat:-1
    })
    this.bird.play('fly')
  }

  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }
  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }
    this.pauseEvent = this.events.on("resume", () => {
      this.initialTime = 3;
      this.countDownText = this.add
        .text(
          ...this.screenCenter,
          "Fly in:" + this.initialTime,
          this.fontOptions
        )
        .setOrigin(0.5);
      this.timeEvents = this.time.addEvent({
        delay: 1000,
        callback: this.countDown.bind(this),
        callbackScope: this,
        loop: true,
      });
    });
  }
  countDown() {
    this.initialTime--;

    this.countDownText.setText("Fly in: " + this.initialTime);

    if (this.initialTime <= 0) {
      this.isPause = false;
      this.countDownText.setText("");

      this.physics.resume();
      this.timeEvents.remove();
    }
  }
  createBird() {
    this.bird = this.physics.add
      .sprite(
        this.config.initialBirdPos.x,
        this.config.initialBirdPos.y,
        "bird"
      )
      .setScale(3).setFlipX(true)
      .setOrigin(0, 0);
    
     this.bird.setBodySize(this.bird.width,this.bird.height-8) 
    this.bird.body.gravity.y = 600;

    this.bird.setCollideWorldBounds();
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPE_RENDER; i++) {
      const upperPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 0);

      this.placePipes(upperPipe, lowerPipe);

      upperPipe.body.velocity.x = -200;
      lowerPipe.body.velocity.x = -200;
    }

    this.pipes.setVelocityX(-200);
  }
  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createPause() {
    this.isPause = false;
    const pauseBtn = this.add
      .image(this.config.width - 10, this.config.height - 10, "pause")
      .setInteractive()
      .setScale(3)
      .setOrigin(1);

    pauseBtn.on("pointerdown", () => {
      this.isPause = true;

      this.physics.pause();
      this.scene.pause();
      this.scene.launch("PauseScene");
    });
  }
  handleInputs() {
    this.input.on("pointerdown", this.flap, this);
    this.input.keyboard.on("keydown-SPACE", this.flap, this);
  }

  flap() {
    if (this.isPause) {
      return;
    }
    this.bird.body.velocity.y = -this.flapVelocity;
  }
  placePipes(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipes();

    const pipeVerticleDistance = Phaser.Math.Between(
      ...difficulty.pipeVerticleDistanceRange
    );
    const pipeVerticlePosition = Phaser.Math.Between(
      20,
      this.config.height - 20 - pipeVerticleDistance
    );
    const pipeHorizontalDistance = Phaser.Math.Between(
      ...difficulty.pipeHorizontalDistanceRange
    );

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticlePosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticleDistance;
  }

  getRightMostPipes() {
    let rightMostX = 0;
    // debugger;
    this.pipes.getChildren().forEach((pipe) => {
      // debugger;

      rightMostX = Math.max(pipe.x, rightMostX);
    });
    return rightMostX;
  }
  recyclePipes() {
    const tempPipes = [];
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipes(...tempPipes);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty()
        }
      }
    });
  }
  increaseDifficulty(){
    if(this.score === 3){
      this.currentDifficulty = 'normal'
    }
    if(this.score === 7){
      this.currentDifficulty = 'hard'
    }
  }
  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem("bestScore") || 0;
    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });
    this.add.text(16, 52, `Best Score: ${bestScore}`, {
      fontSize: "18px",
      fill: "#000",
    });
  }
  saveBestScore() {
    const bestScoreText = localStorage.getItem("bestScore");
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem("bestScore", this.score);
    }
  }
  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
  gameOver() {
    // this.bird.x = this.config.initialBirdPos.x;
    // this.bird.y = this.config.initialBirdPos.y;
    // this.bird.body.velocity.y = 0;

    this.physics.pause();
    this.bird.setTint(0xff0000);

    this.saveBestScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  checkGameStatus() {
    if (
      this.bird.getBounds().bottom >= this.config.height ||
      this.bird.y <= 0
    ) {
      this.gameOver();
    }
  }
}

export default PlayScene;
