import earcut from "./earcut";
window.pointLineList = [];
window.nodeMoveList = [];
window.laberMoveList = [];
window.entityLineList = []; // 用来存放多边形实体
window.entityLabelList = []; // 用来存放标签实体
window.labelObj = []; // 用于存放标签对象
function measureAreaStarts() {
  window.convertObj = {
    // 相同数据转换
    "m²-m²": function(value) {
      return value;
    },
    "km²-km²": function(value) {
      return value;
    },
    // 转换数据的公式
    "m²-km²": function(value) {
      return value / 1000000;
    },
    "km²-m²": function(value) {
      return value * 1000000;
    }
  };
  if (window.endMeasure) {
    window.endMeasure(); // 先解绑事件
  }
  window.endMeasure = endMeasure; // 暴露结束测量方法出去,方便以后绑定事件先解绑
  document
    .getElementById("qtcanvas")
    .addEventListener("mousedown", MouseDownEvent);
  document.getElementById("qtcanvas").style.cursor = "crosshair";
  document
    .getElementById("qtcanvas")
    .addEventListener("mousemove", MouseMoveEvent);
  // 结束测量
  function endMeasure() {
    document
      .getElementById("qtcanvas")
      .removeEventListener("mousedown", MouseDownEvent);
    document.getElementById("qtcanvas").style.cursor = "default";
    document
      .getElementById("qtcanvas")
      .removeEventListener("mousemove", MouseMoveEvent);
  }
  // 鼠标按下
  function MouseDownEvent(event) {
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
    if (event.button == 0) {
      window.pointLineList.push(point); //记录点击的节点坐标
      // var obj = {
      //     position: point,
      //     color: [255, 0, 0, 255],
      //     altitude: Li.AltitudeMethod.OnTerrain,
      //     name: 'point',
      //     // id: "measure",
      // }
      // drawPoint(obj);
    } else if (event.button == 2) {
      if (window.pointLineList.length > 2) {
        var points = [];
        for (var i = 0; i < window.pointLineList.length; i++) {
          var carto = window.pointLineList[i].toCartesian3().toCartographic();
          points.push(carto);
        }

        var polygonObj = {
          width: 1,
          alpha: 0.8,
          pointArr: window.pointLineList,
          color: Li.Color.fromRgb(0, 240, 120, 128),
          borColor: Li.Color.fromRgb(83, 255, 26, 255),
          altitude: Li.AltitudeMethod.OnTerrain,
          name: "polygon"
          // id: "measure",
        };
        var polygon = drawPolygon3D(polygonObj);
        window.entityLineList.push(polygon);

        var area = calSpaceArea(window.pointLineList); //面积
        var retcenpoint = getCenterPoint(window.pointLineList); //中心点
        var cenpoint = Li.Cartographic.fromDegrees(
          retcenpoint.lon,
          retcenpoint.lat,
          0
        ).toVector3();

        //标签
        var labelObj = {
          position: cenpoint,
          text: "面积：" + area.toFixed(2).toString() + "m²",
          fontSize: 20,
          fontColor: Li.Color.fromRgb(255, 255, 26, 255),
          translucencyByDistance: Li.Vector4.create(30000, 1.0, 1.0e5, 0.7),
          name: "label"
          // id: "measure",
        };

        let convertUnit = "m²-" + window.form.region;
        let convertaAreaSize = window.convertObj[convertUnit](area).toFixed(2);
        labelObj.text = "面积：" + convertaAreaSize + window.form.region;

        window.labelObj.push(labelObj);
        var label3d = addLabel3D(labelObj);
        window.entityLabelList.push(label3d);
      }

      if (window.nodeMoveList.length > 0) {
        window.nodeMoveList[window.nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
      }
      window.nodeMoveList = [];
      if (window.laberMoveList.length > 0) {
        window.laberMoveList[window.laberMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
      }
      window.laberMoveList = [];
      window.pointLineList = [];
      endMeasure();
    }
  }
  // 鼠标移动事件
  function MouseMoveEvent(event) {
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

    if (window.nodeMoveList.length > 0) {
      window.nodeMoveList[window.nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
    }
    window.nodeMoveList = [];
    if (window.laberMoveList.length > 0) {
      window.laberMoveList[window.laberMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
    }
    window.laberMoveList = [];
    if (window.pointLineList.length > 0) {
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
  }
  // 清除测量
  // function clearMeasure() {
  //   if (window.entityAllList.length > 0) {
  //     let length = window.entityAllList.length;
  //     for (var i = length - 1; i > -1; i--) {
  //       window.entityAllList[i].delete();
  //       window.entityAllList.splice(i, 1);
  //       delete window.entityAllList[i];
  //     }
  //   }
  // }
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
  // 计算空间多边形面积
  function calSpaceArea(pointArray) {
    var indices = createIndex(pointArray);
    var s = 0;
    for (var i = 0; i < indices.length; i += 3) {
      var idx1 = indices[i];
      var idx2 = indices[i + 1];
      var idx3 = indices[i + 2];

      var point1 = pointArray[idx1];
      var point2 = pointArray[idx2];
      var point3 = pointArray[idx3];

      var edge1 = calEdge(point1, point2);
      var edge2 = calEdge(point2, point3);
      var edge3 = calEdge(point3, point1);

      s += calHeron(edge1, edge2, edge3);
    }
    return s;
  }
  // 计算边长 vector3类型
  function calEdge(pointA, pointB) {
    var x2 = Math.pow(pointA.x - pointB.x, 2);
    var y2 = Math.pow(pointA.y - pointB.y, 2);
    var z2 = Math.pow(pointA.z - pointB.z, 2);
    return Math.sqrt(x2 + y2 + z2);
  }
  function calHeron(a, b, c) {
    var p = (a + b + c) / 2;
    return Math.sqrt(p * (p - a) * (p - b) * (p - c));
  }
  // 返回顶点索引数组,用耳切法生成索引
  function createIndex(pointArray) {
    var earcutArray = [];
    for (var i = 0; i < pointArray.length; i++) {
      earcutArray.push(pointArray[i].x);
      earcutArray.push(pointArray[i].y);
      earcutArray.push(pointArray[i].z);
    }

    var originIndices = earcut(earcutArray, null, 3);
    var indices = new Uint16Array(originIndices.length);
    for (var o = 0; o < originIndices.length; o++) {
      indices[o] = originIndices[o];
    }
    return indices;
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
  window.addLabel3D = addLabel3D;
}
function listenersArea() {
  if (window.entityLabelList.length > 0) {
    var length = window.entityLabelList.length;
    for (var i = length - 1; i > -1; i--) {
      window.entityLabelList[i].delete();
      window.entityLabelList.splice(i, 1);
    }
  }
  let convertUnit = window.oldUnit + "-" + window.newUnit;
  console.log(convertUnit);
  console.log(window.labelObj);
  window.labelObj.forEach(item => {
    console.log(item.text);
    console.log(window.oldUnit, window.newUnit);
    const num1IndexStart = item.text.indexOf("：") + 1;
    const num1IndexEnd = item.text.indexOf(window.oldUnit);
    console.log(num1IndexStart, num1IndexEnd);
    console.log(item.text.slice(num1IndexStart, num1IndexEnd));
    let newData = window.convertObj[convertUnit](
      item.text.slice(num1IndexStart, num1IndexEnd)
    );
    item.text = "面积：" + Number(newData).toFixed(2) + window.newUnit;
    var label3d = window.addLabel3D(item);
    window.entityLabelList.push(label3d);
  });
}
export default measureAreaStarts;
export const listenerArea = listenersArea;
// "面积:"
