//import * as THREE from "./three/three.module.js";
//import * as THREE from 'https://unpkg.com/three@0.148.0/build/three.module.js';
//import { OrbitControls } from 'https://unpkg.com/three@0.148.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.148.0/examples/jsm/loaders/GLTFLoader.js';

import { FontLoader } from "./three/loaders/FontLoader.js";
import { TextGeometry } from "./three/geometries/TextGeometry.js";

import { gameObject, gameObjectGroup } from './gameObject.js';
import { gameFunc } from './gameFunc.js';
import { keyInputReceiver, keyInput } from './keyInputReceiver.js';
import { touchInputReceiver, touchInput } from './touchInputReceiver.js';
import { gameUIController } from './gameUIController.js';
import { gameScene } from './gameScene.js';
import { gmStage } from './gmStage.js';
import { gmPlayer } from './gmPlayer.js';
import { gmEffects } from './gmEffects.js';
import { gmSoundManage } from './gmSoundManage.js';
//import { GLTFLoader } from './three/loaders/GLTFLoader.js';
//----------------------------------------
//  ゲームシーン : ゲーム
//----------------------------------------
export class gameSceneGame extends gameScene {
    constructor() {
        super();
        this.imageCanvas = null;
        this.context = null;

        this.gf = new gameFunc();

        this.texCanvas = new gameObject();
        this.texCanvas2 = new gameObject();
        this.textureCanvas = null;
        this.textureCanvas2 = null;

        this.materialCanvas = null;
        this.materialCanvas2 = null;

        this.geometry = null;

        this.meshCanvas = null;
        this.meshCanvas2 = null;

        this.texturePainting = null;
        this.texturePainting2 = null;
        this.materialPainting = null;
        this.materialPainting2 = null;

        //  ステージ関係
        this.mato_counter = 0;
        this.mato_action = 0;
        this.mato_state = 0;
        //        this.stage = new gmStage();

        //  3D関係
        this.objs = new gameObjectGroup();
        this.obj_mato = new gameObject();
        this.obj3d_mato = new gameObject();
        this.obj_arrow = new gameObject();
        this.obj3d_arrow = new gameObject();
        this.arrow_state = 0;
        this.arrow_counter = 0;
        this.arrow_speed = new THREE.Vector3();
        this.arrow_direction = new THREE.Vector3();

        //  デバッグ系
        this.rayline = null;
        this.testplane = null;

        //  UI関係
        this.hudis = new gameObjectGroup();
        this.hudi_title = new gameObject(); //  ヘッドアップディスプレイ・イメージ
        this.hudi_usayumi = new gameObject();
        this.hudi_mato = new gameObject();
        this.hudi_pushstart = new gameObject();
        this.guic = null;
        this.hudi_txtobj = null;
        this.guic_txtobj_pulling = null; //  「ひっぱる」の表示
        this.guic_txtobj_release = null; //  「放つ」の表示

        //  デバッグ系
        this.rayline = null;
        this.rayline_s = null;
        this.rayline_e = null;
        this.helper = null;

        //  ルーチン
        this.TASKSTATE = {
            INIT: 0,
            CALC: 1,
            TASK: 2
        }
        this.taskState = this.TASKSTATE.INIT; //  勝手に処理が先行してる？為、ひと手間制御

        this.pscount = 0;
        this.pickobjectUI = null;
        this.pickobject = null;
        //  ゲーム用変数
        this.SCENESTATE = {
            NONE: 0,
            INIT: 1,
            LOOP: 2,
            SCOREBOARD: 10,
            NEXTSCENE: 99
        }
        this.sceneState = this.SCENESTATE.LOOP;

        //  スコアボード
        this.scoreBoard_count = 0;
        this.scoreBoard_state = 0;
        this.hudi_sbo_per = null; //スコアボードオブジェクト
    }


    //----------------------------------------
    //  ループ
    //----------------------------------------
    taskGameLoop(i_gc) {
        //  最初の初期化
        this.init(i_gc);
        //  ループ処理
        this.animate();
    }


    //----------------------------------------
    //  初期化
    //----------------------------------------
    init(i_gc) {
        //初期化済みなら終了
        if (this.fInit) return;

        this.fInit = true;
        this.gc = i_gc;
        this.gf.init(i_gc);
        //  シーンの3D2Dグループセット
        this.objs = new gameObjectGroup();
        this.hudis = new gameObjectGroup();
        this.gc.objs = this.objs;
        this.gc.hudis = this.hudis;
        //console.log(" gameSceneTest : init() : ゲーム本編です");

        this.arrow_state = 0;

        this.obj_mato = new gameObject();
        this.obj3d_mato = new gameObject();
        this.obj_arrow = new gameObject();
        this.obj3d_arrow = new gameObject();
        this.arrow_speed = new THREE.Vector3();
        this.arrow_direction = new THREE.Vector3();

        //  UI関係
        this.hudi_title = new gameObject(); //  ヘッドアップディスプレイ・イメージ
        this.hudi_usayumi = new gameObject();
        this.hudi_mato = new gameObject();
        this.hudi_pushstart = new gameObject();

        //  シーンテストでのオブジェクトを作成
        this.makeObject();

        //  各種初期化
        this.guic = new gameUIController();
        this.guic.init(this.gc, this.gf);
        //  シーンのHUDグループにコントローラーのオブジェクトを追加
        this.hudis.add(this.guic.hudi_bowbutton);

        this.gc.fStageClear = false;
        //  ユーザーステータスの初期化
        //  これはこれで別個クラスにした方がいいような
        this.gc.shotCount = 0; //  撃った回数
        this.gc.myscore = 0; //  スコア
        this.gc.shotAccuracy = 0;
        this.gc.enemyDefeatCount = 0;

        //  プレイヤー
        //  ボーンデータのバックアップ
        this.gc.player.backupDatas();
    }


    //----------------------------------------
    //  1フレーム
    //----------------------------------------
    animate() {
        switch (this.sceneState) {
            case this.SCENESTATE.LOOP:
                //  taskStateは、何か処理が非同期的に感じたのでフラグで縛ってみた
                //  あまり効果はなさそう
                //  オブジェクトのステータスを初期化
                if (this.taskState == this.TASKSTATE.INIT) {
                    //this.objs.setNormalAll();
                    //this.hudis.setNormalAll();
                    this.taskState = this.TASKSTATE.CALC;

                    let plo = this.gc.player.plobj;
                    plo.setPosition(-400, -400, 600); //  3d用
                    plo.setScale(0.3, 0.3, 0.3);
                    //  2D用
                    //plo.setPosition(100, 600, 0);
                    //plo.setScale(0.3, 0.3, 0.3);
                    //console.log(" game : init :", plo);
                }

                if (this.taskState == this.TASKSTATE.CALC) {
                    //  マウス座標と画面、raycast判定 3D
                    this.task_Mouse3DRaycast();
                    //  マウス座標と画面、raycast判定 2D
                    this.task_Mouse2DRaycast();
                    this.taskState = this.TASKSTATE.TASK;
                }

                if (this.taskState == this.TASKSTATE.TASK) {
                    //  ステージ・的の処理
                    if (this.gc.stage.task()) {
                        //  クリア処理
                        //                        this.sceneState = this.SCENESTATE.NEXTSCENE;
                        this.gc.soundmanage.playSingleSound("stage_clear");

                        //  コントローラーを非表示
                        if (this.guic.hudi_bowbutton)
                            this.guic.hudi_bowbutton.object.visible = false;
                        if (this.guic_txtobj_pulling)
                            this.guic_txtobj_pulling.visible = false; //  「ひっぱる」の表示
                        if (this.guic_txtobj_release)
                            this.guic_txtobj_release.visible = false; //  「放つ」の表示
                        //console.log("clear : ", this.guic.hudi_bowbutton, this.guic_txtobj_pulling, this.guic_txtobj_release);


                        //  スコアボードへ進む
                        this.sceneState = this.SCENESTATE.SCOREBOARD;
                        return;
                    }
                    //  プレイヤー・弾(矢)の処理
                    this.gc.player.task();

                    //  エフェクトの処理
                    if (this.gc.effects)
                        this.gc.effects.task();

                    //  個別でできない当たり判定などの総合的な処理
                    let stg = this.gc.stage;
                    let wav = stg.getNowWave();
                    //console.log("task_wave前", wav, stg);
                    if (wav) this.task_wave(wav);

                    //this.task_checkMouseCollision2D(this.gc.camera2d, this.gc.scene2d);

                    //  キー、マウス、タッチ入力処理
                    this.task_input();

                    //  ステータスの描画
                    //  文字列に関するループ用再作成関数も作ったほうがいい
                    if (this.hudi_txtobj) {
                        if (this.hudi_txtobj.material) this.hudi_txtobj.material.dispose();
                        if (this.hudi_txtobj.geometry) this.hudi_txtobj.geometry.dispose();
                        this.gc.scene2d.remove(this.hudi_txtobj);
                    }
                    this.mato_counter++;
                    let state_txt = "SHOT:" + this.gc.shotCount;
                    //state_txt += "　TIME:" + this.mato_counter;
                    state_txt += "　WAVE:" + (stg.nowwave + 1) + " / " + stg.waves.waves.length;
                    state_txt += "　SCORE:" + this.gc.myscore;
                    this.hudi_txtobj = this.gf.makeTextObject(this.gc.scene2d, state_txt,
                        new THREE.Vector3(500, 40, 1000), 60,
                        'rgba(0, 0, 255, 0.0)', 'black', false, true);

                    //  UI : 操作関係
                    //this.guic.task(this.gc);
                    this.taskState = this.TASKSTATE.INIT;
                }
                //  描画
                this.render();
                break;

                //  ゲームが終りスコアボード表示
            case this.SCENESTATE.SCOREBOARD:
                //                this.taskState = this.TASKSTATE.INIT;
                //  一定時間スコア表示ループ
                //  的はちゃんと落ちる
                //  ステージ・的の処理
                if (this.gc.stage.task()) {}
                //  プレイヤー・弾(矢)の処理
                this.gc.player.task();
                //  エフェクトの処理
                if (this.gc.effects) this.gc.effects.task();

                //  スコアボード処理
                this.task_scoreBoard();
                //  描画
                this.render();
                break;

                //  次のステージへ
            case this.SCENESTATE.NEXTSCENE:
                //  フェードインとかの処理が必用ならする
                this.destroy();
                //  タイトルを破棄する？
                //  カウントしてから出る？
                this.changeScene(this.gc.GAMESCENE.TITLE);
                break;
        }
    }


    //----------------------------------------
    //  破棄
    //----------------------------------------
    destroy() {
        //  タイトルのものを継続して使用する場合は破棄しなくてもいいのでは
        this.fInit = false;
        this.sceneState = this.SCENESTATE.LOOP;
        //  コントローラーの破棄
        if (this.guic) this.guic.destroy();
        //  オブジェクトの破棄
        if (this.objs) this.objs.destroyAll(this.gc.scene);
        this.gc.player.destroy();
        this.gc.stage.destroy();
        this.gc.effects.destroy();
        //  ステータス
        this.gc.scene2d.remove(this.hudi_txtobj);
        this.gc.scene2d.remove(this.guic_txtobj_pulling); //  「ひっぱる」の表示
        this.gc.scene2d.remove(this.guic_txtobj_release); //  「放つ」の表示
        //  スコアボード
        this.gc.scene2d.remove(this.hudi_sbo_per);
        //  コントローラー
        if (this.guic) {
            this.guic.destroy();
            //  シーンのHUDグループにコントローラーのオブジェクトを追加
            this.hudis.destroyAll();

            this.guic = null;
        }

    }


    //----------------------------------------
    //  シーン切替
    //----------------------------------------
    changeScene(i_scene) {
        this.gc.nowScene = i_scene;
        //console.log(" gameSceneGame : changeScene() : 脱出だ");
        this.destroy();
        return true;
    }


    //----------------------------------------
    //  シーン中のオブジェクト作成
    //----------------------------------------
    makeObject() {
        //  テスト用のカメラとシーン
        // 座標情報をはっきりさせるためにx=0 y=0 z=0 に軸表示のヘルパーを置く
        /*
                let axis = new THREE.AxesHelper(2000);
                axis.position.set(0, 0, 0);
                this.gc.scene.add(axis);
        */
        //  ステージの作成
        //     的オブジェクトの作成も含む
        this.gc.stage.makeStage(1);

        //  プレイヤーの作成
        //     弾・弓オブジェクトの作成も含む
        this.gc.player.makePlayer(0);

        //  エフェクト初期化
        this.gc.effects.make();

        //  シーンオブジェクト

        //  2D HUD
        //  タイトル
        //this.makeObject_hud(this.gc.scene2d);
        let txt = null;
        this.guic_txtobj_pulling = null; //  「ひっぱる」の表示
        this.guic_txtobj_release = null; //  「放つ」の表示
        txt = "ひっぱる";
        this.guic_txtobj_pulling = this.gf.makeTextObject(this.gc.scene2d, "ひっぱる",
            new THREE.Vector3(100, 0, 0), 40,
            'rgba(0, 0, 0, 0.0)', 'white', false, true);
        this.guic_txtobj_release = this.gf.makeTextObject(this.gc.scene2d, "離す",
            new THREE.Vector3(100, 100, 0), 40,
            'rgba(0, 0, 0, 0.0)', 'white', false, true);

        this.guic_txtobj_pulling.visible = false;
        this.guic_txtobj_release.visible = false;

        /*        
                //  フォントテスト
                const fontLoader = new FontLoader();
                fontLoader.load("./fonts/rounded_mplus_1c_medium_regular.json", (font) => {
                    console.log("loaded font!!");
                    const textGeometry = new TextGeometry("ARROW: 5　　WAVE 1/3　　SCORE : 32060", {
                        font: font,
                        size: -20,
                        height: 1,
                        bevelOffset: 0,
                        bevelSegments: 5,
                    });
                    textGeometry.center();

                    const textMaterial = new THREE.MeshStandardMaterial();
                    const text = new THREE.Mesh(textGeometry, textMaterial);
                    text.castShadow = true;
                    text.position.set(400, 40, 300);
                    text.scale.set(-1, 1, 1);
                    this.gc.scene2d.add(text);
                });
        */

    }

    //----------------------------------------
    // 確認用にRaycasterと同じ位置にLineを引く
    //----------------------------------------
    makeObject_rayline(i_ox, i_oy, i_oz, i_ex, i_ey, i_ez) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i_ox, i_oy, i_oz),
            new THREE.Vector3(i_ex, i_ey, i_ez)
        ]);
        const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0xffffff }));
        line.name = "rayline";
        this.gc.scene.add(line);

        this.rayline = line;
    }

    destroyObject_rayline() {
        if (this.rayline == null) return;
        this.gc.scene.remove(this.rayline);
        this.rayline.material.dispose();
        this.rayline.geometry.dispose();
    }



    //----------------------------------------
    //  オブジェクト作成 : UI
    //----------------------------------------
    async makeObject_HUD(i_scene) {
        var gmobj = null;;
        var gmobjo = null;

        //----------------
        //   ウサ弓
        await this.gf.makeHUDImage('textures/sTitle/usayumi.png', "usayumi", this.hudi_usayumi, i_scene);
        gmobj = this.hudi_usayumi;
        gmobjo = gmobj.object;
        gmobj.setPosition(-300,
            (this.gc.GAMESCREEN_MAXHEIGHT) - (gmobj.height / 1.5),
            1000);
        gmobj.setSizeScale(1, 1, 1);

        //----------------
        //   的
        await this.gf.makeHUDImage('textures/sTitle/mato.png', "mato", this.hudi_mato, i_scene);
        gmobj = this.hudi_mato;
        gmobjo = gmobj.object;
        //        gmobj.setPosition(this.gc.cwidth - gmobj.width * 2.5, -100, 1000);
        gmobj.setPosition(this.gc.GAMESCREEN_MAXWIDTH - gmobj.width * 5, -200, 1000);
        gmobj.setSizeScale(3, 3, 1);

    }


    //----------------------------------------
    //  描画
    //----------------------------------------
    render() {
        var pgc = this.gc;
        //        console.log("[pgc]", pgc);
        //        console.log("[pgc.camera]", pgc.camera);


        let mxc = pgc.mouseXc;
        let myc = pgc.mouseYc;
        if (100 < mxc) mxc = 100;
        //        if (myc < 100) myc = 100;
        if (myc < -50) myc = -50;
        if (280 < myc) myc = 280;



        //if (100 < myc) myc = 100;
        //  マウスの画面内位置で、カメラのポジション調整
        pgc.camera.position.x += ((mxc) - pgc.camera.position.x) * 0.05;
        pgc.camera.position.y += (-(myc) - pgc.camera.position.y) * 0.05;
        //pgc.camera.position.y += (-(pgc.mouseYc) - pgc.camera.position.y) * .05;

        //  カメラは常に中央を向く
        pgc.camera.lookAt(pgc.scene.position);

        //  画面のクリア
        pgc.renderer.clear();

        pgc.renderer.setScissorTest(true); // 描画矩形を利用する
        pgc.renderer.setScissor(0, 0, pgc.cwidth, pgc.cheight); //  描画する矩形を決める

        //  背景シーン描画
        pgc.renderer.render(pgc.sceneBackground, pgc.camera); //  描画

        //  spine描画
        pgc.renderer.render(pgc.sceneSpine, pgc.camera); //  描画

        //  シーン1描画
        pgc.renderer.render(pgc.scene, pgc.camera); //  描画


        //  シーン2D( HUD )描画
        pgc.renderer.setScissorTest(false); //  
        pgc.renderer.render(pgc.scene2d, pgc.camera2d);
        pgc.camera2d.updateProjectionMatrix();

        pgc.renderer.setScissorTest(false);
    }





    //========================================================
    //
    //  ゲーム処理
    //
    //========================================================
    //--------------------------------------------------------
    //  3Dの判定
    //--------------------------------------------------------
    task_Mouse3DRaycast() {
        //  マウスと3Dの判定
        if (this.gf.checkMouseCollision3D(this.gc.camera, this.gc.scene, this.gc)) {
            this.task_object3DHover(this.gc.pickobject);
        } else {
            this.gc.pickobject = null;
        }

    }

    //--------------------------------------------------------
    //  2Dの判定 HUD
    //--------------------------------------------------------
    task_Mouse2DRaycast() {
        //  マウスと2Dの判定
        if (this.gf.checkMouseCollision2D(this.gc.camera2d, this.gc.scene2d, this.gc)) {
            //this.gc.pickobjectUI.fCursorHoverrrrr = true;
            this.gc.pickobjectUI.fHover = true;

            this.task_object2DHover(this.gc.pickobjectUI);
        } else {
            if (this.gc.pickobjectUI) {
                //this.gc.pickobjectUI.fHover = true;
                this.gc.pickobjectUI.fHover = false;
                this.gc.pickobjectUI = null;
            }
        }

    }

    //--------------------------------------------------------
    //  的の処理
    //--------------------------------------------------------
    task_mato() {
        var gobj = this.obj3d_mato;
        //        var obj3d = this.obj3d_mato;
        //  基礎管理
        if (!gobj.manage()) return;

        var obj = gobj.object;
        if (obj == null) return;
        //  状態によって
        switch (gobj.state) {
            //  通常時
            case 0:
                obj.children[0].material.opacity = 1;
                break;
                //  選択されてる
            case 1:
                obj.children[0].material.opacity = 0.7;
                //  自動解除はないので自分で解除
                gobj.state = 0;
                break;
        }

        //  オブジェクト思考なら的クラス作って的が自立した方がいいとは思う
        this.mato_counter++;
        switch (this.mato_action) {
            //  左に移動
            case 0:
                obj.position.x -= 2;
                if (150 < this.mato_counter) {
                    this.mato_counter = 0;
                    this.mato_action = 1;
                }
                break;

                //  止まる
            case 1:
                if (30 < this.mato_counter) {
                    this.mato_counter = 0;
                    this.mato_action = 2;
                }
                break;

                //  右に移動
            case 2:
                obj.position.x += 2;
                if (150 < this.mato_counter) {
                    this.mato_counter = 0;
                    this.mato_action = 3;
                }
                break;
                //  止まる
            case 3:
                if (60 < this.mato_counter) {
                    this.mato_counter = 0;
                    this.mato_action = 0;
                }
                break;
        }
    }


    //--------------------------------------------------------
    //  矢の処理
    //--------------------------------------------------------
    task_arrow() {
        //  
        let stg = this.gc.stage;
        let wav = stg.getNowWave();
        //console.log("task_wave前", wav, stg);
        if (wav) this.task_wave(wav);

    }



    //--------------------------------------------------------
    //  ウェーブの処理
    //--------------------------------------------------------
    task_wave(i_wave) {
        //console.log("task_wave", i_wave.targets.length);
        for (let i = 0; i < i_wave.targets.length; i++) {
            this.task_waveTarget_arrowhitAll(i_wave.targets[i]);
        }
    }

    //--------------------------------------------------------
    //  ターゲットと弾の衝突判定
    //--------------------------------------------------------
    task_waveTarget_arrowhitAll(i_target) {

        //console.log("task_arrowhit ", this.player, i_target);
        if (!this.gc.player) return;
        //  矢と面の判定
        var tar = i_target;
        //  このターゲットは既に刺さっているので判定しない
        if (tar.stabbedPoint) return;
        var tobj = tar.targetobj.object;
        if (tobj) {
            //  まとをセット
            //  光線を可視化 / 毎回作り直す
            //            this.destroyObject_rayline();
            var ammos = this.gc.player.ammos;
            //  このターゲットと、全ての弾を判定する
            //console.log("task_arrowhit", ammos.ammos.length);
            for (let i = 0; i < ammos.ammos.length; i++) {
                if (ammos.ammos[i]) {
                    this.task_waveTarget_ammohit(i_target, ammos.ammos[i]);
                }
            }
        }
    }

    //--------------------------------------------------------
    //  ターゲットと弾の衝突判定 :指定の弾
    //--------------------------------------------------------
    task_waveTarget_ammohit(i_target, i_ammo) {

        //  矢と面の判定
        var tar = i_target;
        var tobj = tar.targetobj.object;
        if (!tobj) return;
        var ammo = i_ammo;
        //console.log("task_arrowhit ", this.gc.player, i_target, ammo);
        if (!ammo) return;
        //  既に刺さっている場合判定しない
        if (ammo.targetobj) return;
        var aobj = ammo.ammoobj;

        let tsrp = ammo.hitLineOrigin;
        let tsrd = ammo.hitLineDist;
        //  作りたてか何かで判定線がない
        if (!tsrp) return;
        let tspp = tobj.position;
        let tspd = new THREE.Vector3(tspp.x, tspp.y, tspp.z);
        tspd.add(tar.direction);
        //            this.makeObject_rayline(tsrp.x, tsrp.y, tsrp.z + 10,
        //                tsrp.x + tsrd.x, tsrp.y + tsrd.y, tsrp.z + tsrd.z + 10);
        //this.makeObject_rayline(tsrp.x, tsrp.y, tsrp.z + 5,
        //    tsrd.x, tsrd.y, tsrd.z + 5);
        //  円面判定をする
        //console.log('判定前', tsrp, tsrd, tspp, tspd);
        var ret = this.gf.checkLineCollisionCircle_Raycast(tsrp, tsrd, tspp, tar.hitradius, tspd);
        if (ret) {
            //console.log('[衝突判定]', ret);
            //console.log('ヒット', ret, aobj);
            ammo.counter = 0;
            ammo.nowaction = 4;
            //ammo.speed.x = 0;
            //ammo.speed.y = -3;

            //  刺さった処理( 位置保存、位置調整 )
            //tar.stabbed(ret, ammo);
            tar.stabbed(ret.sub(tobj.position), ammo);
            tar.stabbedAdjust();
            //            tar.stabbedPoint = new THREE.Vector3().copy(ret.sub(tobj.position));
            //            tar.ammoobj = ammo;
            //                ammo.stabbedPoint = new THREE.Vector3().copy(ret);
            //            ammo.targetobj = tar;

            //  刺さった場所を先端にする
            //ammo.ammoobj.setPosition(ret.x, ret.y, ret.z);
            //this.obj3d_arrow.object.children[0].material.opacity = 0.5;
            //  一度消して判定見えるようにする
            //this.obj3d_arrow.object.visible = false;
            //  エフェクト追加 : スコア
            let score = (100 * tar.objscale) - tar.checkStabbedLength();
            score = Math.trunc(score / tar.objscale);
            this.gc.myscore += score;
            //console.log("eff追加", tar, this.gc.effects, tar.checkStabbedLength());
            this.gc.effects.addEffect("getScoreDisp", tobj.position, score);
            //            this.gc.effects.addEffect("getScoreDisp", ret.sub(tobj.position), score);
            this.gc.soundmanage.playSingleSound("target_hit");
            this.gc.enemyDefeatCount++; //  撃破数
            //  命中率
            this.gc.shotAccuracy = (this.gc.enemyDefeatCount / this.gc.shotCount) * 100;

        }
    }


    //--------------------------------------------------------
    //  オブジェクトのホバー処理 : 3D部分
    //--------------------------------------------------------
    task_object3DHover(i_gameobject) {
        var gobj = i_gameobject;
        var obj = i_gameobject.object;
        //        gobj.mato_state = 0;
        switch (gobj.name) {
            case "mato":
                gobj.state = 1;
                //                obj.material.opacity = 0.7; //  半透明にする
                //console.log("的ですね");
                break;
        }
    }

    //--------------------------------------------------------
    //  オブジェクトの実行 : 3D部分
    //--------------------------------------------------------
    task_object3DAction(i_gameobject) {
        var gobj = i_gameobject;
        var obj = i_gameobject.object;
        //  個別操作で利用する為のホバーフラグ
        gobj.fCursorHover = true;
        //  全部matoだから暴発してる
        switch (i_gameobject.name) {
            //  まと
            case "mato":
                //this.sceneState = this.SCENESTATE.NEXTSCENE;
                break;
        }
    }


    //--------------------------------------------------------
    //  オブジェクトのホバー処理 : 2D部分 HUD
    //--------------------------------------------------------
    task_object2DHover(i_gameobject) {
        var gobj = i_gameobject;
        var obj = i_gameobject.object;
        //  個別操作で利用する為のホバーフラグ
        //i_gameobject.setCursorHover(true);
        //        gobj.fCursorHover = true;
        //this.gc.pickobjectUI.fCursorHoverrr = true;
        //        this.gc.pickobjectUI.setCursorHover(true);
        switch (gobj.name) {
            case "bowbutton":
                //                obj.material.opacity = 0.5; //  半透明にする
                //console.log("コントローラーです", this.gc.pickobjectUI);
                break;
        }
    }

    //--------------------------------------------------------
    //  オブジェクトの実行 : 2D部分 HUD
    //--------------------------------------------------------
    task_object2DAction(i_gameobject) {
        var gobj = i_gameobject;
        var obj = i_gameobject.object;
        switch (i_gameobject.name) {
            case "bowbutton":
                //console.log("コントローラークリック");
                break;
        }
    }


    //========================================
    //  操作関係
    //--------------------------------
    //--------------------------------------------------------
    //  入力処理
    //--------------------------------------------------------
    task_input() {
        //  キーボード入力処理
        const irkey = this.gc.keyInputReceiver.getInput();
        //  マウス・タッチ入力処理
        const irtouch = this.gc.touchInputReceiver.getTouch();
        //タッチ座標の設定。タッチした画面座標に、canvas要素の相対座標や、スクローラー要素を反映させる
        //                const clientRect = this.gc.gameCanvas.getBoundingClientRect();
        //                touch.x = touch.pageX - clientRect.left - this.scroller.x - window.pageXOffset;
        //                touch.y = touch.pageY - clientRect.top - this.scroller.y - window.pageYOffset;
        //console.log("task_input : 来てる");

        //------------------------------
        //  3Dオブジェクトを選択している
        if (this.gc.pickobject) {
            //console.log("task_input : クリック処理は来てる");
            //console.log("irtouch", irtouch);

            //  クリックした
            if (irtouch.touchDown()) {
                this.task_object3DAction(this.gc.pickobject);
                //                this.task_object2DAction(this.pickobject);
            }
        }
        //------------------------------
        //  UIオブジェクトを選択している
        if (this.gc.pickobjectUI) {
            //  クリックした
            if (irtouch.touchDown()) {
                this.task_object2DAction(this.gc.pickobjectUI);
            }
            //  ドラッグした
            //  離した
        }

        //------------------------------
        //  コントローラー
        //this.guic.task(this.gc);
        var obj = this.guic.hudi_bowbutton;
        if (obj.object) {

            if (this.arrow_state == 0) {
                obj.object.visible = true;
            } else {
                obj.object.visible = false;

            }
        }

        let fDisp_txt_pulling = false;
        let fDisp_txt_release = false;
        let pl = this.gc.player.plobj;
        //  乗ってる
        if (obj.fHover) {
            if (obj.object) obj.object.material.opacity = 0.5;
            //console.log(" gameUIController : task()", irtouch);
            //  ひっぱり開始
            if (irtouch.touchDown()) {
                //console.log(" gameUIController : ひっぱり開始");
                //  矢が放たれてないなら
                let nam = this.gc.player.getNowAmmo();
                if (nam.nowaction == 0) {
                    this.guic.fpulling = true;

                    //  プレイヤー ひっぱりモーション開始
                    pl.setSpineAnimation("draw", false);
                    pl.addSpineAnimation("draw-loop", true);
                    this.guic_txtobj_pulling.visible = false; //  「ひっぱる」
                    this.guic_txtobj_release.visible = false; //  「放つ」
                }
            }
        }
        //  乗ってない時
        else {
            if (obj.object) {
                obj.object.material.opacity = 1;
                //this.guic_txtobj_pulling.visible = true; //  「ひっぱる」
                this.guic_txtobj_release.visible = false; //  「放つ」
                //  「ひっぱる」の表示
                fDisp_txt_pulling = true;
            }

            //  弓を触ってない
            this.gc.player.isdraw = false;
        }

        //  ひっぱり状態
        if (this.guic.fpulling) {

            //console.log(" gameUIController : ひっぱっている");
            //  ドラッグしてる
            if (irtouch.touch()) {
                let pl = this.gc.player.plobj;
                let plo = pl.spineMesh;
                //  弓を引いてるフラグ
                this.gc.player.isdraw = true;

                //  物体のカーソル付随
                //console.log(" gameUIController : ドラッグしてる");
                //  マウスの位置をとるには？
                var mouse = new THREE.Vector2();
                mouse.x = this.gc.mouseX3D;
                mouse.y = this.gc.mouseY3D;
                //  レイキャスト・光線判定を飛ばす
                this.gc.raycaster.setFromCamera(mouse, this.gc.camera2d);
                var plen = this.gc.raycaster.ray.origin;
                var po = this.gc.raycaster.ray.origin;
                plen.z = 0;
                po.z = 0;
                //  開始位置
                var bcx = this.guic.bowbuttonCenter.x;
                var bcy = this.guic.bowbuttonCenter.y;
                //var a = Math.sqrt(Math.pow(po.x - x1, 2) + Math.pow(po.y - y1, 2));
                var a = plen.distanceTo(this.guic.bowbuttonCenter);
                //  距離が100を超えた場合移動しない
                //console.log(" gameUIController : 距離:", a);
                if (100 < a) {
                    a = 100;
                    //  po = po.normalize() * 100;
                    plen.x = plen.x - bcx;
                    plen.y = plen.y - bcy;
                    po = plen;
                    po = po.normalize();
                    //console.log(" gameUIController : 限界:", po);
                    po.x = bcx + po.x * 100;
                    po.y = bcy + po.y * 100;
                }
                //  左方向しか反応しない
                if (bcx < po.x) {
                    po.x = bcx;
                }
                //  下方向しか反応しない
                if (po.y < bcy) {
                    po.y = bcy;
                }
                //po.y = po.y*0.8;    

                obj.setPosition(po.x, po.y, 0);
                //  最終的なボタン中心からのひっぱり距離
                var pow = po.distanceTo(this.guic.bowbuttonCenter);

                //  「離す」の表示
                fDisp_txt_pulling = false;
                fDisp_txt_release = true;
                let to_rel = this.guic_txtobj_release;
                to_rel.visible = true; //  「離す」
                to_rel.position.set(po.x + 70, po.y, 0);

                //  弾(矢)の方向を狙っている方角にする
                let pdx = -(po.x - bcx);
                let pdy = po.y - bcy;
                //  角度とパワーが0の時
                if (pdx == 0 && pdy == 0) {
                    this.gc.player.setAmmoDirection(1, 0, 0);
                } else {
                    this.gc.player.setAmmoDirection(pdx, pdy * 0.7, 0);
                }
                this.gc.player.setAmmoSpeed(pow * 2);
                //  プレイヤーspineの弓持ってる腕を狙っている方向に向ける
                let pik = pl.getSpineBoneIK("LarmIK");
                //                pik.target.data.x = 200 + pdx * 3;

                //pik.target.data.x = 200 + 200 + pdx * 2;
                //pik.target.data.y = 700 + 200 + (pdy * 1);
                pik.target.data.x = 200 + pdx * 4;
                pik.target.data.y = 700 + 0 + (pdy * 3);

                //                pik.target.data.x = pdx * 5;
                //                pik.target.data.y = 700 + (pdy * 4);
                //console.log("IKの位置変えたい :", pik.target, pdx, pdy);
                //obj.setPosition(this.guic.bowbuttonCenter.x, this.guic.bowbuttonCenter.y, 0);
                //console.log(" gameUIController : ドラッグしてる:", obj.object.position, this.guic.bowbuttonCenter);
                //  視線IKも作るべきだった・・headの先にIK作ればいけた
                let b_head = pl.getSpineBone("head");
                if (b_head) {
                    //b_head.rotationx = 25;
                    b_head.data.rotation = 10 + pdy / 8;
                    //                    b_head.data.rotation = a / 4;
                }
                let b_torso = pl.getSpineBone("torso");
                if (b_torso) {
                    b_torso.data.rotation = -10 + pdy / 4;
                }

                //  引く位置と力によって、右手・腕位置調整
                let b_rh = pl.getSpineBone("Rhand");
                if (b_rh) {
                    //                    b_rh.data.x = -50 + pdx * 2;
                    //                    b_rh.data.y = 100 + pdy;
                    b_rh.data.x = -200 + pdx * 2;
                    b_rh.data.y = 0 + pdy;

                }
                let b_ra2 = pl.getSpineBone("Rarm2");
                if (b_ra2) {
                    //b_ra2.data.x = -100 + pdx;
                    b_ra2.data.y = 0 + pdy;
                    b_ra2.data.x = -50 + pdx;
                    //                    b_ra2.data.y = 0 + pdy;
                }
                //------------------
                //  改めて矢の角度を決める( 弓の方向を見る)
                let na = this.gc.player.getNowAmmo(); //  nowammo
                let bow = pl.getSpineBone("bow");
                //let plo = pl.spineMesh;
                let plsize = plo.scale.x;
                //  player.task内で行われている「右手に弾」の座標計算、
                let nax = plo.position.x + (b_rh.worldX * plsize);
                let nay = plo.position.y + (b_rh.worldY * plsize) + 10;
                //  弓の位置
                let bowx = plo.position.x + (bow.worldX * plsize);
                let bowy = plo.position.y + (bow.worldY * plsize);
                //let nax = bow.worldX - na.ammoobj.object.position.x;
                //let nay = bow.worldY - na.ammoobj.object.position.y;
                this.gc.player.setAmmoDirection(bowx - nax, bowy - nay, 0);
                this.gc.player.setAmmoSpeed(pow * 2);
                //console.log("[角度]", na.direction.x, na.direction.y, na.direction.z);
                ///console.log("[角度X]", bow, b_rh);
                //                console.log("[角度Y]", bow.worldY, nay);
                //console.log("[弾位置]", this.gc.player.useammo.ammoobj.object.position);
                //                console.log("[角度]", bow, na.ammoobj.object.position);
                //                console.log("[角度]", bow, na.ammoobj.object.position);


            }
            //  離した
            else if (irtouch.touchUp()) {
                //console.log(" 発射:", this.arrow_speed);
                //  「離す」の非表示
                fDisp_txt_pulling = true;
                fDisp_txt_release = false;

                let na = this.gc.player.getNowAmmo()
                    //b_rh.data.y += (na.direction.y * 200);
                    //console.log("[放つ]", na.direction);

                this.gc.player.shoot();
                //  撃った回数を記録
                this.gc.shotCount++;

                //  指を放す際に少し後ろに引く
                let b_rh = pl.getSpineBone("Rhand");
                b_rh.data.x += (na.direction.x * 200);

                //                this.arrow_state = 1;
                //                this.arrow_speed = new THREE.Vector3();
                //console.log(" gameUIController : 離した");
                this.guic.fpulling = false;
                //  位置を戻す
                obj.object.position.copy(this.guic.bowbuttonCenter);
                //  バックアップを戻す
                //this.gc.player.recoverDatas();


                //  プレイヤー 通常モーション開始
                pl.setSpineAnimation("idle", true);
                //  放つ音
                this.gc.soundmanage.playSingleSound("arrow");
                //  弓を触ってない、放った状態を作ってアニメーションさせた方がいいとは思う
                this.gc.player.isdraw = false;

            }
        }

        //  表示
        let to_pul = this.guic_txtobj_pulling;
        let to_rel = this.guic_txtobj_release;

        //  「ひっぱる」
        if (fDisp_txt_pulling) {
            to_pul.visible = true; //  「ひっぱる」
            if (this.guic && this.guic.bowbuttonCenter) {
                //console.log("[to_pul]", to_pul.position);
                //console.log("[to_pul]", this.guic);
                to_pul.position.set(this.guic.bowbuttonCenter.x + 110, this.guic.bowbuttonCenter.y, 0);
            }
        } else {

            to_pul.visible = false;
        }
        //  「離す」
        if (fDisp_txt_release) {
            to_rel.visible = true;

        } else {
            to_rel.visible = false;
        }


    }

    //========================================
    //  スコアボード処理
    //--------------------------------
    task_scoreBoard() {
        //console.log("scoreBoard:", this.scoreBoard_count, this.scoreBoard_state);
        //  考えとしては
        //  命中率( 撃破枢 ÷ 射撃数 )
        //  長射程ボーナス( 遠いほど高い )
        //  個体倍率( 的が小さいほど高い )
        //  複雑にしてもしょうがないので命中率と射程ぐらい
        //  合計点
        //        //  ユーザー変数
        //  this.gc.shotCount = 0; //  撃った回数
        //  this.gc.myscore = 0; //  スコア
        //this.enemyDefeatCount = 0; //  撃破数
        //        this.shotAccuracy = 0;  //  命中率
        let fcol = null;
        let state_txt, per;
        switch (this.scoreBoard_state) {
            //  「命中率」
            case 0:
                this.gf.destroyTextObject(this.gc.scene2d, this.hudi_sbo_per);
                //                this.mato_count++;
                fcol = "rgba(255,255,255," + (2 - (this.scoreBoard_count / 100)) + ")";
                //state_txt = "命中率";
                per = Math.round(this.gc.shotAccuracy);
                //                state_txt += "　" + per + "％　×　"+this.gc.myscore +" 点");
                state_txt = this.gc.myscore + " 点　×　命中率" + per + "％ × 100";
                this.hudi_sbo_per = this.gf.makeTextObject(this.gc.scene2d, state_txt,
                    new THREE.Vector3((this.gc.GAMESCREEN_MAXWIDTH / 2) + 50,
                        (this.gc.GAMESCREEN_MAXHEIGHT / 2) - 60 - (this.scoreBoard_count / 2), 1000),
                    60,
                    'rgba(0, 0, 255, 0.0)', fcol, false, true);
                //this.hudi_txtobj.material.opacity = 1 - (this.scoreBoard_count / 60);


                this.scoreBoard_count += 1;
                if (60 < this.scoreBoard_count) {
                    this.scoreBoard_count = 0;
                    this.scoreBoard_state = 1;
                }
                break;

            case 1:
                //  「合計点」
                this.gf.destroyTextObject(this.gc.scene2d, this.hudi_txtobj);
                //                this.mato_count++;
                per = Math.round(this.gc.shotAccuracy);
                fcol = "rgba(255,255,255," + (2 - (this.scoreBoard_count / 100)) + ")";
                state_txt = "合計";
                state_txt += "　" + this.gc.myscore * per;
                state_txt += "点　";
                this.hudi_txtobj = this.gf.makeTextObject(this.gc.scene2d, state_txt,
                    new THREE.Vector3((this.gc.GAMESCREEN_MAXWIDTH / 2) + 50, (this.gc.GAMESCREEN_MAXHEIGHT / 2) - (this.scoreBoard_count / 2), 1000),
                    60,
                    'rgba(0, 0, 255, 0.0)', fcol, false, true);
                //this.hudi_txtobj.material.opacity = 1 - (this.scoreBoard_count / 60);


                this.scoreBoard_count += 1;
                if (60 < this.scoreBoard_count) {
                    this.scoreBoard_count = 0;
                    this.scoreBoard_state = 2;
                }

                break;

            case 2:
                this.scoreBoard_count += 1;
                if (200 < this.scoreBoard_count) {
                    this.scoreBoard_count = 0;
                    this.scoreBoard_state = 0;
                    this.sceneState = this.SCENESTATE.NEXTSCENE;
                }
                break;

        }
    }

}