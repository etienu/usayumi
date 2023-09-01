//====================================================
//  タッチ入力管理
//====================================================
export class TouchMap { //タッチを記録するクラス
    constructor(touchdown, x, y) {
        this.touchdown = touchdown;
        this.x = x;
        this.y = y;
    }
}


//----------------------------------------------------
//  タッチ入力処理
//  画面タッチを検知してTouchクラスを生成するクラス、タッチの検知はgameクラスで行う
//----------------------------------------------------
export class touchInputReceiver {
    constructor() {
        this._touchMap = new TouchMap(false, NaN, NaN);
        this._prevtouchMap = new TouchMap(false, NaN, NaN);

        //ここから画面クリック情報の読み取り、タッチと両立
        addEventListener('mousedown', (e) => {
            this._touchMap = new TouchMap(true, e.pageX, e.pageY);
        });
        addEventListener('mousemove', (e) => {
            if (this._touchMap.touchdown) {
                this._touchMap = new TouchMap(true, e.pageX, e.pageY);
            } else {
                this._touchMap = new TouchMap(false, e.pageX, e.pageY);
            }
        });
        addEventListener('mouseup', (e) => {
            this._touchMap = new TouchMap(false, e.pageX, e.pageY);
        });

        //ここから画面タッチ情報の読み取り、クリックと両立
        addEventListener('touchstart', (e) => {
            //e.preventDefault();
            this._touchMap = new TouchMap(true, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
            //        }, { passive: false });
        }, { passive: true });
        addEventListener('touchmove', (e) => {
            //e.preventDefault();
            this._touchMap = new TouchMap(true, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        }, { passive: true });
        addEventListener('touchend', (e) => {
            //e.preventDefault();
            this._touchMap = new TouchMap(false, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        }, { passive: true });
        addEventListener('touchcancel', (e) => {
            //e.preventDefault();
            this._touchMap = new TouchMap(false, NaN, NaN);
        }, { passive: true });
    }

    getTouch() {
        const prevtouchMap = new TouchMap(this._prevtouchMap.touchdown, this._prevtouchMap.x, this._prevtouchMap.y);
        const touch = new touchInput(this._touchMap, prevtouchMap);
        this._prevtouchMap = this._touchMap;
        return touch;
    }
}


//----------------------------------------------------
//  キー情報保持
//  現在と一つ前のTouch入力をgameInfoに渡すためのクラス
//----------------------------------------------------
export class touchInput {
    constructor(touchMap, prevTouchMap) {
        this.touchMap = touchMap;
        this.prevTouchMap = prevTouchMap;
    }

    touchDown() {
        //console.log("touchInput", this.touchMap);
        return this.touchMap.touchdown && !this.prevTouchMap.touchdown;
    }
    touchUp() {
        return !this.touchMap.touchdown && this.prevTouchMap.touchdown;
    }
    touch() { return this.touchMap.touchdown; }

    pageX() { return this.touchMap.x; }
    pageY() { return this.touchMap.y; }
}