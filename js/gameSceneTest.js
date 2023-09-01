import { gameImage } from './gameImage.js';
import { gameFunc } from './gameFunc.js';
import { gameScene } from './gameScene.js';

//----------------------------------------
//  ゲームシーン : テスト用シーン
//----------------------------------------
export class gameSceneTest extends gameScene {
    constructor() {
        super();
        this.imageCanvas = null;
        this.context = null;

        this.gf = new gameFunc();

        this.texCanvas = new gameImage();
        this.texCanvas2 = new gameImage();
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

        //  UI関係
        this.hudi_title = new gameImage(); //  ヘッドアップディスプレイ・イメージ
        this.hudi_usayumi = new gameImage();
        this.hudi_mato = new gameImage();
        this.hudi_pushstart = new gameImage();

        //  デバッグ系
        this.rayline = null;
        this.rayline_s = null;
        this.rayline_e = null;
        this.helper = null;

        //  ルーチン
        this.pscount = 0;
        this.pickobject = null;
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
        console.log(" gameSceneTest : init() : テストシーンです");

        //  シーンテストでのオブジェクトを作成
        this.makeObject();
    }


    //----------------------------------------
    //  1フレーム
    //----------------------------------------
    animate() {
        var gmobj = this.hudi_title;
        //gmobj.movePosition(0.1, 0, 0);

        //  pushstartの点滅処理
        this.pscount += 1;
        if (60 < this.pscount) {
            this.pscount = 0;
            //    this.hudi_pushstart.object.visible = this.hudi_pushstart.object.visible == true ? false : true;
        }
        //        this.gc.camera.updateMatrixWorld();

        //  レイキャストテスト
        //var mousepos = new THREE.Vector3(this.gc.mouseX3D, this.gc.mouseY3D, 1);
        //var mouseposn = new THREE.Vector3(0, 0, 1);
        //mousepos.unproject(this.gc.camera);
        //mouseposn = mousepos.sub(this.gc.camera.position).normalize();

        var mouse = new THREE.Vector2();
        mouse.x = this.gc.mouseX3D;
        mouse.y = this.gc.mouseY3D;

        //  レイキャスト・光線判定を飛ばす
        //        this.gc.raycaster.setFromCamera(mouse, this.gc.camera);
        this.gc.raycaster.setFromCamera(mouse, this.gc.camera2d);
        //console.log("[ray]", this.gc.raycaster);

        //  光線を可視化
        //  毎回作り直す
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
        //作成
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
        this.rayline_s.position.copy(rs);
        this.rayline_e.position.copy(re);
        //this.rayline_s.visible = false;
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

        // その光線とぶつかったオブジェクトを得る
        //        const intersects = this.gc.raycaster.intersectObjects(this.gc.scene.children, true);
        const intersects = this.gc.raycaster.intersectObjects(this.gc.scene2d.children, true);

        var flag = false;
        if (intersects.length > 0) {
            //console.log("[接触判定:intersects]", intersects.length);
            // ぶつかったオブジェクトに対してなんかする

            for (var i = 0; i < intersects.length; i++) {
                //intersects[ i ].object.material.color.set( 0x000000 );
                //    intersects[i].object.material.opacity = 0.5;
                //  無視するか名称で判断
                switch (intersects[i].object.name) {
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
                    this.pickobject = intersects[i].object; //  最も手前のobjを保存
                    this.pickobject.material.opacity = 0.5; //  半透明にする

                    //  接触位置にヘルパー置く
                    this.helper.position.set(0, 0, 0);
                    if (intersects[i].face != null) {
                        this.helper.lookAt(intersects[i].face.normal);
                    }
                    this.helper.position.copy(intersects[i].point);
                    //console.log("[接触判定:intersects]", intersects[i]);
                    break;
                }
            }
        } else {
            //            if (this.pickobject) this.pickobject.material.emissive.setHex(this.pickobject.currentHex);

        }
        if (flag == false) {
            if (this.pickobject) this.pickobject.material.opacity = 1;
            this.pickobject = null;
        }


        this.render();
    }


    //----------------------------------------
    //  破棄
    //----------------------------------------
    destroy() {}


    //----------------------------------------
    //  シーン切替
    //----------------------------------------
    changeScene(i_scene) {
        this.gc.nowScene = i_scene;
        console.log(" gameSceneTitle : changeScene() : 脱出だ");
        this.destroy();
        return true;
    }


    //----------------------------------------
    //  シーン中のオブジェクト作成
    //----------------------------------------
    makeObject() {
        //  テスト用のカメラとシーン

        //  配置するオブジェクト
        //  地面のGround作成
        this.makeObject_Ground();

        this.makeObject_rayline(200, 25, 100, -200, -25, -100);

        //  確認用ヘルパー作成
        this.makeObject_helper();

        //  タイトル
        this.makeObject_title(this.gc.scene2d);

        // マウスクリックイベントのリスナー登録
        document.addEventListener('mousedown', this.clickPosition, false);
    }

    //----------------------------------------
    // 確認用にRaycasterと同じ位置にLineを引く
    //----------------------------------------
    makeObject_rayline(i_ox, i_oy, i_oz, i_ex, i_ey, i_ez) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i_ox, i_oy, i_oz),
            new THREE.Vector3(i_ex, i_ey, i_ez)
        ]);
        //        const line = new THREE.Line(geometry, new THREE.MeshNormalMaterial());
        //        const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0xffaa00, dashSize: 3, gapSize: 1, linewidth: 2 }), THREE.LinePieces);
        const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0xffaa00 }));
        line.name = "rayline";
        this.gc.scene.add(line);

        this.rayline = line;
        //this.rayline.geometry.attributes.position.array[1] = 450;
        //this.rayline.geometry.attributes.position.array[4] = -400;
        //console.log(" gameSceneTitle : rayline : ", this.rayline);
        //console.log(" gameSceneTitle : rayline : ", this.rayline.geometry.attributes.position);

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
        geometryHelper.translate(0, 50, 0);
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

        this.context.fillStyle = '#444';
        this.context.fillRect(0, 0, 128, 128);

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

        //  よよ画像を追加
        this.addPlaneImage(this.gc.scene);

        await this.gf.loadTexture('textures/758px-Canestra_di_frutta_(Caravaggio).jpg', this.texCanvas);
        this.texturePainting = this.texCanvas.texture;
        this.texturePainting2 = new THREE.Texture();
        this.materialPainting = new THREE.MeshBasicMaterial({ color: 0xffffff, map: this.texturePainting });
        this.materialPainting2 = new THREE.MeshBasicMaterial({ color: 0xffccaa, map: this.texturePainting2 });
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
        console.log("callbackPainting : [texture.image.width]", texture.image.width);
    }

    //--------------------------------
    // オブジェクト追加 : 壁
    //--------------------------------
    makeTexturePainting(i_tex, o_tex2) {
        var image = i_tex.texture.image;
        console.log("makeTexturePainting : [i_tex.width]", i_tex.width);

        o_tex2.image = image;
        o_tex2.needsUpdate = true;

        this.gc.scene.add(this.meshCanvas);
        this.gc.scene2.add(this.meshCanvas2);

        var geometry = new THREE.PlaneGeometry(100, 100);
        var mesh = new THREE.Mesh(geometry, this.materialPainting);
        var mesh2 = new THREE.Mesh(geometry, this.materialPainting2);

        console.log("makeTexturePainting : [image]", image);

        this.addPainting(this.gc.scene, mesh, image);
        this.addPainting(this.gc.scene2, mesh2, image);
    }

    addPainting(zscene, zmesh, i_image) {
        zmesh.scale.x = i_image.width / 100;
        zmesh.scale.y = i_image.height / 100;
        zmesh.name = "wall";

        //  本体画像壁のセット
        //zscene.add(zmesh);

        //  黒いフレームの作成とセット
        const meshFrame = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
        meshFrame.position.z = -10.0;
        meshFrame.scale.x = 1.1 * i_image.width / 100;
        meshFrame.scale.y = 1.1 * i_image.height / 100;
        //zscene.add(meshFrame);

        //  影の作成とセット
        const meshShadow = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.75, transparent: true }));
        meshShadow.position.y = -1.1 * i_image.height / 2;
        meshShadow.position.z = -1.1 * i_image.height / 2;
        meshShadow.rotation.x = -Math.PI / 2;
        meshShadow.scale.x = 1.1 * i_image.width / 100;
        meshShadow.scale.y = 1.1 * i_image.height / 100;
        zscene.add(meshShadow);

        const floorHeight = -1.117 * i_image.height / 2;
        this.meshCanvas.position.y = this.meshCanvas2.position.y = floorHeight;

    }

    //--------------------------------
    // オブジェクト追加 : よよ
    //--------------------------------
    addPlaneImage(i_scene) {
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
                plane.name = "yoyo";
                i_scene.add(plane);
            });
    }

    //--------------------------------
    // UIオブジェクト追加 : よよ
    //--------------------------------
    addUIObject(i_scene) {
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
                console.log(plane.scale, plane.position, plane.rotation);
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
        await this.gf.makeHUDImage('./textures/sTitle/pushstart.png', "pushstart", this.hudi_pushstart, i_scene);
        gmobj = this.hudi_pushstart;
        gmobjo = gmobj.object;
        gmobj.setPosition((this.gc.cwidth / 2) - (gmobj.width / 2),
            (this.gc.cheight) - (gmobj.height),
            1000);

        //   ウサ弓
        await this.gf.makeHUDImage('./textures/sTitle/usayumi.png', "usayumi", this.hudi_usayumi, i_scene);
        gmobj = this.hudi_usayumi;
        gmobjo = gmobj.object;
        gmobj.setPosition(-150,
            (this.gc.cheight) - (gmobj.height / 2) + 50,
            1000);
        gmobj.setSizeScale(1.5, 1.5, 1);

        //   的
        await this.gf.makeHUDImage('./textures/sTitle/mato.png', "mato", this.hudi_mato, i_scene);
        gmobj = this.hudi_mato;
        gmobjo = gmobj.object;
        gmobj.setPosition(this.gc.cwidth - gmobj.width,
            0,
            1000);
        gmobj.setSizeScale(3, 3, 1);

        //  タイトル文字
        await this.gf.makeHUDImage('./textures/sTitle/title.png', "gametitle", this.hudi_title, i_scene);
        gmobj = this.hudi_title;
        gmobjo = this.hudi_title.object;
        //        console.log("[makeObject_title]obj_title :", gmobjo);
        gmobj.setPosition(300, 150, 1000);
        gmobj.setSizeScale(0.7, 0.7, 1);

    }






    //----------------------------------------
    //  描画
    //----------------------------------------
    render() {
        var pgc = this.gc;
        //        console.log("[pgc]", pgc);
        //        console.log("[pgc.camera]", pgc.camera);

        //  マウスの画面内位置で、カメラのポジション調整
        pgc.camera.position.x += ((pgc.mouseXc) - pgc.camera.position.x) * 0.05;
        pgc.camera.position.y += (-(pgc.mouseYc) - pgc.camera.position.y) * 0.05;
        //pgc.camera.position.y += (-(pgc.mouseYc) - pgc.camera.position.y) * .05;

        //  カメラは常に中央を向く
        pgc.camera.lookAt(pgc.scene.position);

        //  画面のクリア
        pgc.renderer.clear();

        //  シーン1描画
        pgc.renderer.setScissorTest(true); // 描画矩形を利用する
        pgc.renderer.setScissor(0, 0, pgc.cwidth, pgc.cheight); //  描画する矩形を決める
        //        pgc.renderer.setScissor(0, 0, pgc.cwidth / 2 - 2, pgc.cheight); //  マスク？
        pgc.renderer.render(pgc.scene, pgc.camera); //  描画
        //  シーン2描画
        //pgc.renderer.setScissor(pgc.cwidth / 2, 0, pgc.cwidth / 2 - 2, pgc.cheight);
        //pgc.renderer.render(pgc.scene2, pgc.camera);

        //  シーン2D( HUD )描画
        pgc.renderer.setScissorTest(false); //  
        pgc.renderer.render(pgc.scene2d, pgc.camera2d);
        pgc.camera2d.updateProjectionMatrix();

        pgc.renderer.setScissorTest(false);
    }


    //========================================
    //  操作関係
    //--------------------------------
    //  マウス位置の取得
    //--------------------------------
    clickPosition(event) {
        // 画面上のマウスクリック位置
        var x = event.clientX;
        var y = event.clientY;
        var i_gc = event.target.gc;
        if (event.target == null) {
            console.log("範囲外? target == null");
            return;
        }
        if (i_gc == null) {
            console.log("範囲外? i_gc == null");
            return;
        }

        //        i_gc.mouseX = (x - i_gc.cHalfX);
        //        i_gc.mouseY = (y - i_gc.cHalfY);


        // マウスクリック位置を正規化
        var mouse = new THREE.Vector2();
        //                mouse.x = (x / window.innerWidth) * 2 - 1;
        //                mouse.y = -(y / window.innerHeight) * 2 + 1;
        mouse.x = (x / i_gc.cwidth) * 2 - 1;
        mouse.y = -(y / i_gc.cheight) * 2 + 1;
        //mouse.x = (x);
        //mouse.y = (y);

        // Raycasterインスタンス作成
        var raycaster = new THREE.Raycaster();
        // 取得したX、Y座標でrayの位置を更新
        raycaster.setFromCamera(mouse, i_gc.camera);
        // オブジェクトの取得
        var intersects = raycaster.intersectObjects(i_gc.scene.children);

        if (intersects[0] == null) {
            console.log("レイがない");
            return;
        }

        console.log("クリック : [名称]", intersects[0].object.name);

        // cube1がクリックされたらcube1を消してcube2を表示
        if (intersects[0].object.name === 'cube1') {
            cube.visible = false;
            cube2.visible = true;
        }
        // cube2がクリックされたらcube2を消してcube1を表示
        if (intersects[0].object.name === 'cube2') {
            cube.visible = true;
            cube2.visible = false;
        }


    }

    /*
        //--------------------------------------------------------
        //--------------------------------------------------------
        getSceneToWorld(i_camera, i_dx, i_dy) {
            //var projector = new THREE.Projector();
            var mouse3D = new THREE.Vector3(i_dx / window.innerWidth * 2 - 1, -i_dy / window.innerHeight * 2 + 1, 0.5);
            //projector.unprojectVector( mouse3D, i_camera );
            mouse3D.unproject(i_camera);
            mouse3D.sub(i_camera.position);
            mouse3D.normalize();
            var rayCaster = new THREE.Raycaster(i_camera.position, mouse3D);
            var scale = window.innerWidth * 2;
            var rayDir = new THREE.Vector3(rayCaster.ray.direction.x * scale, rayCaster.ray.direction.y * scale, rayCaster.ray.direction.z * scale);
            var rayVector = new THREE.Vector3(camera.position.x + rayDir.x, camera.position.y + rayDir.y, camera.position.z + rayDir.z);
            return rayVector;
        }

        //--------------------------------------------------------
        //  ユーザーがクリックした場所にラベルを貼り付ける方法は?
        //  https://discourse.threejs.org/t/how-to-stick-label-at-that-where-user-clicks/40348
        //  css2dオブジェクト
        //  2022?.07.15
        //--------------------------------------------------------
        hotspot() {
            //    $("canvas").one('click', function (event) {
            let mouse = new THREE.Vector2();
            mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;
            let [mouseX, mouseY] = d3.pointer(event);
            mouse_position = [mouseX, mouseY];
            mouse_position[0] = mouse_position[0] + 15;
            mouse_position[1] = mouse_position[1] - 15;
            const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(hotspots, true);
            console.log(camera.position);

            const hit = intersects.find((hit) => !hit.object.userData.shadow);
            hit.face.normal.applyNormalMatrix(
                new Matrix3().getNormalMatrix(hit.object.matrixWorld));

            console.log("hit", hit);

            if (intersects.length > 0) {
                let dot_count = $(".dot").length;
                const numDiv = document.createElement('div');
                numDiv.className = 'dot';
                numDiv.id = `div_${dot_count}`;
                numDiv.textContent = `${dot_count + 1}`;
                numDiv.style.marginTop = '-1em';
                const Label = new CSS2DObject(numDiv);
                Label.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
                console.log(Label.position)

                scene.add(Label);
            }
        }
    */

}