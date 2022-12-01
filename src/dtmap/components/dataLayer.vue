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
window.checkObj = []; //选中的节点
import data from "../data/modelFile/writeFile";
export default {
  data() {
    return {
      nowscale: 1, // 缩放比例
      dataTree: [],
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
        this.addmodelglb(glbPath, node);
      }
      // 加载FBX模型
      if (Number(node.id) >= 39 && Number(node.id) <= 310 && !node.children) {
        let FBXPath = this.dataTree[0].children[1].path;
        this.addmodelFBX(FBXPath, node);
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
        this.addmodelDae(daePath, node);
      }
    },
    //dae 添加
    addmodelDae(daePath, node) {
      this.deletemodel();
      if (!window.cctvModel) {
        let cctvUrl = daePath + "/" + node.label + ".DAE";
        let model = new Li.Model(cctvUrl);
        let entity = new Li.Entity();
        entity.addComponent(model);
        // entity.objectName = "model";
        GlobalViewer.scene.addEntity(entity);
        let carto = Li.Cartographic.fromDegrees(114.05300844, 22.530465169, 10); //坐标
        // model.transform.scale = 100;
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
    //gltf glb 添加
    addmodelglb(glbPath, node) {
      this.deletemodel();
      if (!window.cctvModel) {
        let cctvUrl = glbPath + "/" + node.label + ".glb";
        let model = new Li.Model(cctvUrl);
        let entity = new Li.Entity();
        entity.addComponent(model);
        // entity.objectName = "model";
        GlobalViewer.scene.addEntity(entity);
        let carto = Li.Cartographic.fromDegrees(
          114.05300844,
          22.530465169,
          200
        ); //坐标
        model.transform.cartographic = carto;
        //模型正在渲染中
        model.readyPromise.then(() => {
          model.entity.travalRenderers(function(renderer) {
            // let objectName = renderer.entity.objectName;
            // console.log("nodeName:" + objectName);
            console.log(renderer);
            let camera = GlobalViewer.scene.mainCamera;
            let p = renderer.boundingVolume.center;
            console.log(carto, p);
            camera.flyTo(p.toCartographic());
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
    //添加模型
    // modelLayer(url, carto, rotation, offset, scale) {
    //   let modelLayer = new Li.ModelLayer();
    //   modelLayer.url = url;
    //   modelLayer.cartographic = carto;
    //   modelLayer.rotation = rotation;
    //   modelLayer.offset = offset;
    //   if (scale) {
    //     //不设置，默认时为1
    //     modelLayer.scale = scale;
    //   }
    //   modelLayer.componentComplete();
    //   return modelLayer;
    // },
    addmodel(url, carto, rotation, offset, scale, srs) {
      let model = new Li.Model(url);
      let entity = new Li.Entity();
      entity.addComponent(model);
      GlobalViewer.scene.addEntity(entity);
      if (!srs) {
        this.transform(model, carto, rotation, offset, scale);
      } else {
        model.srs = srs;
      }
      return entity;
    },
    transform(m, carto, rotation, offset, mscale) {
      let model = m;
      //位置
      if (carto) {
        model.transform.cartographic = carto;
      }
      // 偏移
      if (offset) {
        model.offset = offset;
      }
      // 旋转
      if (rotation) {
        model.rotation = rotation;
      }
      // 缩放
      if (mscale) {
        model.scale = mscale;
      }
    },
    //FBX添加
    addmodelFBX(FBXPath, node) {
      this.deletemodel();
      if (!window.cctvModel) {
        let cctvUrl = FBXPath + "/" + node.label + ".fbx";
        // window.document.location.origin + "/" + "data/model/Girl.fbx";
        let carto = Li.Cartographic.fromDegrees(114.05300844, 22.530465169, 15); //坐标
        let rotation = Li.Quaternion.fromEulerAngles(0, 0, 0); //旋转
        let offset = Li.Vector3.create(0, 0, 0); //偏移量
        this.nowscale = 0.3;
        let scale = Li.Vector3.create(
          this.nowscale,
          this.nowscale,
          this.nowscale
        ); //比例
        window.cctvModel = this.addmodel(
          cctvUrl,
          carto,
          rotation,
          offset,
          scale
        );
        let camera = GlobalViewer.scene.mainCamera;
        var p = Li.Cartographic.fromDegrees(114.05300844, 22.530465169, 150);
        camera.cameraController().flyToCartographic(p, 3, 0, -90, 0);
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
    }
  },

  mounted() {
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
          if (geojsonItem.label.indexOf("点") > -1) {
            GeoJSONPoint.push(geojsonItem);
          } else if (geojsonItem.label.indexOf("线") > -1) {
            GeoJSONPolily.push(geojsonItem);
          } else if (geojsonItem.label.indexOf("面") > -1) {
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
