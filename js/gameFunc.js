import { gameImage } from './gameImage.js';
import { gameObject, gameObjectGroup } from './gameObject.js';
//  3Dモデルローダー
import { GLTFLoader } from 'https://unpkg.com/three@0.148.0/examples/jsm/loaders/GLTFLoader.js';

//----------------------------------------
//  ゲーム共通関数
//----------------------------------------
export class gameFunc {

    constructor() {
        this.gc = null;
        this.hitplane = null;

        this.lastFrameTime = Date.now() / 1000;

    }
    init(i_gc) {
        this.gc = i_gc;
        //  判定用の2枚のポリゴンを作る
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        this.hitplane = new THREE.Mesh(geometry, material);
        this.hitplane.visible = false; //  見えない
        this.hitplane.position.set(0, 0, 0);
        this.gc.scene.add(this.hitplane);
        //console.log("★gameFunct★ : init");
    }


    //--------------------------------------------------------
    //  テキスト・フォント関係

    // spriteを作成し、sceneに追加
    createSprite(i_scene, i_texture, i_scale, i_position) {
        const spriteMaterial = new THREE.SpriteMaterial({ map: i_texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(i_scale.x, i_scale.y, i_scale.z);
        sprite.position.set(i_position.x, i_position.y, i_position.z);
        i_scene.add(sprite);
        return sprite;
    };

    // planeを作成し、sceneに追加
    createPlane(i_scene, i_texture, i_scale, i_position) {
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            map: i_texture,
            alphaTest: 0.2
        });
        //        const spriteMaterial = new THREE.SpriteMaterial({ map: i_texture });
        const geometry = new THREE.PlaneGeometry(1, 1);
        const plane = new THREE.Mesh(geometry, material);
        //const sprite = new THREE.Sprite(spriteMaterial);
        plane.scale.set(i_scale.x, i_scale.y, i_scale.z);
        plane.position.set(i_position.x, i_position.y, i_position.z);
        //plane.name = "text";

        //        sprite.scale.set(i_scale.x, i_scale.y, i_scale.z);
        //        sprite.position.set(i_position.x, i_position.y, i_position.z);
        i_scene.add(plane);
        return plane;
    };

    createCanvasForTexture(i_cw, i_ch, i_text, i_fontSize, i_bgcolortxt, i_fontcolortxt) {
        // 貼り付けるcanvasを作成。
        const canvasForText = document.createElement('canvas');
        const ctx = canvasForText.getContext('2d');
        ctx.canvas.width = i_cw; // 小さいと文字がぼやける
        ctx.canvas.height = i_ch; // 小さいと文字がぼやける 
        // 透過率50%の青背景を描く
        //        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.fillStyle = i_bgcolortxt;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        //        ctx.fillStyle = 'white';
        ctx.fillStyle = i_fontcolortxt;
        //  フォントの指定
        //        ctx.font = `${i_fontSize}px serif`;
        ctx.font = `${i_fontSize}px メイリオ`;
        ctx.fillText(i_text,
            // x方向の余白/2をx方向開始時の始点とすることで、横方向の中央揃えをしている。
            (i_cw - ctx.measureText(i_text).width) / 2,
            // y方向のcanvasの中央に文字の高さの半分を加えることで、縦方向の中央揃えをしている。
            i_ch / 2 + ctx.measureText(i_text).actualBoundingBoxAscent / 2
        );
        return canvasForText;
    };

    //----------------------------------------
    //  テキストを表示する3Dスプライトを作成する
    //  3D用、スプライトはorthographicCameraでは表示されない
    //  テキストを表示する3Dオブジェクトを作成する
    //  3DSprite-> i_fSprite : true / 3D空間中で回転しない
    //  3DObject-> i_fSprite : false / i_fYReverse:false 3D空間中で回転する
    //  2DHUD -> i_fSprite : false /  i_fYReverse:true
    //----------------------------------------
    makeTextObject(i_scene, i_text, i_position, i_fontSize, i_bgcolortxt, i_fontcolortxt, i_fSprite, i_fYReverse) {
        const scaleMaster = 10 * i_fontSize;
        //  文字列が短い場合のぼやけ対策
        let txtlen = i_text.length;
        if (txtlen < 10) txtlen = 10;
        const txtw = txtlen * i_fontSize;
        const txth = i_fontSize;
        const canvasRectTexture = new THREE.CanvasTexture(
            this.createCanvasForTexture(txtw, txth, i_text, i_fontSize, i_bgcolortxt, i_fontcolortxt)
        );
        const sca = new THREE.Vector3(scaleMaster, scaleMaster * (txth / txtw), scaleMaster);
        let sp = null;
        //  3D空間中でずっとカメラを向いているスプライト
        if (i_fSprite) {
            sp = this.createSprite(i_scene, canvasRectTexture, sca, i_position);
            //  空間中で回転するメッシュ
        } else {
            //  3Dの場合上下を逆転しない
            //  HUDの場合上下を逆転する
            if (i_fYReverse) sca.y *= -1;
            sp = this.createPlane(i_scene, canvasRectTexture, sca, i_position);
        }
        //console.log("makeTextSprite:", sp);

        return sp;
    };
    destroyTextObject(i_scene, i_obj) {
        if (i_obj) {
            if (i_obj.material) i_obj.material.dispose();
            if (i_obj.geometry) i_obj.geometry.dispose();
            i_scene.remove(i_obj);
        }

    }

    //--------------------------------------------------------
    //  テクスチャ

    async loadTexture(imagePath, i_gameimage) {
        if (i_gameimage == null) {
            i_gameimage = new gameImage();
        } else {
            i_gameimage.destroy(this.gc.scene);
        }
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            //let retsize = {};
            //let retw = 0,
            //    reth = 0;
            this.texture = loader.load(this.gc.path + imagePath, function(i_texture) {
                //console.log("loadTexture : ", imagePath, " [texture]", i_gameimage);
                //                                console.log(" [texture.source]", i_texture.source);
                //                                console.log(" [texture.image]", i_texture.image);
                //console.log(" [this.texture] : this :", this);
                //  幅と高さを、引数構造体に保存して外部に持ち出す
                i_gameimage.texture = i_texture;
                i_gameimage.width = i_texture.image.naturalWidth;
                i_gameimage.height = i_texture.image.naturalHeight;
                i_gameimage.fInit = true;
                resolve(i_texture);
            });
            //  この次点では0
            //console.log(" gameImage : [loadTexture]", i_gameimage.width);
        });
    }

    //--------------------------------
    //  画像を読み込み2Dシーンへセットする
    //--------------------------------
    async makeHUDImage(imagePath, i_name, i_gameimage, i_scene2d) {
        await this.makeObjectPlane(imagePath, i_name, i_gameimage, i_scene2d);
    }

    //--------------------------------
    //  画像を読み込み3Dシーンへセットする( 主に2Dカメラ用 )
    //--------------------------------
    async makeObjectPlane(imagePath, i_name, i_gameobject, i_scene) {
        //console.log("makeHUDImage : [i_gameimage]", i_gameimage);
        let go = i_gameobject;
        go.type = go.OBJTYPE.TEXTURE;
        //  作っても外部までもっていけない
        if (i_gameobject == null) {
            ///console.log("makeHUDImage : nullなので作成");
            //i_gameimage = new gameImage();
        }
        //  既にあるなら一度破棄する
        else {
            i_gameobject.destroy();
        }
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            this.texture = loader.load(this.gc.path + imagePath, function(i_texture) {
                // 縦横比を保って適当にリサイズ
                const w = i_texture.image.naturalWidth;
                const h = i_texture.image.naturalHeight; // / (tex.image.width / w);

                i_gameobject.texture = i_texture;
                i_gameobject.naturalwidth = w;
                i_gameobject.naturalheight = h;
                i_gameobject.width = w;
                i_gameobject.height = h;
                i_gameobject.name = i_name;
                i_gameobject.fInit = true;

                // 平面
                const geometry = new THREE.PlaneGeometry(1, 1);
                const material = new THREE.MeshBasicMaterial({
                    transparent: true,
                    side: THREE.DoubleSide,
                    map: i_texture,
                    alphaTest: 0.2
                });
                const plane = new THREE.Mesh(geometry, material);
                plane.scale.set(w, -h, 1);
                plane.position.set(0, 0, 0);
                plane.name = i_name;
                //console.log(plane.scale, plane.position, plane.name);
                i_scene.add(plane);
                if (i_gameobject.object == null) {
                    //                    this.object = new THREE.Object3D
                }
                i_gameobject.object = plane;

                resolve(i_texture);
            });
        });
    }


    //--------------------------------
    //  GLTFモデルを読み込み3Dシーンへセットする
    //--------------------------------
    async loadGLTFModel(i_filePath, i_name, i_gameobject, i_scene) {
        let go = i_gameobject;
        go.type = go.OBJTYPE.MODEL;
        //  3Dモデルの読み込み
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            //  https://threejs.org/docs/#examples/en/loaders/GLTFLoader
            loader.load(this.gc.path + i_filePath,
                function(gltf) {
                    const model = gltf.scene;
                    //                    gltf.animations; // Array<THREE.AnimationClip>
                    //                    gltf.scene; // THREE.Group
                    //                    gltf.scenes; // Array<THREE.Group>
                    //                    gltf.cameras; // Array<THREE.Camera>
                    //                    gltf.asset; // Object                    
                    i_scene.add(model);
                    i_gameobject.object = model;
                    i_gameobject.object.name = i_name;
                    i_gameobject.name = i_name;
                    //console.log("loadGLTFModel : load :", i_gameobject);
                    resolve(gltf);
                },
                undefined,
                function(e) {
                    console.error(e);
                });
        });
    }

    //--------------------------------
    //  Spineモデルを読み込み3Dシーンへセットする
    //--------------------------------
    loadSpineModel(i_skeletonFilePath, i_atlasFilePath, i_name, i_gameobject, i_scene) {
        let am = this.gc.spineAssetManager;
        am.loadText(i_skeletonFilePath);
        am.loadTextureAtlas(i_atlasFilePath);
        //console.log("loadSpineModel :", am.toLoad, am.loaded, am);
        //  設定 : 上記データを保持しておいて、ループで実行する
        let go = i_gameobject;
        go.type = go.OBJTYPE.SPINE;
        go.spineSkeletonFileName = i_skeletonFilePath;
        go.spineAtlasFileName = i_atlasFilePath;
        go.name = i_name; //  呼称
        return;

        let ary = [this, i_skeletonFilePath, i_atlasFilePath, i_name, i_gameobject, i_scene];
        //  読み込みが終るまでのループ処理
        while (!this.gc.spineAssetManager.isLoadingComplete()) {
            //            if (requestAnimationFrame(this.loadSpineModel_loop.apply(null, ary))) {
            if (this.loadSpineModel_loop(this, i_skeletonFilePath, i_atlasFilePath, i_name, i_gameobject, i_scene)) {
                break;
            }
        }
        //        requestAnimationFrame(this.loadSpineModel_loop );
    }


    //--------------------------------
    //  Spineモデルの読み込みをループ中で完成させる
    //--------------------------------
    manageSpineModelLoading(i_gameobject, i_scene) {
        let am = this.gc.spineAssetManager;
        //console.log("loop :", am.toLoad, am.loaded, am.errors);
        let gobj = i_gameobject;

        //  ロード済み : アニメーション管理
        if (gobj.spineSkeletonMesh) {
            let now = Date.now() / 1000;
            let delta = now - this.lastFrameTime;
            this.lastFrameTime = now;
            //console.log("spineアニメーション管理 : ", delta, gobj, gobj.spineMesh, gobj.spineSkeletonMesh);

            // resize canvas to use full page, adjust camera/renderer
            //resize();
            // update the animation
            gobj.spineSkeletonMesh.update(delta);
        }
        //  まだオブジェクトが入っておらず、かつコンプリートフラグが立った場合
        else if (!gobj.spineMesh && am.isLoadingComplete()) {
            // Add a box to the scene to which we attach the skeleton mesh
            let geometry = new THREE.BoxGeometry(10, 10, 10);
            let material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
            let mesh = new THREE.Mesh(geometry, material);
            mesh.visible = false;
            i_scene.add(mesh);

            // Load the texture atlas using name.atlas and name.png from the AssetManager.
            // The function passed to TextureAtlas is used to resolve relative paths.
            let atlas = am.require(gobj.spineAtlasFileName);

            // Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
            let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

            // Create a SkeletonJson instance for parsing the .json file.
            let skeletonJson = new spine.SkeletonJson(atlasLoader);

            // Set the scale to apply during parsing, parse the file, and create a new skeleton.
            skeletonJson.scale = 1;
            let skeletonData = skeletonJson.readSkeletonData(am.require(gobj.spineSkeletonFileName));

            //            console.log("spine読み込み完了そ : ", atlas, atlasLoader, skeletonJson, skeletonData);
            // Create a SkeletonMesh from the data and attach it to the scene
            let skeletonMesh = new spine.SkeletonMesh(skeletonData, (parameters) => {
                parameters.depthTest = true;
                //parameters.depthWrite = true;
                //                parameters.alphaTest = 0.001;
                parameters.depthTest = false;
                parameters.alphaTest = 0.5;
            });
            //let animation = "run-to-idle";
            //let animation = "hoverboard";
            //let animation = "aim";        //  映ってはいる
            //let animation = "death"; //  動いているしエラーがないが、一部足先？がNaNか０かで固定されている。
            //let animation = "idle";
            //let animation = "idle-turn";
            //let animation = "jump";
            //let animation = "run";
            //let animation = "portal";   //  一瞬飛んでくるが、ボーンが壊れているのか落ちて消える
            //let animation = "shoot";    //  銃が動いているがポーズはバラバラ
            //let animation = "draw";
            //            let animation = "test";
            //let retAnim = skeletonMesh.state.setAnimation(0, animation, true);
            skeletonMesh.name = "anim";
            mesh.add(skeletonMesh);

            //mesh.position.set(0, -330, 0);
            //mesh.scale.set(0.5, 0.5, 0.5);
            skeletonMesh.update(0.1);
            //console.log("spine読み込み完了そ : ", skeletonMesh, mesh, retAnim);

            //mesh.lookAt(new THREE.Vector3(100, 100, -100));

            //  ゲームオブジェクトにセット
            gobj.spineMesh = mesh;
            gobj.spineSkeletonMesh = skeletonMesh;
            gobj.type = gobj.OBJTYPE.SPINE;

            //gobj.setRotation(0, 0, 0);
            //            gobj.setScale(1, 1, 1);
            //console.log("spine読み込み完了 : ", gobj);
            //            gobj.spineSkeletonFileName = i_skeletonFilePath;
            //            gobj.spineAtlasFileName = i_atlasFilePath;
            //            gobj.name = i_name; //  呼称
            return true;
            //            requestAnimationFrame(render);
            //  読み込みが完了しない限りループし続ける
        } // else requestAnimationFrame(i_this.loadSpineModel_loop.apply(null, ary));
        return false;
    }

    //--------------------------------
    //  Spineモデルを読み込み3Dシーンへセットする
    //--------------------------------
    loadSpineModel_loop(i_this, i_skeletonFilePath, i_atlasFilePath, i_name, i_gameobject, i_scene) {
        let am = i_this.gc.spineAssetManager;
        //console.log("loop :", am.toLoad, am.loaded, am.errors);
        let gobj = i_gameobject;
        let ary = [i_this, this.gc.path + i_skeletonFilePath, this.gc.path + i_atlasFilePath, i_name, i_gameobject, i_scene];
        if (i_this.gc.spineAssetManager.isLoadingComplete()) {
            // Add a box to the scene to which we attach the skeleton mesh
            let geometry = new THREE.BoxGeometry(200, 200, 200);
            let material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
            let mesh = new THREE.Mesh(geometry, material);
            i_scene.add(mesh);

            // Load the texture atlas using name.atlas and name.png from the AssetManager.
            // The function passed to TextureAtlas is used to resolve relative paths.
            let atlas = i_this.gc.spineAssetManager.require(this.gc.path + i_atlasFilePath);

            // Create a AtlasAttachmentLoader that resolves region, mesh, boundingbox and path attachments
            let atlasLoader = new spine.AtlasAttachmentLoader(atlas);

            // Create a SkeletonJson instance for parsing the .json file.
            let skeletonJson = new spine.SkeletonJson(atlasLoader);

            // Set the scale to apply during parsing, parse the file, and create a new skeleton.
            skeletonJson.scale = 0.4;
            let skeletonData = skeletonJson.readSkeletonData(i_this.gc.spineAssetManager.require(this.gc.path + i_skeletonFilePath));

            // Create a SkeletonMesh from the data and attach it to the scene
            skeletonMesh = new spine.SkeletonMesh(skeletonData, (parameters) => {
                parameters.depthTest = true;
                parameters.depthWrite = true;
                parameters.alphaTest = 0.001;
            });
            let animation = "walk";
            skeletonMesh.state.setAnimation(0, animation, true);
            mesh.add(skeletonMesh);

            //  ゲームオブジェクトにセット
            gobj.spineMesh = mesh;
            gobj.spineSkeletonMesh = skeletonMesh;
            gobj.spineSkeletonFileName = i_skeletonFilePath;
            gobj.spineAtlasFileName = i_atlasFilePath;
            gobj.name = i_name; //  呼称
            return true;
            //            requestAnimationFrame(render);
            //  読み込みが完了しない限りループし続ける
        } // else requestAnimationFrame(i_this.loadSpineModel_loop.apply(null, ary));
        return false;
    }



    //================================================
    //
    //  接触判定
    //
    //================================================
    //--------------------------------------------------------
    //  Vector3とMatrix4を演算してベクトルを回転する
    //--------------------------------------------------------
    calcVectorMatrix(i_vec, i_mat) {
        //  指定方向を正面に回転しているマトリクス
        let mt = i_mat.elements;
        let vd = i_vec; //  回転したいベクトル
        let vdn = new THREE.Vector3(); //  結果
        //  ベクトルとマトリクスの演算
        //  縦横の演算結果を逆転している + マイナス反転している
        vdn.x = -(mt[0 + 0] * vd.x + mt[4 + 0] * vd.y + mt[8 + 0] * vd.z);
        vdn.y = -(mt[0 + 1] * vd.x + mt[4 + 1] * vd.y + mt[8 + 1] * vd.z);
        vdn.z = -(mt[0 + 2] * vd.x + mt[4 + 2] * vd.y + mt[8 + 2] * vd.z);
        return vdn;
    }

    //--------------------------------------------------------
    //  ベクトルを指定の方向に回転させる
    //--------------------------------------------------------
    calcVectorAtLook(io_vec, i_lookVec) {
        //面の向きを変える
        //        const lp = new THREE.Vector3(-1, -1, -1);
        //console.log(" test : matrix - lookat前:", this.hitplane.position, lp, this.hitplane.matrix, this.hitplane.matrixWorld);
        this.hitplane.lookAt(new THREE.Vector3(
            this.hitplane.position.x + i_lookVec.x,
            this.hitplane.position.y + i_lookVec.y,
            this.hitplane.position.z + i_lookVec.z));
        return this.calcVectorMatrix(io_vec, this.hitplane.matrix);
    }


    //================================================
    //
    //  接触判定
    //
    //================================================
    //--------------------------------------------------------
    // *  三角形の内包判定
    // *  
    // *  @param vecA vectorA
    // *  @param vecB vectorB
    // *  @param vecC vectorC
    //--------------------------------------------------------
    det(vecA, vecB, vecC) {
        return ((vecA.x * vecB.y * vecC.z) +
            (vecA.y * vecB.z * vecC.x) +
            (vecA.z * vecB.x * vecC.y) -
            (vecA.x * vecB.z * vecC.y) -
            (vecA.y * vecB.x * vecC.z) -
            (vecA.z * vecB.y * vecC.x));
    }

    //--------------------------------------------------------
    // *  Raycast
    // *
    // *  @param origin origin vector of ray
    // *  @param ray  ray direction
    // *  @param v0 a vertex of a triangle
    // *  @param v1 a vertex of a triangle
    // *  @param v2 a vertex of a triangle
    // *
    // *  @return result object
    //--------------------------------------------------------
    rayIntersectsTriangle(origin, ray, v0, v1, v2) {
        // 交差判定結果を表すオブジェクト
        var ret = {
            result: false,
            point: new THREE.Vector3(),
            distance: 0
        };

        // レイの逆方向のベクトルを得る
        var invRay = ray.clone().multiplyScalar(-1);
        var edge1 = (new THREE.Vector3()).subVectors(v1, v0);
        var edge2 = (new THREE.Vector3()).subVectors(v2, v0);

        // クラメルの公式の分母
        var denominator = this.det(edge1, edge2, invRay);

        // レイが平面と平行でないかチェック
        if (denominator <= 0) {
            return ret;
        }

        var d = (new THREE.Vector3()).subVectors(origin, v0);

        var u = this.det(d, edge2, invRay) / denominator;
        if ((u >= 0) && (u <= 1)) {
            var v = this.det(edge1, d, invRay) / denominator;
            if ((v >= 0) && (u + v <= 1)) {
                var t = this.det(edge1, edge2, d) / denominator;

                // 距離がマイナスの場合は交差していない
                if (t < 0) {
                    return ret;
                }

                var tmp = ray.clone().multiplyScalar(t);
                ret.point = (new THREE.Vector3()).addVectors(origin, tmp);
                ret.result = true;
                ret.distance = t;
                //console.log("[Triangle-hit]", origin, invRay, v0, v1, v2);
                //console.log("[Triangle-hit]d,u,v,t", d, u, v, t);
            }
        }

        return ret;
    }

    //  物体との自力計算
    rayIntersectsObject(i_lineorigin, i_lineray, i_object) {
        if (i_object == null) return;
        //  線座標をコピー
        let vo = (new THREE.Vector3()).copy(i_lineorigin);
        let vr = (new THREE.Vector3()).copy(i_lineray);
        //  線の始点(シーン座標)から、物体の位置を引いて距離にする
        vo = vo.subVectors(vo, i_object.position);

        //console.log('[rayIntersectsObject] ', vo, vr, i_object.isGroup, i_object.position, i_object.children.length);
        //  オブジェクトがグループ
        if (i_object.isGroup) {
            //  子の数だけ繰り返す
            for (var j = 0; j < i_object.children.length; j++) {
                //  ジオメトリの頂点を取得する
                var geo = i_object.children[j].geometry;
                var posi = geo.attributes.position;
                var pary = posi.array;
                //  インデックスある場合、インデックスを取得して
                //console.log('[geo] ', geo.index, geo.index.count);
                if (geo.index) {
                    var iary = geo.index.array; //  index配列
                    for (var i = 0; i < geo.index.count; i += 3) {
                        var vposA, vposB, vposC;
                        //  頂点1
                        vposA = iary[i] * 3 + 0; //  頂点番号位置(index × 3(x,y,z))
                        vposB = iary[i] * 3 + 1; //  
                        vposC = iary[i] * 3 + 2; //  
                        //  position配列からインデックス番号で指定して数値を取得
                        var va = new THREE.Vector3(pary[vposA + 0], pary[vposB + 1], pary[vposC + 2]);
                        //  頂点2
                        vposA = iary[i + 1] * 3 + 0; //  頂点番号位置(index × 3(x,y,z))
                        vposB = iary[i + 1] * 3 + 1; //  
                        vposC = iary[i + 1] * 3 + 2; //  
                        var vb = new THREE.Vector3(pary[vposA + 0], pary[vposB + 1], pary[vposC + 2]);
                        //  頂点3
                        vposA = iary[i + 2] * 3 + 0; //  頂点番号位置(index × 3(x,y,z))
                        vposB = iary[i + 2] * 3 + 1; //  
                        vposC = iary[i + 2] * 3 + 2; //  
                        var vc = new THREE.Vector3(pary[vposA + 0], pary[vposB + 1], pary[vposC + 2]);
                        //  三つの頂点から１つの面をつくり判定をとる
                        let ret = this.rayIntersectsTriangle(vo, vr, va, vb, vc);
                        if (ret.result) {
                            return ret.point;
                        }
                    }

                }
                //  インデックスがないので直接番号をとりに行く
                else {
                    for (var i = 0; i < ary.length; i += 3) {
                        pary[i] *= i_scale;
                        this.rayIntersectsTriangle(vo, vr, v0, v1, v2);
                    }
                }
            }
        }

        //  グループではない
        else {}
        return null;
    }


    //--------------------------------------------------------
    //  線分と面一つの判定
    //  ・
    //--------------------------------------------------------
    checkLineCollisionPlane_Raycast(
        //  線分
        i_origin, i_dist,
        i_PlaneCenter, i_w, i_h, i_PlaneDirection
    ) {
        let pc = i_PlaneCenter;
        //  線分と面の判定
        let vo = (new THREE.Vector3()).copy(i_origin);
        let vd = (new THREE.Vector3()).copy(i_dist);
        //  線の始点から面の位置引く
        vo = vo.subVectors(vo, pc);
        vd = vd.subVectors(vd, pc);

        //  面の幅高さから四角形を作成
        let v0 = new THREE.Vector3(-(i_w / 2), -(i_h / 2), 0); //  左上
        let v1 = new THREE.Vector3((i_w / 2), -(i_h / 2), 0); //  右上
        let v2 = new THREE.Vector3((i_w / 2), (i_h / 2), 0); //  右下
        let v3 = new THREE.Vector3(-(i_w / 2), (i_h / 2), 0); //  左下
        //  テスト面を指定方向に向ける
        let pd = i_PlaneDirection;
        //  面の中心から向いてる方向までの距離にする
        pd = pd.subVectors(pd, pc);
        this.hitplane.lookAt(new THREE.Vector3(pd.x, pd.y, pd.z));
        //        console.log(" Plane_raycast : ", vo, vd, pc, pd, v0, v1, v2, v3, this.hitplane.matrix);
        //  計算されたmatrixを使用し、4つの点を始点から回転させる
        v0 = this.calcVectorMatrix(v0, this.hitplane.matrix);
        v1 = this.calcVectorMatrix(v1, this.hitplane.matrix);
        v2 = this.calcVectorMatrix(v2, this.hitplane.matrix);
        v3 = this.calcVectorMatrix(v3, this.hitplane.matrix);

        //const quaternion = new THREE.Quaternion();
        //quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
        //const vector = new THREE.Vector3( 1, 0, 0 ); vector.applyQuaternion( quaternion );
        //  回転された点を使用して線分と面を判定する
        let ret;
        //  0,1,2の三角形と線分判定
        ret = this.rayIntersectsTriangle(vo, vd, v0, v1, v2);
        if (ret.result) {
            //console.log(" Plane_raycast : v0v1v2 hit ", ret);
            //  面の位置引いたで戻す
            ret.point.add(pc);
            return ret.point;
        }
        //  当たらなかった場合
        else {
            //  1,2,3の三角形と線分判定
            ret = this.rayIntersectsTriangle(vo, vd, v1, v2, v3);
            //console.log(" Plane_raycast : v1v2v3 hit ", ret);
            if (ret.result) {
                //  面の位置引いたで戻す
                ret.point.add(pc);
                return ret.point;
            }
        }
        return null;
    }

    //--------------------------------------------------------
    //  線分と円面一つの判定
    //  ・
    //--------------------------------------------------------
    checkLineCollisionCircle_Raycast(
        //  線分
        i_origin, i_dist,
        i_PlaneCenter, i_radius, i_PlaneDirection
    ) {
        //  面と判定する
        let ret = this.checkLineCollisionPlane_Raycast(
            i_origin, i_dist, i_PlaneCenter, i_radius * 2, i_radius * 2, i_PlaneDirection);
        if (ret == null) return null;
        //  面と接触している場合、中心点から接触点の距離を測る
        let d = ret.distanceTo(i_PlaneCenter);
        //  半径以内なら接触している
        if (d <= i_radius) {
            //console.log(" Circle_raycast : distanceTo? ", d, i_radius, ret);
            return ret;
        }

        return null;
    }

    //--------------------------------------------------------
    //  線分と物体一つの判定
    //  ・
    //--------------------------------------------------------
    checkLineCollisionObject_Raycast(i_origin, i_dist, i_scene, i_targetobject) {
        //        console.log("checkMouseCollisionRaycast() : ");

        //  レイキャスト・線判定を作る
        const raycas = new THREE.Raycaster(i_origin, i_dist);

        // その光線とぶつかったオブジェクトを得る
        let iss = raycas.intersectObjects(i_scene.children, true);

        // オブジェクトの中から指定されたオブジェクトの名前があるかチェック
        if (iss.length <= 0) return null;

        for (var i = 0; i < iss.length; i++) {
            if (iss[i].object.name == "arrow" ||
                iss[i].object.name == "ground1" ||
                iss[i].object.name == "rayline"
            ) {
                continue;
            }
            if (i_targetobject) {
                if (i_targetobject.name) {
                    //console.log("gameFunc :clco_ray() : ", i, iss, i_origin, i_dist, iss[i].object.name, i_targetobject.name);

                }
                //  指定した名前と一致するオブジェクトであれば接触したとする
                if (iss[i].object.name == i_targetobject.name) {
                    return iss[i].point;
                }
            }
        }
        return null;
    }


    //--------------------------------------------------------
    //  線分と空間の判定 : 共通処理
    //  ・線分判定情報を返す
    //--------------------------------------------------------
    checkLineCollisionRaycast(i_origin, i_dist, i_scene, i_gc) {
        //        console.log("checkMouseCollisionRaycast() : ");

        //  レイキャスト・光線判定を飛ばす
        const raycas = new THREE.Raycaster(
            i_origin,
            i_dist,
            0,
            8
        );

        // その光線とぶつかったオブジェクトを得る
        return raycas.intersectObjects(i_scene.children, true);
    }

    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 共通処理
    //  ・画面をクリックは共通処理
    //  ・指定カメラとシーンからraycastを作成
    //  ・線分判定情報を返す
    //--------------------------------------------------------
    checkMouseCollisionRaycast(i_camera, i_scene, i_gc) {
        //        console.log("checkMouseCollisionRaycast() : ");
        var gmobj = this.hudi_title;
        //  マウスイベントで画面内の位置を取得し-1～+1の範囲の数値にしたもの
        var mouse = new THREE.Vector2();
        mouse.x = i_gc.mouseX3D;
        mouse.y = i_gc.mouseY3D;

        //  レイキャスト・光線判定を飛ばす
        i_gc.raycaster.setFromCamera(mouse, i_camera);
        /*
                //  光線を可視化 / 毎回作り直す
                //this.destroyObject_rayline();
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
        */
        //var rlp = this.rayline.geometry.attributes.position;
        //var ro = this.gc.raycaster.ray.origin;
        var ro = new THREE.Vector3();
        var ron = new THREE.Vector3();
        //ro.copy(ro);
        //ro.copy(this.gc.raycaster.ray.origin); //.clone();
        //        ro.copy(mousepos); //.clone();
        //ron.copy(this.gc.raycaster.ray.direction);
        //var rd = this.gc.raycaster.ray.direction;
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
        */
        //console.log("[接触判定] : ", mouse);

        // その光線とぶつかったオブジェクトを得る
        return i_gc.raycaster.intersectObjects(i_scene.children, true);

    }


    //--------------------------------------------------------
    //  線分と物体一つの判定
    //--------------------------------------------------------
    checkLineCollisionObject(i_origin, i_dist, i_scene, i_gc) {
        //        console.log("checkMouseCollision3D() : ");
        //  マウス座標と画面の位置で、カメラとシーンから線分を作成し空間と判定
        const intersects = this.checkLineCollisionRaycast(i_origin, i_dist, i_scene, i_gc);
        //  Commonに保存
        i_gc.intersects = intersects;

        //  判定配列データからオブジェクトを識別
        var flag = this.checkMouseCollision3D_ObjectVerifi(intersects, i_gc);

        return flag;
    }

    //--------------------------------------------------------
    //  線分と空間の判定 : 3D部分
    //--------------------------------------------------------
    checkLineCollision3D(i_origin, i_dist, i_scene, i_gc, i_funcHover) {
        //        console.log("checkMouseCollision3D() : ");
        //  マウス座標と画面の位置で、カメラとシーンから線分を作成し空間と判定
        const intersects = this.checkLineCollisionRaycast(i_origin, i_dist, i_scene, i_gc);
        //  Commonに保存
        i_gc.intersects = intersects;

        //  判定配列データからオブジェクトを識別
        var flag = this.checkMouseCollision3D_ObjectVerifi(intersects, i_gc);

        return flag;
    }

    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 3D部分
    //--------------------------------------------------------
    checkMouseCollision3D(i_camera, i_scene, i_gc, i_funcHover) {
        //        console.log("checkMouseCollision3D() : ");
        //  マウス座標と画面の位置で、カメラとシーンから線分を作成し空間と判定
        const intersects = this.checkMouseCollisionRaycast(i_camera, i_scene, i_gc);
        //  Commonに保存
        i_gc.intersects = intersects;

        //  判定配列データからオブジェクトを識別
        var flag = this.checkMouseCollision3D_ObjectVerifi(intersects, i_gc);

        return flag;

        //  オブジェクトがあった場合のホバー処理( 関数は外部 )
        if (flag) {
            i_funcHover(i_gc.pickobject);
        } else {
            //  オブジェクトがなかった場合
            //( 半透明にするのはデバッグ処理 )
            //            if (i_gc.pickobject) this.pickobject.material.opacity = 1;
            i_gc.pickobject = null;
        }
        return flag;
    }

    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 2D部分 HUD
    //--------------------------------------------------------
    checkMouseCollision2D(i_camera, i_scene, i_gc, i_funcHover) {
        //  マウス座標と画面の位置で、カメラとシーンから線分を作成し空間と判定
        const intersects = this.checkMouseCollisionRaycast(i_camera, i_scene, i_gc);
        //  Commonに保存
        i_gc.intersects = intersects;
        //  判定配列データからオブジェクトを識別
        var flag = this.checkMouseCollision2D_ObjectVerifi(intersects, i_gc);

        return flag;

        //  オブジェクトがあった場合のホバー処理( 関数は外部 )
        if (flag) {
            i_funcHover(i_gc.pickobjectUI);
        }
        //  オブジェクトがなかった場合
        else {
            //if (this.pickobjectUI) this.pickobjectUI.material.opacity = 1;
            i_gc.pickobjectUI = null;
        }
    }


    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 3D部分 / オブジェクトとの判定
    //--------------------------------------------------------
    checkMouseCollision3D_ObjectVerifi(i_intersects, i_gc) {
        var flag = false;
        if (i_intersects.length <= 0) return false;

        for (var i = 0; i < i_intersects.length; i++) {
            //  名称指定で無視か決めるにはgameObjectの紐づけが必用。
            //  空間に関わる全てにアクセスできないといけない
            //  そうなると全てgc=gameCommonにセットしておくのが無難か
            var ret = i_gc.objs.getObject(i_intersects[i].object.name);
            //            console.log("3d verifi() : [i]", i, i_intersects.length, i_intersects[i].object.name, ret);
            //            console.log("3d verifi() : [objs]", i_gc, i_gc.objs);
            if (ret && !ret.fTouchIgnore) flag = true;
            //  無視しないオブジェクトが出た
            if (flag) {
                //if (i_gc.pickobject) i_gc.pickobject.material.opacity = 1;
                //  最も手前のobjを保存
                //  キャストの物ではなく、gameObjectで取得する
                i_gc.pickobject = ret;
                //i_gc.pickobject = i_intersects[i].object; //  最も手前のobjを保存
                //i_gc.pickobject.material.opacity = 0.5; //  半透明にする
                //console.log("[接触判定:intersects]", intersects[i]);

                //  接触位置にヘルパー置く
                //this.helper.position.set(0, 0, 0);
                if (i_intersects[i].face != null) {
                    //    this.helper.lookAt(i_intersects[i].face.normal);
                }
                //this.helper.position.copy(i_intersects[i].point);

                break;
            }
        }
        return flag;
    }


    //--------------------------------------------------------
    //  マウス座標と画面の判定 : 2D部分 HUD / オブジェクトとの判定
    //--------------------------------------------------------
    checkMouseCollision2D_ObjectVerifi(i_intersects, i_gc) {
        //        console.log("checkMouseCollision2D_objectverifi() : ");
        var flag = false;
        if (i_intersects.length <= 0) return false;

        for (var i = 0; i < i_intersects.length; i++) {
            //  無視するか名称で判断
            var ret = i_gc.hudis.getObject(i_intersects[i].object.name);
            //            console.log("2d verifi() : [i]", i, i_intersects.length, i_intersects[i].object.name, ret);
            //            console.log("2d verifi() : [objs]", i_gc, i_gc.hudis);
            //  retがない = グループにない場合も無視
            if (ret && !ret.fTouchIgnore) flag = true;
            //  無視しないオブジェクトが出た
            if (flag) {
                i_gc.pickobjectUI = ret;
                //                if (this.pickobjectUI) this.pickobjectUI.material.opacity = 1;
                //                this.pickobjectUI = i_intersects[i].object; //  最も手前のobjを保存
                //                this.pickobject.material.opacity = 0.5; //  半透明にする
                //console.log("[接触判定:intersects]", intersects[i]);
                break;
            }
        }
        return flag;
    }

}