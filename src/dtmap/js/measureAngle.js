window.pointLineList = [];
window.nodeMoveList = [];
window.laberMoveList = [];
window.entityLineList = []; // 用来存放标签多边形实体
window.entityLabelList = []; // 用来存放标签实体
window.labelObj = []; // 用于存放标签对象
function measureAngleStarts() {
  window.convertObj = {
    // 相同数据转换
    "°-°": function(value) {
      return value;
    },
    "rad-rad": function(value) {
      return value;
    },
    // 转换数据的公式
    "°-rad": function(value) {
      return (value * Math.PI) / 180;
    },
    "rad-°": function(value) {
      return (value * 180) / Math.PI;
    }
  };
  if (window.endMeasure) {
    window.endMeasure(); // 先解绑事件
  }
  window.endMeasure = endMeasure; // 暴露结束测量方法出去,方便以后绑定事件先解绑之前事件
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
    if (rayok) {
      if (hit) {
        point = hit.point; //Vector3
      }
    }
    hit.delete();

    //鼠标左键点击
    if (event.button == 0) {
      window.pointLineList.push(point); //记录点击的节点坐标

      //两个节点确定一条线
      if (window.pointLineList.length > 1) {
        var pointArr = new Array();
        pointArr.push(window.pointLineList[window.pointLineList.length - 2]);
        pointArr.push(window.pointLineList[window.pointLineList.length - 1]);
        var polylineObj = {
          width: 1.5,
          alpha: 1,
          pointArr: pointArr,
          color: Li.Color.fromRgb(83, 255, 26, 255),
          altitude: Li.AltitudeMethod.Absolute,
          name: "polyline",
          id: "measure"
        };
        var polyline = drawPolyline(polylineObj);
        window.entityLineList.push(polyline);

        if (window.pointLineList.length > 2) {
          let list = [];
          list.push(window.pointLineList[window.pointLineList.length - 3]);
          list.push(window.pointLineList[window.pointLineList.length - 2]);
          list.push(window.pointLineList[window.pointLineList.length - 1]);

          let vec1 = Li.Vector3.subtract(list[1], list[0]);
          let vec2 = Li.Vector3.subtract(list[1], list[2]);
          let v1 = vec1.normalize();
          let v2 = vec2.normalize();
          let dot = Li.Vector3.dot(v1, v2);
          let angle = (Math.acos(dot) * 180.0) / Math.PI;

          //标签
          var labelObj = {
            position: window.pointLineList[window.pointLineList.length - 2],
            text: angle.toFixed(2).toString() + "°",
            fontSize: 20,
            fontColor: Li.Color.fromRgb(255, 255, 26, 255),
            translucencyByDistance: Li.Vector4.create(30000, 1.0, 1.0e5, 0.7),
            name: "label",
            id: "measure"
          };

          let convertUnit = "°-" + window.form.region;
          let convertaAngleSize = window.convertObj[convertUnit](angle).toFixed(
            2
          );
          labelObj.text = convertaAngleSize + window.form.region;
          
          window.labelObj.push(labelObj);
          var label3d = addLabel3D(labelObj);
          window.entityLabelList.push(label3d);
        }
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
      var pointArr = new Array();
      pointArr.push(window.pointLineList[window.pointLineList.length - 1]);
      pointArr.push(point);
      var polylineObj = {
        width: 1.5,
        alpha: 1,
        pointArr: pointArr,
        color: Li.Color.fromRgb(83, 255, 26, 255),
        altitude: Li.AltitudeMethod.Absolute,
        name: "move"
      };
      var polyline = drawPolyline(polylineObj);
      window.nodeMoveList.push(polyline);
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
  window.addLabel3D = addLabel3D;
}
function listenersAngle() {
  if (window.entityLabelList.length > 0) {
    var length = window.entityLabelList.length;
    for (var i = length - 1; i > -1; i--) {
      window.entityLabelList[i].delete();
      window.entityLabelList.splice(i, 1);
    }
  }
  let convertUnit = window.oldUnit + "-" + window.newUnit;
  //   console.log(convertUnit);
  //   console.log(window.labelObj);
  window.labelObj.forEach(item => {
    // console.log(item.text);
    // console.log(window.oldUnit, window.newUnit);
    const num1IndexStart = 0;
    const num1IndexEnd = item.text.indexOf(window.oldUnit);
    // console.log(num1IndexStart, num1IndexEnd);
    // console.log(item.text.slice(num1IndexStart, num1IndexEnd));
    let newData = window.convertObj[convertUnit](
      item.text.slice(num1IndexStart, num1IndexEnd)
    );
    item.text = Number(newData).toFixed(2) + window.newUnit;
    var label3d = window.addLabel3D(item);
    window.entityLabelList.push(label3d);
  });
}
export default measureAngleStarts;
export const listenerAngle = listenersAngle;
