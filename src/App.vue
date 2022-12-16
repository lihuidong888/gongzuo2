<template>
  <div id="app">
    <figure style="overflow: visible" id="qtspinner">
      <center style="margin-top: 1.5em; line-height: 150%">
        <img
          src="./assets/logo.svg"
          width="320"
          height="200"
          style="display: block"
        />
        <strong>WebAssembly: teramap</strong>
        <div id="qtstatus"></div>
        <noscript
          >JavaScript is disabled. Please enable JavaScript to use this
          application.</noscript
        >
      </center>
    </figure>
    <div class="menuContainer">
      <!-- <button @click="test">添加影像</button> -->
    </div>
    <canvas
      id="qtcanvas"
      oncontextmenu="event.preventDefault()"
      contenteditable="true"
    ></canvas>
    <div class="ui-wrapper">
      <div @click="baseMap">
        <img
          class="base"
          src="./dtmap/assets/image图片/地球.png"
          width="21px"
          height="21px"
        />
        底图
      </div>
      <div @click="dataLayer">
        <img
          class="data"
          src="./dtmap/assets/image图片/数据图层.png"
          width="24px"
          height="24px"
        />
        数据图层
      </div>
      <div class="tool">
        <img
          src="./dtmap/assets/image图片/工具.png"
          width="24px"
          height="24px"
        />
        工具
        <img
          v-if="showArrow"
          src="./dtmap/assets/image图片/向上收箭头.png"
          width="24px"
          height="24px"
        />
        <img
          v-else
          src="./dtmap/assets/image图片/向下拉箭头.png"
          width="24px"
          height="24px"
        />
        <!-- 工具选项 -->
        <div class="toolItem">
          <div @click="openMeasure">
            <img
              src="./dtmap/assets/image图片/尺子.png"
              width="24px"
              height="24px"
            />
            图上量算
          </div>
          <div @click="openSpace">
            <img
              src="./dtmap/assets/image图片/空间.png"
              width="24px"
              height="24px"
            />
            空间分析
          </div>
          <div @click="openPositionSetting">
            <img
              src="./dtmap/assets/image图片/定位.png"
              width="24px"
              height="24px"
            />
            坐标定位
          </div>
          <div>
            <img
              src="./dtmap/assets/image图片/飞行.png"
              width="24px"
              height="24px"
            />
            飞行漫游
          </div>
        </div>
      </div>
    </div>
    <baseMap :showBaseMap.sync="showBaseMap" ref="baseMap" />
    <dataLayer :showDataLayer.sync="showDataLayer" />
    <measure :showMeasure.sync="showMeasure" />
    <position :showPosition.sync="showPosition" />
    <space :showSpace.sync="showSpace" />
  </div>
</template>

<script>
import QtLoader from "./qtloader";
import baseMap from "./dtmap/components/baseMap.vue";
import dataLayer from "./dtmap/components/dataLayer.vue";
import measure from "./dtmap/components/tool/measure.vue";
import position from "./dtmap/components/tool/position.vue";
import space from "./dtmap/components/tool/space.vue";
export default {
  name: "App",
  methods: {
    init() {
      /*------------底层库初始化start------------------*/
      var spinner = document.querySelector("#qtspinner");
      var canvas = document.querySelector("#qtcanvas");
      var status = document.querySelector("#qtstatus");
      var qtLoader = QtLoader({
        canvasElements: [canvas],
        showLoader: function(loaderStatus) {
          spinner.style.display = "block";
          canvas.style.display = "none";
          status.innerHTML = loaderStatus + "...";
        },
        showError: function(errorText) {
          status.innerHTML = errorText;
          spinner.style.display = "block";
          canvas.style.display = "none";
        },
        showExit: function() {
          status.innerHTML = "Application exit";
          if (qtLoader.exitCode !== undefined)
            status.innerHTML += " with code " + qtLoader.exitCode;
          if (qtLoader.exitText !== undefined)
            status.innerHTML += " (" + qtLoader.exitText + ")";
          spinner.style.display = "block";
          canvas.style.display = "none";
        },
        showCanvas: function() {
          spinner.style.display = "none";
          canvas.style.display = "block";
        }
      });
      qtLoader.loadEmscriptenModule("teramap");
      /*------------底层库初始化end------------------*/

      var url = window.document.location.href;
      var baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
      window.baseUrl = baseUrl;

      //底层库加载完成后自动调用
      window.initScene = function() {
        console.log("加载完成");
        var viewer = GlobalViewer;
        //viewer.setBaseUrl("https://xxxxxx/");  //设置引擎资源的路径, 根据你的项目进行配置
        var scene = viewer.scene;
        var globe = scene.globe;
        // 初始化定位来到的地方
        var camera = scene.mainCamera;
        let position = Li.Cartographic.fromDegrees(114.054494, 22.540745, 1300);
        camera.flyTo(position); // 初始化定位来到的地方
        var cameraController = camera.cameraController;
        var timeSystem = viewer.timeSystem;
        // globe.setTerrainProviderUrl(window.baseUrl + 'data/sz');
        window.scene = scene;
        window.pickPoint = false;
        // set camera view
        camera.flyTo(Li.Cartographic.fromDegrees(114.054494, 22.540745, 6000));
      };
    },
    //调用引擎提供的API
    test() {
      var scene = GlobalViewer.scene;
      var camera = scene.mainCamera;
      console.log(camera);
      var tianditu = new Li.TiandituImageryLayer();
      tianditu.url =
        "https://t8.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff";
      tianditu.useWebMercator = false;
      tianditu.tileWidth = 256;
      tianditu.tileHeight = 256;
      tianditu.minimumLevel = 1;
      tianditu.maximumLevel = 17;
      tianditu.hasAlphaChannel = false;
      tianditu.isLabel = false;
      tianditu.componentComplete();
    },
    // 展示底图,关闭其他
    baseMap() {
      this.showDataLayer = false;
      this.showBaseMap = true;
      this.showMeasure = false;
      this.showPosition = false;
      this.showSpace = false;
    },
    // 数据图层,关闭其他
    dataLayer() {
      this.showBaseMap = false;
      this.showDataLayer = true;
      this.showMeasure = false;
      this.showPosition = false;
      this.showSpace = false;
    },
    // 打开测量
    openMeasure() {
      this.showMeasure = true;
    },
    // 打开位置设置
    openPositionSetting() {
      this.showPosition = true;
    },
    // 打开空间
    openSpace() {
      this.showSpace = true;
    },
    // 初始化样式
    styleInit() {
      var oTool = document.getElementsByClassName("tool")[0];
      var oToolItem = document.getElementsByClassName("toolItem")[0];
      oTool.addEventListener("mouseenter", () => {
        this.showArrow = true;
        this.showMeasure = false;
        this.showBaseMap = false;
        this.showDataLayer = false;
        this.showPosition = false;
        this.showSpace = false;

        oToolItem.style.display = "block";
        oToolItem.style.height = "0px";

        setTimeout(() => {
          oToolItem.style.height = "200px";
          oToolItem.style.transition = "all 1s";
        }, 100);
      });
      oTool.addEventListener("mouseleave", () => {
        this.showArrow = false;
        oToolItem.style.display = "none";
      });
      // 点击对应的工具选项显示对应的选项卡,隐藏工具栏
      oToolItem.addEventListener("click", e => {
        oToolItem.style.display = "none";
      });
    }
  },
  components: {
    baseMap,
    dataLayer,
    measure,
    position,
    space
  },
  data() {
    return {
      showArrow: false,
      showBaseMap: false,
      showDataLayer: false,
      showMeasure: false,
      showPosition: false,
      showSpace: false,
    };
  },
  mounted() {
    this.init();
    // 加载影像
    window.nowLayer = null;
    // 刚开始加载遥感影像
    setTimeout(() => {
      this.$refs.baseMap.addImagery();
    }, 2000);
    // 初始化样式
    this.styleInit();
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

canvas {
  position: absolute;
  border: 0px none;
  background-color: white;
  height: 100%;
  width: 100%;
  z-index: 1;
}
/* canvas {
  outline: 0px solid transparent;
  caret-color: transparent;
  cursor: default;
} */

.menuContainer {
  position: absolute;
  top: 10;
  left: 10px;
  z-index: 3;
  color: rgba(183, 183, 236, 0.959);
  background-color: rgba(48, 46, 46, 0.767);
  border-radius: 10px;
  padding: 10px;
}
.menuContainer2 {
  position: absolute;
  top: 10;
  left: 120px;
  z-index: 3;
  color: rgba(183, 183, 236, 0.959);
  background-color: rgba(48, 46, 46, 0.767);
  border-radius: 10px;
  padding: 10px;
}
body,
html {
  margin: 0;
  height: 100%;
  border: 0;
}
.ui-wrapper {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 336px;
  height: 50px;
  z-index: 20;
  background-color: rgba(36, 56, 72, 0.9);
  color: #fff;
  display: flex;
  justify-content: space-around;
}
.ui-wrapper > div {
  width: 112px;
  height: 50px;
  text-align: center;
  line-height: 50px;
  cursor: pointer;
}
.ui-wrapper img {
  vertical-align: middle;
}
.ui-wrapper > div:hover {
  color: rgba(45, 133, 240, 0.8);
}
/* 下面是工具模块的样式 */
.ui-wrapper > div:hover div {
  color: #fff;
}
.toolItem {
  background-color: rgba(36, 56, 72, 0.9);
  height: 0;
  overflow: hidden;
}
.ui-wrapper .toolItem div:hover {
  color: rgba(45, 133, 240, 0.8);
}
</style>
