window.linedistance = 0;
window.pointLineList = [];
window.nodeMoveList = [];
window.laberMoveList = [];
window.entityLineList = [];
window.entityLabelList = [];
window.labelObj = []; // 用于存放标签对象
function measureAreaStarts() {
  window.convertObj = {
    // 相同数据转换
    "m-m": function(value) {
      return value;
    },
    "km-km": function(value) {
      return value;
    },
    "nmi-nmi": function(value) {
      return value;
    },
    "丈-丈": function(value) {
      return value;
    },
    // 转换数据的公式
    "m-km": function(value) {
      return value * 0.001;
    },
    "m-nmi": function(value) {
      return value / 1852;
    },
    "m-丈": function(value) {
      return (value / 10) * 3;
    },
    "km-m": function(value) {
      return value * 1000;
    },
    "nmi-m": function(value) {
      return value * 1852;
    },
    "丈-m": function(value) {
      return (value * 10) / 3;
    },
    "km-nmi": function(value) {
      return value / 1.852;
    },
    "km-丈": function(value) {
      return value * 300;
    },
    "nmi-km": function(value) {
      return value * 1.852;
    },
    "丈-km": function(value) {
      return value / 300;
    },
    "nmi-丈": function(value) {
      return value * 555.6;
    },
    "丈-nmi": function(value) {
      return value / 555.6;
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
      if (window.pointLineList.length == 0) {
        window.linedistance = 0; //清空上次测量结果
      }
      window.pointLineList.push(point); //记录点击的节点坐标
      //当是一个起始节点时,需要添加一个标签
      var labelObj = {
        position: point,
        text: "起点",
        fontSize: 14,
        fontColor: Li.Color.fromRgb(255, 255, 26, 255),
        translucencyByDistance: Li.Vector4.create(30000, 1.0, 1.0e5, 0.7),
        name: "label"
        // id: "起点",
      };
      if (window.pointLineList.length == 1) {
        window.labelObj.push(labelObj);
        var label3d = addLabel3D(labelObj);
        window.entityLabelList.push(label3d);
      }
      //两个节点确定一条线
      if (window.pointLineList.length > 1) {
        var pointArr = new Array();
        pointArr.push(window.pointLineList[window.pointLineList.length - 2]);
        pointArr.push(window.pointLineList[window.pointLineList.length - 1]);
        var polylineObj = {
          width: 3,
          alpha: 1,
          pointArr: pointArr,
          color: Li.Color.fromRgb(83, 255, 26, 255),
          altitude: Li.AltitudeMethod.Absolute,
          depthTest: false,
          name: "polyline"
          // id: "measure",
        };
        var polyline = drawPolyline(polylineObj);
        window.entityLineList.push(polyline);
        //水平距离
        var distance = Li.Cartesian3.distance(
          window.pointLineList[window.pointLineList.length - 2].toCartesian3(),
          window.pointLineList[window.pointLineList.length - 1].toCartesian3()
        ).toFixed(2);
        //累积多个节点的距离，总长度
        var opt = {
          num1: window.linedistance,
          num2: distance
        };
        window.linedistance = numAdd(opt);
        let convertUnit = "m-" + window.form.region;
        console.log(convertUnit, window.convertObj);
        let convertLinedistance = window.convertObj[convertUnit](
          window.linedistance
        ).toFixed(2);
        let convertDistance = window.convertObj[convertUnit](
          Number(distance)
        ).toFixed(2);
        if (window.pointLineList.length == 2) {
          //标签
          labelObj.text = convertLinedistance + window.form.region;
        } else if (window.pointLineList.length > 2) {
          //标签
          labelObj.text =
            "总长:" +
            convertLinedistance +
            window.form.region +
            "\n" +
            "(+" +
            convertDistance +
            window.form.region +
            ")";
        }
        window.labelObj.push(labelObj);
        var label3d = addLabel3D(labelObj);
        window.entityLabelList.push(label3d);
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
        depthTest: false,
        name: "move"
      };
      var polyline = drawPolyline(polylineObj);
      window.nodeMoveList.push(polyline);
    }
  }
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
  // 画线
  function drawPolyline(opt) {
    var polyline = new Li.Polyline3D();
    for (var i = 0; i < opt.pointArr.length; i++) {
      polyline.addPoint(opt.pointArr[i]);
    }
    polyline.alpha = opt.alpha >= 1 ? 0.99 : opt.alpha; //alpha透明度不能设置为1.0
    polyline.color = opt.color;
    polyline.depthTest = opt.depthTest;
    polyline.setWidth(opt.width);
    polyline.setAltitudeMethod(opt.altitude);
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
  // 相加
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
  // 加标签
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
  window.addLabel3D = addLabel3D;
}
function listenersLength() {
  if (window.entityLabelList.length > 0) {
    var length = window.entityLabelList.length;
    for (var i = length - 1; i > -1; i--) {
      window.entityLabelList[i].delete();
      window.entityLabelList.splice(i, 1);
    }
  }
  let convertUnit = window.oldUnit + "-" + window.newUnit;
  window.labelObj.forEach(item => {
    if (item.text.indexOf("总") == -1 && item.text != "起点") {
      let data = Number(item.text.slice(0, -window.oldUnit.length));
      let newData = window.convertObj[convertUnit](data);
      item.text = newData.toFixed(2) + window.newUnit;
    }
    if (item.text.indexOf("总") > -1) {
      const num1IndexStart = item.text.indexOf(":") + 1;
      const num1IndexEnd = item.text.indexOf(window.oldUnit);
      const num2IndexStart = item.text.indexOf("+") + 1;
      const num2IndexEnd = item.text.lastIndexOf(window.oldUnit);
      let newData1 = window.convertObj[convertUnit](
        item.text.slice(num1IndexStart, num1IndexEnd)
      );
      let newData2 = window.convertObj[convertUnit](
        item.text.slice(num2IndexStart, num2IndexEnd)
      );
      // console.log(newData1,newData2);
      item.text =
        "总长:" +
        Number(newData1).toFixed(2) +
        window.newUnit +
        "\n(+" +
        Number(newData2).toFixed(2) +
        window.newUnit +
        ")";
    }
    var label3d = window.addLabel3D(item);
    window.entityLabelList.push(label3d);
  });
}
export default measureAreaStarts;
export const listenerLength = listenersLength;
