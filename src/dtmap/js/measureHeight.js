window.pointLineList = [];
window.nodeMoveList = [];
window.laberMoveList = [];
window.entityLineList = []; // 用来存放标签多边形实体
window.entityLabelList = []; // 用来存放标签实体
window.labelObj = []; // 用于存放标签对象
function measureHeightStarts() {
  window.convertObj = {
    // 相同数据转换
    "m-m": function(value) {
      return value;
    },
    "km-km": function(value) {
      return value;
    },
    // 转换数据的公式
    "m-km": function(value) {
      return value * 0.001;
    },
    "km-m": function(value) {
      return value * 1000;
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

      if (window.pointLineList.length > 1) {
        if (window.nodeMoveList.length > 0) {
          window.nodeMoveList[window.nodeMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
        }
        window.nodeMoveList = [];
        if (window.laberMoveList.length > 0) {
          window.laberMoveList[window.laberMoveList.length - 1].delete(); //删除鼠标移动中前一帧创建的线实体
        }
        window.laberMoveList = [];

        var obj = altitudeHeight(
          window.pointLineList[0],
          window.pointLineList[1]
        );
        window.entityLabelList.push(obj.label3d);
        window.entityLineList.push(obj.entity);
        window.labelObj.push(obj.labelObj);
        endMeasure();
        window.pointLineList = [];
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
      window.pointLineList = [];
      endMeasure();
      //   clearMeasure();
    }
  }
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
      var obj = altitudeHeight(window.pointLineList[0], point);
      window.nodeMoveList.push(obj.entity);
      window.laberMoveList.push(obj.label3d);
    }
  }
  //   function clearMeasure() {
  //     if (window.entityAllList.length > 0) {
  //       let length = window.entityAllList.length;
  //       for (var i = length - 1; i > -1; i--) {
  //         window.entityAllList[i].delete();
  //         window.entityAllList.splice(i, 1);
  //         delete window.entityAllList[i];
  //       }
  //     }
  //   }
  // 高度差
  function altitudeHeight(point1, point2) {
    var degress1 = point1
      .toCartesian3()
      .toCartographic()
      .toDegrees();
    var degress2 = point2
      .toCartesian3()
      .toCartographic()
      .toDegrees();
    var height = Math.abs(degress1.height - degress2.height); //高度差

    //第三点坐标
    var thrheig =
      degress1.height > degress2.height
        ? numAdd({
            num1: degress2.height,
            num2: height
          })
        : numAdd({
            num1: degress1.height,
            num2: height
          });
    var point3 =
      degress1.height > degress2.height
        ? Li.Cartographic.fromDegrees(
            degress2.lon,
            degress2.lat,
            thrheig
          ).toVector3()
        : Li.Cartographic.fromDegrees(
            degress1.lon,
            degress1.lat,
            thrheig
          ).toVector3();

    //标签
    var labelObj = {
      position: point3,
      fontSize: 20,
      fontColor: Li.Color.fromRgb(255, 255, 26, 255),
      text: "高度差：" + height.toFixed(2) + "米",
      translucencyByDistance: Li.Vector4.create(30000, 1.0, 1.0e5, 0.7),
      name: "measure",
      id: "measure"
    };

    let convertUnit = "m-" + window.form.region;
    let convertHeightSize = window.convertObj[convertUnit](height).toFixed(2);
    labelObj.text = "高度差：" + convertHeightSize + window.form.region;
    // window.labelObj.push(obj.labelObj); 这行代码不能在这里执行,因为鼠标移动影响,后期监视会有很多标签
    var label3d = addLabel3D(labelObj);
    //线
    var pointArr = [point1, point2, point3, point1];
    var polylineObj = {
      width: 1.5,
      alpha: 1,
      pointArr: pointArr,
      color: Li.Color.fromRgb(83, 255, 26, 255),
      altitude: Li.AltitudeMethod.Absolute, //贴地模式，绝对
      name: "celiang",
      id: "measure"
    };
    var entity = drawPolyline(polylineObj);

    var obj = {
      label3d: label3d,
      entity: entity,
      labelObj: labelObj
    };
    return obj;
  }
  function drawPolyline(opt) {
    var polyline = new Li.Polyline3D();
    for (var i = 0; i < opt.pointArr.length; i++) {
      polyline.addPoint(opt.pointArr[i]);
    }
    if (opt.alpha) {
      polyline.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha; //alpha透明度不能设置为1.0
    }
    if (opt.color) {
      polyline.color = opt.color;
    }
    if (opt.width) {
      polyline.width = opt.width;
    }
    if (opt.altitude) {
      polyline.setAltitudeMethod(opt.altitude);
    }
    polyline.setMinDistance(5.0); //设定插点的最小距离

    polyline.name = opt.name;
    polyline.addProperty("name", opt.name);
    if (opt.id) {
      polyline.id = opt.id;
      polyline.addProperty("id", opt.id);
    }
    polyline.draw();
    polyline.end();
    return polyline;
  }
  function addLabel3D(opt) {
    var label3d = new Li.Label3D();
    label3d.position = opt.position;
    label3d.fontSize = opt.fontSize; //字体大小
    label3d.fontColor = opt.fontColor; //字体颜色，白色
    if (opt.text != "" && opt.text != undefined) {
      label3d.text = opt.text;
    }
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
function listenersHeight() {
  if (window.entityLabelList.length > 0) {
    var length = window.entityLabelList.length;
    for (var i = length - 1; i > -1; i--) {
      window.entityLabelList[i].delete();
      window.entityLabelList.splice(i, 1);
    }
  }
  let convertUnit = window.oldUnit + "-" + window.newUnit;
  window.labelObj.forEach(item => {
    const num1IndexStart = item.text.indexOf("：") + 1;
    const num1IndexEnd = item.text.indexOf(window.oldUnit);
    let newData = window.convertObj[convertUnit](
        Number(item.text.slice(num1IndexStart, num1IndexEnd))
    );
    item.text = "高度差：" + newData.toFixed(2) + window.newUnit;
    var label3d = window.addLabel3D(item);
    window.entityLabelList.push(label3d);
  });
}
export default measureHeightStarts;
export const listenerHeight = listenersHeight;
