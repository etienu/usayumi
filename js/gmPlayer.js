import { GLTFLoader } from 'https://unpkg.com/three@0.148.0/examples/jsm/loaders/GLTFLoader.js';

import { gameObject, gameObjectGroup } from './gameObject.js';
import { gameFunc } from './gameFunc.js';
import { keyInputReceiver, keyInput } from './keyInputReceiver.js';
import { touchInputReceiver, touchInput } from './touchInputReceiver.js';
import { gameUIController } from './gameUIController.js';
import { gameScene } from './gameScene.js';
//import { GLTFLoader } from './three/loaders/GLTFLoader.js';

//----------------------------------------
//  ゲームプレイヤー: プレイヤー側の管理
//  ステージの進行と物体の管理
//----------------------------------------
export class gmPlayer {
    constructor() {
        this.gf = null;
        this.gc = null;
        this.fInit = false;

        this.models = null; //  オブジェクトコピー用の元モデル

        //  プレイヤーオブジェクト
        this.plobj = null;

        this.isdraw = false;

        //弾(矢)管理
        this.ammos = null; //  弾の配列
        this.useammo = null; //  現在の弾
        this.nowammoIndex = 0;
        //        this.nowwave = 0; //  現在のウェーブ

        //        this.fStageClear = false;
        //  弓の糸
        this.line_threadU = null; //  上
        this.line_threadB = null; //  下
        this.line_threadRH = null; //  右手
    }

    //----------------------------------------
    //  ループ
    //----------------------------------------
    task() {
        //  初期化されているかなどの確認
        if (!this.fInit || !this.gc || !this.gf || !this.ammos) {
            //console.log("player.task: 何かない", this);
            return;
        }

        let pl = this.plobj;
        pl.manage();

        let plo = pl.spineMesh;

        // spineローディング管理
        if (this.gf.manageSpineModelLoading(this.plobj, this.gc.scene)) {
            //console.log("読み込みおわったわーwww");
        }


        //  弾がない場合は処理しない
        if (this.ammos.ammos.length <= 0) {
            //console.log("player.task: 弾がない？", this.ammos);
            return;

        }

        //  状態に応じて弓の糸を描く
        this.destroyArrowThread();
        this.makeArrowThread();

        //  右手に弾
        //        let b_bow = pl.getSpineBone("bow");
        //        let b_bow = pl.getSpineBone("Rhand");
        let b_arrow = pl.getSpineBone("arrow");
        if (b_arrow) {
            let size = plo.scale.x;
            this.useammo.ammoobj.setPosition(
                plo.position.x + (b_arrow.worldX * size),
                plo.position.y + (b_arrow.worldY * size), // + 10,
                plo.position.z + 0);
            //this.useammo.ammoobj.object.rotation.z = -90;
            //            this.useammo.ammoobj.setPosition(b_bow.worldX - plo.position.x, b_bow.worldY - plo.position.y, -plo.position.z);
            //console.log("getSpineBone: bowある", b_bow, b_bow.worldX, b_bow.worldY, plo.position);

        }

        //  弾グループを処理
        this.ammos.task(this.gc, this.gf);
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
        this.plobj = new gameObject();
    }

    //----------------------------------------
    //  破棄
    //----------------------------------------
    destroy() {
        this.fInit = false;
        if (this.models) {
            this.models.destroyAll(this.gc.scene);
            this.models = null;
        }
        if (this.plobj) {
            this.plobj.destroy(this.gc.sceneSpine);
            this.plobj = null;
        }
        if (this.ammos) {
            this.ammos.destroy(this.gc.scene, this.gc);
            this.ammos = null;
        }
        this.destroyArrowThread();
    }

    getNowAmmo() {
        if (!this.useammo) return null;
        return this.useammo;

    }

    //----------------------------------------
    //  元モデルを作る
    //----------------------------------------
    async makeModels() {
        //  最初に全部読み込む事で、その時ローディングを入れて止めるんだろう
        this.models = new gameObjectGroup();
        let ms = this.models;
        let gmobj;

        //  3Dモデルの読み込み : 矢
        gmobj = new gameObject();
        await this.gf.loadGLTFModel('gltf/arrow_side2.glb', "arrow", gmobj, this.gc.scene);
        ms.add(gmobj);
        gmobj.setPosition(200, 50, 200); //
        gmobj.setScale(8, 4, 8); //
        //        gmobj.setPosition(0, 0, 0); //
        //        gmobj.setScale(1, 1, 1); //
        gmobj.object.visible = false;
        //gmobj.name = "mato";
        //gmobj.setRotation(0, -90, 0); //  向きはその時決めた方がいい
        //  取得する時はmodels.getObject( name );で名前検索
        //this.objs.add(this.obj3d_arrow);


    }

    //  アニメーションでいじってしまう数値を保存
    backupDatas() {
        let pl = this.plobj;
        let b_rh = pl.getSpineBone("Rhand");
        b_rh.data.backup_x = b_rh.data.x;
        b_rh.data.backup_y = b_rh.data.y;
    }

    //  アニメーションでいじってしまった数値を戻す数値を戻す
    recoverDatas() {
        let pl = this.plobj;
        let b_rh = pl.getSpineBone("Rhand");
        b_rh.data.x = b_rh.data.backup_x;
        b_rh.data.y = b_rh.data.backup_y;

    }


    //----------------------------------------
    //  プレイヤーを作る
    //----------------------------------------
    makePlayer(i_playerIndex) {
        switch (i_playerIndex) {
            case 0:
                //  とりあえず弾1個
                //                this.addAmmo(this.models, "arrow", new THREE.Vector3(400, 50, 200), 8, 0);
                this.addAmmo(this.models, "arrow", new THREE.Vector3(-100, 100, 200), 8, 0);
                break;
        }
    }

    //----------------------------------------
    //  弾の追加
    //----------------------------------------
    addAmmo(i_models, i_modelname, i_position, i_size, i_pattern) {
        let sce = this.gc.scene;
        if (!this.ammos) {
            this.ammos = new gmAmmoGroup();
            this.ammos.init();
        }
        this.useammo = this.ammos.addAmmo(this.plobj);
        let amo = this.useammo;
        if (!amo) return;
        //  モデル名の指定と別に、固有の識別名も必用か
        amo.init();
        amo.make(i_models, i_modelname, i_position, i_size, i_pattern);
        sce.add(amo.ammoobj.object);
        //console.log("addAmmo ", amo);
        return this.useamo;
    }


    //----------------------------------------
    //  弾の方向
    //----------------------------------------
    setAmmoDirection(i_x, i_y, i_z) {
        let am = this.getNowAmmo();
        if (!am) return;
        am.direction.x = i_x;
        am.direction.y = i_y;
        am.direction.z = i_z;
        am.direction = am.direction.normalize();
        //console.log("ammo : direction : ", am);

    }

    //----------------------------------------
    //  弾の速度
    //----------------------------------------
    setAmmoSpeed(i_speed) {
        let am = this.getNowAmmo();
        if (!am) return;
        am.speed.x = am.direction.x * i_speed;
        am.speed.y = am.direction.y * i_speed;
        am.speed.z = am.direction.z * i_speed;
    }

    //----------------------------------------
    //  弾の速度
    //----------------------------------------
    setAmmoSpeedVec(i_x, i_y, i_z) {
        let am = this.getNowAmmo();
        if (!am) return;
        am.speed.x = i_x;
        am.speed.y = i_y;
        am.speed.z = i_z;
    }

    //----------------------------------------
    //  発射
    //----------------------------------------
    shoot() {
        let am = this.getNowAmmo();
        if (!am) return;
        // 発射初期化
        am.nowaction = 1;
        //console.log("Ammo : shoot");
        //  次の弾を追加
        this.addAmmo(this.models, "arrow", new THREE.Vector3(-100, 100, 200), 8, 0);
    }

    //----------------------------------------
    //  弓の糸を作る
    //----------------------------------------
    makeArrowThread() {
        let pl = this.plobj;
        let plo = this.plobj.spineMesh;
        if (!plo) return;
        let sca = plo.scale.x;
        let b_but = pl.getSpineBone("bowU_thread_point");
        let b_bbt = pl.getSpineBone("bowB_thread_point");
        //        let b_rh = pl.getSpineBone("Rhand");
        let b_rh = pl.getSpineBone("arrow");
        //  三つの点の作成
        let uPoint = new THREE.Vector3(b_but.worldX * sca, b_but.worldY * sca, 0);
        uPoint.add(plo.position);
        let bPoint = new THREE.Vector3(b_bbt.worldX * sca, b_bbt.worldY * sca, 0);
        bPoint.add(plo.position);
        let rhPoint = new THREE.Vector3(b_rh.worldX * sca - 0, b_rh.worldY * sca + 0, 0);
        rhPoint.add(plo.position);
        //  状態によって分岐
        if (this.isdraw) {
            //  弓上から右手
            this.line_threadU = this.makeObject_threadline(this.line_threadU, uPoint.x, uPoint.y, uPoint.z, rhPoint.x, rhPoint.y, rhPoint.z);
            //  弓下から右手    
            this.line_threadB = this.makeObject_threadline(this.line_threadB, bPoint.x, bPoint.y, bPoint.z, rhPoint.x, rhPoint.y, rhPoint.z);
        } else {
            //  弓上から弓下
            this.line_threadU = this.makeObject_threadline(this.line_threadU,
                uPoint.x, uPoint.y, uPoint.z,
                bPoint.x, bPoint.y, bPoint.z);

        }
        //三つの線の作成
    }

    //----------------------------------------
    //  弓の糸を破棄
    //----------------------------------------
    destroyArrowThread() {
        this.destroyObject_threadline(this.line_threadB);
        this.destroyObject_threadline(this.line_threadU);
        this.destroyObject_threadline(this.line_threadRH);
    }

    //----------------------------------------
    // 確認用にRaycasterと同じ位置にLineを引く
    //----------------------------------------
    makeObject_threadline(i_line, i_ox, i_oy, i_oz, i_ex, i_ey, i_ez) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i_ox, i_oy, i_oz),
            new THREE.Vector3(i_ex, i_ey, i_ez)
        ]);
        const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0xffaa60 }));
        line.name = "threadline";
        //  完成版では判定表示を消す、 処理を全部消しに行くと面倒なので
        line.visible = true;
        this.gc.scene.add(line);

        i_line = line;
        return line;
    }

    destroyObject_threadline(i_line) {
        if (i_line == null) return;
        this.gc.scene.remove(i_line);
        i_line.material.dispose();
        i_line.geometry.dispose();
    }

}



//----------------------------------------
//  弾グループ
//  １つのステージはウェーブの組み合わせでできている
//  グループはウェーブを保持しているだけ
//----------------------------------------
export class gmAmmoGroup {
    constructor() {
        this.fInit = false;
        this.ammos = null;
    }

    //  全弾の処理
    task(i_gc, i_gf) {
        //  処理
        for (let i = 0; i < this.ammos.length; i++) {
            let am = this.ammos[i];
            if (am == null) continue;
            am.task(i_gc, i_gf);
        }
        //  終了フラグ処理
        for (let i = 0; i < this.ammos.length; i++) {
            let am = this.ammos[i];
            if (am == null) {
                this.ammos.splice(i, 1);
            }

            //  終了フラグが立ってたら減らす
            if (am.fEnd) {
                am.destroy(i_gc.scene, i_gc);
                this.ammos[i] = null;
                this.ammos.splice(i, 1);
                //  一回外に出る
                break;
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
    destroy(i_scene, i_gc) {
        for (let i = 0; i < this.ammos.length; i++) {
            this.ammos[i].destroy(i_scene, i_gc);
            this.ammos[i] = null;
        }
        this.ammos = null;
        this.fInit = false;
    }

    //  作成
    addAmmo(i_user) {
        //  配列でなければ配列作成
        if (!Array.isArray(this.ammos)) {
            this.ammos = new Array();
        }
        //  gmWaveを追加
        //  jsバージョンによって返り値が違うという話なのでreturnに使わない
        let newamo = new gmAmmo();
        newamo.init();
        newamo.userobj = i_user;
        this.ammos.push(newamo);
        //  追加した配列番号を返す
        return this.ammos[this.ammos.length - 1];

    }
}




//----------------------------------------
//  弾( 矢 )
//  
//----------------------------------------
export class gmAmmo {
    constructor() {
        this.fInit = false;
        this.userobj = null; //  弾の所有者
        this.ammoobj = null; //  弾本体
        this.targetobj = null; //  刺さった相手
        this.stabbedPoint = null; // 刺さった矢のポイント
        this.state = 0; // ターゲットの状態
        this.routine = 0; //  ルーチンパターン
        this.counter = 0; //  カウント汎用
        this.nowaction = 0; //  現在のアクション

        this.direction = new THREE.Vector3(); //  向き
        this.speed = null;
        this.rayline = null; //    それぞれの当たり判定確認用
        this.hitLineOrigin = new THREE.Vector3(); //  当たり判定開始位置
        this.hitLineDist = new THREE.Vector3(); //  当たり判定終了位置(距離ではなく空間絶対座標)
        this.hitBaseVector = new THREE.Vector3(); //  当たりの基礎サイズ
        this.ObjLength = 120; // 物体の全長
        this.hitLength = 80; // 当たり判定の長さ

        this.fEnd = false;
    }

    //  初期化
    init() {
        //初期化済みなら終了
        if (this.fInit) return;
        this.fInit = true;
        this.targetobj = null;
        this.ammoobj = null;
        this.stabbedPoint = null;
        this.counter = 0;
        this.speed = new THREE.Vector3();
        this.fEnd = false;
    }

    //  破棄
    destroy(i_scene, i_gc) {
        this.fInit = false;
        if (this.ammoobj) {
            this.ammoobj.destroy(i_scene);
            this.ammoobj = null;
        }
        this.destroyObject_rayline(i_gc);

        this.targetobj = null;
        this.direction = null;
        this.stabbedPoint = null;
        this.hitLineOrigin = null;
        this.hitLineDist = null;
        this.hitBaseVector = null;
    }

    //  ターゲットの作成、名前指定
    make(i_srcobjects, i_ammoName, i_position, i_size, i_pattern) {
        let obj = null;
        switch (i_ammoName) {
            case "arrow":
                //                await this.gf.loadGLTFModel('./gltf/mato02_x100.glb', "mato", this.obj3d_mato, this.gc.scene);
                //  指定した名前からオブジェクトを探しコピー
                let ret = i_srcobjects.getObject(i_ammoName);
                if (!ret) return null;
                this.ammoobj = ret.clone();

                //  コピーオブジェクトの設定
                obj = this.ammoobj;
                obj.setPosition(i_position.x, i_position.y, i_position.z); //
                obj.setScale(i_size, i_size, i_size); //
                this.direction.set(1, 0, 0);
                obj.setRotation(0, 90, 0);
                obj.object.name = "arrow";
                obj.object.visible = true;
                this.routine = i_pattern;
                //console.log("[AMMO作成]", i_ammoName,
                //    i_srcobjects, ret, this.ammoobj, this.ammoobj.position);
                return this.ammoobj;
                break;
        }
        return null;
    }

    //----------------------------------------
    // 確認用にRaycasterと同じ位置にLineを引く
    //----------------------------------------
    makeObject_rayline(i_gc, i_ox, i_oy, i_oz, i_ex, i_ey, i_ez) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(i_ox, i_oy, i_oz),
            new THREE.Vector3(i_ex, i_ey, i_ez)
        ]);
        const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: 0xffffff }));
        line.name = "rayline";
        //  完成版では判定表示を消す、 処理を全部消しに行くと面倒なので
        line.visible = false;
        i_gc.scene.add(line);

        this.rayline = line;
    }

    destroyObject_rayline(i_gc) {
        if (this.rayline == null) return;
        i_gc.scene.remove(this.rayline);
        this.rayline.material.dispose();
        this.rayline.geometry.dispose();
    }

    //----------------------------------------
    //  弾の方向
    //----------------------------------------
    setDirection(i_x, i_y, i_z) {
            this.direction.x = i_x;
            this.direction.y = i_y;
            this.direction.z = i_z;
            this.direction = this.direction.normalize();
        }
        //----------------------------------------
        //  刺さった状態での位置調整
        //----------------------------------------
    stabbedAdjust() {
        /*        
                //  刺さったポイントから、directionと全長かけた分バックする
                //  というか一体化させた方が早いとは思う
                this.position.x = this.direction * 
                this.direction.x = i_x;
                this.direction.y = i_y;
                this.direction.z = i_z;
                this.direction = this.direction.normalize();
        */
    }



    //--------------------------------
    //  ループ処理
    //--------------------------------
    task(i_gc, i_gf) {
        var go = this.ammoobj;
        //console.log("ammo.task: taskはきてるー", go);
        //        var obj3d = this.obj3d_mato;
        //  基礎管理( 読み込み処理未完の対応(startPosition等)の処理 )
        if (!go.manage()) return;

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

        //  刺さっている場合の処理
        if (this.stabbedPoint) {
            this.stabbedAdjust();
        } else {

            //  ルーチン番号によって分岐
            switch (this.routine) {
                case 0:
                    this.task_arrow1();
                    break;
                case 1:
                    this.task_arrow2();
                    break;
            }
            //  当たり判定の表示
            //  光線を可視化 / 毎回作り直す
            this.destroyObject_rayline(i_gc);

            //  開始位置
            //let tsrp = o.position;    そのままやるとoに代入してしまう
            let tsrp = (new THREE.Vector3()).copy(o.position);
            let adv = this.ObjLength - this.hitLength; //  全長から判定引いた距離
            tsrp.x += this.direction.x * adv;
            tsrp.y += this.direction.y * adv;
            tsrp.z += this.direction.z;
            let hbv = this.hitBaseVector;
            //        let tsrd = new THREE.Vector3(tsrp.x + this.speed.x * 2, tsrp.y + this.speed.y * 2, tsrp.z);
            let tsrd = new THREE.Vector3(tsrp.x, tsrp.y, tsrp.z);
            //  基礎判定線を加算
            tsrd.add(hbv);
            //  表示させる為に少し手前に出現
            this.makeObject_rayline(i_gc, tsrp.x, tsrp.y, tsrp.z + 5,
                tsrd.x, tsrd.y, tsrd.z + 2);
            //  判定線分の保存
            this.hitLineOrigin = (new THREE.Vector3()).copy(tsrp);
            this.hitLineDist = (new THREE.Vector3()).copy(tsrd);
        }
    }

    //--------------------------------
    //  動作 [ arrow 1 ]
    //--------------------------------
    task_arrow1() {
        var obj3d = this.ammoobj;
        if (!obj3d) return;
        //  基礎管理
        if (!obj3d.manage()) {
            console.log(" ammo manage : false");
            return;
        }

        let gobj = obj3d;
        let obj = obj3d.object;
        let pl = this.userobj;
        let plo = pl.spineMesh;
        //  スピードの調整
        var speed = 0.1;
        //  物体の向きを設定
        obj.lookAt(new THREE.Vector3(
            obj.position.x + this.direction.x,
            obj.position.y + this.direction.y,
            obj.position.z + this.direction.z));
        //  基礎判定線
        //  発射される際にこれも向きで回転させる必用がある
        this.hitBaseVector.set(
            this.direction.x * this.hitLength,
            this.direction.y * this.hitLength,
            this.direction.z * this.hitLength);

        //console.log(" ammo arrow1 : きてはいる", this.nowaction);
        //  状態により分岐
        switch (this.nowaction) {
            //  出てない
            case 0:
                break;

                //  飛び位置初期化
            case 1:
                /*                
                gobj.setPosition(-500, -200, 200);
                let b_bow = pl.getSpineBone("Rhand");
                if (b_bow) {
                    let size = plo.scale.x;
                    gobj.setPosition(
                        plo.position.x + b_bow.worldX * size,
                        plo.position.y + b_bow.worldY * size + 10,
                        plo.position.z + 0);
                //this.useammo.ammoobj.object.rotation.z = -90;
                //            this.useammo.ammoobj.setPosition(b_bow.worldX - plo.position.x, b_bow.worldY - plo.position.y, -plo.position.z);
                //console.log("getSpineBone: bowある", b_bow, b_bow.worldX, b_bow.worldY, plo.position);

        }
                */

                this.nowaction = 2;

                //  飛んでる
            case 2:
                //  重力
                this.speed.y -= 10.0 * speed;
                obj.position.x += this.speed.x * speed;
                obj.position.y += this.speed.y * speed;
                //  重力による向きの調整
                this.setDirection(
                    obj.position.x + this.speed.x * this.hitLength,
                    obj.position.y + this.speed.y * this.hitLength,
                    obj.position.z);

                obj.lookAt(new THREE.Vector3(
                    obj.position.x + this.speed.x,
                    obj.position.y + this.speed.y,
                    obj.position.z));

                this.counter++;
                //  console.log("arrow:進む", this.arrow_counter);
                if (300 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 3;
                }
                break;

                //  止まった
            case 3:
                this.counter++;
                if (1 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 0;
                    this.fEnd = true;
                }
                break;

                //  的と衝突
            case 4:
                //obj.position.x += this.speed.x;
                //obj.position.y += this.speed.y;
                this.counter++;
                if (1 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 0;
                    //  役目を終える
                    //  とりあえず的と一体化するので的に任せる
                    //this.fEnd = true;
                }
                break;
        }

    }

    //--------------------------------
    //  動作 [ arrow 2 ]
    //--------------------------------
    task_arrow2() {
        var obj3d = this.ammoobj;
        if (!obj3d) return;
        //  基礎管理
        if (!obj3d.manage()) {
            console.log(" ammo manage : false");
            return;
        }

        let gobj = obj3d;
        let obj = obj3d.object;

        //  スピードの調整
        var speed = 0.1;

        //  状態により分岐
        switch (this.nowaction) {
            //  出てない
            case 0:
                break;

                //  飛び位置初期化
            case 1:
                gobj.setPosition(-500, -200, 200);
                this.nowaction = 2;

                //  飛んでる
            case 2:
                obj.position.x += this.speed.x * speed;
                obj.position.y += this.speed.y * speed;

                obj.lookAt(new THREE.Vector3(
                    obj.position.x + this.speed.x,
                    obj.position.y + this.speed.y,
                    obj.position.z));

                //  重力
                this.speed.y -= 0.3 * speed;
                this.counter++;
                //  console.log("arrow:進む", this.arrow_counter);
                if (300 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 3;
                }
                break;

                //  何も当たらず一定時間経過
            case 3:
                this.counter++;
                if (1 < this.counter) {
                    this.fEnd = true;
                    this.counter = 0;
                    this.nowaction = 0;
                }
                break;

                //  的と衝突
            case 4:
                obj.position.x += this.speed.x;
                obj.position.y += this.speed.y;
                this.counter++;
                if (20 < this.counter) {
                    this.counter = 0;
                    this.nowaction = 0;
                }
                break;
        }

    }
}