import { GLTFLoader } from 'https://unpkg.com/three@0.148.0/examples/jsm/loaders/GLTFLoader.js';

import { gameObject, gameObjectGroup } from './gameObject.js';
import { gameFunc } from './gameFunc.js';
import { keyInputReceiver, keyInput } from './keyInputReceiver.js';
import { touchInputReceiver, touchInput } from './touchInputReceiver.js';
import { gameUIController } from './gameUIController.js';
import { gameScene } from './gameScene.js';
//import { GLTFLoader } from './three/loaders/GLTFLoader.js';

//----------------------------------------
//  ゲームエフェクト管理: エフェクト処理の管理
//----------------------------------------
//  EngineとかManageとか名前にした方がいいかと
export class gmEffects {
    constructor() {
        this.gf = null;
        this.gc = null;
        this.fInit = false;

        this.models = null; //  オブジェクトコピー用の元モデル

        //弾(矢)管理
        this.effectgroup = null; //  弾の配列
        this.useammo = null; //  現在の弾
        this.nowammoIndex = 0;
    }

    //----------------------------------------
    //  ループ
    //----------------------------------------
    task() {
        //  初期化されているかなどの確認
        if (!this.fInit || !this.gc || !this.gf || !this.effectgroup) {
            //console.log("eff.task: 何かない", this);
            return;
        }

        //let plo = pl.spineMesh;

        // spineローディング管理
        //        if (this.gf.manageSpineModelLoading(this.plobj, this.gc.scene)) {
        //console.log("読み込みおわったわーwww");
        //        }

        //  弾グループを処理
        this.effectgroup.task(this.gc, this.gf);
    }

    //----------------------------------------
    //  初期化
    //----------------------------------------
    init(i_gc, i_gf) {
        //初期化済みなら終了
        if (this.fInit) return;

        this.fInit = true;
        this.gc = i_gc;
        this.gf = i_gf;
    }


    //----------------------------------------
    //  破棄
    //----------------------------------------
    destroy() {
        this.fInit = false;
        if (this.effectgroup) {
            this.effectgroup.destroy(this.gc.scene);
            this.effectgroup = null;
        }

    }

    //----------------------------------------
    //  最初に作るものがあれば
    //----------------------------------------
    make() {}

    //----------------------------------------
    //  元モデルを作る
    //----------------------------------------
    makeModels() {}


    //----------------------------------------
    //  エフェクト追加追加
    //----------------------------------------
    addEffect(i_effName, i_position, i_number) {
        let sce = this.gc.scene;
        if (!this.effectgroup) {
            this.effectgroup = new gmEffectGroup();
            this.effectgroup.init();
        }
        let eff = this.effectgroup.addEffect();

        if (!eff) return;
        //  モデル名の指定と別に、固有の識別名も必用か
        eff.init();
        eff.make(this.gc, this.gf, i_effName, i_position, i_number);
        //sce.add(amo.ammoobj.object);
        //        console.log("addEffect ", eff );
        return eff;
    }
}



//----------------------------------------
//  エフェクトグループ
//  グループはエフェクトオブジェクトを保持しているだけ
//----------------------------------------
export class gmEffectGroup {
    constructor() {
        this.fInit = false;
        this.effects = null;
    }

    //  全弾の処理
    task(i_gc, i_gf) {
        //  処理
        for (let i = 0; i < this.effects.length; i++) {
            let ef = this.effects[i];
            if (ef == null) continue;
            ef.task(i_gc, i_gf);
        }
        //  終了フラグ処理
        for (let i = 0; i < this.effects.length; i++) {
            let ef = this.effects[i];
            if (ef == null) {
                this.effects.splice(i, 1);
            }
            //  終了フラグが立ってたら減らす
            if (ef.fEnd) {
                ef.destroy();
                this.effects[i] = null;
                this.effects.splice(i, 1);
            }
        }
    }

    //  初期化
    init(i_gc) {
        //初期化済みなら終了
        if (this.fInit) return;
        this.fInit = true;
    }

    //  破棄
    destroy(i_scene) {
        for (let i = 0; i < this.effects.length; i++) {
            this.effects[i].destroy(i_scene);
            this.effects[i] = null;
        }
        this.effects = null;
        this.fInit = false;
    }

    //  作成
    addEffect() {
        //  配列でなければ配列作成
        if (!Array.isArray(this.effects)) {
            this.effects = new Array();
        }
        let neweff = new gmEffect();
        neweff.init();
        //neweff.userobj = i_user;
        this.effects.push(neweff);
        //  追加した配列番号を返す
        return this.effects[this.effects.length - 1];

    }
}




//----------------------------------------
//  エフェクト
//  
//----------------------------------------
export class gmEffect {
    constructor() {
        this.fInit = false;
        this.userobj = null; //  弾の所有者
        this.effectobj = null;
        this.scene = null; //  エフェクトによって突っ込むシーンが違うので保存

        this.targetobj = null; //  刺さった相手
        this.effName = null;
        this.state = 0; // ターゲットの状態
        this.routine = 0; //  ルーチンパターン
        this.counter = 0; //  カウント汎用
        this.nowaction = 0; //  現在のアクション

        this.direction = new THREE.Vector3(); //  向き
        this.speed = null;
        this.fEnd = false;
    }

    //  初期化
    init() {
        //初期化済みなら終了
        if (this.fInit) return;
        this.fInit = true;
        this.effectobj = null;
        this.counter = 0;
        this.speed = new THREE.Vector3();
        this.fEnd = false;
    }

    //  破棄
    destroy(i_scene) {
        this.fInit = false;
        //console.log("eff : destroy : ", this.effectobj);
        //console.log(" gameImage:destroy() : object");
        if (this.effectobj.material) this.effectobj.material.dispose();
        if (this.effectobj.geometry) this.effectobj.geometry.dispose();
        this.scene.remove(this.effectobj);
        this.effectobj = null;
    }

    make(i_gc, i_gf, i_effectName, i_position, i_number) {
        let obj = null;
        this.effName = i_effectName;
        switch (i_effectName) {
            case "getScoreDisp":
                this.scene = i_gc.scene;
                let txtscore = i_number + "点";
                //  3D座標から2D座標を取得する
                let pos2d = new THREE.Vector3();
                pos2d.copy(i_position);
                /*
                                pos2d.project(i_gc.camera);
                                var sposx = pos2d.x,
                                    sposy = pos2d.y;
                                if (pos2d.z < 1) {
                                    sposx = i_gc.cwidth * 0.5 + (pos2d.x * 0.5 * i_gc.cwidth);
                                    sposy = i_gc.cheight * 0.5 + (pos2d.y * -0.5 * i_gc.cheight);
                                }
                                pos2d.set(sposx, sposy, pos2d.z);
                */

                //  2D上の座標をセット
                this.effectobj = i_gf.makeTextObject(
                    this.scene,
                    txtscore,
                    pos2d, 60,
                    'rgba(0, 0, 0, 0.0)', 'white', false, false);
                //                    'rgba(0, 0, 0, 0.0)', 'white', true, true);

                //  コピーオブジェクトの設定
                //this.routine = i_pattern;
                //console.log("[EFFECT作成]");
                return this.effectobj;
                break;
        }
        return null;
    }

    //--------------------------------
    //  ループ処理
    //--------------------------------
    task(i_gc, i_gf) {
        var eo = this.effectobj;
        //        var obj3d = this.obj3d_mato;
        //  基礎管理( 読み込み処理未完の対応(startPosition等)の処理 )
        //if (!eo.manage()) return;
        if (this.fEnd) {
            return;
        }

        //var o = go.object;
        //if (o == null) return;
        //  ルーチン番号によって分岐
        //        console.log("effect.task: taskはきてるー", this);
        switch (this.effName) {
            case "getScoreDisp":
                this.task_getScoreDisp();
                break;
        }
    }

    //--------------------------------
    //  動作 [ スコアの入手 ]
    //--------------------------------
    task_getScoreDisp() {
        var obj3d = this.effectobj;
        if (!obj3d) return;
        //  基礎管理

        let gobj = obj3d;
        let obj = obj3d.object;
        let eff = this.effectobj;
        //  スピードの調整
        var speed = 0.1;

        //console.log(" ammo arrow1 : きてはいる", this.nowaction);
        //  状態により分岐
        switch (this.nowaction) {
            //  初期化
            case 0:
                this.nowaction = 1;
                break;

                //  飛び位置初期化
            case 1:
                eff.position.y += 1;
                eff.material.opacity -= 1.0 / 60;
                this.counter++;
                if (60 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 0;
                    this.fEnd = true;
                }
                break;
        }

    }

}