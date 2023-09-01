//----------------------------------------
//  ゲーム共通オブジェクト管理
//----------------------------------------
export class gameObjectGroup {
    constructor() {
        //  使用する画像
        this.objects = [];
    }

    //--------------------------------
    //  変数の解放、シーンから
    //--------------------------------
    destroyAll(i_scene) {
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i])
                this.objects[i].destroy(i_scene);
        }
    }

    //--------------------------------
    //  全オブジェクトのステータスを正常化( 処理前に使用 )
    //--------------------------------
    setNormalAll() {
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i]) {
                this.objects[i].initState();
            }
        }
    }

    add(i_object) {
        //console.log("gameObjectGroup : add前", this.objects);
        return this.objects.push(i_object);
        //        console.log("gameObjectGroup : add後", this.objects);
    }
    sub(i_name, i_scene) {
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i]) {
                if (this.objects[i].name == i_name) {
                    this.objects[i].destroy(i_scene); //  オブジェクトを破棄
                    this.objects.splice(i, 1); //  配列から抜く
                    return;
                }
            }
        }
        this.objects.push(i_object);
    }


    //  名前指定でオブジェクト取得
    getObject(i_name) {
        //console.log(" getObject in : ", this.objects.length);
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i]) {
                if (this.objects[i].name === i_name) {
                    //console.log(" getObject : ", i, this.objects.length, this.objects[i]);
                    return this.objects[i];
                }
            }
        }
        return null;
    }

}

//  内容はgameImageとほぼ同じ
export class gameObject {
    constructor() {
        this.OBJTYPE = {
            NONE: 0, //  未使用
            TEXTURE: 1, //  板画像テクスチャ
            MODEL: 2, //  blenderモデル
            SPINE: 3 //  spineモデル
        }
        this.type = this.OBJTYPE.NONE;
        //  使用する画像
        this.texture = null;
        //  画像の元サイズ
        this.naturalwidth = 0;
        this.naturalheight = 0;
        //  操作用可変サイズ
        this.width = 0;
        this.height = 0;

        //  名称
        this.name = ""; //  呼称
        //  オブジェクトの3Dメッシュデータ
        this.object = null;
        this.fInit = false; //  最初の読み込み完了後に初期化をしたフラグ
        //  spineデータ
        this.spineSkeletonFileName = ""; //  spineスケルトンファイル名
        this.spineAtlasFileName = ""; //  spineアトラスファイル名
        this.spineMesh = null;
        this.spineSkeletonMesh = null;

        //  フラグ
        this.fTouchIgnore = false; //  ユーザーからのクリック・タッチを無視するか
        this.fCollisionIgnore = false; //  true:物質として他の物質と判定しない
        //  個別のゲームステータス
        //  増えすぎるようなら、別のclassを作って任意で作成するように
        this.state = 0;
        //this.fCursorHover = false; //  カーソルが乗っているか
        this.fHover = false; //  カーソルが乗っているか

        //  読み込み前の予約用
        this.startPosition = new THREE.Vector3();
        this.startScale = new THREE.Vector3();
        this.startRotation = new THREE.Vector3();
        this.startVertexScale = -1;

        this.startSpineAnimation = "";
    }

    //--------------------------------
    //  変数の解放、シーンから
    //--------------------------------
    destroy(i_scene) {
        switch (this.type) {
            case this.OBJTYPE.NONE:
                break;

            case this.OBJTYPE.TEXTURE:
                break;

            case this.OBJTYPE.MODEL:
                break;

            case this.OBJTYPE.SPINE:
                break;
        }
        if (this.texture) {
            //console.log(" gameImage:destroy() : texture");
            this.texture.dispose();
        }
        if (this.object) {
            //console.log(" gameImage:destroy() : object");
            if (this.object.material) this.object.material.dispose();
            if (this.object.geometry) this.object.geometry.dispose();
            if (i_scene) i_scene.remove(this.object);
        }
        if (this.spineMesh) {
            if (this.spineMesh.material) this.spineMesh.material.dispose();
            if (this.spineMesh.geometry) this.spineMesh.geometry.dispose();
            if (i_scene) i_scene.remove(this.spineMesh);
        }
    }

    //--------------------------------
    //  ステータスの初期化
    //--------------------------------
    //  最初の初期化
    initState() {
        //console.log(" ★★★gameobject:★★★initState() : start");
        //  初期化済みなら実行しない
        if (this.fInit) return true;
        switch (this.type) {
            case this.OBJTYPE.NONE:
                break;

            case this.OBJTYPE.TEXTURE:
                //  objectが空なら実行しない
                if (!this.object) {
                    //console.log(" texture : objectが空");
                    return false;
                }
                break;

            case this.OBJTYPE.MODEL:
                //  objectが空なら実行しない
                if (!this.object) {
                    //console.log(" model : objectが空");
                    return false;
                }
                break;

            case this.OBJTYPE.SPINE:
                //  空なら実行しない
                if (!this.spineMesh) {
                    //console.log(" spine : spineMeshが空");
                    return false;
                }

                this.setSpineAnimation(this.startSpineAnimation, true);
                //  上下逆 
                // テクスチャと同じくscaleYの符号を反転すれば逆さを解消できるが、位置も著しくずれる
                break;
        }

        this.state = 0;
        this.fHover = false;

        this.fInit = true;

        if (this.type == this.OBJTYPE.SPINE) {
            this.spineMesh.visible = true;
            this.spineMesh.position.copy(this.startPosition);
            this.setRotation(this.startRotation.x, this.startRotation.y, this.startRotation.z);
            this.spineMesh.scale.copy(this.startScale);
            if (0 < this.startVertexScale) {
                this.setVertexScale(this.startVertexScale);

            }

        } else {
            this.object.position.copy(this.startPosition);
            this.setRotation(this.startRotation.x, this.startRotation.y, this.startRotation.z);
            //        this.object.rotation.x = this.startRotation.x;
            //        this.object.rotation.y = this.startRotation.y;
            //        this.object.rotation.z = this.startRotation.z;
            this.object.scale.copy(this.startScale);
            if (0 < this.startVertexScale) {
                this.setVertexScale(this.startVertexScale);

            }

        }


        //console.log(" ★★★gameobject:★★★initState() :", this);
        return true;

    }

    //  状態を処理開始前の通常に戻す
    setStateNormal() {
        this.state = 0;
        this.fHover = false;
    }
    setCursorHover(i_f) {
        //this.fCursorHover = 1;
        this.fHover = i_f;
        //console.log("trueにならん？", this.fCursorHover);
    }

    //  読み込んだ直後にobjectが反映されず進んでしまうので
    //  ループ中に初期化完了処理
    manage() {
        //  読み込んだ最初の初期化
        return this.initState();
    }

    //--------------------------------
    //  クローン
    //--------------------------------
    clone() {
        if (!this.object) return null;

        let cln = new gameObject();
        cln.object = this.object.clone();

        if (this.texture) cln.texture = this.texture.clone();
        cln.naturalwidth = this.naturalwidth;
        cln.naturalheight = this.naturalheight;

        cln.width = this.width;
        cln.height = this.height;

        cln.name = this.name;

        cln.fInit = this.fInit;
        //  フラグ
        cln.fTouchIgnore = false; //  ユーザーからのクリック・タッチを無視するか
        cln.fCollisionIgnore = false; //  true:物質として他の物質と判定しない

        cln.state = 0;
        cln.fHover = false;

        //  読み込み前の予約用
        cln.startPosition = new THREE.Vector3();
        cln.startScale = new THREE.Vector3();
        cln.startRotation = new THREE.Vector3();
        cln.startVertexScale = -1;


        return cln;
    }

    //--------------------------------
    //  position 位置座標
    //--------------------------------
    //  固定値で位置決める
    setPosition(i_x, i_y, i_d) {
        if (!this.fInit) {
            this.startPosition.set(i_x, i_y, i_d);
            return;
        }
        let obj = this.object;
        if (this.type == this.OBJTYPE.SPINE) obj = this.spineMesh;

        if (!obj) return;
        obj.position.set(i_x, i_y, i_d);
    }

    //--------------------------------
    //  rotation 回転
    //--------------------------------
    setRotation(i_x, i_y, i_d) {
        if (!this.fInit) {
            this.startRotation.set(i_x, i_y, i_d);
            return;
        }

        let obj = this.object;
        if (this.type == this.OBJTYPE.SPINE) obj = this.spineMesh;

        if (!obj) return;
        const one = Math.PI / 180;
        obj.rotation.x = i_x * one;
        obj.rotation.y = i_y * one;
        obj.rotation.z = i_d * one;
        //        this.object.scale.set(i_x * one, i_y * one, i_d * one);
    }


    //  移動
    movePosition(i_x, i_y, i_d) {
        let obj = this.object;
        if (this.type == this.OBJTYPE.SPINE) obj = this.spineMesh;
        if (obj == null) {
            return;
        }
        var nx = obj.position.x;
        var ny = obj.position.y;
        var nz = obj.position.z;
        obj.position.set(nx + i_x, ny + i_y, nz + i_d);
    }

    //--------------------------------
    //  scale サイズ
    //--------------------------------
    //  実際の頂点の倍率を操作する
    setVertexScale(i_scale) {
        if (!this.fInit) {
            this.startVertexScale = i_scale;
            return;
        }

        let obj = this.object;
        if (this.type == this.OBJTYPE.SPINE) obj = this.spineMesh;

        //console.log("[setVertexScale]", obj);
        //  グループである
        if (obj.isGroup) {
            for (var j = 0; j < obj.children.length; j++) {
                var ary = obj.children[j].geometry.attributes.position.array;
                for (var i = 0; i < ary.length; i++) {
                    ary[i] *= i_scale;
                }
            }
        }
        //  単体
        else {
            var ary = obj.geometry.attributes.position.array;
            for (var i = 0; ary.length; i++) {
                ary[i] *= i_scale;
            }

        }
    }


    //  固定値で位置決める
    setScale(i_x, i_y, i_d) {
        let obj = this.object;
        if (this.type == this.OBJTYPE.SPINE) obj = this.spineMesh;

        if (!this.fInit) {
            this.startScale.set(i_x, i_y, i_d);
            return;
        }

        obj.scale.set(i_x, i_y, i_d);
    }


    //  固定値でサイズを決める
    setSize(i_w, i_h, i_d) {
        let obj = this.object;
        if (this.type == this.OBJTYPE.SPINE) obj = this.spineMesh;

        if (obj == null) return;
        this.width = i_w; //  naturalは変化しない
        this.height = i_h; //  
        obj.scale.set(
            this.width, -this.height, //  2D画像の場合反転する必用がある
            i_d
        );
    }

    //  倍率でサイズを決める
    setSizeScale(i_xper, i_yper, i_zper) {
        let obj = this.object;
        if (this.type == this.OBJTYPE.SPINE) obj = this.spineMesh;

        if (obj == null) return;
        this.width = this.naturalwidth * i_xper; //  naturalは変化しない
        this.height = this.naturalheight * (-i_yper); //  
        obj.scale.set(
            this.width,
            this.height,
            1 * i_zper
        );
    }

    //--------------------------------
    //  SPINE処理
    setSpineAnimation(i_AnimeName, i_loop) {
        //console.log("setSpineAnimation : ", i_AnimeName, this);
        if (this.type != this.OBJTYPE.SPINE) return false;
        let ssm = this.spineSkeletonMesh;
        //  空の場合初期化処理にセットして終了
        if (ssm == null) {
            this.startSpineAnimation = i_AnimeName;
            return false;
        }
        //  アニメーション名が空の場合も終了
        if (!i_AnimeName || i_AnimeName == "") return false;

        //  http://ja.esotericsoftware.com/spine-applying-animations
        //  戻り値はTrackEntry
        let retAnim = ssm.state.setAnimation(0, i_AnimeName, i_loop);
        //  mixの設定
        retAnim.mixDuration = 0.1;
        ssm.update(0);
        //console.log("setSpineAnimation : ", i_AnimeName, retAnim);
    }

    //--------------------------------
    //  アニメのキュー追加
    addSpineAnimation(i_AnimeName, i_loop) {
        //console.log("addSpineAnimation : ", i_AnimeName, this);
        if (this.type != this.OBJTYPE.SPINE) return false;
        let ssm = this.spineSkeletonMesh;
        if (ssm == null) {
            return false;
        }
        //  アニメーション名が空の場合も終了
        if (!i_AnimeName || i_AnimeName == "") return false;

        let retAnim = ssm.state.addAnimation(0, i_AnimeName, true);
        //  mixの設定
        retAnim.mixDuration = 0.1;
        ssm.update(0);
        //console.log("addSpineAnimation : ", i_AnimeName, retAnim);
    }

    //  ボーンの取得
    getSpineBone(i_boneName) {
        if (this.type != this.OBJTYPE.SPINE) return null;
        let sm = this.spineMesh;
        if (sm == null) {
            return null;
        }

        let sms = sm.children[0].skeleton;
        //  ボーンを全て検索
        for (let i = 0; i < sms.data.bones.length; i++) {
            //  名前の入っているデータ配列を検索して一致した
            let db = sms.data.bones[i];
            if (db.name == i_boneName) {
                //  その配列番号の計算済みデータ？を取得して返す
                let sb = sms.bones[i];
                //console.log("getSpineBone: ", i);
                return sb;
            }
        }
        return null;

    }

    //  ボーンの取得
    getSpineBoneIK(i_ikName) {
        if (this.type != this.OBJTYPE.SPINE) return null;
        let sm = this.spineMesh;
        if (sm == null) {
            return null;
        }

        let sms = sm.children[0].skeleton;
        //  IKを全て検索
        for (let i = 0; i < sms.ikConstraints.length; i++) {
            //  名前の入っているデータ配列を検索して一致した
            let ikc = sms.ikConstraints[i];
            if (ikc.data.name == i_ikName) {
                //  IKデータを返す
                //console.log("getSpineBone: ", i);
                return ikc;
            }
        }
        return null;

    }
}