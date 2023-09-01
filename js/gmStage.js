import { GLTFLoader } from 'https://unpkg.com/three@0.148.0/examples/jsm/loaders/GLTFLoader.js';

import { gameObject, gameObjectGroup } from './gameObject.js';
import { gameFunc } from './gameFunc.js';
import { keyInputReceiver, keyInput } from './keyInputReceiver.js';
import { touchInputReceiver, touchInput } from './touchInputReceiver.js';
import { gameUIController } from './gameUIController.js';
import { gameScene } from './gameScene.js';
//import { GLTFLoader } from './three/loaders/GLTFLoader.js';

//----------------------------------------
//  ゲームシーン : ゲームのステージ
//  ステージの進行と物体の管理
//----------------------------------------
export class gmStage {
    constructor() {
        this.gf = null;
        this.gc = null;
        this.fInit = false;

        this.models = null; //  オブジェクトコピー用の元モデル

        this.waves = null; //  ウェーブグループ
        this.nowStageIndex = 0; // 現在のステージ番号
        this.nowwave = 0; //  現在のウェーブ

        this.fStageFirst = false; //  ステージ最初
        this.fStageClear = false;
    }

    //----------------------------------------
    //  ループ
    //----------------------------------------
    task() {
        if (!this.fInit || !this.gc || !this.gf || !this.waves) return false;

        if (this.waves.waves.length <= 0) return false;

        //  ステージ開始時の処理
        if (!this.fStageFirst) {
            //  ウェーブの取得
            let nw = this.waves.waves[this.nowwave];
            //  ウェーブのターゲットを表示
            nw.startWave();
            this.fStageFirst = true;
        }
        //        console.log("stage.task きてる？", this.waves, this.nowwave);
        //        console.log("stage.task", nw, this.waves);

        //  全ウェーブの処理
        this.taskWaveAll();

        //  ステージクリア時の処理
        if (this.fStageClear) {
            return true;
        }
        /*        //  現在のウェーブを処理
                nw.task(this.gc, this.gf);

                //  ウェーブが終了したら次へ進む
                if (nw.checkEndWave()) {
                    //  現在のウェーブを処理する
                    nw.taskWaveEnd();
                    //  次へ進む
                    this.nowwave += 1;
                    //  最終ウェーブが終った
                    if (this.waves.waves.length <= this.nowwave) {
                        console.log("最終ウェーブ終った");
                        this.fStageClear = true;
                    }
                    //  まだウェーブがある
                    else {
                        nw = this.waves.waves[this.nowwave];
                        //  ウェーブのターゲットを表示
                        nw.startWave();

                    }
                }
        */
        return false;
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
        if (this.waves) {
            this.waves.destroy(this.gc.scene);
            this.waves = null;
        }
        if (this.models) {
            this.models.destroyAll(this.gc.scene);
            this.models = null;

        }

    }

    getNowWave() {
        if (!this.waves) return null;
        return this.waves.waves[this.nowwave];

    }

    //----------------------------------------
    //  元モデルを作る
    //----------------------------------------
    async makeModels() {
        //  最初に全部読み込む事で、その時ローディングを入れて止めるんだろう
        this.models = new gameObjectGroup();
        let ms = this.models;
        let gmobj;
        //  矢

        //  まと
        gmobj = new gameObject();
        await this.gf.loadGLTFModel('gltf/mato02_x100.glb', "mato", gmobj, this.gc.sceneMaterial);
        ms.add(gmobj);
        gmobj.setPosition(0, 0, 0); //
        gmobj.setScale(1, 1, 1); //
        gmobj.object.visible = false;
        //gmobj.name = "mato";
        //gmobj.setRotation(0, -90, 0); //  向きはその時決めた方がいい
        //  取得する時はmodels.getObject( name );で名前検索
    }

    //----------------------------------------
    //  面を作る
    //----------------------------------------
    makeStage(i_stageIndex) {
        if (!this.waves) {
            this.waves = new gmWaveGroup();
        }
        //  一度破棄
        else {
            this.waves.destroy();
        }
        //  ステージ番号によって分岐
        switch (i_stageIndex) {
            case 0:
                break;
            case 1:
                this.makeStage_1();
                break;
        }
    }

    //----------------------------------------
    //  個別の作成
    //----------------------------------------
    makeStage_1() {
        //console.log("★　makeStage1　★");

        //  三つのウェーブ、各種サイズ違いのまとが一つずつ
        //  wave1 : とりあえず1個でいい
        let w = this.waves.addWave();
        //  モデル名の指定と別に、固有の識別名も必用か
        this.addTarget(w, this.models, "mato", new THREE.Vector3(350, 150, 600), 2.5, 1);

        //  wave2 : サイズ違い
        w = this.waves.addWave();
        this.addTarget(w, this.models, "mato", new THREE.Vector3(400, 150, 600), 2, 0);


        //  wave3 : サイズ違い
        w = this.waves.addWave();
        this.addTarget(w, this.models, "mato", new THREE.Vector3(500, 200, 600), 1, 0);

    }

    //----------------------------------------
    //  個別の作成
    //----------------------------------------
    addTarget(i_wave, i_models, i_modelname, i_position, i_size, i_pattern) {
        let sce = this.gc.scene;
        let w = i_wave;
        //  モデル名の指定と別に、固有の識別名も必用か
        let ret = w.addTarget(i_models, i_modelname, i_position, i_size, i_pattern);
        sce.add(ret.object);
        // いやまて、ウェーブ設定なのだから
        //  ウェーブが始まるまでは追加しちゃだめか
        //console.log("addTarget ", ret);
        //  もしくは、全て非表示にしておくという手もある
        //  落とした的を残しておく演出がしたいなら、消さずに増やしていくと。
    }

    //----------------------------------------
    //  全ウェーブの処理
    //----------------------------------------
    taskWaveAll() {
        for (let i = 0; i < this.waves.waves.length; i++) {
            //  現在進行中のウェーブを超えたら処理しない
            if (this.nowwave < i) continue;
            //console.log("taskWaveAll: ", i, this.nowwave, this.waves.waves.length);
            //  ウェーブの取得
            let nw = this.waves.waves[i];
            //  処理 : 終ったウェーブでもターゲットの後処理を行う
            //console.log("taskWaveAll: ", i, this.nowwave, nw);
            nw.task(this.fStageClear, this.gc, this.gf);

            //  現在進行中のウェーブ、かつ終了したら次へ進む処理
            if (this.nowwave == i &&
                nw.checkEndWave()) {
                //  現在のウェーブを処理する
                nw.taskWaveEnd();
                //  次へ進む
                this.nowwave += 1;
                //  最終ウェーブが終った
                if (this.waves.waves.length <= this.nowwave) {
                    //console.log("最終ウェーブ終った");
                    this.fStageClear = true;
                }
                //  まだウェーブがある
                else {
                    nw = this.waves.waves[this.nowwave];
                    //  ウェーブのターゲットを表示
                    nw.startWave();

                }
            }
        }

    }
}



//----------------------------------------
//  ウェーブグループ
//  １つのステージはウェーブの組み合わせでできている
//  グループはウェーブを保持しているだけ
//----------------------------------------
export class gmWaveGroup {
    constructor() {
        this.fInit = false;
        this.waves = null;
    }

    //  ループ
    task(i_gc) {

    }

    //  初期化
    init(i_gc) {
        //初期化済みなら終了
        if (this.fInit) return;
        this.fInit = true;
    }

    //  破棄
    destroy(i_scene) {
        for (let i = 0; i < this.waves.length; i++) {
            this.waves[i].destroy(i_scene);
            this.waves[i] = null;
        }
        this.waves = null;
        this.fInit = false;
    }

    //  作成
    makeWaves(i_count) {
        this.waves = new Array(i_count);
        for (let i = 0; i < i_count; i++) {
            this.waves[i] = new gmWave();
        }
    }

    //  作成
    addWave() {
        //  配列でなければ配列作成
        if (!Array.isArray(this.waves)) {
            this.waves = new Array();
        }
        //  gmWaveを追加
        //  jsバージョンによって返り値が違うという話なのでreturnに使わない
        this.waves.push(new gmWave());
        //  追加した配列番号を返す
        return this.waves[this.waves.length - 1];

    }
}



//----------------------------------------
//  ウェーブ
//  １つのウェーブは複数のターゲットオブジェクトの集まり
//----------------------------------------
export class gmWave {
    constructor() {
        this.fInit = false;
        this.targets = null;
    }

    //  ループ
    task(i_fStageClear, i_gc, i_gf) {
        //  全てのターゲットの処理
        for (let i = 0; i < this.targets.length; i++) {
            let tar = this.targets[i];
            if (tar.fEnd) continue;
            tar.task(i_fStageClear, i_gc, i_gf);
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
        this.fInit = false;
        for (let i = 0; i < this.targets.length; i++) {
            this.targets[i].destroy(i_scene);
            this.targets[i] = null;
        }
        this.targets = null;
    }

    //  
    addTarget(i_srcobjects, i_targetName, i_position, i_size, i_pattern) {
        //  配列でなければ配列作成
        if (!Array.isArray(this.targets)) {
            this.targets = new Array();
        }
        this.targets.push(new gmTarget());

        let t = this.targets[this.targets.length - 1];
        //  ターゲットの作成、名前指定
        return t.make(i_srcobjects, i_targetName, i_position, i_size, i_pattern);
    }

    //  ウェーブ開始時、全てのターゲットを可視化
    startWave() {
        //console.log("startWave:", this.targets.length);
        for (let i = 0; i < this.targets.length; i++) {
            //console.log("startWave:", i, this.targets[i].targetobj);
            //  objがあれば表示
            if (this.targets[i].targetobj) {
                this.targets[i].targetobj.object.visible = true;
            }
        }
    }
    checkEndWave() {
        //  全てのターゲットに刺さったポイントがあるか
        for (let i = 0; i < this.targets.length; i++) {
            //  ひとつでも刺さってないものがあればfalse
            if (!this.targets[i].stabbedPoint) return false;
        }
        //  全て刺さっていた場合にウェーブ終了
        return true;
    }

    taskWaveEnd() {
        //  全て非表示にする？
    }

}


//----------------------------------------
//  ターゲット
//  １つのターゲットはゲーム内敵のようなもの
//----------------------------------------
export class gmTarget {
    constructor() {
        this.fInit = false;
        this.targetobj = null;
        this.ammoobj = null; //  刺さった矢
        this.stabbedPoint = null; // 刺さった矢のポイント
        this.stabbedAcc = null; // 刺さった衝撃の加速度
        this.objscale = 0; //  スコア判定に使う倍率
        this.state = 0; // ターゲットの状態
        this.routine = 0; //  ルーチンパターン
        this.counter = 0; //  カウント汎用
        this.nowaction = 0; //  現在のアクション
        this.hitradius = 0; //  判定の半径

        this.direction = new THREE.Vector3(); //  向き(lookAtで使う)
        this.fEnd = false;
    }

    //  初期化
    init(i_gc) {
        //初期化済みなら終了
        if (this.fInit) return;
        this.fInit = true;
        this.targetobj = null;
        this.ammoobj = null;
        this.stabbedPoint = null;
        this.counter = 0;
    }

    //  破棄
    destroy(i_scene) {
        this.fInit = false;
        this.targetobj.destroy(i_scene);
        this.targetobj = null;
        this.ammoobj = null;
        this.stabbedPoint = null;
    }

    //  ターゲットの作成、名前指定
    make(i_srcobjects, i_targetName, i_position, i_size, i_pattern) {
        let obj = null;
        switch (i_targetName) {
            case "mato":
                //                await this.gf.loadGLTFModel('./gltf/mato02_x100.glb', "mato", this.obj3d_mato, this.gc.scene);
                //  指定した名前からオブジェクトを探しコピー
                let ret = i_srcobjects.getObject(i_targetName);
                if (ret) this.targetobj = ret.clone();

                //  コピーオブジェクトの設定
                obj = this.targetobj;
                obj.setPosition(i_position.x, i_position.y, i_position.z); //
                obj.setScale(i_size, i_size, i_size); //
                //  自動的に横向きにしておく？
                obj.setRotation(0, -90, 0);
                this.direction.set(-1, 0, 0); //  左向き
                this.hitradius = 40 * i_size; //  判定半径
                this.objscale = i_size;
                obj.object.name = "mato";
                obj.object.visible = false;
                this.routine = i_pattern;
                //console.log("[ターゲットオブジェクト]", i_targetName,
                //i_srcobjects, ret, this.targetobj, this.targetobj.position);
                //this.objs.add(this.obj3d_mato);
                //console.log("[gmobj]", gmobj);
                //console.log(" : obj", obj);
                return this.targetobj;
                break;
        }
        return null;
    }

    //----------------------------------------
    //  弾の刺さった処理
    //----------------------------------------
    stabbed(i_point, i_ammo) {
        //                ammo.stabbedPoint = new THREE.Vector3().copy(ret);
        //  object座標を引いている距離
        this.stabbedPoint = new THREE.Vector3().copy(i_point);
        this.ammoobj = i_ammo; //  ターゲットに刺さった弾
        i_ammo.targetobj = this; //  弾から見たターゲット
        //  衝撃を吸収しつつのけぞる
        this.stabbedAcc = new THREE.Vector3();
        this.stabbedAcc.set(i_ammo.speed.x / 4, i_ammo.speed.y / 5, 0);
        //this.targetobj.object.add(i_ammo.object);
        //console.log("stabbed: ", this.targetobj.object.children, i_ammo.ammoobj);
        //  これで入る？
        //  入ったが、モデルのバラバラのパーツが入っただけで、オブジェクトとしての回転なども受け継がれない
        //  セット関数作って全部うまくコピーしないといけない
        //            this.targetobj.object.children[0].add(i_ammo.ammoobj.object.children[0]);
        i_ammo.ammoobj.object.parent.add(this.targetobj.object);

        //  刺さった場所を先端にする( これは弾の処理)
        //ammo.ammoobj.setPosition(ret.x, ret.y, ret.z);
        this.counter = 0;
    }

    //----------------------------------------
    //  弾の刺さった処理ループ用
    //----------------------------------------
    stabbedAdjust() {
        if (!this.ammoobj) return;
        let aobj = this.ammoobj;
        //  刺さった後に矢が消えた場合エラーになる
        if (!this.ammoobj.ammoobj) return;
        let aobjo = this.ammoobj.ammoobj.object;

        //  矢の座標を的の位置にする
        //  刺さった位置 - 矢の全長
        let apos = new THREE.Vector3(
            this.stabbedPoint.x - aobj.direction.x * aobj.ObjLength,
            this.stabbedPoint.y - aobj.direction.y * aobj.ObjLength,
            this.stabbedPoint.z - aobj.direction.z * aobj.ObjLength
        );

        /*  
        let apos = new THREE.Vector3(
            this.stabbedPoint.x,
            this.stabbedPoint.y,
            this.stabbedPoint.z
        );
*/
        //console.log("stabbedAdjust :", apos, this.targetobj.object.position);
        //  刺さった位置に的の座標が含まれていない場合は足す
        apos.add(this.targetobj.object.position);
        //  ammoの座標をセット
        aobjo.position.copy(apos);

        //  刺さった位置にずらす
        // aobj.position.add(this.stabbedPoint);
    }

    //  中心から刺さった場所までの距離
    checkStabbedLength() {
        //console.log("checkStabbedLength() : ", this.stabbedPoint, this.targetobj.object.position);

        //        return this.stabbedPoint.distanceTo(this.targetobj.object.position);
        return this.stabbedPoint.distanceTo(new THREE.Vector3(0, 0, 0));
    }


    //--------------------------------
    //  ループ
    //--------------------------------
    task(i_fStageClear, i_gc, i_gf) {
        var go = this.targetobj;
        //        var obj3d = this.obj3d_mato;
        //  基礎管理( 読み込み処理未完の対応(startPosition等)の処理 )
        if (!go.manage()) return;

        //  baseSpeed
        let bs = 1;
        //  クリア時に時間進行が減速する
        if (i_fStageClear) bs = 0.1;

        var o = go.object;
        if (o == null) return;
        //  状態によって
        switch (go.state) {
            //  通常時
            case 0:
                o.children[0].material.opacity = 1;
                break;
                //  選択されてる
            case 1:
                o.children[0].material.opacity = 0.7;
                go.state = 0;
                break;
        }

        //  刺さっている
        if (this.stabbedPoint) {
            this.stabbedAdjust();
            //  回転しながら落ちていく
            o.rotation.y += 0.3 * bs;
            o.position.x += this.stabbedAcc.x * bs;
            o.position.y += this.stabbedAcc.y * bs;
            this.stabbedAcc.x -= (this.stabbedAcc.x * 0.2) * bs;
            this.stabbedAcc.y -= 3 * bs;
            //  地面抜けたので消失
            this.counter += 1 * bs;
            if (60 < this.counter) {
                if (this.ammoobj) this.ammoobj.fEnd = true;
                //  的は消えずに残って止まる
                this.fEnd = true;
            }
            //            console.log("stabbed :", o.position.y, this.ammoobj.ammoobj);
            //if (-20 <= o.position.y) {           }

            //  通常時
        } else {
            //  ルーチン番号によって分岐
            switch (this.routine) {
                case 0:
                    this.task_mato1();
                    break;
                case 1:
                    this.task_mato2();
                    break;
            }

        }

    }

    //--------------------------------
    //  動作 [ mato 1 ]
    //--------------------------------
    task_mato1() {
        var go = this.targetobj;
        var o = go.object;

        this.counter++;
        switch (this.nowaction) {
            //  左に移動
            case 0:
                o.position.x -= 2;
                if (150 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 1;
                }
                break;

                //  止まる
            case 1:
                if (30 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 2;
                }
                break;

                //  右に移動
            case 2:
                o.position.x += 2;
                if (150 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 3;
                }
                break;
                //  止まる
            case 3:
                if (60 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 0;
                }
                break;
        }
    }

    //--------------------------------
    //  動作 [ mato 2 ]
    //--------------------------------
    task_mato2() {
        var go = this.targetobj;
        var o = go.object;

        this.counter++;
        switch (this.nowaction) {
            //  左上に移動
            case 0:
                o.position.x -= 1.5;
                o.position.y -= 1.5;
                if (150 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 1;
                }
                break;

                //  止まる
            case 1:
                if (45 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 2;
                }
                break;

                //  右下に移動
            case 2:
                o.position.x += 1.5;
                o.position.y += 1.5;
                if (150 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 3;
                }
                break;
                //  止まる
            case 3:
                if (70 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 0;
                }
                break;
        }
    }

}