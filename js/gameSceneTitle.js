import { gameObject, gameObjectGroup } from './gameObject.js';
import { gameFunc } from './gameFunc.js';
import { keyInputReceiver, keyInput } from './keyInputReceiver.js';
import { touchInputReceiver, touchInput } from './touchInputReceiver.js';
import { gameScene } from './gameScene.js';
import { gmStage } from './gmStage.js';
import { gmPlayer } from './gmPlayer.js';
import { gmEffects } from './gmEffects.js';

//----------------------------------------
//  ゲームシーン : タイトル
//----------------------------------------
export class gameSceneTitle extends gameScene {
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

        //  3D関係
        this.objs = new gameObjectGroup();
        this.obj_background = new gameObject();


        //  UI関係
        this.hudis = new gameObjectGroup();
        this.hudi_title = new gameObject(); //  ヘッドアップディスプレイ・イメージ
        this.hudi_usayumi = new gameObject();
        this.hudi_mato = new gameObject();
        this.hudi_pushstart = new gameObject();

        //  デバッグ系
        this.rayline = null;
        this.rayline_s = null;
        this.rayline_e = null;
        this.helper = null;

        //  ルーチン
        this.pscount = 0;
        this.pickobjectUI = null;
        this.pickobject = null;
        //  ゲーム用変数
        this.SCENESTATE = {
            NONE: 0,
            INIT: 1,
            LOOP: 2,
            NEXTSCENE: 3
        }
        this.sceneState = this.SCENESTATE.LOOP;
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
        //console.log(" gameSceneTest : init() : タイトルです。");

        //  シーンテストでのオブジェクトを作成
        this.makeObject();

        //  ステージの初期設定作成
        this.gc.stage = new gmStage();
        this.gc.stage.init(this.gc, this.gf); //  初期化
        this.gc.stage.makeModels(); //  ステージ中で使用するモデルの作成

        //  プレイヤーの初期設定作成
        this.gc.player = new gmPlayer();
        this.gc.player.init(this.gc, this.gf); //  初期化
        this.gc.player.makeModels(); //  プレイヤーが使用するモデルの作成

        //  エフェクト初期化
        this.gc.effects = new gmEffects();
        this.gc.effects.init(this.gc, this.gf); //  初期化

        //  spineテスト
        //  plobjに入れるという事は、playerの初期化で使うかんじ
        //this.gf.loadSpineModel("raptor/raptor-pro.json", "raptor/raptor.atlas", "raptor", this.gc.player.plobj, this.gc.scene);
        //this.gc.player.plobj.setPosition(0, 100, 0);
        //        this.gf.loadSpineModel("spine-boy/spineboy-pro.json", "spine-boy/spineboy.atlas", "spineboy", this.gc.player.plobj, this.gc.scene);
        this.gf.loadSpineModel("usayumi/usayumi.json", "usayumi/usayumi.atlas", "usayumi", this.gc.player.plobj, this.gc.sceneSpine);
        let pl = this.gc.player.plobj;
        pl.setPosition(-600, -450, 300); //  3d用
        pl.setScale(0.6, 0.6, 0.6);
        //pl.setPosition(200, 700, 0); //  2D用
        //pl.setScale(0.5, -0.5, 0.5);  //  2D用
        pl.setSpineAnimation("idle", true);
    }


    //----------------------------------------
    //  1フレーム
    //----------------------------------------
    animate() {
        switch (this.sceneState) {
            case this.SCENESTATE.LOOP:
                //  PUSH START の点滅
                this.task_pushStart();

                //  マウス座標と画面、raycast判定 3D
                //this.task_checkMouseCollision3D(this.gc.camera, this.gc.scene );
                let am = this.gc.spineAssetManager;
                //console.log("title - loadSpineModel :", am.toLoad, am.loaded, am);

                let pl = this.gc.player.plobj;
                pl.manage();

                //  浮いてる的の処理
                let gmobj = this.hudi_mato;
                let gmobjo = this.hudi_mato.object;
                if (gmobj && gmobjo) {
                    let mpos = gmobjo.position;
                    if (gmobjo.rotation.y == 0)
                        gmobjo.lookAt(new THREE.Vector3(mpos.x - 200, mpos.y + 100, mpos.z + 100));

                    //gmobj.manage();
                    gmobjo.rotation.y += 0.01;
                    if (360 <= gmobjo.rotation.y) {
                        gmobjo.rotation.y = 0;
                    }
                    gmobjo.rotation.z += 0.002;
                    if (360 <= gmobjo.rotation.z) {
                        gmobjo.rotation.z = 0;
                    }
                }


                // spineローディング管理
                if (this.gf.manageSpineModelLoading(this.gc.player.plobj, this.gc.sceneSpine)) {
                    //console.log("読み込みおわったわーwww");
                }

                //  マウス座標と画面、raycast判定 2D
                this.task_checkMouseCollision2D(this.gc.camera2d, this.gc.scene2d);
                //  キー入力
                this.task_input();

                this.render();
                break;

            case this.SCENESTATE.NEXTSCENE:
                //  フェードインとかの処理が必用ならする
                //  タイトルを破棄する？
                //  カウントしてから出る？
                this.changeScene(this.gc.GAMESCENE.GAME);

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

        this.hudi_title.destroy(this.gc.scene2d);
        //        this.hudi_usayumi.destroy(this.gc.scene2d);
        this.hudi_mato.destroy(this.gc.scene2d);
        this.hudi_pushstart.destroy(this.gc.scene2d);

    }


    //----------------------------------------
    //  シーン切替
    //----------------------------------------
    changeScene(i_scene) {
        this.gc.nowScene = i_scene;
        //console.log(" gameSceneTitle : changeScene() : 脱出だ");
        this.destroy();
        return true;
    }


    //----------------------------------------
    //  シーン中のオブジェクト作成
    //----------------------------------------
    async makeObject() {
        //  テスト用のカメラとシーン

        //  配置するオブジェクト
        //  地面のGround作成
        this.makeObject_Ground();
        //        this.addPlaneImage(this.gc.scene);        //  よよ面を追加
        //      背景
        //        this.addPlaneImage_bg(this.gc.scene);
        var gmobj = null;
        var gmobjo = null;

        //   背景
        await this.gf.makeObjectPlane('textures/sTitle/bg.jpg', "background", this.obj_background, this.gc.sceneBackground);
        gmobj = this.obj_background;
        gmobj.setScale(gmobj.width * 7, gmobj.height * 6, 10);
        gmobj.setPosition(0, 100, -1000);
        //  グループに追加しておく
        this.objs.add(this.obj_background);


        //this.makeObject_rayline(200, 25, 100, -200, -25, -100);

        //  確認用ヘルパー作成
        //this.makeObject_helper();

        //  2D HUD
        //  タイトル
        this.makeObject_title(this.gc.scene2d);

        // マウスクリックイベントのリスナー登録
        //var c_mc = document.querySelector('#myCanvas');
        //document.addEventListener('mousedown', this.clickPosition, false);
        //c_mc.addEventListener('mousedown', this.clickPosition, false);
        //c_mc.gc = this.gc;

    }

    //----------------------------------------
    // 確認用にRaycasterと同じ位置にLineを引く
    //----------------------------------------
    makeObject_rayline(i_ox, i_oy, i_oz, i_ex, i_ey, i_ez) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i_ox, i_oy, i_oz),
            new THREE.Vector3(i_ex, i_ey, i_ez)
        ]);
        const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0xffaa00 }));
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
    // 確認用にヘルパーコーン作成
    //----------------------------------------
    makeObject_helper() {
        const geometryHelper = new THREE.ConeGeometry(20, 100, 3);
        geometryHelper.translate(0, 50, 500);
        geometryHelper.rotateX(Math.PI / 2);
        this.helper = new THREE.Mesh(geometryHelper, new THREE.MeshNormalMaterial());
        this.helper.name = "hithelper";
        this.gc.scene.add(this.helper);

        const color1 = new THREE.Color("rgb(0, 255, 0)");
        const color2 = new THREE.Color("rgb(0, 0, 255)");

        //  ラインの始点用
        const g_line_s = new THREE.SphereGeometry(4, 20, 20);
        g_line_s.translate(0, 50, 0);
        g_line_s.rotateX(Math.PI / 2);
        this.rayline_s = new THREE.Mesh(g_line_s, new THREE.MeshLambertMaterial({ color: color1 }));
        this.rayline_s.name = "rayline_s";
        this.gc.scene.add(this.rayline_s);

        //  ラインの終点用
        const g_line_e = new THREE.SphereGeometry(4, 20, 20);
        g_line_e.translate(0, 50, 0);
        g_line_e.rotateX(Math.PI / 2);
        this.rayline_e = new THREE.Mesh(g_line_e, new THREE.MeshLambertMaterial({ color: color2 }));
        this.rayline_e.name = "rayline_e";
        this.gc.scene.add(this.rayline_e);
    }

    //----------------------------------------
    //  オブジェクト作成 : グラウンド
    //----------------------------------------
    async makeObject_Ground() {
        this.imageCanvas = document.createElement('canvas');
        this.context = this.imageCanvas.getContext('2d');

        this.imageCanvas.width = this.imageCanvas.height = 128;

        //  メッシュのグレー
        //        this.context.fillStyle = '#444';
        this.context.fillStyle = '#453';
        this.context.fillRect(0, 0, 128, 128);
        //  メッシュの白
        this.context.fillStyle = '#fff';
        this.context.fillRect(0, 0, 64, 64);
        this.context.fillRect(64, 64, 64, 64);

        this.textureCanvas = new THREE.CanvasTexture(this.imageCanvas);
        this.textureCanvas.repeat.set(1000, 1000);
        this.textureCanvas.wrapS = THREE.RepeatWrapping;
        this.textureCanvas.wrapT = THREE.RepeatWrapping;

        this.textureCanvas2 = this.textureCanvas.clone();
        this.textureCanvas2.magFilter = THREE.NearestFilter;
        this.textureCanvas2.minFilter = THREE.NearestFilter;

        this.materialCanvas = new THREE.MeshBasicMaterial({ map: this.textureCanvas });
        this.materialCanvas2 = new THREE.MeshBasicMaterial({ color: 0xffccaa, map: this.textureCanvas2 });

        this.geometry = new THREE.PlaneGeometry(100, 100);

        this.meshCanvas = new THREE.Mesh(this.geometry, this.materialCanvas);
        this.meshCanvas.rotation.x = -Math.PI / 2;
        this.meshCanvas.scale.set(1000, 1000, 1000);
        this.meshCanvas.name = "ground1";

        this.meshCanvas2 = new THREE.Mesh(this.geometry, this.materialCanvas2);
        this.meshCanvas2.rotation.x = -Math.PI / 2;
        this.meshCanvas2.scale.set(1000, 1000, 1000);
        this.meshCanvas2.name = "ground2";

        //  壁絵をランダムで決める
        let imgfiles = ["textures/sGame/wall01.jpg",
            "textures/sGame/wall02.jpg",
            "textures/sGame/wall03.jpg",
            "textures/sGame/wall04.jpg",
            "textures/sGame/wall05.jpg",
            "textures/sGame/wall06.jpg",
            "textures/sGame/wall07.jpg",
            "textures/sGame/wall08.jpg",
            "textures/sGame/wall09.jpg",
            "textures/sGame/wall10.jpg"
        ];
        let ind = Math.floor(Math.random() * 10);

        let imgFileName = imgfiles[ind];

        //        await this.gf.loadTexture('textures/758px-Canestra_di_frutta_(Caravaggio).jpg', this.texCanvas);
        await this.gf.loadTexture(imgFileName, this.texCanvas);
        //this.texCanvas.object.position.z = 100;
        this.texturePainting = this.texCanvas.texture;
        this.texturePainting2 = new THREE.Texture();
        this.materialPainting = new THREE.MeshBasicMaterial({ color: 0xffffff, map: this.texturePainting });
        this.materialPainting2 = new THREE.MeshBasicMaterial({ color: 0xffccaa, map: this.texturePainting2 });
        //this.materialPainting2 = new THREE.MeshBasicMaterial({ color: 0xaaccff, map: this.texturePainting2 });
        //        this.makeTexturePainting(this.texturePainting, this.texturePainting2);
        this.makeTexturePainting(this.texCanvas, this.texturePainting2);

        this.texturePainting2.minFilter = this.texturePainting2.magFilter = THREE.NearestFilter;
        this.texturePainting.minFilter = this.texturePainting.magFilter = THREE.LinearFilter;
        this.texturePainting.mapping = THREE.UVMapping;
    }

    //--------------------------------
    // 
    //--------------------------------
    callbackPainting(texture) {
        //console.log("callbackPainting : [texture.image.width]", texture.image.width);
    }

    //--------------------------------
    // オブジェクト追加 : 壁
    //--------------------------------
    makeTexturePainting(i_tex, o_tex2) {
        var image = i_tex.texture.image;
        //console.log("makeTexturePainting : [i_tex.width]", i_tex.width);

        o_tex2.image = image;
        o_tex2.needsUpdate = true;

        let smg = this.gc.stage_meshGround;
        if (smg) {
            if (smg.material) smg.material.dispose();
            if (smg.geometry) smg.geometry.dispose();
            if (this.gc.sceneBackground) this.gc.sceneBackground.remove(smg);
        }
        this.gc.stage_meshGround = this.meshCanvas;
        this.gc.sceneBackground.add(this.gc.stage_meshGround);
        //        this.gc.scene2.add(this.meshCanvas2);

        var geometry = new THREE.PlaneGeometry(100, 100);
        var mesh = new THREE.Mesh(geometry, this.materialPainting);
        //var mesh2 = new THREE.Mesh(geometry, this.materialPainting2);

        //console.log("makeTexturePainting : [image]", image);

        this.addPainting(this.gc.sceneBackground, mesh, image);
        //    this.addPainting(this.gc.scene2, mesh2, image);
    }

    addPainting(zscene, zmesh, i_image) {
        zmesh.scale.x = i_image.width / 100;
        zmesh.scale.y = i_image.height / 100;
        zmesh.position.z = -300;
        zmesh.name = "wall";

        //  本体画像壁のセット
        let smw = this.gc.stage_meshWall;
        if (smw) {
            if (smw.material) smw.material.dispose();
            if (smw.geometry) smw.geometry.dispose();
            if (zscene) zscene.remove(smw);
        }
        this.gc.stage_meshWall = zmesh;
        zscene.add(this.gc.stage_meshWall);

        //  黒いフレームの作成とセット
        let smf = this.gc.stage_meshFrame;
        if (smf) {
            if (smf.material) smf.material.dispose();
            if (smf.geometry) smf.geometry.dispose();
            if (zscene) zscene.remove(smf);
        }
        const meshFrame = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
        meshFrame.position.z = -310.0;
        meshFrame.scale.x = 1.1 * i_image.width / 100;
        meshFrame.scale.y = 1.1 * i_image.height / 100;
        this.gc.stage_meshFrame = meshFrame;
        zscene.add(this.gc.stage_meshFrame);

        //  影の作成とセット
        //  既にあれば破棄
        let sms = this.gc.stage_meshShadow;
        if (sms) {
            if (sms.material) sms.material.dispose();
            if (sms.geometry) sms.geometry.dispose();
            if (zscene) zscene.remove(sms);
        }
        const meshShadow = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.75, transparent: true }));
        meshShadow.position.y = -1.1 * i_image.height / 2;
        meshShadow.position.z = -1.1 * i_image.height / 2;
        meshShadow.rotation.x = -Math.PI / 2;
        meshShadow.scale.x = 1.1 * i_image.width / 100;
        meshShadow.scale.y = 1.1 * i_image.height / 100;
        this.gc.stage_meshShadow = meshShadow;
        zscene.add(this.gc.stage_meshShadow);


        const floorHeight = -1.117 * i_image.height / 2;
        this.meshCanvas.position.y = this.meshCanvas2.position.y = floorHeight;

    }

    //--------------------------------
    // オブジェクト追加 : よよ
    //--------------------------------
    addPlaneImage(i_scene) {
        // 画像を読み込む
        var texture = new THREE.TextureLoader().load('textures/yoyo.png',
            (tex) => { // 読み込み完了時
                // 縦横比を保って適当にリサイズ
                const w = tex.image.width;
                const h = tex.image.height; // / (tex.image.width / w);

                // 平面
                const geometry = new THREE.PlaneGeometry(1, 1);
                //            const material = new THREE.MeshPhongMaterial({ map: texture });
                const material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    side: THREE.DoubleSide,
                    map: texture,
                    alphaTest: 0.2,
                });
                const plane = new THREE.Mesh(geometry, material);
                plane.scale.set(w * 2, h * 2, 10);
                plane.position.set(-500, 100, -100);
                plane.name = "yoyo";
                i_scene.add(plane);
            });
    }

    //--------------------------------
    // オブジェクト追加 : bg
    //--------------------------------
    addPlaneImage_bg(i_scene) {
        // 画像を読み込む
        var texture = new THREE.TextureLoader().load('textures/sTitle/bg.jpg',
            (tex) => { // 読み込み完了時
                // 縦横比を保って適当にリサイズ
                const w = tex.image.width;
                const h = tex.image.height; // / (tex.image.width / w);

                // 平面
                const geometry = new THREE.PlaneGeometry(1, 1);
                //            const material = new THREE.MeshPhongMaterial({ map: texture });
                const material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    side: THREE.DoubleSide,
                    map: texture,
                    alphaTest: 0.2,
                });
                const plane = new THREE.Mesh(geometry, material);
                plane.scale.set(w * 6, h * 6, 10);
                plane.position.set(0, 100, -1000);
                plane.name = "background";
                i_scene.add(plane);
            });
    }

    //--------------------------------
    // UIオブジェクト追加 : よよ
    //--------------------------------
    addUIObject(i_scene) {
        // 画像を読み込む
        var texture = new THREE.TextureLoader().load('textures/yoyo.png',
            (tex) => { // 読み込み完了時
                // 縦横比を保って適当にリサイズ
                const w = tex.image.width;
                const h = tex.image.height; // / (tex.image.width / w);
                //console.log(tex.image.width, tex.image.height);
                //console.log(texture.image.width, texture.image.height);
                //console.log(texture.image.naturalWidth, texture.image.naturalHeight);


                // 平面
                const geometry = new THREE.PlaneGeometry(1, 1);
                const material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    side: THREE.DoubleSide,
                    map: texture,
                    alphaTest: 0.2,
                });
                const plane = new THREE.Mesh(geometry, material);
                plane.scale.set(w, -h, 1);
                plane.position.set(0, 0, 1000);
                plane.name = "test_yoyo";
                //console.log(plane.scale, plane.position, plane.rotation);
                i_scene.add(plane);
            });
    }



    //----------------------------------------
    //  オブジェクト作成 : タイトル
    //----------------------------------------
    async makeObject_title(i_scene) {

        var gmobj = null;;
        var gmobjo = null;

        //   pushStart
        await this.gf.makeHUDImage('textures/sTitle/pushstart.png', "pushstart", this.hudi_pushstart, i_scene);
        gmobj = this.hudi_pushstart;
        gmobjo = gmobj.object;
        gmobj.setPosition((this.gc.GAMESCREEN_MAXWIDTH / 2),
            (this.gc.GAMESCREEN_MAXHEIGHT) - (gmobj.height),
            1000);
        /*
                //   ウサ弓
                await this.gf.makeHUDImage('./textures/sTitle/usayumi.png', "usayumi", this.hudi_usayumi, i_scene);
                gmobj = this.hudi_usayumi;
                gmobjo = gmobj.object;
                gmobj.setPosition((gmobj.width / 4),
                    (this.gc.cheight) - (gmobj.height / 2),
                    1000);
                gmobj.setSizeScale(1, 1, 1);
        */
        //   的
        /*        
                await this.gf.makeHUDImage('./textures/sTitle/mato.png', "mato", this.hudi_mato, i_scene);
                gmobj = this.hudi_mato;
                gmobjo = gmobj.object;
                gmobj.setPosition(this.gc.cwidth, 50,
                    1000);
                gmobj.setSizeScale(3, 3, 1);
        */

        //  タイトル文字
        await this.gf.makeHUDImage('textures/sTitle/title.png', "gametitle", this.hudi_title, i_scene);
        gmobj = this.hudi_title;
        gmobjo = this.hudi_title.object;
        //        console.log("[makeObject_title]obj_title :", gmobjo);
        gmobj.setPosition((this.gc.GAMESCREEN_MAXWIDTH) - (gmobj.width / 2.2),
            150, 1000);
        gmobj.setSizeScale(0.5, 0.5, 1);

        //  テキスト
        //        this.gf.makeTextObject(this.gc.scene2d, "テストテキストオブジェクト object", 1000, 200, 100);
        //        this.gf.makeTextObject(this.gc.scene, "３Ｄ空間用の文字列テスト これは入るんだけど",
        //            new THREE.Vector3(200, 100, -200), 100, 'rgba(0, 0, 255, 0)', 'white', false, false);
        //        this.gf.makeTextObject(this.gc.scene2d, "テストテキストオブジェクト object",
        //            new THREE.Vector3(500, 150, 1000), 100, 'rgba(0, 0, 255, 0.0)', 'black', false, true);

        //  まと3D
        gmobj = this.hudi_mato;
        gmobjo = gmobj.object;
        await this.gf.loadGLTFModel('gltf/mato02_x100.glb', "mato", this.hudi_mato, i_scene);
        //        ms.add(gmobj);
        gmobj.manage();
        gmobj.setPosition(this.gc.GAMESCREEN_MAXWIDTH - 200, 100, 1200);
        gmobj.setScale(3, 3, 3);
        //gmobj.object.position.set(this.gc.cwidth - 200, 0, 100);
        //gmobj.object.scale.set(3, 3, 3);
        //        gmobj.setPosition(0, 0, 0); //
        //        gmobj.setScale(1, 1, 1); //
        //        this.objs.add(this.hido_mato);



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
        if (myc < -100) myc = -100;
        if (100 < myc) myc = 100;
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
        //console.log("render : [sceneBackGround]", pgc.sceneBackground);

        //  背景シーン描画
        pgc.renderer.render(pgc.sceneBackground, pgc.camera); //  描画

        //  シーン1描画
        //pgc.renderer.setScissor(0, 0, pgc.cwidth / 2 - 2, pgc.cheight); //  マスク？
        pgc.renderer.render(pgc.scene, pgc.camera); //  描画
        //  シーン2描画
        //pgc.renderer.setScissor(pgc.cwidth / 2, 0, pgc.cwidth / 2 - 2, pgc.cheight);
        //pgc.renderer.render(pgc.scene2, pgc.camera);

        //  シーンSpine描画
        pgc.renderer.render(pgc.sceneSpine, pgc.camera);

        //  シーン2D( HUD )描画
        pgc.renderer.setScissorTest(false); //  
        //pgc.renderer.render(pgc.scene2d, pgc.camera);
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
    //  pushstartの点滅処理
    //--------------------------------------------------------
    task_pushStart() {
        this.pscount += 1;
        if (60 < this.pscount) {
            this.pscount = 0;
            //            this.hudi_pushstart.object.visible = this.hudi_pushstart.object.visible == true ? false : true;
            this.hudi_pushstart.object.material.opacity = this.hudi_pushstart.object.material.opacity > 0.9 ? 0.75 : 1; //  半透明にする
        }
    }

    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 共通処理
    //  ・画面をクリックは共通処理
    //  ・指定カメラとシーンからraycastを作成
    //  ・線分判定情報を返す
    //--------------------------------------------------------
    task_checkMouseCollision(i_camera, i_scene) {
        var gmobj = this.hudi_title;
        //  マウスイベントで画面内の位置を取得し-1～+1の範囲の数値にしたもの
        var mouse = new THREE.Vector2();
        mouse.x = this.gc.mouseX3D;
        mouse.y = this.gc.mouseY3D;

        //  レイキャスト・光線判定を飛ばす
        this.gc.raycaster.setFromCamera(mouse, i_camera);

        //  光線を可視化 / 毎回作り直す
        this.destroyObject_rayline();
        var co = this.gc.camera.position;
        var po = this.gc.raycaster.ray.origin;
        var rs = new THREE.Vector3();
        var re = new THREE.Vector3();
        rs.x = po.x + this.gc.raycaster.ray.direction.x * 100;
        rs.y = po.y + this.gc.raycaster.ray.direction.y * 100;
        rs.z = po.z + this.gc.raycaster.ray.direction.z * 100;
        re.x = po.x + this.gc.raycaster.ray.direction.x * 1000;
        re.y = po.y + this.gc.raycaster.ray.direction.y * 1000;
        re.z = po.z + this.gc.raycaster.ray.direction.z * 1000;
        //線作成
        this.makeObject_rayline(
            rs.x, rs.y, rs.z,
            re.x, re.y, re.z);

        var rlp = this.rayline.geometry.attributes.position;
        //var ro = this.gc.raycaster.ray.origin;
        var ro = new THREE.Vector3();
        var ron = new THREE.Vector3();
        //ro.copy(ro);
        ro.copy(this.gc.raycaster.ray.origin); //.clone();
        //        ro.copy(mousepos); //.clone();
        ron.copy(this.gc.raycaster.ray.direction);
        var rd = this.gc.raycaster.ray.direction;
        //  ラインの始点位置
        //this.rayline_s.position.copy(rs);
        //this.rayline_e.position.copy(re);
        //this.rayline_s.visible = false;
        /*        
                var txt = "[0](" +
                    ('______' + Math.trunc(rlp.array[0])).slice(-6) +
                    "," + ('______' + Math.trunc(rlp.array[1])).slice(-6) +
                    "," + ('______' + Math.trunc(rlp.array[2])).slice(-6) +
                    ")-[1](" + ('______' + Math.trunc(rlp.array[3])).slice(-6) +
                    "," + ('______' + Math.trunc(rlp.array[4])).slice(-6) +
                    "," + ('______' + Math.trunc(rlp.array[5])).slice(-6) + ")";
                this.gc.ctn_debug_rayposition.innerText = txt;
                //  スクリーンに対するマウス位置
                txt = "[xy](" + this.gc.mouseX3D + "," + this.gc.mouseY3D + ")";
                this.gc.ctn_debug_mouseposition.innerText = txt;
                //console.log("[接触判定] : ", mouse);
        */
        // その光線とぶつかったオブジェクトを得る
        return this.gc.raycaster.intersectObjects(i_scene.children, true);

    }


    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 3D部分
    //--------------------------------------------------------
    task_checkMouseCollision3D(i_camera, i_scene) {
        //  マウス座標と画面の位置で、カメラとシーンから線分を作成し空間と判定
        const intersects = this.task_checkMouseCollision(i_camera, i_scene);
        //  判定配列データからオブジェクトを識別
        var flag = this.task_checkMouseCollision3D_ObjectVerifi(intersects);
        //  オブジェクトがあった場合のホバー処理
        if (flag) {
            this.task_object3DHover(this.pickobject);
        }

        //  オブジェクトがなかった場合
        if (flag == false) {
            if (this.pickobject) this.pickobject.material.opacity = 1;
            this.pickobject = null;
        }
    }

    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 2D部分 HUD
    //--------------------------------------------------------
    task_checkMouseCollision2D(i_camera, i_scene) {
        //  マウス座標と画面の位置で、カメラとシーンから線分を作成し空間と判定
        const intersects = this.task_checkMouseCollision(i_camera, i_scene);
        //  判定配列データからオブジェクトを識別
        var flag = this.task_checkMouseCollision2D_ObjectVerifi(intersects);

        //  オブジェクトがあった場合のホバー処理
        if (flag) {
            this.task_object2DHover(this.pickobject);
        }
        //  オブジェクトがなかった場合
        else {
            if (this.pickobject) this.pickobject.material.opacity = 1;
            this.pickobject = null;
        }
    }


    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 3D部分 / オブジェクトとの判定
    //--------------------------------------------------------
    task_checkMouseCollision3D_ObjectVerifi(i_intersects) {
        var flag = false;
        if (i_intersects.length <= 0) return false;

        for (var i = 0; i < i_intersects.length; i++) {
            //  無視するか名称で判断
            switch (i_intersects[i].object.name) {
                case "hithelper":
                    break;
                case "rayline":
                    break;
                case "rayline_s":
                    break;
                case "rayline_e":
                    break;
                default:
                    flag = true;
                    break;
            }

            //  無視しないオブジェクトが出た
            if (flag) {
                if (this.pickobject) this.pickobject.material.opacity = 1;
                this.pickobject = i_intersects[i].object; //  最も手前のobjを保存
                this.pickobject.material.opacity = 0.5; //  半透明にする
                //console.log("[接触判定:intersects]", intersects[i]);

                //  接触位置にヘルパー置く
                this.helper.position.set(0, 0, 0);
                if (i_intersects[i].face != null) {
                    this.helper.lookAt(i_intersects[i].face.normal);
                }
                this.helper.position.copy(i_intersects[i].point);

                break;
            }
        }
        return flag;
    }

    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 2D部分 HUD / オブジェクトとの判定
    //--------------------------------------------------------
    task_checkMouseCollision2D_ObjectVerifi(i_intersects) {
        var flag = false;
        if (i_intersects.length <= 0) return false;

        for (var i = 0; i < i_intersects.length; i++) {
            //  無視するか名称で判断
            switch (i_intersects[i].object.name) {
                case "pushstart":
                    flag = true;
                    break;
                default:
                    break;
            }

            //  無視しないオブジェクトが出た
            if (flag) {
                if (this.pickobject) this.pickobject.material.opacity = 1;
                this.pickobject = i_intersects[i].object; //  最も手前のobjを保存
                //                this.pickobject.material.opacity = 0.5; //  半透明にする
                //console.log("[接触判定:intersects]", intersects[i]);
                break;
            }
        }
        return flag;
    }

    //--------------------------------------------------------
    //  オブジェクトのホバー処理 : 3D部分
    //--------------------------------------------------------
    task_object3DHover(i_object) {
        switch (i_object.name) {
            case "yoyo":
                break;
        }
    }

    //--------------------------------------------------------
    //  オブジェクトの実行 : 3D部分
    //--------------------------------------------------------
    task_object3DAction(i_object) {
        switch (i_object.name) {
            case "yoyo":
                break;
        }
    }


    //--------------------------------------------------------
    //  オブジェクトのホバー処理 : 2D部分 HUD
    //--------------------------------------------------------
    task_object2DHover(i_object) {
        switch (i_object.name) {
            case "pushstart":
                i_object.material.opacity = 0.5; //  半透明にする
                break;
        }
    }

    //--------------------------------------------------------
    //  オブジェクトの実行 : 2D部分 HUD
    //--------------------------------------------------------
    task_object2DAction(i_object) {
        switch (i_object.name) {
            case "pushstart":
                //console.log("pushstart : ゲーム画面へ");
                this.gc.soundmanage.playSingleSound("title_pushstart");
                this.sceneState = this.SCENESTATE.NEXTSCENE;
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

        //  オブジェクトを選択している
        if (this.pickobject) {
            //console.log("task_input : クリック処理は来てる");
            //console.log("irtouch", irtouch);

            //  クリックした
            if (irtouch.touchDown()) {
                this.task_object2DAction(this.pickobject);
            }
        }
    }



}