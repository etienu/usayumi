import { gameImage } from './gameImage.js';
import { gameScene } from './gameScene.js';
//const gameScene = require("./gameScene.js");
import { gmSoundManage } from './gmSoundManage.js';

//----------------------------------------
//  ゲーム全体の初期化
//----------------------------------------
export class gameSceneInit extends gameScene {
    constructor() {
        super();
        this.btnOpen = null; // フルスクリーン化ボタン
        this.btnClose = null; // フルスクリーンキャンセルボタン
        this.album = null;

    }

    //----------------------------------------
    //  ループ
    //----------------------------------------
    taskGameLoop(i_gc) {
        this.init(i_gc);
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
        //        this.gc.nowScene = 0;
        //console.log(" gameSceneInit : init()");
        this.btnOpen = document.querySelector("#gameCtrlButtons-Fullscreen-Open"); // フルスクリーン化ボタン
        this.btnClose = document.querySelector("#gameCtrlButtons-Fullscreen-Close"); // フルスクリーンキャンセルボタン
        this.btnClose.style.display = "none"; // CloseをOFF
        this.album = document.querySelector("#gameAppframe"); // フルスクリーンにするオブジェクト

        this.makeObject();
    }

    //----------------------------------------
    //  1フレーム
    //----------------------------------------
    animate() {
        this.render();
        if (this.changeScene(this.gc.GAMESCENE.TITLE)) {
            return;
        }
        requestAnimationFrame(this.animate);
    }

    //----------------------------------------
    //  描画
    //----------------------------------------
    render() {}

    //----------------------------------------
    //  破棄
    //----------------------------------------
    destroy() {}

    //----------------------------------------
    //  オブジェクトの作成
    //----------------------------------------
    makeObject() {
        //  bodyの一番後ろにdivを追加
        //        this.gc.container = document.createElement('div');
        //document.body.appendChild(this.gc.container);
        //  追加しないでid指定でdivを取得
        this.gc.container = document.querySelector('#gameframe');

        this.gc.ctn_debug_rayposition = document.querySelector('#gmd-raypos');
        this.gc.ctn_debug_mouseposition = document.querySelector('#gmd-mousepos');

        //  一番最初のthree.jsの初期化
        //  3D : シーンとカメラの作成
        this.makeObject_3DScene();
        //  2D : UI、HUDの作成
        this.makeObject_HUDScene();

        //  素材配置用シーン
        this.makeScene_Material();

        //  背景用シーンとカメラ
        this.makeScene_Background();
        //  Spine用シーンとカメラ
        this.makeScene_Spine();

        //  Spineの初期化
        this.makeSpine();

        //  描画する為のレンダラー作成
        this.makeObject_Renderer();

        //  マウス処理等イベント
        this.makeObject_Event();

        //  音声の作成
        this.gc.soundmanage = new gmSoundManage();
        this.gc.soundmanage.init(this.gc, this.gf);
        this.gc.soundmanage.make();
        this.gc.soundmanage.makeSoundDatas();
        //        this.gc.audioLoader = new THREE.AudioLoader();
        //        this.gc.listener = new THREE.AudioListener();
        //console.log(" gameSceneInit : makeObject()");
    }

    makeObject_3DScene() {
        //  カメラを作成
        //this.gc.camera = new THREE.PerspectiveCamera(50, this.gc.SCREEN_WIDTH / this.gc.SCREEN_HEIGHT, 1, 5000);
        this.gc.camera = new THREE.PerspectiveCamera(35, this.gc.cwidth / this.gc.cheight, 1, 5000);
        this.gc.camera.position.z = 1500; //10;

        //  シーンを作成
        this.gc.scene = new THREE.Scene();
        //this.gc.scene.background = new THREE.Color(0x66ffff);
        //this.gc.scene.fog = new THREE.Fog(0x66ffff, 1500, 4000);
        //        this.gc.scene.background = new THREE.Color(0x000000);
        //        this.gc.scene.fog = new THREE.Fog(0x000000, 1500, 4000);

        // ライト
        var light = new THREE.AmbientLight(0xffffff);
        this.gc.scene.add(light);

        //  シーン2を作成
        this.gc.scene2 = new THREE.Scene();
        this.gc.scene2.background = new THREE.Color(0x000000);
        this.gc.scene2.fog = new THREE.Fog(0x000000, 1500, 4000);
    }

    makeScene_Spine() {
        this.gc.sceneSpine = new THREE.Scene();
        // ライト
        var light = new THREE.AmbientLight(0xffffff);
        this.gc.sceneSpine.add(light);
    }

    makeScene_Background() {
        //  シーンを作成
        this.gc.sceneBackground = new THREE.Scene();
        // ライト
        var light = new THREE.AmbientLight(0xffffff);
        this.gc.sceneBackground.add(light);
    }
    makeScene_Material() {
        //  シーンを作成
        this.gc.sceneMaterial = new THREE.Scene();
    }


    makeObject_HUDScene() {
        // UI、HUD用
        //  カメラ2D
        //        this.gc.camera2d = new THREE.OrthographicCamera(0, this.gc.SCREEN_WIDTH, 0, this.gc.SCREEN_HEIGHT, 0.001, 10000);
        this.gc.camera2d = new THREE.OrthographicCamera(0, this.gc.cwidth, 0, this.gc.cheight, 0.001, 10000);
        //        this.gc.camera2d.position.set(-400, -200, 3000);
        //  中央の場合
        //this.gc.camera2d.position.set(-(this.gc.cwidth / 2), -(this.gc.cheight / 2), 3000);
        this.gc.camera2d.position.set(0, 0, 3000);

        //        this.gc.camera2d.scale.set(1, 0.75, 1); //  縦横倍率が違う事に対しての対策試し
        this.gc.camera2d.scale.set(1, 1, 1); //  縦横倍率が違う事に対しての対策試し
        //console.log(this.gc.camera2d);
        //  シーン2D
        this.gc.scene2d = new THREE.Scene();
        // ライト
        var light = new THREE.AmbientLight(0xffffff);
        this.gc.scene2d.add(light);
    }

    //  spineの初期化
    makeSpine() {
        this.gc.spineBaseUrl = this.gc.path + "spine/"; //  spineファイルの場所
        this.gc.spineAssetManager = new spine.AssetManager(this.gc.spineBaseUrl);
        //console.log("★spineの初期化★ : ", this.gc.spineAssetManager);
    }


    //--------------------------------
    // レンダラーを作成
    //--------------------------------
    makeObject_Renderer() {
        this.gc.renderer = new THREE.WebGLRenderer({
            antialias: true, //  アンチエイリアス
            alpha: true, //  透過
            canvas: document.querySelector('#myCanvas') //  キャンバス指定
        });
        this.gc.renderer.setPixelRatio(window.devicePixelRatio);
        this.gc.renderer.setSize(this.gc.cwidth, this.gc.cheight);
        this.gc.renderer.autoClear = false;
        this.gc.renderer.domElement.style.position = 'relative';
        this.gc.container.appendChild(this.gc.renderer.domElement);

        this.resizeWindow();
        /*
                //  UI用レンダラーを作成
                this.gc.rendererUI = new THREE.WebGLRenderer({
                    antialias: true, //  アンチエイリアス
                    alpha: true, //  透過
                    canvas: document.querySelector('#myCanvas') //  キャンバス指定
                });
                this.gc.rendererUI.setPixelRatio(window.devicePixelRatio);
                this.gc.rendererUI.setSize(this.gc.cwidth, this.gc.cheight);
                this.gc.rendererUI.autoClear = false;
                this.gc.rendererUI.domElement.style.position = 'relative';
                //  rendererUI.setFaceCulling(THREE.CullFaceNone);
                //this.gc.container.appendChild(this.gc.rendererUI.domElement);
        */
        //console.log(this.gc);
    }


    //--------------------------------
    // イベントを作成
    //--------------------------------
    makeObject_Event() {
        this.gc.raycaster = new THREE.Raycaster();
        //  マウスイベントの追加
        var c_mc = document; //.querySelector('#myCanvas');
        c_mc.addEventListener('mousemove', this.onDocumentMouseMove, false);
        c_mc.gc = this.gc;
        //  タッチイベントの追加
        c_mc.addEventListener('touchstart', this.onDocumentTouchMove, { passive: false });
        c_mc.addEventListener('touchmove', this.onDocumentTouchMove, { passive: false });
        c_mc.addEventListener('touchend', this.onDocumentTouchMove, { passive: false });
        c_mc.addEventListener('touchcancel', this.onDocumentTouchMove, { passive: false });
        //c_mc.addEventListener('touchstart', this.onDocumentTouchMove, { passive: false });

        //  bindしてthisを使用可能にする
        this.callbackEvent_ResizeWindow = this.onDocumentResizeWindow.bind(this);
        window.addEventListener('resize', this.callbackEvent_ResizeWindow);

        //--------------------------------
        // [event] 開始ボタンをクリック
        //--------------------------------
        this.btnOpen.addEventListener("click", () => {
            if (!this.enabledFullScreen()) {
                alert("フルスクリーンに対応していません");
                return (false);
            }
            // フルスクリーンを開始
            this.goFullScreen(this.album);
        });

        //--------------------------------
        // [event] 閉じるボタンをクリック
        //--------------------------------
        this.btnClose.addEventListener("click", () => {
            // フルスクリーンを解除
            this.cancelFullScreen(this.album);
        });

        //--------------------------------
        // フルスクリーンイベント
        //--------------------------------
        this.eventFullScreen(() => {
            // ボタンを入れ替える
            if (this.getFullScreenObject()) {
                //console.log("フルスクリーン開始");
                this.btnOpen.style.display = "none"; // OpenをOFF
                this.btnClose.style.display = "block"; // CloseをON
            } else {
                //console.log("フルスクリーン終了");
                this.btnClose.style.display = "none"; // CloseをOFF
                this.btnOpen.style.display = "block"; // OpenをON
            }
        });
    }

    onDocumentResizeWindow(event) {
        this.resizeWindow();
    }

    resizeWindow() {
        //        let appframe = document.querySelector("#gameAppframe");
        //        var framediv = document.querySelector('#gameframe');

        let appframe = document.getElementById("gameAppframe");
        var framediv = document.getElementById("gameframe");
        var canvas = document.querySelector('#myCanvas');
        let rectaf = appframe.getBoundingClientRect();
        //        var rect = canvas.getBoundingClientRect();
        //console.log("resizeWindow : ", rectfd, rect);
        //pw.innerText = 'width:' + window.innerWidth + 'px';
        //ph.innerText = 'height:' + window.innerHeight + 'px';
        //  1.ウインドウからはみ出るのをなくしたい
        //  まず想定上の最大幅をセットする

        this.gc.cwidth = this.gc.GAMESCREEN_MAXWIDTH;
        this.gc.cheight = this.gc.GAMESCREEN_MAXHEIGHT;


        //  画面が変更された時にフルスクリーンかどうか確認する
        this.gc.fFullScreen = this.isFullScreen();
        //  ボタンの状態もセットし直す
        //  フルスクリーン
        if (this.gc.fFullScreen) {
            if (this.isSmartPhone()) {
                this.screenOrientaion_Lock();
            }
            this.btnOpen.style.display = "none"; // OpenをOFF
            this.btnClose.style.display = "block"; // CloseをON
            //  フルスクリーンの場合に画面を限界まで引き延ばす
            this.gc.cwidth = window.innerWidth;
            this.gc.cheight = window.innerHeight;
            //console.log("[フルスク]", window.innerWidth, window, rectfd, rect);

            //ウインドウ
        } else {
            this.screenOrientation_Unlock();
            this.btnOpen.style.display = "block"; // OpenをOFF
            this.btnClose.style.display = "none"; // CloseをON
            //  gameframeとmyCanvas
            //  横幅はAppFrameに合わせる
            //framediv.style.width = parseInt(appframe.style.width) + "px";
            //  縦幅はgameFrameに合わせる
            //appframe.style.height = parseInt(framediv.style.height) + "px";
            //console.log("[ウインドウ]", framediv.style, appframe.style);
            let rectfd = framediv.getBoundingClientRect();
            //  フレームを超えていたら直す
            let xper = rectfd.width / this.gc.cwidth;
            if (rectfd.width < this.gc.cwidth) {
                this.gc.cwidth = rectfd.width;
                this.gc.cheight = this.gc.cheight * xper; //  比率を保って小さくする
            }
        }

        let width = this.gc.cwidth; //  基準キャンバス幅
        let height = this.gc.cheight; //  基準キャンバス高さ
        //console.log("resizeWindow : ", rectfd, this.gc.cwidth, this.gc.cheight, this.gc.GAMESCREEN_MAXHEIGHT, xper, rectfd.height);
        if (this.gc.renderer) {
            this.gc.renderer.setPixelRatio(window.devicePixelRatio);

            // three.js レンダラーのサイズを調整する
            this.gc.renderer.setPixelRatio(window.devicePixelRatio);
            this.gc.renderer.setSize(width, height);
        }
        if (this.gc.camera) {
            // カメラのアスペクト比を正す 3D
            this.gc.camera.aspect = width / height;
            this.gc.camera.updateProjectionMatrix();
        }
        if (this.gc.camera2d) {
            // カメラのアスペクト比を正す 2D
            this.gc.camera2d.aspect = width / height;
            this.gc.camera2d.updateProjectionMatrix();
        }

    }


    //--------------------------------
    //  マウス位置の取得
    //--------------------------------
    onDocumentMouseMove(event) {
            var framediv = document.querySelector('#gameframe');
            var rectfd = framediv.getBoundingClientRect();
            var canvas = document.getElementById('myCanvas');
            var rect = canvas.getBoundingClientRect();
            var mousePos = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            //  キャンバス範囲外なら処理しない
            if (mousePos.x < 0 || rect.width <= mousePos.x) return;
            if (mousePos.y < 0 || rect.height <= mousePos.y) return;

            //  ターゲットがキャンバス以外なら処理しない( DIV、HTML )
            if (event.target.tagName !== "CANVAS") return;
            //        var mousePos = this.getMousePosition(canvas, event);
            var i_gc = event.target.gc;
            var mx = mousePos.x; // - i_gc.offsetLeft;
            var my = mousePos.y; // - i_gc.offsetTop;
            //        var mx = event.clientX - i_gc.offsetLeft;
            //        var my = event.clientY - i_gc.offsetTop;

            //console.log("onDocumentMouseMove : ", rect, event.clientX, event.clientY, i_gc.offsetLeft, i_gc.offsetTop);
            i_gc.mouseX = mx;
            i_gc.mouseY = my;
            //  3D用の正規化マウス座標
            i_gc.mouseX3D = (mx / i_gc.cwidth) * 2 - 1;
            i_gc.mouseY3D = -(my / i_gc.cheight) * 2 + 1;
            //i_gc.mouseX3D = (mx / i_gc.renderer.clientWidth) * 2 - 1;
            //i_gc.mouseY3D = -(my / i_gc.renderer.clientHeight) * 2 + 1;
            //console.log("[onDocumentMouseMove]X : ", i_gc.renderer);
            //console.log("[onDocumentMouseMove]X : ", i_gc.mouseX3D, mx, i_gc.cwidth);
            //console.log("[onDocumentMouseMove]Y : ", i_gc.mouseY3D, my, i_gc.cheight);
            //        i_gc.mouseX3D = (mx / window.innerWidth) * 2 - 1;
            //        i_gc.mouseY3D = (my / window.innerHeight) * 2 + 1;

            //  画面の中心分ずれたもの( 演出に使用 )
            i_gc.mouseXc = (mx - i_gc.cHalfX);
            i_gc.mouseYc = (my - i_gc.cHalfY);
        }
        /*
            //  マウス座標の取得
            getMousePosition(i_canvas, evt) {
                var rect = i_canvas.getBoundingClientRect();
                return {
                    x: evt.clientX - rect.left,
                    y: evt.clientY - rect.top
                };
            }
        */


    //--------------------------------
    //  タッチ位置の取得
    //--------------------------------
    onDocumentTouchMove(event) {
        var framediv = document.querySelector('#gameframe');
        var rectfd = framediv.getBoundingClientRect();
        //  rectfdはウインドウサイズ調整時に使っている、
        //  HTMLの記事枠に収める為のフレーム

        //  ゲーム上判定を取る必要があるのは実際に描かれているキャンバス
        //  フレームとキャンバスは若干の差があり
        //  その隙間をクリックするとエラーに繋がる
        var canvas = document.getElementById('myCanvas');
        var rect = canvas.getBoundingClientRect();
        var mousePos = {
            x: 0,
            y: 0
        };

        //        if (event.type == "touchend") {
        //            console.log("onDocumentTouchMove(end) : ", event);
        //            return;
        //        }
        if (event.type == "touchcancel") {
            //console.log("onDocumentTouchMove(cancel) : ", event);
            return;
        }
        // 画面スクロールを防止 // touchcancel時にエラーになる
        mousePos.x = event.changedTouches[0].clientX - rect.left;
        mousePos.y = event.changedTouches[0].clientY - rect.top;
        //  touchesはtouchendの時に存在しない
        //  キャンバス範囲外なら処理しない
        if (mousePos.x < 0 || rect.width <= mousePos.x) return;
        if (mousePos.y < 0 || rect.height <= mousePos.y) return;
        //  ターゲットがキャンバス以外なら処理しない( DIV、HTML )
        if (event.target.tagName !== "CANVAS") return;
        //console.log("[mouse/touch]", event.target.tagName);
        //        console.log("[mouse/touch]", event.type, event.target, event.target.gc);
        //console.log("[mouse/touch]",
        //    event.type, mousePos, event.changedTouches[0], rectfd, event.target);

        //  キャンバス範囲内かつエラーがおきそうになければ処理
        event.preventDefault(); //  なくても動く、むしろエラーが出る

        //  targetではなくcurrentTargetで、確実に設定した要素(キャンバス)を取得する
        //  targetだと背後の親要素(<html lang="jp">等)が混じってエラーが出る
        var i_gc = event.currentTarget.gc;
        var mx = mousePos.x;
        var my = mousePos.y;

        //        console.log("onDocumentTouchMove : ", rect, event.clientX, event.clientY, i_gc.offsetLeft, i_gc.offsetTop);
        i_gc.mouseX = mx;
        i_gc.mouseY = my;
        //  3D用の正規化マウス座標
        i_gc.mouseX3D = (mx / i_gc.cwidth) * 2 - 1;
        i_gc.mouseY3D = -(my / i_gc.cheight) * 2 + 1;

        //  画面の中心分ずれたもの( 演出に使用 )
        i_gc.mouseXc = (mx - i_gc.cHalfX);
        i_gc.mouseYc = (my - i_gc.cHalfY);
        //console.log("onDocumentTouchMove : ", event, i_gc, mx, my);
        //        console.log("onDocumentTouchMove : ", event, i_gc, i_gc.mouseX, i_gc.mouseY, i_gc.mouseX3D, i_gc.mouseY3D, i_gc.mouseXc, i_gc.mouseYc);
    }



    //----------------------------------------
    //  シーン切替
    //----------------------------------------
    changeScene(i_scene) {
        this.gc.nowScene = i_scene;
        //console.log(" gameSceneInit : changeScene() : 脱出だ");
        //this.destroy();
        return true;
    }

    //----------------------------------------
    // フルスクリーン開始/終了時のイベント設定
    //
    // @param {function} callback
    //----------------------------------------
    eventFullScreen(callback) {
        document.addEventListener("fullscreenchange", callback, false);
        document.addEventListener("webkitfullscreenchange", callback, false);
        document.addEventListener("mozfullscreenchange", callback, false);
        document.addEventListener("MSFullscreenChange", callback, false);
    }

    //----------------------------------------
    // フルスクリーンが利用できるか
    //
    // @return {boolean}
    //----------------------------------------
    enabledFullScreen() {
        return (
            document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen || document.msFullscreenEnabled
        );
    }

    //----------------------------------------
    // フルスクリーンにする
    //
    // @param {object} [element]
    //----------------------------------------
    goFullScreen(element = null) {
        const doc = window.document;
        const docEl = (element === null) ? doc.documentElement : element;
        let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        requestFullScreen.call(docEl);
        this.gc.fFullScreen = true;
    }


    //----------------------------------------
    // フルスクリーンをやめる
    //----------------------------------------
    cancelFullScreen() {
        const doc = window.document;
        const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        cancelFullScreen.call(doc);
        this.gc.fFullScreen = false;
    }


    //----------------------------------------
    // フルスクリーン中のオブジェクトを返却
    //----------------------------------------
    getFullScreenObject() {
        const doc = window.document;
        const objFullScreen = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
        return (objFullScreen);
    }

    //--------------------------------
    // フルスクリーンかどうかを返す
    //  @return {Boolean} フルスクリーンなら true、そうでないなら false
    //--------------------------------
    isFullScreen() {
        if ((document.fullscreenElement !== undefined && document.fullscreenElement !== null) || // HTML5 標準
            (document.mozFullScreenElement !== undefined && document.mozFullScreenElement !== null) || // Firefox
            (document.webkitFullscreenElement !== undefined && document.webkitFullscreenElement !== null) || // Chrome・Safari
            (document.webkitCurrentFullScreenElement !== undefined && document.webkitCurrentFullScreenElement !== null) || // Chrome・Safari (old)
            (document.msFullscreenElement !== undefined && document.msFullscreenElement !== null)) { // IE・Edge Legacy
            return true; // fullscreenElement に何か入ってる = フルスクリーン中
        } else {
            return false; // フルスクリーンではない or フルスクリーン非対応の環境（iOS Safari など）
        }
    }

    //  スマホかどうか
    isSmartPhone() {
        if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
            return true;
        } else {
            return false;
        }
    }

    //  回転ロック
    screenOrientaion_Lock() {
        //        const oppositeOrientation = screen.orientation.type.startsWith("portrait") ? "landscape" : "portrait";
        const oppositeOrientation = "landscape";
        screen.orientation.lock(oppositeOrientation)
            .then(() => {
                //            log.textContent = `${oppositeOrientation} に固定しました\n`
            })
            .catch((error) => {
                console.log(`${error}\n`);
            });
    }

    //  回転アンロック
    screenOrientation_Unlock() {
        screen.orientation.unlock();
    }
}