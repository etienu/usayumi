import { gameEngine } from './js/game.js';


const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const cwidth = 960;
const cheight = 540;


let lge = new gameEngine();
let container;

let camera, scene, scene2, renderer,
    cameraUI, sceneUI, rendererUI,
    camera2d, scene2d;

let mouseX = 0,
    mouseY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
const cHalfX = cwidth / 2;
const cHalfY = cheight / 2;

// ページの読み込みを待つ
window.addEventListener('DOMContentLoaded', playgame);
//  初期化処理
//init();
//  描画ループ
//animate();

//--------------------------------
//  ゲームの実行
//--------------------------------
function playgame() {
    //console.log(" start : play game !!");
    //  初期化処理
    //    init();

    //  描画ループ
    //    animate();

    //  ゲームループに投げる
    //lge.taskGameLoop();
    requestAnimationFrame(loopgame);
}
//--------------------------------
//  ゲームのループ
//--------------------------------
function loopgame() {
    //  requestAnimationFrame(lge.taskGameLoop);    //  内部のthisが存在しないからエラー

    //  ゲームループに投げる
    lge.taskGameLoop();
    requestAnimationFrame(loopgame);
}

//--------------------------------
//  初期化処理
//--------------------------------
function init() {

    //  bodyの一番後ろにdivを追加
    container = document.createElement('div');
    document.body.appendChild(container);

    //  カメラを作成
    camera = new THREE.PerspectiveCamera(35, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 5000);
    camera.position.z = 1500; //10;
    // カメラ2D UI用
    cameraUI = new THREE.PerspectiveCamera(35, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 10000);
    cameraUI.position.set(0, 0, 1500);
    //  カメラ2D
    camera2d = new THREE.OrthographicCamera(0, SCREEN_WIDTH, 0, SCREEN_HEIGHT, 0.001, 10000);
    //    camera2d.position.set(0, 0, 3000);
    camera2d.position.set(-400, -200, 3000);
    camera2d.scale.set(1, 0.75, 1); //  縦横倍率が違う事に対しての対策試し
    //camera2d.lookAt(new THREE.Vector3(0, 0, 0));
    console.log(camera2d);

    scene2d = new THREE.Scene();


    //  シーンUIを作成
    sceneUI = new THREE.Scene();
    //sceneUI.background = new THREE.Color(0x000000);


    //  シーンを作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 1500, 4000);

    // ライト
    var light = new THREE.AmbientLight(0xffffff);
    //var light = new THREE.AmbientLight(0x888888);
    scene.add(light);
    sceneUI.add(light);

    //  シーン2を作成
    scene2 = new THREE.Scene();
    scene2.background = new THREE.Color(0x000000);
    scene2.fog = new THREE.Fog(0x000000, 1500, 4000);

    //  配置するオブジェクトの変数用意
    // 地面のGROUNDを作成
    const imageCanvas = document.createElement('canvas');
    const context = imageCanvas.getContext('2d');

    imageCanvas.width = imageCanvas.height = 128;

    context.fillStyle = '#444';
    context.fillRect(0, 0, 128, 128);

    context.fillStyle = '#fff';
    context.fillRect(0, 0, 64, 64);
    context.fillRect(64, 64, 64, 64);

    const textureCanvas = new THREE.CanvasTexture(imageCanvas);
    textureCanvas.repeat.set(1000, 1000);
    textureCanvas.wrapS = THREE.RepeatWrapping;
    textureCanvas.wrapT = THREE.RepeatWrapping;

    const textureCanvas2 = textureCanvas.clone();
    textureCanvas2.magFilter = THREE.NearestFilter;
    textureCanvas2.minFilter = THREE.NearestFilter;

    const materialCanvas = new THREE.MeshBasicMaterial({ map: textureCanvas });
    const materialCanvas2 = new THREE.MeshBasicMaterial({ color: 0xffccaa, map: textureCanvas2 });

    const geometry = new THREE.PlaneGeometry(100, 100);

    const meshCanvas = new THREE.Mesh(geometry, materialCanvas);
    meshCanvas.rotation.x = -Math.PI / 2;
    meshCanvas.scale.set(1000, 1000, 1000);

    const meshCanvas2 = new THREE.Mesh(geometry, materialCanvas2);
    meshCanvas2.rotation.x = -Math.PI / 2;
    meshCanvas2.scale.set(1000, 1000, 1000);


    // PAINTING // 画像読み込み時に呼ばれている
    const callbackPainting = function() {

        const image = texturePainting.image;

        texturePainting2.image = image;
        texturePainting2.needsUpdate = true;

        scene.add(meshCanvas);
        scene2.add(meshCanvas2);

        const geometry = new THREE.PlaneGeometry(100, 100);
        const mesh = new THREE.Mesh(geometry, materialPainting);
        const mesh2 = new THREE.Mesh(geometry, materialPainting2);

        addPainting(scene, mesh);
        addPainting(scene2, mesh2);

        function addPainting(zscene, zmesh) {

            zmesh.scale.x = image.width / 100;
            zmesh.scale.y = image.height / 100;

            zscene.add(zmesh);

            const meshFrame = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
            meshFrame.position.z = -10.0;
            meshFrame.scale.x = 1.1 * image.width / 100;
            meshFrame.scale.y = 1.1 * image.height / 100;
            zscene.add(meshFrame);

            const meshShadow = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.75, transparent: true }));
            meshShadow.position.y = -1.1 * image.height / 2;
            meshShadow.position.z = -1.1 * image.height / 2;
            meshShadow.rotation.x = -Math.PI / 2;
            meshShadow.scale.x = 1.1 * image.width / 100;
            meshShadow.scale.y = 1.1 * image.height / 100;
            zscene.add(meshShadow);

            const floorHeight = -1.117 * image.height / 2;
            meshCanvas.position.y = meshCanvas2.position.y = floorHeight;

        }
    };

    //  よよ画像を追加
    addPlaneImage(scene);
    //  UIオブジェクト設定
    addUIObject(scene2d);

    const texturePainting = new THREE.TextureLoader().load('textures/758px-Canestra_di_frutta_(Caravaggio).jpg', callbackPainting);
    const texturePainting2 = new THREE.Texture();
    const materialPainting = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texturePainting });
    const materialPainting2 = new THREE.MeshBasicMaterial({ color: 0xffccaa, map: texturePainting2 });

    texturePainting2.minFilter = texturePainting2.magFilter = THREE.NearestFilter;
    texturePainting.minFilter = texturePainting.magFilter = THREE.LinearFilter;
    texturePainting.mapping = THREE.UVMapping;

    //  レンダラーを作成
    renderer = new THREE.WebGLRenderer({
        antialias: true, //  アンチエイリアス
        alpha: true, //  透過
        canvas: document.querySelector('#myCanvas') //  キャンバス指定
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(cwidth, cheight);
    renderer.autoClear = false;
    renderer.domElement.style.position = 'relative';
    container.appendChild(renderer.domElement);

    //  UI用レンダラーを作成
    rendererUI = new THREE.WebGLRenderer({
        antialias: true, //  アンチエイリアス
        alpha: true, //  透過
        canvas: document.querySelector('#myCanvas') //  キャンバス指定
    });
    rendererUI.setPixelRatio(window.devicePixelRatio);
    rendererUI.setSize(cwidth, cheight);
    rendererUI.autoClear = false;
    rendererUI.domElement.style.position = 'relative';
    //rendererUI.setFaceCulling(THREE.CullFaceNone);
    container.appendChild(rendererUI.domElement);


    //  マウスイベントの追加
    document.addEventListener('mousemove', onDocumentMouseMove);

}

//--------------------------------
// 　オブジェクト追加 : よよ
//--------------------------------
function addPlaneImage(i_scene) {
    // 画像を読み込む
    var texture = new THREE.TextureLoader().load('./textures/yoyo.png',
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
            i_scene.add(plane);
        });
}
//--------------------------------
// 　UIオブジェクト追加 : よよ
//--------------------------------
function addUIObject(i_scene) {
    // 画像を読み込む
    var texture = new THREE.TextureLoader().load('./textures/yoyo.png',
        (tex) => { // 読み込み完了時
            // 縦横比を保って適当にリサイズ
            const w = tex.image.width;
            const h = tex.image.height; // / (tex.image.width / w);
            //console.log(tex.image.width, tex.image.height);
            //console.log(texture.image.width, texture.image.height);
            //console.log(texture.image.naturalWidth, texture.image.naturalHeight);


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
            //            plane.scale.set(w * 0.75, -h, 1);
            //plane.scale.set(w, -h * 1.25, 1);
            plane.scale.set(w, -h, 1);
            //plane.scale.set(w, h, 1);
            //            plane.position.set(-w * 0.5, -h * 0.5, 700);
            plane.position.set(0, 0, 1000);
            //plane.position.set(cwidth + w / 2, cheight - 100 + (h / 2), -2000);
            //            plane.center.set(0, 0, 0);
            console.log(plane.scale, plane.position, plane.rotation);
            i_scene.add(plane);
            /*
                        const spmaterial = new THREE.SpriteMaterial({
                            map: texture,
                            color: 0xFFFFFF,
                            transparent: true,
                            //                rotation: 3.15,
                            side: THREE.DoubleSide
                        });
                        var sprite;
                        sprite = new THREE.Sprite(spmaterial);
                        sprite.position.set(w * 0.5, h * 0.5, -2000);
                        //            sprite.position.set(0, 0, -9000);
                        sprite.scale.set(w, -h, 1);
                        //sprite.center.set(0.5, 0.5);
                        i_scene.add(sprite);
            */
        });
}




//--------------------------------
//  マウス位置の取得
//--------------------------------
function onDocumentMouseMove(event) {

    mouseX = (event.clientX - cHalfX);
    mouseY = (event.clientY - cHalfY);

}

//--------------------------------
//  1フレームの処理
//--------------------------------
function animate() {
    //  自身を呼んでループ
    requestAnimationFrame(animate);
    //  描画処理
    render();

}

//--------------------------------
//  描画処理
//--------------------------------
function render() {

    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-(mouseY - 200) - camera.position.y) * .05;

    camera.lookAt(scene.position);

    renderer.clear();


    renderer.setScissorTest(true);
    //  シーン1描画
    renderer.setScissor(0, 0, cwidth / 2 - 2, cheight); //  マスク？
    renderer.render(scene, camera);
    //  シーン2描画
    renderer.setScissor(cwidth / 2, 0, cwidth / 2 - 2, cheight);
    renderer.render(scene2, camera);

    //  シーン2D描画
    renderer.setScissorTest(false);
    //camera2d.lookAt(scene2d.position);
    //camera2d.lookAt(new THREE.Vector3(0, 0, 0));
    //camera2d.up.set(0, 1, 0);
    //camera2d.zoom = 1;
    renderer.render(scene2d, camera2d);
    camera2d.updateProjectionMatrix();


    //  シーンUI描画
    /*
    rendererUI.setScissorTest(false);
    cameraUI.position.set(-0, 0, -700);
    cameraUI.lookAt(sceneUI.position);
    //    rendererUI.clear();
    //    rendererUI.setScissorTest(false);
    rendererUI.setScissor(0, 0, cwidth, cheight);
    rendererUI.render(sceneUI, cameraUI);
    */

    /*
        //  シーンUI描画
        cameraUI.position.set(-500, 100, -1000);
        cameraUI.lookAt(sceneUI.position);
        renderer.setScissorTest(true);
        //    rendererUI.clear();
        rendererUI.setScissorTest(false);
        rendererUI.setScissor(0, 0, cwidth, cheight);
        rendererUI.render(sceneUI, cameraUI);
    */
    renderer.setScissorTest(false);

}