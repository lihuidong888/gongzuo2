<template>
  <div class="position" v-if="showPosition">
    <div class="title">
      <div class="left">坐标拾取</div>
      <div class="right" @click="closePosition">X</div>
    </div>
    <div class="content">
      <div class="coordinate">
        <span>经度：</span><input type="text" v-model="lon" />
      </div>
      <div class="coordinate">
        <span>纬度：</span><input type="text" v-model="lat" />
      </div>
      <div class="coordinate">
        <span>高度：</span><input type="text" v-model="height" />
      </div>
      <div class="fly">
        <button type="button" @click="startPickUp">图上拾取</button>
        <button type="button" @click="flyToentity">坐标定位</button>
      </div>
    </div>
  </div>
</template>

<script>
let GeoJSON = require("geojson");
window.geojsonmodel = null;
export default {
  name: "Position",
  props: ["showPosition"],
  methods: {
    // 关闭坐标定位模块
    closePosition() {
      this.$emit("update:showPosition", false);
    },
    // 开始在图上拾取坐标
    startPickUp() {
      // this.addPoint();
      // let flyposition = {
      //   lat: 22.63178,
      //   lng: 113.992218,
      //   alt: 1553.3,
      //   duration: 3,
      //   heading: 11.6,
      //   pitch: -23.1,
      //   roll: 0
      // };
      // this.flyToentity(flyposition);
      document
        .getElementById("qtcanvas")
        .addEventListener("mousedown", this.MouseDownEvent);
      document.getElementById("qtcanvas").style.cursor = "crosshair";
    },
    // 结束拾取
    endPickUp() {
      document
        .getElementById("qtcanvas")
        .removeEventListener("mousedown", this.MouseDownEvent);
      document.getElementById("qtcanvas").style.cursor = "default";
    },
    //点击在底图上添加点坐标
    addPoint() {
      if (window.geojsonmodel) {
        window.geojsonmodel.delete();
        window.geojsonmodel = null;
      }
      let data = [
        {
          name: "会展中心",
          uid: 123,
          id: 456,
          longitude: this.lon,
          latitude: this.lat,
          height: 6.88383776317402
        }
      ];
      let jsonData = GeoJSON.parse(data, {
        Point: ["latitude", "longitude"]
      });
      let opt = {
        iconurl: "assets/image图片/blueicon.png",
        selectediconurl: "assets/image图片/blueicon.png",
        iconwidth: 20,
        iconheight: 36,
        labeloffsetx: 2,
        labeloffsety: 25,
        iconoffsetx: 0,
        iconoffsety: 0,
        scaleDistance: [6000, 1.0],
        height: 10,
        labelfield: "FID",
        // geojsonurl: "data/testdata/geojson/dzsb-point.geojson",
        testString: JSON.stringify(jsonData),
        FieldList: ["进出类型", "卡口"]
      };
      window.geojsonmodel = this.addGeoJsonModel(opt);
    },
    MouseDownEvent(event) {
      var camera = GlobalViewer.scene.mainCamera; //获取相机
      var hit = new Li.RaycastHit(); //射线投影
      //鼠标点击的位置，通过相机视角射线获取
      var ray = camera.screenPointToRay(event.x, event.y);
      var rayok = GlobalViewer.scene.raycast(ray, hit); //判断是否存在
      var point = 0;
      if (rayok) {
        if (hit) {
          point = hit.point; //Vector3
        }
      }
      hit.delete();
      //鼠标左键点击
      if (event.button == 0 && point != 0) {
        point = point.toCartographic();
        this.lon = Number(((point.lon / Math.PI) * 180).toFixed(6));
        this.lat = Number(((point.lat / Math.PI) * 180).toFixed(6));
        let height = point.height.toFixed(1);
        if (height == 0) this.height = 0;
        // 底图上加点
        this.addPoint();
      } else if (event.button == 2) {
        this.endPickUp();
        this.clear();
      }
    },
    clear() {
      if (window.geojsonmodel != null) {
        window.geojsonmodel.delete();
        window.geojsonmodel = null;
      }
    },
    //     flyToentity(opt) {
    //     let scene = window.viewer.scene;
    //     let camera = scene.mainCamera;
    //     let position = Li.Cartesian3.fromDegrees(
    //         opt.lng,
    //         opt.lat,
    //         opt.alt
    //     ).toVector3();
    //     camera
    //         .cameraController()
    //         .flyTo(
    //             position,
    //             opt.duration,
    //             opt.heading,
    //             opt.pitch,
    //             opt.roll
    //         );
    // },
    flyToentity() {
      let opt = {
        duration: 3,
        heading: 0,
        pitch: -90,
        roll: 0
      };
      this.clear();
      // 底图上加点
      this.addPoint();
      let scene = GlobalViewer.scene;
      let camera = scene.mainCamera;
      let position = Li.Cartesian3.fromDegrees(
        Number(this.lon),
        Number(this.lat),
        Number(1000)
      ).toVector3();
      camera
        .cameraController()
        .flyTo(position, opt.duration, opt.heading, opt.pitch, opt.roll);
    },
    addGeoJsonModel(opt) {
      opt = opt || {};
      let url = window.document.location.href;
      let baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
      var GeoJsonModel = new Li.GeoJsonModel();
      GeoJsonModel.iconUrl = baseUrl + opt.iconurl;
      GeoJsonModel.selectedIconUrl = baseUrl + opt.selectediconurl; //
      GeoJsonModel.iconSize = Li.Vector2.create(opt.iconwidth, opt.iconheight); //图标大小
      GeoJsonModel.labelOffset = Li.Vector2.create(
        opt.labeloffsetx,
        opt.labeloffsety
      ); //x, y偏移值
      GeoJsonModel.iconOffset = Li.Vector2.create(
        opt.iconoffsetx,
        opt.iconoffsety
      );
      GeoJsonModel.scaleByDistance = Li.Vector2.create(
        opt.scaleDistance[0],
        opt.scaleDistance[1]
      );
      GeoJsonModel.height = opt.height; //高度
      GeoJsonModel.labelField = opt.labelfield; //标签
      GeoJsonModel.addField("进出类型"); //添加字段
      GeoJsonModel.addField("卡口"); //添加字段
      if (opt.geojsonurl) {
        GeoJsonModel.load(baseUrl + opt.geojsonurl); //加载GeoJson文件的url
      }
      // debugger;
      //or addString可通过字符串类型数据加载
      if (opt.testString) {
        GeoJsonModel.addString(opt.testString);
      }
      return GeoJsonModel;
    }
  },
  data() {
    return {
      lon: 0,
      lat: 0,
      height: 0
    };
  },
  watch: {
    showPosition(val) {
      if (val === false) {
        this.endPickUp();
        this.clear();
        this.lon = 0;
        this.lat = 0;
        this.height = 0;
      }
    }
  }
};
</script>

<style scoped>
.position {
  position: absolute;
  top: 80px;
  right: 16px;
  z-index: 20;
  background-color: rgba(36, 56, 72, 0.9);
  color: #fff;
  width: 400px;
  text-align: center;
}
.position .title {
  height: 36px;
  background-image: url("../../assets/image图片/baseMaginTitle.png");
}
.position .title .left {
  float: left;
  height: 36px;
  line-height: 36px;
  margin-left: 6px;
}
.position .title .right {
  float: right;
  width: 16px;
  height: 36px;
  line-height: 36px;
  margin-right: 6px;
  cursor: pointer;
}
.position .title .right:hover {
  color: rgba(45, 133, 240, 0.8);
}
.content {
  height: 220px;
}
.content .coordinate {
  margin: 16px 0;
  height: 30px;
}
.content .coordinate input {
  width: 200px;
  height: 30px !important;
  box-sizing: border-box;
  border: 1px solid #fff;
  padding: 2px 10px;
  border-radius: 2px;
  outline: none;
  color: #fff;
  background: none;
}
.content .fly {
  height: 50px;
  line-height: 50px;
}
.content .fly button {
  width: 90px;
  height: 36px;
  font-size: 16px;
  color: #fff;
  font-weight: 500;
  background: rgb(64, 158, 255);
  border-radius: 4px;
  font-family: Arial, Helvetica, sans-serif;
  border: none;
  cursor: pointer;
  margin: 0 5px;
}
</style>
