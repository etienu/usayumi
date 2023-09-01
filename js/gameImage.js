//----------------------------------------
//  ゲーム共通変数
//----------------------------------------
export class gameImage {
    constructor() {
        //  three.js用変数
        this.texture = null;
        //  画像の元サイズ
        this.naturalwidth = 0;
        this.naturalheight = 0;
        //  操作用可変サイズ
        this.width = 0;
        this.height = 0;
        //  名称
        this.name = "";
        //  オブジェクト
        this.object = null;
    }

    //--------------------------------
    //  変数の解放
    //--------------------------------
    destroy(i_scene) {
        if (this.texture) {
            //console.log(" gameImage:destroy() : texture");
            this.texture.dispose();
        }

        if (!this.object) return;
        //console.log(" gameImage:destroy() : object");
        i_scene.remove(this.object);
        if (this.object.material) this.object.material.dispose();
        if (this.object.geometry) this.object.geometry.dispose();

    }

    //--------------------------------
    //  position 位置座標
    //--------------------------------
    //  固定値で位置決める
    setPosition(i_x, i_y, i_d) {
        if (this.object == null) return;
        this.object.position.set(i_x, i_y, i_d);
    }

    //  移動
    movePosition(i_x, i_y, i_d) {
        if (this.object == null) return;
        var nx = this.object.position.x;
        var ny = this.object.position.y;
        var nz = this.object.position.z;
        this.object.position.set(nx + i_x, ny + i_y, nz + i_d);
    }

    //--------------------------------
    //  scale サイズ
    //--------------------------------
    //  固定値でサイズを決める
    setSize(i_w, i_h, i_d) {
        if (this.object == null) return;
        this.width = i_w; //  naturalは変化しない
        this.height = i_h; //  
        this.object.scale.set(
            this.width, -this.height, //  2D画像の場合反転する必用がある
            i_d
        );
    }

    //  倍率でサイズを決める
    setSizeScale(i_xper, i_yper, i_zper) {
        if (this.object == null) return;
        this.width = this.naturalwidth * i_xper; //  naturalは変化しない
        this.height = this.naturalheight * (-i_yper); //  
        this.object.scale.set(
            this.width,
            this.height,
            1 * i_zper
        );
    }
}