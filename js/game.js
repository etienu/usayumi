import { gameCommon } from './gameCommon.js';
import { gameSceneInit } from './gameSceneInit.js';
import { gameSceneTitle } from './gameSceneTitle.js';
import { gameSceneTest } from './gameSceneTest.js';
import { gameSceneGame } from './gameSceneGame.js';

let gc = new gameCommon();
let gs_Init = new gameSceneInit(); //  シーン:起動時の初期化
let gs_Title = new gameSceneTitle(); //  シーン:タイトル
let gs_Test = new gameSceneTest(); //  シーン:テスト
let gs_Game = new gameSceneGame(); //  シーン:ゲーム
//----------------------------------------
//  ゲームエンジン
//----------------------------------------
export class gameEngine {

    constructor() {
        //this.gc = gc;
        this.gc = new gameCommon(); //  ゲーム共有変数
        this.renderer = 0;
        this.camera = 0;
        this.scene = 0;
        this.sceneUI = 0;
        //this.nowscene = GAMESCENE_INIT;
        //console.log(" gameEngine :: constructor");
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

    //--------------------------------
    //  ゲームループ : シーンによって変化
    //--------------------------------
    taskGameLoop() {
        //        console.log(" gameEngine : taskGameLoop()");
        //        console.log(this);
        //        console.log(this.gc);
        //        console.log(this.gc.GAMESCENE.INIT);
        switch (this.gc.nowScene) {
            case this.gc.GAMESCENE.NONE:
                break;

            case this.gc.GAMESCENE.INIT:
                gs_Init.taskGameLoop(this.gc);
                break;

            case this.gc.GAMESCENE.TITLE:
                gs_Title.taskGameLoop(this.gc); //  タイトル
                //gs_Test.taskGameLoop(this.gc); //  テスト用
                break;

            case this.gc.GAMESCENE.GAME:
                gs_Game.taskGameLoop(this.gc); //  ゲーム
                break;

            case this.gc.GAMESCENE.SCOREBOARD:
                break;

            case this.gc.GAMESCENE.TEST:
                gs_Test.taskGameLoop(this.gc);
                break;

        }
        //        requestAnimationFrame(this.taskGameLoop);
    }

    //--------------------------------
    //  シーンの変更
    //--------------------------------
    changeScene(i_scene) {
        this.nowscene = i_scene;
        //  一度全て破棄する
        //this.destroyScene();
    }

    //--------------------------------
    //  シーンの破棄
    //--------------------------------
    destroyScene() {

    }

}