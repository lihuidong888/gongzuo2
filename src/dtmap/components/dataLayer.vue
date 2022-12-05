<template>
  <div class="dataLayer" v-if="showDataLayer">
    <div class="title">
      <div class="left">图层</div>
      <div class="right" @click="closeLayer">X</div>
    </div>
    <el-tree
      :data="dataTree"
      show-checkbox
      node-key="id"
      :props="defaultProps"
      @check="handleClick"
      :check-on-click-node="true"
    >
    </el-tree>
  </div>
</template>

<script>
// 跳转的位置点
window.point = [
  { lon: 114.03585691, lat: 22.54412276, height: 20, id: 0 },
  { lon: 114.11640021, lat: 22.55061716, height: 20, id: 1 },
  { lon: 114.17684616, lat: 22.54787511, height: 20, id: 2 },
  { lon: 114.1590136, lat: 22.51254139, height: 20, id: 3 },
  { lon: 114.0801523, lat: 22.47828424, height: 20, id: 4 },
  { lon: 114.05300844, lat: 22.530465169, height: 20, id: 5 }
];
window.FieldList = []; //撒点属性
window.checkObj = []; //选中的节点
window.entityLine = [];
import data from "../data/modelFile/writeFile";
export default {
  data() {
    return {
      nowscale: 1, // 缩放比例
      dataTree: [],
      GeoJsonModel: null,
      haha: [
        {
          id: 0,
          label: "三维模型",
          children: [
            {
              id: "28",
              label: "DAE模型",
              children: [
                { id: "34", label: "dabache" },
                { id: "35", label: "hongseqiaoche" },
                { id: "36", label: "huiseqiaoche" },
                { id: "37", label: "lanseqiaoche" }
              ],
              path: "./data/testdata/models/dae/cars"
            },
            {
              id: "211",
              label: "fbx模型",
              children: [
                { id: "39", label: "Girl" },
                { id: "310", label: "xmh-epsg4547" }
              ],
              path: "./data/testdata/models/fbx"
            },
            {
              id: "241",
              label: "glb模型",
              children: [
                { id: "312", label: "batched" },
                { id: "313", label: "batchedAnimated" },
                { id: "314", label: "batchedQuantization" },
                { id: "315", label: "box" },
                { id: "316", label: "BoxTextured" },
                { id: "317", label: "BoxTexturedKtx2Basis" },
                { id: "318", label: "camera_180" },
                { id: "319", label: "CesiumBalloon" },
                { id: "320", label: "CesiumBalloonKTX2" },
                { id: "321", label: "CesiumDrone" },
                { id: "322", label: "CesiumMilkTruck" },
                { id: "323", label: "CesiumTexturedBoxTest" },
                { id: "324", label: "Cesium_Air" },
                { id: "325", label: "Cesium_Man" },
                { id: "326", label: "GroundVehicle" },
                { id: "327", label: "InterpolationTest" },
                { id: "328", label: "MultiUVTest" },
                { id: "329", label: "ParcLeadMine" },
                { id: "330", label: "parent" },
                { id: "331", label: "Pawns" },
                { id: "332", label: "Shadow_Tester" },
                { id: "333", label: "Shadow_Tester_2" },
                { id: "334", label: "Shadow_Tester_3" },
                { id: "335", label: "Shadow_Tester_4" },
                { id: "336", label: "Shadow_Tester_Point" },
                { id: "337", label: "Shadow_Transparent" },
                { id: "338", label: "textured_box" },
                { id: "339", label: "tree3" },
                { id: "340", label: "Wood_Tower" }
              ],
              path: "./data/testdata/models/gltf_glb"
            },
            {
              id: "243",
              label: "3dtile",
              children: [
                { id: "342", label: "ft", path: "./data/testdata/3dtiles/ft" },
                {
                  id: "344",
                  label: "ft-pipe",
                  path: "./data/testdata/3dtiles/ft-pipe"
                },
                {
                  id: "346",
                  label: "BIM",
                  path: "./data/testdata/BIM/BIM_TEST_g1"
                }
              ]
            }
          ]
        },
        {
          id: -1,
          label: "矢量数据",
          children: [
            {
              id: 1,
              label: "GeoJSON点",
              children: [
                { id: "349", label: "福田128点" },
                { id: "351", label: "福田179点" },
                { id: "355", label: "福田热力图点" },
                { id: "357", label: "福田街道点" },
                { id: "358", label: "福田设施点" },
                { id: "360", label: "福田重要区域点" },
                { id: "361", label: "福田防疫点" }
              ]
            },
            {
              id: 0,
              label: "GeoJSON线",
              children: [
                { id: "350", label: "福田1370线" },
                { id: "353", label: "福田多线段" },
                { id: "359", label: "福田道路多线段" }
              ]
            },
            {
              id: -1,
              label: "GeoJSON面",
              children: [
                { id: "348", label: "深圳面" },
                { id: "352", label: "福田人民建筑面" },
                { id: "354", label: "福田建筑面" },
                { id: "356", label: "福田瘟疫面" },
                { id: "362", label: "福田防疫面" },
                { id: "363", label: "福田面区域" },
                { id: "364", label: "福田面图" }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "label"
      }
    };
  },
  props: ["showDataLayer"],
  methods: {
    closeLayer() {
      this.$emit("update:showDataLayer", false);
    },
    // 选中加载数据
    handleClick(node, checkObj) {
      // 生成不同随机数,飞不同点
      var preNum = 0;
      var num = Math.floor(Math.random() * 6);
      while (num === preNum) {
        num = Math.floor(Math.random() * 6);
      }
      preNum = num;
      // 目标多选框被去掉时候,不加载模型,删除模型并跳转到选中的第一个
      console.log("1111", node, checkObj);
      window.checkObj.push(checkObj);
      let length = window.checkObj.length;
      if (window.checkObj.length >= 2) {
        if (
          window.checkObj[length - 1].checkedKeys.length <
          window.checkObj[length - 2].checkedKeys.length
        ) {
          this.deletemodel();
          this.deleteTiles();
          let firstNodes = [];
          window.checkObj[length - 1].checkedNodes.forEach(item => {
            if (!item.children) {
              firstNodes.push(item);
            }
          });
          if (firstNodes.length) {
            node = firstNodes[0];
          } else {
            return;
          }
        }
      }
      // 加载glb模型
      if (Number(node.id) >= 312 && Number(node.id) <= 340 && !node.children) {
        let glbPath = this.dataTree[0].children[2].path;
        let cctvUrl = glbPath + "/" + node.label + ".glb";
        this.model(cctvUrl, window.point[preNum]);
      }
      // 加载FBX模型
      if (Number(node.id) >= 39 && Number(node.id) <= 310 && !node.children) {
        let FBXPath = this.dataTree[0].children[1].path;
        let cctvUrl = FBXPath + "/" + node.label + ".fbx";
        this.model(cctvUrl, window.point[preNum]);
      }
      // 加载3dtile模型
      if (Number(node.id) >= 342 && Number(node.id) <= 346 && !node.children) {
        let tilesetPath = "";
        this.dataTree[0].children[3].children.forEach(tilesetItem => {
          if (tilesetItem.id == node.id) {
            tilesetPath = tilesetItem.path;
          }
        });
        this.addTilese(tilesetPath);
      }
      // 加载DAE模型
      if (Number(node.id) >= 34 && Number(node.id) <= 37 && !node.children) {
        let daePath = this.dataTree[0].children[0].path;
        let cctvUrl = daePath + "/" + node.label + ".DAE";
        this.model(cctvUrl, window.point[preNum]);
      }
      // 加载Geojson点
      if (node.label.indexOf("point") > -1 && !node.children) {
        let geojsonurl = "./data/testdata/geojson/" + node.label + ".geojson";
        let geojsondataPath =
          "./data/testdata/geojson/数据/" + node.label + ".geojson";
        console.log(geojsonurl);
        this.spreadPoint(geojsonurl, geojsondataPath);
      }
      // 加载Geojson线
      if (node.label.indexOf("polyline") > -1 && !node.children) {
        let geojsonurl = "./data/testdata/geojson/" + node.label + ".geojson";
        let geojsondataPath =
          "./data/testdata/geojson/数据/" + node.label + ".geojson";
        this.spreadPolyline(geojsonurl, geojsondataPath);
      }
    },
    // 添加模型
    model(path, point) {
      this.deletemodel();
      if (!window.cctvModel) {
        let model = new Li.Model(path);
        let entity = new Li.Entity();
        entity.addComponent(model);
        GlobalViewer.scene.addEntity(entity);
        let carto = Li.Cartographic.fromDegrees(
          point.lon,
          point.lat,
          point.height
        ); //坐标

        model.transform.cartographic = carto;
        //模型正在渲染中
        model.readyPromise.then(() => {
          model.entity.travalRenderers(function(renderer) {
            let camera = GlobalViewer.scene.mainCamera;
            let center = renderer.boundingVolume.center;
            let carto = center.toCartesian3().toCartographic();
            let height = carto.height;
            carto.height += height * 2;
            let position = carto.toVector3();
            position = vector3Offset(position, {
              offsetY: -2 * height
            });
            camera.cameraController().flyTo(position, 2, 0, -45, 0);
            function vector3Offset(
              point,
              { offsetX = 0, offsetY = 0, offsetZ = 0 }
            ) {
              let scene = GlobalViewer.scene;
              let globe = scene.globe;
              let vec3 = Li.Vector3.create(offsetX, offsetY, offsetZ);
              let localToWorld = globe.ellipsoid.eastNorthUpToFixedFrame(
                point.toCartesian3()
              );
              let newPoint = Li.Matrix4.multiplyByVector3(localToWorld, vec3);
              return newPoint;
            }
          });
        });
        window.cctvModel = entity;
        return entity;
      }
    },
    //删除模型
    deletemodel() {
      if (window.cctvModel) {
        window.cctvModel.delete();
        window.cctvModel = null;
      }
    },
    // 删除3dtile
    deleteTiles() {
      if (window.tilesetmodel) {
        window.tilesetmodel.delete();
        window.tilesetmodel = null;
      }
    },
    //3Dtiles 添加
    addTilese(tilesetPath) {
      this.deleteTiles();
      let tileset = new Li.Tileset(
        window.document.location.origin +
          tilesetPath.slice(1) +
          "/" +
          "tileset.json"
        // window.document.location.origin + "/" + "data/dayanta/tileset.json"
        // window.document.location.origin + "/" + "data/testdata/BIM/BIM_TEST_g1/tileset.json"
        // window.document.location.origin + "/" + "data/testdata/3dtiles/ft-pipe/tileset.json"
      );
      tileset.streamingMode = true; // default 流式加载
      tileset.skipLevelOfDetail = true; // default 跳过层级
      tileset.genMeshNormals = false; // default   生成法线
      window.entity = new Li.Entity();
      window.entity.addComponent(tileset);
      GlobalViewer.scene.addEntity(window.entity);
      tileset.readyPromise.then(function() {
        const center = tileset.rectangle.center();
        const cord = center.toDegrees();
        let camera = GlobalViewer.scene.mainCamera;
        var p = Li.Cartographic.fromDegrees(cord.lon, cord.lat, 300);
        camera.cameraController().flyToCartographic(p, 3, 0, -90, 0);
      });
      window.tilesetmodel = tileset;
    },
    //撒点
    spreadPoint(geojsonurl, geojsondataPath) {
      this.clear();
      var script = document.createElement("script");
      script.src = geojsondataPath;
      document.body.appendChild(script);
      setTimeout(() => {
        // flyToHome
        let point = a.features[0].geometry.coordinates;
        let scene = GlobalViewer.scene;
        let camera = scene.mainCamera;
        let position = Li.Cartographic.fromDegrees(point[0], point[1], 100);
        camera.flyTo(position);
        let FieldList = [];
        let properties = a.features[0].properties;
        let objKeysArr = Object.keys(properties);
        if (objKeysArr[1]) {
          FieldList.push(objKeysArr[0]);
          FieldList.push(objKeysArr[1]);
        } else {
          FieldList.push(objKeysArr[0]);
        }
        let labelfield = "";
        if (FieldList.join("-").indexOf("name") > -1) {
          labelfield = "name";
        } else if (FieldList.join("-").indexOf("卡口") > -1) {
          labelfield = "卡口";
        } else if (FieldList.join("-").indexOf("lat") > -1) {
          labelfield = "lat";
        } else if (FieldList.join("-").indexOf("Crime ID") > -1) {
          labelfield = "Crime ID";
        } else {
          labelfield = "jd";
        }

        window.FieldList = FieldList;
        let opt = {
          iconurl: "assets/image图片/blueicon.png",
          selectediconurl: "assets/image图片/redicon.png",
          iconwidth: 40,
          iconheight: 50,
          labeloffsetx: -10,
          labeloffsety: -10,
          iconoffsetx: 0,
          iconoffsety: 0,
          scaleDistance: [6000, 0.5],
          height: 10,
          labelfield,
          geojsonurl,
          FieldList
        };
        this.GeoJsonModel = this.addGeoJsonModel(opt);
      }, 500);
    },
    //撒线
    spreadPolyline(geojsonurl, geojsondataPath) {
      this.clear(); // 删除原有的geojson
      // 删除创建的线
      if (window.entityLine.length != 0) {
        for (let i = 0; i < window.entityLine.length; i++) {
          var entitys = window.entityLine[i];
          entitys.delete();
        }
        window.entityLine = [];
      }
      var script = document.createElement("script");
      script.src = geojsondataPath;
      document.body.appendChild(script);
      setTimeout(() => {
        // flyToHome
        var middle = Math.floor(
          a.features[0].geometry.coordinates[0].length / 2
        );
        let point = a.features[0].geometry.coordinates[0][middle];
        if (a.features[0].geometry.coordinates.length != 1) {
          var middle1 = Math.floor(
            a.features[0].geometry.coordinates.length / 2
          );
          point = a.features[0].geometry.coordinates[middle1];
        }
        let scene = GlobalViewer.scene;
        let camera = scene.mainCamera;
        let position = Li.Cartographic.fromDegrees(point[0], point[1], 100);
        camera.flyTo(position);
        // 撒点
        let FieldList = [];
        let properties = a.features[0].properties;
        let objKeysArr = Object.keys(properties);
        if (objKeysArr[1]) {
          FieldList.push(objKeysArr[0]);
          FieldList.push(objKeysArr[1]);
        } else {
          FieldList.push(objKeysArr[0]);
        }
        let labelfield = "";
        if (FieldList.join("-").indexOf("name") > -1) {
          labelfield = "name";
        } else if (FieldList.join("-").indexOf("FID_道路") > -1) {
          labelfield = "FID_道路";
        } else {
          labelfield = "OBJECTID";
        }

        window.FieldList = FieldList;
        let opt = {
          iconurl: "assets/image图片/blueicon.png",
          selectediconurl: "assets/image图片/redicon.png",
          iconwidth: 40,
          iconheight: 50,
          labeloffsetx: -10,
          labeloffsety: -10,
          iconoffsetx: 0,
          iconoffsety: 0,
          scaleDistance: [6000, 0.5],
          height: 10,
          labelfield,
          geojsonurl,
          FieldList
        };
        this.GeoJsonModel = this.addGeoJsonModel(opt);
        // 绘制多线段
        a.features.forEach(item => {
          let pointList = item.geometry.coordinates[0];
          let polylinepoint = [];
          pointList.forEach(position => {
            let coordinate = Li.Cartesian3.fromDegrees(
              position[0],
              position[1],
              0
            );
            polylinepoint.push(coordinate.toVector3());
          });
          var opt = {
            width: 5, //线宽
            alpha: 1, //线的透明度
            pointArr: polylinepoint, //坐标点
            color: Li.Color.fromRgb(211, 25, 222, 1), //线的颜色
            altitudemethod: Li.AltitudeMethod.Absolute, //海拔高度模式
            altitude: 0,
            glow: true,
            name: "xian~glow", //名称
            id: "xianid~glow" //id
          };
          let polyline = this.addPolyline(opt);
          window.entityLine.push(polyline);
        });
      }, 500);
    },
    // 绘制多线段
    addPolyline(opt) {
      var polyline = new Li.Polyline3D();
      polyline.setWidth(opt.width);
      polyline.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha; //alpha透明度不能设置为1.0
      for (var i = 0; i < opt.pointArr.length; i++) {
        polyline.addPoint(opt.pointArr[i]);
      }
      polyline.color = opt.color;
      polyline.depthTest = opt.depthTest == undefined ? true : opt.depthTest; //是否关闭深度检测
      polyline.setAltitudeMethod(opt.altitudemethod);
      if (opt.altitude) {
        polyline.setAltitude(opt.altitude);
      }
      polyline.setMinDistance(5.0); //设定插点的最小距离
      polyline.setGlowMaterial(opt.glow == undefined ? false : opt.glow); //发光
      polyline.name = opt.name;
      if (opt.id) {
        polyline.id = opt.id;
        polyline.addProperty("id", opt.id); //拾取 属性设置
        polyline.addProperty("name", opt.name);
      }
      polyline.draw();
      polyline.end();
      return polyline;
    },
    // geojson创建
    addGeoJsonModel(opt) {
      opt = opt || {};
      let url = window.document.location.href;
      let baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
      var GeoJsonModel = new Li.GeoJsonModel();

      GeoJsonModel.iconUrl = baseUrl + opt.iconurl;
      GeoJsonModel.selectedIconUrl = baseUrl + opt.selectediconurl;
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
      GeoJsonModel.addField(opt.FieldList[0]); //添加字段
      GeoJsonModel.addField(opt.FieldList[1]); //添加字段
      console.log(opt.geojsonurl);
      if (opt.geojsonurl) {
        GeoJsonModel.load(baseUrl + opt.geojsonurl.slice(2)); //加载GeoJson文件的url
      }
      //or addString可通过字符串类型数据加载
      if (opt.testString) {
        GeoJsonModel.addString(opt.testString);
      }
      return GeoJsonModel;
    },
    // geojson创建，事件触发拾取撒点属性
    createPickModel(event) {
      var e = event || window.event;
      if (e) {
        let feature = Li.GeoJsonModel.getSelectedFeature();
        if (feature) {
          console.log("拾取撒点属性");
          console.log(window.FieldList);
          let property = feature.getProperty(window.FieldList[0]); //要查询的属性
          let property1 = feature.getProperty(window.FieldList[1]); //要查询的属性
          if (property1) {
            console.log(window.FieldList[0] + ":" + property);
            console.log(window.FieldList[1] + ":" + property1);
          } else {
            console.log(window.FieldList[0] + ":" + property);
          }
        }
      }
    },
    // 删除geojson
    clear() {
      if (this.GeoJsonModel != null) {
        this.GeoJsonModel.delete();
        this.GeoJsonModel = null;
      }
    }
  },
  mounted() {
    document
      .getElementById("qtcanvas")
      .addEventListener("click", this.createPickModel); // 监听geojson创建,拾取撒点属性
    document.body.style.overflow = "hidden";
    let dataFrame = [
      {
        id: 0,
        label: "三维模型",
        children: []
      },
      {
        id: -1,
        label: "矢量数据",
        children: [
          {
            id: 1,
            label: "GeoJSON点",
            children: []
          },
          {
            id: 0,
            label: "GeoJSON线",
            children: []
          },
          {
            id: -1,
            label: "GeoJSON面",
            children: []
          }
        ]
      }
    ];
    let GeoJSONPoint = dataFrame[1].children[0].children;
    let GeoJSONPolily = dataFrame[1].children[1].children;
    let GeoJSONPoligon = dataFrame[1].children[2].children;
    let model = dataFrame[0].children;
    // 数据分类---
    data.forEach(item => {
      if (
        item.label === "DAE模型" ||
        item.label === "fbx模型" ||
        item.label === "glb模型" ||
        item.label === "3dtile"
      ) {
        model.push(item);
      } else {
        item.children.forEach(geojsonItem => {
          if (geojsonItem.label.indexOf("point") > -1) {
            GeoJSONPoint.push(geojsonItem);
            9;
          } else if (geojsonItem.label.indexOf("polyline") > -1) {
            GeoJSONPolily.push(geojsonItem);
          } else if (geojsonItem.label.indexOf("polygon") > -1) {
            GeoJSONPoligon.push(geojsonItem);
          }
        });
      }
    });
    this.dataTree = dataFrame;
    // console.log(JSON.stringify(this.dataTree));
  }
};
</script>

<style scoped>
.dataLayer {
  position: absolute;
  z-index: 20;
  width: 340px;
  right: 16px;
  top: 80px;
  color: #fff;
  background-color: rgba(36, 56, 72, 0.9);
}
.dataLayer .title {
  height: 36px;
  background-image: url("../assets/image图片/baseMaginTitle.png");
}
.dataLayer .title .left {
  float: left;
  height: 36px;
  line-height: 36px;
  margin-left: 6px;
}
.dataLayer .title .right {
  float: right;
  width: 16px;
  height: 36px;
  line-height: 36px;
  margin-right: 6px;
  cursor: pointer;
}
.dataLayer .title .right:hover {
  color: rgba(45, 133, 240, 0.8);
}
.el-tree {
  padding-left: 20px;
  height: 400px;
  /* padding-left: 20px; */
  overflow-y: scroll;
  background-color: rgba(36, 56, 72, 0.9);
  color: #fff;
}
.el-tree::-webkit-scrollbar {
  display: none;
}
</style>
