import BaseScene from "./BaseScene";

class MenuScene extends BaseScene {
  constructor(config) {
    super("MenuScene", config);
    this.menu = [
      { scene: "PlayScene", text: "Play" },
      { scene: "ScoreScene", text: "Score" },
      { scene: null, text: "Exit" },
    ];
  }

  create() {
    super.create()
    super.createMenu(this.menu, this.setUpMenuEvents.bind(this));
  }
  setUpMenuEvents(menuItem) {
    const textGO = menuItem.textGO;

    textGO.setInteractive();

    textGO.on("pointerover", () => {
      textGO.setStyle({
        fill: "#ff0",
      });
    });
    textGO.on("pointerout", () => {
      textGO.setStyle({
        fill: "#fff",
      });
    });
    textGO.on("pointerup", () => {
      menuItem.scene && this.scene.start(menuItem.scene);

      if (menuItem.text === "Exit") {
        this.game.destroy(true)
      }
      if(menuItem.text === 'Score'){
        this.scene.start(menuItem.scene)
      }
    });
  }
}
export default MenuScene;
