window.entityAllList = [];
window.mouseClick = "";
window.pointLineList = [];
window.nodeMoveList = [];
window.laberMoveList = [];

function measureVolumeStarts() {
  if (window.endMeasure) {
    window.endMeasure(); // 先解绑事件
  }
  window.endMeasure = endMeasure; // 暴露结束测量方法出去,方便以后绑定事件先解绑
  window.mouseClick = "polygon";

  document
    .getElementById("qtcanvas")
    .addEventListener("mousedown", MouseDownEvent);
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  document
    .getElementById("qtcanvas")
    .addEventListener("mousemove", MouseMoveEvent);
  function endMeasure() {
    document
      .getElementById("qtcanvas")
      .removeEventListener("mousedown", MouseDownEvent);
    document.getElementById("qtcanvas").style.cursor = "default";
    document
      .getElementById("qtcanvas")
      .removeEventListener("mousemove", MouseMoveEvent);
  }
  function MouseDownEvent(event) {
    var camera = GlobalViewer.scene.mainCamera; //获取相机

    var hit = new Li.RaycastHit(); //射线投影
    //鼠标点击的位置，通过相机视角射线获取
    var ray = camera.screenPointToRay(event.x, event.y);
    var rayok = GlobalViewer.scene.raycast(ray, hit); //判断是否存在
    var point = 0;
    var tohic = 0;
    if (rayok) {
      if (hit) {
        point = hit.point; //Vector3
        tohic = point.toCartesian3().toCartographic();
      }
    }
    hit.delete();

    //鼠标左键点击
    if (event.button == 0) {
      if (window.mouseClick == "polygon") {
        window.pointLineList.push(point); //记录点击的节点坐标
        // var pointObj = {
        //     position: point,
        //     color: [255, 0, 0, 255],
        //     altitude: Li.AltitudeMethod.Absolute,
        //     name: 'point',
        //     // id: "measure",
        // }
        // drawPoint(pointObj);
      }
      if (window.mouseClick == "volume") {
        if (window.nodeMoveList.length > 0) {
          window.nodeMoveList[window.nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
        }
        window.nodeMoveList = [];

        var height = Number(tohic.height.toFixed(2));

        // 绘制多边形几何体
        var pointArr = new Array();
        window.pointLineList.forEach(item => {
          pointArr.push(item.toCartesian3());
        });
        var polygongeometryObj = {
          height: height,
          alpha: 0.8,
          pointArr: pointArr,
          color: Li.Color.fromRgb(83, 255, 26, 255),
          name: "polygongeometry"
          // id: "measure",
        };
        var polygongeometry = drawPolygonGeometry(polygongeometryObj);
        window.entityAllList.push(polygongeometry);

        var renderer = polygongeometry.renderer;
        var f = Li.GisUtil.calculateGeometryVolume(renderer);
        var pointlist = new Array();
        pointlist = window.pointLineList;
        f.then(function(value) {
          console.log("geometry volume : " + value);
          // 中心点
          var retcenpoint = getCenterPoint(pointlist);
          var cenpoint = Li.Cartographic.fromDegrees(
            retcenpoint.lon,
            retcenpoint.lat,
            height
          ).toVector3();

          //标签
          var labelObj = {
            position: cenpoint,
            text: "体积：" + value.toFixed(2).toString() + "立方米",
            fontSize: 20,
            fontColor: Li.Color.fromRgb(255, 255, 255, 255),
            strokeColor: Li.Color.fromRgb(50, 143, 254, 255),
            translucencyByDistance: Li.Vector4.create(30000, 1.0, 1.0e5, 0.7),
            name: "label"
            // id: "measure",
          };
          var label3d = addLabel3D(labelObj);
          window.entityAllList.push(label3d);
        });

        delectEntity(window.entityAllList, "maxpolygongeometry");
        window.pointLineList = [];
        window.mouseClick = "";
        endMeasure();
      }
    } else if (event.button == 2) {
      if (window.nodeMoveList.length > 0) {
        window.nodeMoveList[window.nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
      }
      window.nodeMoveList = [];
      if (window.laberMoveList.length > 0) {
        window.laberMoveList[window.laberMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
      }
      window.laberMoveList = [];

      if (window.pointLineList.length > 2) {
        // 绘制多边形几何体
        var maxPointArr = new Array();
        window.pointLineList.forEach(item => {
          maxPointArr.push(item.toCartesian3());
        });
        var maxPolygongeometryObj = {
          height: 10000,
          alpha: 0,
          pointArr: maxPointArr,
          color: Li.Color.fromRgb(255, 255, 255, 0),
          name: "maxpolygongeometry"
          // id: "measure",
        };
        var maxPolygongeometry = drawPolygonGeometry(maxPolygongeometryObj);
        window.entityAllList.push(maxPolygongeometry);

        // 绘制多边形几何体
        var initPointArr = new Array();
        window.pointLineList.forEach(item => {
          initPointArr.push(item.toCartesian3());
        });
        var initPolygongeometryObj = {
          height: 10,
          alpha: 0.8,
          pointArr: initPointArr,
          color: Li.Color.fromRgb(0, 240, 120, 128),
          name: "polygongeometry"
          // id: "measure",
        };
        var initPolygongeometry = drawPolygonGeometry(initPolygongeometryObj);
        window.nodeMoveList.push(initPolygongeometry);

        window.mouseClick = "volume";
      } else {
        window.pointLineList = [];
        window.mouseClick = "";
        endMeasure();
        clearsMeasure();
      }
    }
  }
  function MouseMoveEvent(event) {
    var camera = GlobalViewer.scene.mainCamera; //获取相机

    var hit = new Li.RaycastHit(); //射线投影
    //鼠标点击的位置，通过相机视角射线获取
    var ray = camera.screenPointToRay(event.x, event.y);
    var rayok = GlobalViewer.scene.raycast(ray, hit); //判断是否存在
    var point = 0;
    var tohic = 0;
    if (rayok) {
      if (hit) {
        point = hit.point; //Vector3
        tohic = point.toCartesian3().toCartographic();
      }
    }
    hit.delete();

    if (window.nodeMoveList.length > 0) {
      window.nodeMoveList[window.nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
    }
    window.nodeMoveList = [];
    if (window.laberMoveList.length > 0) {
      window.laberMoveList[window.laberMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
    }
    window.laberMoveList = [];

    if (window.mouseClick == "polygon" && window.pointLineList.length > 0) {
      var points = [];
      for (var i = 0; i < window.pointLineList.length; i++) {
        var carto = window.pointLineList[i];
        points.push(carto);
      }
      points.push(point);
      var polygonObj = {
        width: 1,
        alpha: 0.8,
        pointArr: points,
        color: Li.Color.fromRgb(0, 240, 120, 128),
        borColor: Li.Color.fromRgb(83, 255, 26, 255),
        altitude: Li.AltitudeMethod.OnTerrain,
        name: "move"
      };
      var polygon = drawPolygon3D(polygonObj);
      window.nodeMoveList.push(polygon);
    }

    if (window.mouseClick == "volume" && window.pointLineList.length > 0) {
      var height = Number(tohic.height.toFixed(2));
      // 绘制多边形几何体
      var pointArr = new Array();
      window.pointLineList.forEach(item => {
        pointArr.push(item.toCartesian3());
      });
      var polygongeometryObj = {
        height: height,
        alpha: 0.8,
        pointArr: pointArr,
        color: Li.Color.fromRgb(83, 255, 26, 255),
        name: "polygongeometry"
        // id: "measure",
      };
      var polygongeometry = drawPolygonGeometry(polygongeometryObj);
      window.nodeMoveList.push(polygongeometry);
    }
  }
  function clearsMeasure() {
    if (window.entityAllList.length > 0) {
      let length = window.entityAllList.length;
      for (var i = length - 1; i > -1; i--) {
        window.entityAllList[i].delete();
        window.entityAllList.splice(i, 1);
        delete window.entityAllList[i];
      }
    }
  }
  window.clearsMeasure = clearsMeasure; // 将测量体积方法暴露出去方便清除数据
  function delectEntity(entityList, name) {
    if (entityList.length > 0) {
      for (var i = 0; i < entityList.length; i++) {
        if (entityList[i] == undefined) continue;
        if (entityList[i].name == name) {
          entityList[i].delete();
          delete entityList[i];
          entityList.splice(i, 1);
        }
      }
    }
  }
  // 添加文字标签
  function addLabel3D(opt) {
    var label3d = new Li.Label3D();
    label3d.position = opt.position;
    if (opt.text != "" && opt.text != undefined) {
      label3d.text = opt.text;
    }
    label3d.fontSize = opt.fontSize; //字体大小
    label3d.fontColor = opt.fontColor; //字体颜色，白色
    if (opt.strokeColor) {
      label3d.strokeColor = opt.strokeColor; //描边颜色，黑边
    }
    if (opt.background) {
      label3d.background = opt.background; //背景颜色
    }
    if (opt.url) {
      label3d.url = window.document.location.origin + "/" + opt.url; //图片路径
    }
    if (opt.vertical) {
      label3d.vertical = opt.vertical;
    }
    if (opt.horizontal) {
      label3d.horizontal = opt.horizontal;
    }
    if (opt.imageWidth) {
      label3d.imageWidth = opt.imageWidth;
    }
    if (opt.imageHeight) {
      label3d.imageHeight = opt.imageHeight;
    }
    if (opt.offset) {
      label3d.offset = opt.offset; //偏移量
    }
    if (opt.scaleByDistance) {
      label3d.setScaleByDistance(opt.scaleByDistance); //缩放比
    }
    if (opt.translucencyByDistance) {
      label3d.setTranslucencyByDistance(opt.translucencyByDistance); //缩放控制透明度
    }
    if (window.billboardCollection == null) {
      var bbcollection = new Li.BillboardCollection();
      window.billboardCollection = bbcollection;
    }

    label3d.name = opt.name;
    label3d.addProperty("name", opt.name);
    if (opt.id) {
      label3d.id = opt.id;
      label3d.addProperty("id", opt.id);
    }
    label3d.setCollection(window.billboardCollection);
    return label3d;
  }
  // 绘制面
  function drawPolygon3D(opt) {
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
    return polygon3d;
  }
  // 绘制多边形体
  function drawPolygonGeometry(opt) {
    let geometry = new Li.Cartesian3Vector();
    opt.pointArr.forEach(item => {
      geometry.push_back(item);
    });
    let extrudeEntity = new Li.ExtrudeEntity();
    extrudeEntity.setOuter(geometry);
    extrudeEntity.extrudeHeight = opt.height; // 几何体的高度
    extrudeEntity.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha; //alpha透明度不能设置为1.0
    extrudeEntity.color = opt.color;
    extrudeEntity.create();

    let entity = extrudeEntity.createEntity();
    GlobalViewer.scene.addEntity(entity);
    entity.name = opt.name;
    if (opt.id) {
      entity.id = opt.id;
    }

    extrudeEntity.delete();
    geometry.delete();
    return entity;
  }
  // 计算中心点
  function getCenterPoint(pointList) {
    var lonlist = new Array();
    var latlist = new Array();
    pointList.forEach(item => {
      var degpoint = item
        .toCartesian3()
        .toCartographic()
        .toDegrees();
      lonlist.push(degpoint.longitude);
      latlist.push(degpoint.latitude);
    });
    var lonmaxmin = getMinMax(lonlist);
    var minlon = lonmaxmin[0];
    var maxlon = lonmaxmin[1];
    var latmaxmin = getMinMax(latlist);
    var minlat = latmaxmin[0];
    var maxlat = latmaxmin[1];
    var obj = {
      num1: minlon,
      num2: maxlon
    };
    var lon = numAdd(obj) / 2;
    var obj1 = {
      num1: minlat,
      num2: maxlat
    };
    var lat = numAdd(obj1) / 2;
    var point = {
      lon: lon,
      lat: lat
    };
    return point;
  }
  // 获取最小最大经度
  function getMinMax(list) {
    if (list.length > 0) {
      list.sort(function(a, b) {
        return a - b;
      });
      var min = list[0];
      var max = list[list.length - 1];
      return [min, max];
    }
  }
  // 两个浮点型相加
  function numAdd(opt) {
    var baseNum, baseNum1, baseNum2;
    try {
      baseNum1 = opt.num1.toString().split(".")[1].length;
    } catch (e) {
      baseNum1 = 0;
    }
    try {
      baseNum2 = opt.num2.toString().split(".")[1].length;
    } catch (e) {
      baseNum2 = 0;
    }
    baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
    return (opt.num1 * baseNum + opt.num2 * baseNum) / baseNum;
  }
}
export default measureVolumeStarts;
