//====================================================
//  キー入力管理
//====================================================
export class keyInputReceiver {
    constructor() {
        this._keyMap = new Map();
        this._prevKeyMap = new Map();

        addEventListener('keydown', (ke) => this._keyMap.set(ke.key, true));
        addEventListener('keyup', (ke) => this._keyMap.set(ke.key, false));
    }

    getInput() {
        const keyMap = new Map(this._keyMap);
        const prevKeyMap = new Map(this._prevKeyMap);
        this._prevKeyMap = new Map(this._keyMap);
        return new keyInput(keyMap, prevKeyMap);
    }
}

//----------------------------------------------------
//キー情報保持
//----------------------------------------------------
export class keyInput {
    constructor(keyMap, prevKeyMap) {
        this.keyMap = keyMap;
        this.prevKeyMap = prevKeyMap;
    }

    _getKeyFromMap(keyName, map) {
        if (map.has(keyName)) { return map.get(keyName); } else { return false; }
    }
    _getPrevKey(keyName) {
            return this._getKeyFromMap(keyName, this.prevKeyMap);
        }
        //  押されているか
    getKey(keyName) {
            return this._getKeyFromMap(keyName, this.keyMap);
        }
        //  押された瞬間か
    getKeyDown(keyName) {
            const prevDown = this._getPrevKey(keyName);
            const currentDown = this.getKey(keyName);
            return (!prevDown && currentDown);
        }
        //  離した瞬間か
    getKeyUp(keyName) {
        const prevDown = this._getPrevKey(keyName);
        const currentDown = this.getKey(keyName);
        return (prevDown && !currentDown);
    }
}