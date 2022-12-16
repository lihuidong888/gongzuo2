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
window.entityLine = []; //线实体
window.entityFace = []; //面实体
window.pointPolygonList = []; //面的点列表
import data from "../data/modelFile/writeFile";
export default {
  data() {
    return {
      nowscale: 1, // 缩放比例
      dataTree: [],
      GeoJsonModel: null,
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
      // 目标多选框被去掉时候,删除模型不跳转
      console.log("1111", node, checkObj);
      window.checkObj.push(checkObj);
      let length = window.checkObj.length;
      if (window.checkObj.length >= 2) {
        if (
          window.checkObj[length - 1].checkedKeys.length <
          window.checkObj[length - 2].checkedKeys.length
        ) {
          if (window.cctvModel && node.label === window.cctvModel.name) {
            this.deletemodel();
          }
          if (window.tilesetmodel && node.label === window.tilesetmodel.name) {
            this.deleteTiles();
          }
          if (this.GeoJsonModel && node.label === this.GeoJsonModel.name) {
            this.clear();
          }
          return;
        }
      }
      // 全选一级或者二级标题加载对应三级标题的模型或矢量数据的第一个
      if (node.label == "三维模型" || node.label == "DAE模型") {
        let cctvUrl = "./data/testdata/models/dae/cars/dabache.DAE";
        this.model(cctvUrl, window.point[preNum]);
      }
      if (node.label == "fbx模型") {
        let cctvUrl = "./data/testdata/models/fbx/Girl.fbx";
        this.model(cctvUrl, window.point[preNum]);
      }
      if (node.label == "glb模型") {
        let cctvUrl = "./data/testdata/models/gltf_glb/box.glb";
        this.model(cctvUrl, window.point[preNum]);
      }
      if (node.label == "3dtile") {
        this.addTilese("./data/testdata/3dtiles/ft");
      }
      if (node.label == "矢量数据" || node.label == "GeoJSON点") {
        let geojsonurl = "./data/testdata/geojson/dzsb-point.geojson";
        let geojsondataPath = "./data/testdata/geojson/数据/dzsb-point.geojson";
        this.spreadPoint(geojsonurl, geojsondataPath);
      }
      if (node.label == "GeoJSON线") {
        let geojsonurl = "./data/testdata/geojson/ft-polyline-1370.geojson";
        let geojsondataPath =
          "./data/testdata/geojson/数据/ft-polyline-1370.geojson";
        this.spreadPolyline(geojsonurl, geojsondataPath);
      }
      if (node.label == "GeoJSON面") {
        let geojsonurl = "./data/testdata/geojson/area-polygon.geojson";
        let geojsondataPath =
          "./data/testdata/geojson/面数据/area-polygon.geojson";
        this.spreadFace(geojsonurl, geojsondataPath);
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
        this.spreadPoint(geojsonurl, geojsondataPath);
      }
      // 加载Geojson线
      if (node.label.indexOf("polyline") > -1 && !node.children) {
        let geojsonurl = "./data/testdata/geojson/" + node.label + ".geojson";
        let geojsondataPath =
          "./data/testdata/geojson/数据/" + node.label + ".geojson";
        this.spreadPolyline(geojsonurl, geojsondataPath);
      }
      // 加载Geojson面
      if (node.label.indexOf("polygon") > -1 && !node.children) {
        let geojsonurl = "./data/testdata/geojson/" + node.label + ".geojson";
        let geojsondataPath =
          "./data/testdata/geojson/面数据/" + node.label + ".geojson";
        this.spreadFace(geojsonurl, geojsondataPath);
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
        if (path.indexOf("DAE") > -1) {
          model.rotation = Li.Quaternion.fromEulerAngles(-90, 0, 0);
        }
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
        // 加名字标记删除
        let name = path.slice(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
        entity.name = name;
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
      // 加名字标记删除
      let name = tilesetPath.slice(tilesetPath.lastIndexOf("/") + 1);
      tileset.name = name;
      window.tilesetmodel = tileset;
    },
    //撒点 -- 点
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
    //撒点 -- 线
    spreadPolyline(geojsonurl, geojsondataPath) {
      this.clear(); // 删除原有的geojson
      var script = document.createElement("script");
      script.src = geojsondataPath;
      document.body.appendChild(script);
      setTimeout(() => {
        // flyToHome
        let coordinates = a.features[0].geometry.coordinates;
        var middle = Math.floor(coordinates[0].length / 2);
        let point = coordinates[0][middle];
        if (coordinates.length != 1) {
          var middle1 = Math.floor(coordinates.length / 2);
          point = coordinates[middle1];
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
    //撒点 -- 面
    spreadFace(geojsonurl, geojsondataPath) {
      this.clear();
      var script = document.createElement("script");
      script.src = geojsondataPath;
      document.body.appendChild(script);
      setTimeout(() => {
        // flyToHome
        let coordinates = a.features[0].geometry.coordinates;
        let point = coordinates[0][0][0];
        if (typeof coordinates[0][0][0] === "number") {
          point = coordinates[0][0];
        }
        let scene = GlobalViewer.scene;
        let camera = scene.mainCamera;
        let position = Li.Cartographic.fromDegrees(point[0], point[1], 100);
        camera.flyTo(position);
        let FieldList = [];
        let properties = a.features[0].properties;
        let objKeysArr = Object.keys(properties);
        FieldList.push(objKeysArr[0]);
        FieldList.push(objKeysArr[1]);
        FieldList.push(objKeysArr[2]);
        let labelfield = "";
        if (FieldList.join("-").indexOf("居住生活区") > -1) {
          labelfield = "居住生活区";
        } else if (FieldList.join("-").indexOf("OBJECTID") > -1) {
          labelfield = "OBJECTID";
        } else if (FieldList.join("-").indexOf("batchid") > -1) {
          labelfield = "batchid";
        } else if (FieldList.join("-").indexOf("ID") > -1) {
          labelfield = "ID";
        } else {
          labelfield = "name";
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
          height: 5,
          labelfield,
          geojsonurl,
          FieldList
        };
        this.GeoJsonModel = this.addGeoJsonModel(opt);
        // 绘制面
        a.features.forEach(item => {
          let pointItem = item.geometry.coordinates[0][0];
          if (typeof coordinates[0][0][0] === "number") {
            pointItem = coordinates[0];
          }
          pointItem.forEach(position => {
            let coordinate = Li.Cartesian3.fromDegrees(
              position[0],
              position[1],
              0
            );
            window.pointPolygonList.push(coordinate.toVector3());
          });
          let polygonObj = {
            width: 1,
            alpha: 0.8,
            pointArr: window.pointPolygonList,
            color: Li.Color.fromRgb(0, 240, 120, 128),
            borColor: Li.Color.fromRgb(83, 255, 26, 255),
            altitude: Li.AltitudeMethod.OnTerrain,
            name: "polygon"
          };
          let polygon = this.drawPolygon3D(polygonObj);
          window.entityFace.push(polygon);
        });
      }, 500);
    },
    // 绘制面
    drawPolygon3D(opt) {
      var polygon3d = new Li.Polygon3D();
      polygon3d.fillAlpha = opt.fillAlpha >= 1 ? 0.99 : opt.fillAlpha || 0.99; //填充透明度
      polygon3d.color = opt.borColor; //边界颜色
      polygon3d.setWidth(opt.width); //边界宽度
      polygon3d.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha || 0.99; //alpha透明度不能设置为1.0 //边界透明度
      polygon3d.setFillColor(opt.color); //填充颜色，颜色，画笔类型
      opt.pointArr.forEach(item => {
        polygon3d.addPoint(item);
      });
      polygon3d.setAltitudeMethod(opt.altitude); //海拔高度模式
      polygon3d.name = opt.name;
      polygon3d.addProperty("name", opt.name);
      if (opt.id) {
        polygon3d.id = opt.id;
        polygon3d.addProperty("id", opt.id);
      }
      polygon3d.draw();
      polygon3d.end();
      window.pointPolygonList = [];
      return polygon3d;
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
      if (opt.geojsonurl) {
        GeoJsonModel.load(baseUrl + opt.geojsonurl.slice(2)); //加载GeoJson文件的url
      }
      //or addString可通过字符串类型数据加载
      if (opt.testString) {
        GeoJsonModel.addString(opt.testString);
      }
      let name = opt.geojsonurl.slice(
        opt.geojsonurl.lastIndexOf("/") + 1,
        opt.geojsonurl.lastIndexOf(".")
      );
      GeoJsonModel.name = name;
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
    // 删除geojson,geojson线
    clear() {
      // 删除geojson
      if (this.GeoJsonModel != null) {
        this.GeoJsonModel.delete();
        this.GeoJsonModel = null;
      }
      // 删除创建的线
      if (window.entityLine.length != 0) {
        for (let i = 0; i < window.entityLine.length; i++) {
          var entitys = window.entityLine[i];
          entitys.delete();
        }
        window.entityLine = [];
      }
      // 删除创建的面
      if (window.entityFace.length != 0) {
        for (let i = 0; i < window.entityFace.length; i++) {
          var entitys = window.entityFace[i];
          entitys.delete();
        }
        window.entityFace = [];
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
