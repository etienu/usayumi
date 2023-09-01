//----------------------------------------
//  ゲームシーン
//----------------------------------------
export class gameScene {
    constructor() {
        this.renderer = 0;
        this.camera = 0;
        this.scene = 0;
        this.sceneUI = 0;

        this.fInit = false;
        this.gc = null;
    }

    setSenderer(i_renderer) {
        this.renderer = i_renderer;
    }
    setCamera(i_camera) {
        this.camera = i_camera;
    }
    setScene(i_scene) {
        this.scene = i_scene;
    }
    setSceneUI(i_sceneUI) {
        this.sceneUI = i_sceneUI;
    }
}