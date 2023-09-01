import { gameObject, gameObjectGroup } from './gameObject.js';
import { gameFunc } from './gameFunc.js';
import { keyInputReceiver, keyInput } from './keyInputReceiver.js';
import { touchInputReceiver, touchInput } from './touchInputReceiver.js';
import { gameScene } from './gameScene.js';


//----------------------------------------
//  ゲームシーン : タイトル
//----------------------------------------
export class gameUIController extends gameScene {
    constructor() {
        super();
        //  ゲーム関数クラス
        this.gf = null; //new gameFunc();
        this.gc = null;

        //  UIオブジェクト
        this.hudi_bowbutton = new gameObject();
        this.bowbuttonCenter = null;

        //  ひっぱる処理
        this.fpulling = false; //  ホバーした状態でクリックされたか
        this.pullMaxLength = 10; //  最大ひっぱり距離

    }

    //----------------------------------------
    //  初期化
    //----------------------------------------
    init(i_gc, i_gf) {
        //初期化済みなら終了
        if (this.fInit) return;
        //  一度破棄する
        this.destroy();

        this.fInit = true;
        this.gc = i_gc;
        this.gf = i_gf;
        //console.log(" gameUIController : init() : です。");

        //  UIオブジェクトを作成
        this.make();
    }


    //----------------------------------------
    //  UI処理
    //----------------------------------------
    task(i_gc) {
        var obj = this.hudi_bowbutton;
        //  キーボード入力処理
        const irkey = i_gc.keyInputReceiver.getInput();
        //  マウス・タッチ入力処理
        const irtouch = i_gc.touchInputReceiver.getTouch();

        //  乗ってる
        if (obj.fHover) {
            //onsole.log(" gameUIController : task()", irtouch);
            //  ひっぱり開始
            if (irtouch.touchDown()) {
                //console.log(" gameUIController : ひっぱり開始");
                this.fpulling = true;
            }
        }
        //  ひっぱり状態
        if (this.fpulling) {
            //console.log(" gameUIController : ひっぱっている");
            //  ドラッグしてる
            if (irtouch.touch()) {
                //  物体のカーソル付随
                //console.log(" gameUIController : ドラッグしてる");
                obj.object.position.set(0, 0, 0);
            }
            //  離した
            else if (irtouch.touchUp()) {
                //console.log(" gameUIController : 離した");
                this.fpulling = false;
                //  位置を戻す
                obj.object.position.copy(this.bowbuttonCenter);
            }

        }

        //  処理として必用なもの
        //  ・現在何の上に乗っているか、UI接触判定とpickUIなどの取得
        //  クリックの状態
        //      ボタンの上に乗ってる状態でクリック = ひっぱり開始
        //      クリック離れた = 終了

        //  ドラッグの状態
        //      ひっぱり中に移動で引っ張り、最大距離がある

        //  ひっぱっている状態で離す = 射撃
    }


    //----------------------------------------
    //  破棄
    //----------------------------------------
    destroy() {
        this.fInit = false;
        //  まとの破棄
        if (!this.gc) return;

        if (this.hudi_bowbutton) this.hudi_bowbutton.destroy(this.gc.scene2d);
    }


    //----------------------------------------
    //  UIオブジェクト作成
    //----------------------------------------
    async make() {
        //  2D HUD
        var i_scene = this.gc.scene2d;

        var gmobj = null;
        var gmobjo = null;

        //   弓ボタン
        await this.gf.makeHUDImage('textures/sTitle/controller.png', "bowbutton", this.hudi_bowbutton, i_scene);
        gmobj = this.hudi_bowbutton;
        gmobjo = gmobj.object;
        gmobj.setPosition((this.gc.GAMESCREEN_MAXWIDTH / 2) - 200, (this.gc.GAMESCREEN_MAXHEIGHT / 2) + 100, 0);
        //gmobj.setPosition(0, 100, 0);
        gmobj.setSizeScale(0.2, 0.2, 1);

        //  座標を保存
        this.bowbuttonCenter = gmobjo.position.clone();;

    }






    //========================================================
    //
    //  処理
    //
    //========================================================


}