import { GLTFLoader } from 'https://unpkg.com/three@0.148.0/examples/jsm/loaders/GLTFLoader.js';

import { gameObject, gameObjectGroup } from './gameObject.js';
import { gameFunc } from './gameFunc.js';
import { keyInputReceiver, keyInput } from './keyInputReceiver.js';
import { touchInputReceiver, touchInput } from './touchInputReceiver.js';
import { gameUIController } from './gameUIController.js';
import { gameScene } from './gameScene.js';
//import { GLTFLoader } from './three/loaders/GLTFLoader.js';

//----------------------------------------
//  ゲームサウンド管理
//----------------------------------------
//  EngineとかManageとか名前にした方がいいかと
export class gmSoundManage {
    constructor() {
        this.gf = null;
        this.gc = null;
        this.fInit = false;

        this.audioLoader = null;
        this.listener = null;

        this.sounddatas = null; //  サウンドコピー用の元モデル

        //弾(矢)管理
        this.soundgroup = null; //  弾の配列
    }

    //----------------------------------------
    //  ループ
    //----------------------------------------
    task() {
        //  初期化されているかなどの確認
        if (!this.fInit || !this.gc || !this.gf || !this.soundgroup) {
            //console.log("eff.task: 何かない", this);
            return;
        }

        //let plo = pl.spineMesh;

        // spineローディング管理
        //        if (this.gf.manageSpineModelLoading(this.plobj, this.gc.scene)) {
        //console.log("読み込みおわったわーwww");
        //        }

        //  弾グループを処理
        this.soundgroup.task(this.gc, this.gf);
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
        if (this.soundgroup) {
            this.soundgroup.destroy(this.gc.scene);
            this.soundgroup = null;
        }
        //  破棄・解放関数ってあるの？
        this.audioLoader = null;
        this.listener = null;

    }

    //----------------------------------------
    //  最初に作るものがあれば
    //----------------------------------------
    make() {
        this.audioLoader = new THREE.AudioLoader();
        this.listener = new THREE.AudioListener();
    }

    //----------------------------------------
    //  元モデルを作る
    //----------------------------------------
    makeSoundDatas() {
        //console.log("makeSoundDatas", this);
        this.sounddatas = [];
        this.addSoundData("sounds/title_start.mp3", "title_pushstart");
        this.addSoundData("sounds/arrow.mp3", "arrow");
        this.addSoundData("sounds/target_hit.mp3", "target_hit");
        this.addSoundData("sounds/stage_clear.mp3", "stage_clear");
    }


    //----------------------------------------
    //  データ追加
    //----------------------------------------
    addSoundData(i_FileName, i_Name) {
        let lis = this.listener;
        let audio = this.audioLoader;
        let i_sounddatas = this.sounddatas;
        //  データクラスをつくり配列にセットしておく
        let sounddata = new gmSoundData();
        i_sounddatas.push(sounddata);
        //  ファイル読み込み
        this.audioLoader.load(this.gc.path + i_FileName,
            function(buffer) {
                //  読み込みが完了したら
                //  上記の追加されているクラスの中にデータを入れていく
                sounddata.sound = new THREE.PositionalAudio(lis);
                sounddata.sound.setBuffer(buffer);
                //i_sounddatas.push(audio);
                sounddata.fLoaded = true;
                sounddata.name = i_Name;
                sounddata.filename = i_FileName;
                //console.log("音よめてるの？", sounddata);
            });

    }

    //----------------------------------------
    //  音名を指定して再生する、単発再生
    //----------------------------------------
    playSingleSound(i_Name) {
        for (let i = 0; i < this.sounddatas.length; i++) {
            let sou = this.sounddatas[i];
            if (!sou) continue;
            //  指定した名称があった
            if (sou.name == i_Name) {
                sou.play();
            }
        }
    }

    //----------------------------------------
    //  音名を指定して再生する
    //----------------------------------------
    playSound(i_Name, i_position, i_number) {
        //        let sce = this.gc.scene;
        /*        
                if (!this.soundgroup) {
                    this.soundgroup = new gmSoundGroup();
                    this.soundgroup.init();
                }
                let sou = this.soundgroup.addSound();

                if (!sou) return;
                //  モデル名の指定と別に、固有の識別名も必用か
                sou.init();
                sou.make(this.gc, this.gf, i_Name, i_position, i_number);
                //sce.add(amo.ammoobj.object);
                //        console.log("addEffect ", eff );
                return eff;
        */
    }
}





//----------------------------------------
//  サウンド元データ1個
//----------------------------------------
//https://threejs.org/docs/?q=Audio#api/en/audio/Audio
export class gmSoundData {
    constructor() {
        this.filename = null;
        this.name = null;
        this.sound = null;
        this.fLoaded = false; //  読み込みが終ったらtrue
    }

    play() {
        // play audio with perfect timing when ball hits the surface
        if (!this.sound) return;
        if (this.sound.hasPlaybackControl) {
            //console.log("play : ", this.sound);
            if (this.sound.isPlaying)
                this.sound.stop();
            this.sound.play();
        }
    }

}






//----------------------------------------
//  サウンドグループ
//  グループはエフェクトオブジェクトを保持しているだけ
//----------------------------------------
export class gmSoundGroup {
    constructor() {
        this.fInit = false;
        this.sounds = null;
    }

    //  全弾の処理
    task(i_gc, i_gf) {
        //  処理
        for (let i = 0; i < this.sounds.length; i++) {
            let sou = this.sounds[i];
            if (sou == null) continue;
            sou.task(i_gc, i_gf);
        }
        //  終了フラグ処理
        for (let i = 0; i < this.sounds.length; i++) {
            let sou = this.sounds[i];
            if (sou == null) {
                this.sounds.splice(i, 1);
            }
            //  終了フラグが立ってたら減らす
            if (sou.fEnd) {
                sou.destroy();
                this.sounds[i] = null;
                this.sounds.splice(i, 1);
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
        for (let i = 0; i < this.sounds.length; i++) {
            this.sounds[i].destroy(i_scene);
            this.sounds[i] = null;
        }
        this.sounds = null;
        this.fInit = false;
    }

    //  作成
    addSound() {
        //  配列でなければ配列作成
        if (!Array.isArray(this.sounds)) {
            this.sounds = new Array();
        }
        let newsou = new gmSound();
        newsou.init();
        this.sounds.push(newsou);
        //  追加した配列番号を返す
        return this.sounds[this.sounds.length - 1];

    }
}




//----------------------------------------
//  サウンド
//  
//----------------------------------------
export class gmSound {
    constructor() {
        this.fInit = false;
        this.userobj = null; //  所有者
        this.soundobj = null;
        this.scene = null; //  エフェクトによって突っ込むシーンが違うので保存

        this.targetobj = null; //  サウンドを付与するオブジェクト
        this.effName = null;
        this.counter = 0; //  カウント汎用
        this.nowaction = 0; //  現在のアクション

        this.fEnd = false;
    }

    //  初期化
    init() {
        //初期化済みなら終了
        if (this.fInit) return;
        this.fInit = true;
        this.effectobj = null;
        this.counter = 0;
        this.fEnd = false;
    }

    //  破棄
    destroy(i_scene) {
        this.fInit = false;
        this.scene.remove(this.effectobj);
        this.effectobj = null;
    }

    make(i_gc, i_gf, i_soundName, i_position, i_number) {
        let obj = null;
        this.effName = i_effectName;
        switch (i_effectName) {
            case "title_pushbutton":
                return this.soundobj;
                break;
        }
        return null;
    }

    //--------------------------------
    //  ループ処理
    //--------------------------------
    task(i_gc, i_gf) {
        var eo = this.soundobj;
        if (this.fEnd) {
            return;
        }

        switch (this.soundName) {
            case "title_pushbutton":
                //                this.task_getScoreDisp();
                break;
        }
    }

}