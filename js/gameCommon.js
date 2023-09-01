import { keyInputReceiver, keyInput } from './keyInputReceiver.js';
import { touchInputReceiver, touchInput } from './touchInputReceiver.js';
//----------------------------------------
//  ゲーム共通変数
//----------------------------------------
export class gameCommon {
    constructor() {
        //  一般html時
        this.path2 = ""; //    ページパス、"./"があるとエラーになる物用
        this.path = "./"; //    ページパス
        this.imgpath = "./textures/"; //    画像パス、ただしusayumiではpathしか使わない
        //  ワードプレス時
        //  wppathはワードプレスの該当PHPページにて、フォルダ位置を代入しているのでそれを受け継ぐ
        //this.path2 = "";  //  spineはSceneInit()中の初期化でbaseURLに下記pathを入れているのでいらない
        //this.path = wppath + "/content/usayumi/";        
        //    this.imgpath = wppath + "/content/yoyocafe/img";

        //  キー入力
        this.keyInputReceiver = new keyInputReceiver();
        this.touchInputReceiver = new touchInputReceiver();

        //  フルスクリーンか
        this.fFullscreen = false;
        //  three.js用変数
        this.SCREEN_WIDTH = window.innerWidth;
        this.SCREEN_HEIGHT = window.innerHeight;
        //  想定上の最大幅
        this.GAMESCREEN_MAXWIDTH = 960;
        this.GAMESCREEN_MAXHEIGHT = 540;
        this.cwidth = 960; //  固定したい描画幅
        this.cheight = 540; //  固定したい描画高さ
        this.gameCanvas = document.querySelector('#myCanvas');
        this.gameCanvas.gc = this;
        this.offsetLeft = this.gameCanvas.offsetLeft;
        this.offsetTop = this.gameCanvas.offsetTop;

        //  spine用変数
        this.spineBaseUrl = "";
        this.spineAssetManager = null;

        //  htmlに関するもの
        this.container = null;
        this.ctn_debug_rayposition = null;
        this.ctn_debug_mouseposition = null;

        //  シーン・カメラ
        this.camera = null;
        this.scene = null;
        this.scene2 = null;
        this.renderer = null;
        //  HUD
        this.camera2d = null;
        this.scene2d = null;
        //  Spine用
        this.cameraSpine = null;
        this.sceneSpine = null;
        //  背景用
        this.cameraBackground = null;
        this.sceneBackground = null;
        //  コピー元素材用
        this.sceneMaterial = null;

        //  音声ローダー
        this.audioLoader = null;
        this.listener = null;

        //  ステージ用背景( 一時しのぎ )
        this.stage_meshShadow = null;
        this.stage_meshFrame = null;
        this.stage_meshWall = null;
        this.stage_meshGround = null;



        //  一時的か、シーンのグループを保持して各地関数で使う
        this.objs = null; //  gameObjectGroup
        this.hudis = null;

        //  判定
        this.raycaster = null;
        this.intersects = null;
        this.pickobjectUI = null;
        this.pickobject = null;

        //  マウス
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseX3D = 0; //  -1～+1の範囲
        this.mouseY3D = 0; //  -1～+1の範囲
        this.mouseXc = 0;
        this.mouseYc = 0;
        this.mouseLState = 0;

        //  ウィンドウ
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.cHalfX = this.cwidth / 2;
        this.cHalfY = this.cheight / 2;


        //  ゲーム用変数
        this.GAMESCENE = {
            NONE: 0,
            INIT: 1,
            TITLE: 2,
            GAME: 3,
            SCOREBOARD: 4,
            TEST: 3,
            END: 100
        }
        this.nowScene = this.GAMESCENE.INIT;
        //  ステージ用変数
        this.stage = null;
        //  プレイヤー用変数
        this.player = null;
        //  エフェクト用変数
        this.effects = null;
        //  サウンド用変数
        this.soundmanage = null;

        //  ゲーム管理
        this.fStageClear = false;
        //  ユーザー変数
        this.shotCount = 0; //  撃った回数
        this.enemyDefeatCount = 0; //  撃破数
        this.shotAccuracy = 0; //  命中率
        this.myscore = 0; //  スコア

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