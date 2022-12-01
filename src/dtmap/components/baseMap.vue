<template>
  <div>
    <div class="baseMap" v-if="showBaseMap">
      <div class="title">
        <div class="left">底图</div>
        <div class="right" @click="closeBase">X</div>
      </div>
      <div class="shadow">
        <div @click="addImagery">
          <img src="../assets/image图片/遥感影像.png" /><br />
          遥感影像
        </div>
        <div @click="addwmtsImagery">
          <img src="../assets/image图片/wms影像.png" /><br />
          wmtsy影像
        </div>
        <div @click="addarcgisImagery">
          <img src="../assets/image图片/ArcGis影像.png" /><br />
          ArcGIS影像
        </div>
        <div @click="addwmtsImagery">
          <img src="../assets/image图片/天地图影像.png" /><br />
          天地图影像
        </div>
      </div>
      <div class="slide">
        <el-switch
          v-model="value"
          active-color="#2D85F0"
          inactive-color="#797778"
          active-value="100"
          inactive-value="0"
        >
        </el-switch>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "baseMap",
  data() {
    return {
      showArrow: false,
      value: "100",
    };
  },
  mounted() {
    setTimeout(()=>{
      this.addTerrainProvider();
    },2000)
  },
  methods: {
    // 关闭底图
    closeBase() {
      this.$emit("update:showBaseMap", false);
    },
    // 加载遥感影像
    addImagery() {
      //在加载这个影像之前,首先清空之前影像
      window.nowLayer = null;
      var opt = {
        url: "./dom/ft/{z}/{x}/{y}.png", //路径
        rectangle: [-180, -90, 180, 90], //遥感影像显示范围
        useWebMercator: true, //卡托
        maximumLevel: 13, //最大层级
        minimumLevel: 1, //最小层级
        tileWidth: 256, //瓦片宽
        tileHeight: 256, //瓦片长
        hasAlphaChannel: true, //阿尔法
        //licensekey:""//请求头需要传入key的参数
      };
      this.addxyzImagery(opt);
    },
    addxyzImagery(option) {
      var that = this;
      var nowrectangle = option.rectangle;
      let newrectangle = Li.Rectangle.fromDegrees(
        nowrectangle[0],
        nowrectangle[1],
        nowrectangle[2],
        nowrectangle[3]
      );

      if (option.url) {
        var imageryProvider = new Li.UrlTemplateImageryProvider(
          option.url, //路径
          option.useWebMercator, //卡托
          option.maximumLevel, //最大
          option.minimumLevel, //最小
          option.tileWidth, //瓦片宽
          option.tileHeight, //瓦片长
          option.hasAlphaChannel //阿尔法
        );
        //无请求头添加的，不需要添加
        if (option.licensekey) {
          imageryProvider.setUrlFunctor(function (x, y, level) {
            var url =
              that.newurl +
              (level - 9) +
              "/" +
              y +
              "/" +
              x +
              "?format=image%2Fpng";
            return url;
          });
          imageryProvider.setHeader("szvsud-license-key", that.licensekey);
        }
        window.nowLayer = new Li.ImageryLayer(imageryProvider, newrectangle);
        GlobalViewer.scene.globe.addImageryLayer(window.nowLayer);
      }
    },
    // 加载wmtsy影像
    addwmtsImagery() {
      window.nowLayer = null;
      //需要在QGIS中正常加载后，拿到图层属性的中source对应的链接
      let wmtsurl =
        "crs=EPSG:3857&format=image/jpeg&layers=World_Imagery&styles=default&tileMatrixSet=default028mm&url=https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS";
      //let wmtsurl ="IgnoreAxisOrientation=1&IgnoreGetMapUrl=1&IgnoreReportedLayerExtents=1&InvertAxisOrientation=1&crs=EPSG:4326&dpiMode=7&format=image/png&layers=wmts_4326_440300&styles=default&tileMatrixSet=c&url=https://jingzhe.szft.gov.cn/sfmap/MapTileService/wmts?SERVICE%3DWMTS%26REQUEST%3DGetCapabilities%26STORETYPE%3Dmerged-dat%26LAYER%3Dwmts_4326_440300%26PROJECTION%3D4326";
      window.nowLayer = GlobalViewer.scene.globe.addWmsImageryLayer(wmtsurl);
    },
    // 加载ArcGIS影像
    addarcgisImagery() {
      window.nowLayer = null;
      window.nowLayer = GlobalViewer.scene.globe.addArcGisMapServerImageryLayer(
        "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
      );
    },
    // 加载天地图影像
    addwmtsImagery() {
      window.nowLayer = null;
      let scene = GlobalViewer.scene;
      let globe = scene.globe;
      globe.lightingEnabled = true;
      window.nowLayer = new Li.TiandituImageryLayer();
      window.nowLayer.url =
        "https://t3.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff";
      window.nowLayer.useWebMercator = false; //使用卡托否
      window.nowLayer.tileWidth = 256; //瓦片宽度
      window.nowLayer.tileHeight = 256; //瓦片长度
      window.nowLayer.minimumLevel = 1; //最小层级
      window.nowLayer.maximumLevel = 17; //最大层级
      window.nowLayer.hasAlphaChannel = false; //使用阿尔法否
      window.nowLayer.isLabel = false; //标签否
      window.nowLayer.componentComplete(); //创建
    },
    // 加载地形
    addTerrainProvider() {
      let scene = GlobalViewer.scene;
      let globe = scene.globe;
      globe.setTerrainProviderUrl(
        window.document.location.origin + "/" + "data/sz/"
      );
    },
    // 移除地形
    addDefaultTerrain() {
      let scene = GlobalViewer.scene;
      let globe = scene.globe;
      globe.setDefaultTerrain();
    },
  },
  props: ["showBaseMap"],
  watch:{
     value(val){
        if(val === "100"){
           this.addTerrainProvider();
        }else if(val === "0"){
           this.addDefaultTerrain();
        }
     }
  }
};
</script>

<style scoped>
.baseMap {
  position: absolute;
  top: 80px;
  right: 16px;
  z-index: 20;
  background-color: rgba(36, 56, 72, 0.9);
  color: #fff;
  width: 430px;
  text-align: center;
}
.baseMap .title {
  height: 36px;
  background-image:url("../assets/image图片/baseMaginTitle.png");
}
.baseMap .title .left {
  float: left;
  height: 36px;
  line-height: 36px;
  margin-left: 6px;
}
.baseMap .title .right {
  float: right;
  width: 16px;
  height: 36px;
  line-height: 36px;
  margin-right: 6px;
  cursor: pointer;
}
.baseMap .title .right:hover {
  color: rgba(45, 133, 240, 0.8);
}
.baseMap .shadow {
  margin: 16px 0;
}
.baseMap .shadow > div {
  display: inline-block;
  margin: 0 6px;
  font-size: 15px;
  cursor: pointer;
}
.baseMap .shadow > div:hover {
  color: rgba(45, 133, 240, 0.8);
}
.baseMap .shadow img {
  width: 80px;
  height: 80px;
}
.baseMap .slide {
  margin-bottom: 16px;
  text-align: left;
}
.baseMap .slide .el-switch {
  display: inline-block;
  margin-left: 6px;
}
</style>