<template>
    <div class="measure" v-if="showMeasure">
        <div class="title">
            <div class="left">图上量算</div>
            <div class="right" @click="closeMeasure">X</div>
        </div>
        <div class="content">
            <div class="box">
                <div class="measureOption1">
                    <div @click="startMeasure">
                        <div class="one">
                            <img src="../../assets/image图片/尺子.png" />
                        </div>
                        距离量算
                    </div>
                    <div @click="startMeasure">
                        <div class="two">
                            <img src="../../assets/image图片/面积.png" />
                        </div>
                        水平面积
                    </div>
                    <div>
                        <div class="three">
                            <img src="../../assets/image图片/角度.png" />
                        </div>
                        角度
                    </div>
                </div>
            </div>
            <div class="box">
                <div class="measureOption2">
                    <div>
                        <div class="four">
                            <img src="../../assets/image图片/高度.png" />
                        </div>
                        高度测量
                    </div>
                    <div>
                        <div class="five">
                            <img src="../../assets/image图片/体积.png" />
                        </div>
                        体积测量
                    </div>
                </div>
            </div>
            <div class="conversion">
                <el-form ref="form" :model="form" label-width="80px">
                    <el-form-item label="单位" style="color: #fff">
                        <el-select
                            v-model="form.region"
                            placeholder="米"
                            class="ss"
                        >
                            <el-option label="米" value="m"></el-option>
                            <el-option label="公里" value="km"></el-option>
                            <el-option label="海里" value="nmi"></el-option>
                            <el-option label="丈" value="zhang"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <el-button type="primary" style="width: 90%" @click="clearMeasure"
                >清空测量数据</el-button
            >
        </div>
    </div>
</template>

<script>
window.linedistance = 0;
window.entityLineList = [];
window.entityLabelList = [];
window.pointLineList = [];
window.nodeMoveList = [];
window.laberMoveList = [];
window.labelObj = []; // 用于存放标签对象
window.convertObj = {
    // 相同数据转换
    "m-m": function (value) {
        return value;
    },
    "km-km": function (value) {
        return value;
    },
    "nmi-nmi": function (value) {
        return value;
    },
    "zhang-zhang": function (value) {
        return value;
    },
    // 转换数据的公式
    "m-km": function (value) {
        return value * 0.001;
    },
    "m-nmi": function (value) {
        return value / 1852;
    },
    "m-zhang": function (value) {
        return (value / 10) * 3;
    },
    "km-m": function (value) {
        return value * 1000;
    },
    "nmi-m": function (value) {
        return value * 1852;
    },
    "zhang-m": function (value) {
        return (value * 10) / 3;
    },
    "km-nmi": function (value) {
        return value / 1.852;
    },
    "km-zhang": function (value) {
        return value * 300;
    },
    "nmi-km": function (value) {
        return value * 1.852;
    },
    "zhang-km": function (value) {
        return value / 300;
    },
    "nmi-zhang": function (value) {
        return value * 555.6;
    },
    "zhang-nmi": function (value) {
        return value / 555.6;
    },
};
export default {
    name: "Measure",
    props: ["showMeasure"],
    methods: {
        // 关闭测量
        closeMeasure() {
            this.$emit("update:showMeasure", false);
        },
        startMeasure() {
            document
                .getElementById("qtcanvas")
                .addEventListener("mousedown", this.MouseDownEvent);
            document.getElementById("qtcanvas").style.cursor = "crosshair";
            document
                .getElementById("qtcanvas")
                .addEventListener("mousemove", this.MouseMoveEvent);
        },
        // 结束测量
        endMeasure() {
            document
                .getElementById("qtcanvas")
                .removeEventListener("mousedown", this.MouseDownEvent);
            document.getElementById("qtcanvas").style.cursor = "default";
            document
                .getElementById("qtcanvas")
                .removeEventListener("mousemove", this.MouseMoveEvent);
        },
        MouseDownEvent(event) {
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
                    translucencyByDistance: Li.Vector4.create(
                        30000,
                        1.0,
                        1.0e5,
                        0.7
                    ),
                    name: "label",
                    // id: "起点",
                };
                if (window.pointLineList.length == 1) {
                    window.labelObj.push(labelObj);
                    var label3d = this.addLabel3D(labelObj);
                    window.entityLabelList.push(label3d);
                }
                //两个节点确定一条线
                if (window.pointLineList.length > 1) {
                    var pointArr = new Array();
                    pointArr.push(
                        window.pointLineList[window.pointLineList.length - 2]
                    );
                    pointArr.push(
                        window.pointLineList[window.pointLineList.length - 1]
                    );
                    var polylineObj = {
                        width: 3,
                        alpha: 1,
                        pointArr: pointArr,
                        color: Li.Color.fromRgb(83, 255, 26, 255),
                        altitude: Li.AltitudeMethod.Absolute,
                        depthTest: false,
                        name: "polyline",
                        // id: "measure",
                    };
                    var polyline = this.drawPolyline(polylineObj);
                    window.entityLineList.push(polyline);
                    //水平距离
                    var distance = Li.Cartesian3.distance(
                        window.pointLineList[
                            window.pointLineList.length - 2
                        ].toCartesian3(),
                        window.pointLineList[
                            window.pointLineList.length - 1
                        ].toCartesian3()
                    ).toFixed(2);
                    //累积多个节点的距离，总长度
                    var opt = {
                        num1: window.linedistance,
                        num2: distance,
                    };
                    window.linedistance = this.numAdd(opt);
                    let convertUnit = "m-" + this.form.region;
                    let convertLinedistance = window.convertObj[convertUnit](
                        window.linedistance
                    ).toFixed(2);
                    let convertDistance = window.convertObj[convertUnit](
                        Number(distance)
                    ).toFixed(2);
                    if (window.pointLineList.length == 2) {
                        //标签
                        labelObj.text = convertLinedistance + this.form.region;
                    } else if (window.pointLineList.length > 2) {
                        //标签
                        labelObj.text =
                            "总长:" +
                            convertLinedistance +
                            this.form.region +
                            "\n" +
                            "(+" +
                            convertDistance +
                            this.form.region +
                            ")";
                    }
                    window.labelObj.push(labelObj);
                    var label3d = this.addLabel3D(labelObj);
                    window.entityLabelList.push(label3d);
                }
            } else if (event.button == 2) {
                if (window.nodeMoveList.length > 0) {
                    window.nodeMoveList[
                        window.nodeMoveList.length - 1
                    ].delete(); //删除鼠标移动中前一帧创建的线实体
                }
                window.nodeMoveList = [];
                if (window.laberMoveList.length > 0) {
                    window.laberMoveList[
                        window.laberMoveList.length - 1
                    ].delete(); //删除鼠标移动中前一帧创建的线实体
                }
                window.laberMoveList = [];
                window.pointLineList = [];
                this.endMeasure();
            }
        },
        MouseMoveEvent(event) {
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
                pointArr.push(
                    window.pointLineList[window.pointLineList.length - 1]
                );
                pointArr.push(point);

                var polylineObj = {
                    width: 1.5,
                    alpha: 1,
                    pointArr: pointArr,
                    color: Li.Color.fromRgb(83, 255, 26, 255),
                    altitude: Li.AltitudeMethod.Absolute,
                    depthTest: false,
                    name: "move",
                };
                var polyline = this.drawPolyline(polylineObj);
                window.nodeMoveList.push(polyline);
            }
        },
        // 画线
        drawPolyline(opt) {
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
        },
        // 相加
        numAdd(opt) {
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
        },
        // 加标签
        addLabel3D(opt) {
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
        },
        // 清除测量数据
        clearMeasure() {
            window.labelObj = [];
            if (
                window.entityLineList.length > 0 ||
                window.entityLabelList.length > 0
            ) {
                var length = window.entityLineList.length;
                for (var i = length - 1; i > -1; i--) {
                    window.entityLineList[i].delete();
                    window.entityLineList.splice(i, 1);
                }
                length = window.entityLabelList.length;
                for (var i = length - 1; i > -1; i--) {
                    window.entityLabelList[i].delete();
                    window.entityLabelList.splice(i, 1);
                }
            }
        },
    },
    data() {
        return {
            form: {
                region: "m",
            },
            unit: "m", // 存放监控转换单位值
        };
    },
    watch: {
        form: {
            handler(newValue) {
                let oldUnit, newUnit;
                oldUnit = this.unit;
                newUnit = newValue.region;
                this.unit = newValue.region; // 值转变，用于下次触发
                if (window.entityLabelList.length > 0) {
                    var length = window.entityLabelList.length;
                    for (var i = length - 1; i > -1; i--) {
                        window.entityLabelList[i].delete();
                        window.entityLabelList.splice(i, 1);
                    }
                }
                let convertUnit = oldUnit + "-" + newUnit;
                window.labelObj.forEach((item) => {
                    console.log(Number(item.text));
                    if (item.text.indexOf("总") == -1 && item.text != "起点") {
                        let data = Number(item.text.slice(0, -oldUnit.length));
                        let newData = window.convertObj[convertUnit](data);
                        item.text = newData.toFixed(2) + newUnit;
                    }
                    if (item.text.indexOf("总") > -1) {
                        const num1IndexStart = item.text.indexOf(":") + 1;
                        const num1IndexEnd = item.text.indexOf(oldUnit);
                        const num2IndexStart = item.text.indexOf("+") + 1;
                        const num2IndexEnd = item.text.lastIndexOf(oldUnit);
                        let newData1 = window.convertObj[convertUnit](
                            item.text.slice(num1IndexStart, num1IndexEnd)
                        );
                        let newData2 = window.convertObj[convertUnit](
                            item.text.slice(num2IndexStart, num2IndexEnd)
                        );
                        item.text =
                            "总长:" +
                            newData1.toFixed(2) +
                            newUnit +
                            "\n(+" +
                            newData2.toFixed(2) +
                            newUnit +
                            ")";
                    }
                    var label3d = this.addLabel3D(item);
                    window.entityLabelList.push(label3d);
                });
            },
            deep: true,
            immediate: true,
        },
    },
};
</script>

<style scoped>
.measure {
    position: absolute;
    top: 80px;
    right: 16px;
    z-index: 20;
    background-color: rgba(36, 56, 72, 0.9);
    color: #fff;
    width: 400px;
    text-align: center;
}
.measure .title {
    height: 36px;
    background-image: url("../../assets/image图片/baseMaginTitle.png");
}
.measure .title .left {
    float: left;
    height: 36px;
    line-height: 36px;
    margin-left: 6px;
}
.measure .title .right {
    float: right;
    width: 16px;
    height: 36px;
    line-height: 36px;
    margin-right: 6px;
    cursor: pointer;
}
.measure .title .right:hover {
    color: rgba(45, 133, 240, 0.8);
}
.measure .measureOption1 {
    width: 70%;
}
.measure .measureOption2 {
    width: 46%;
}
.measure .content {
    position: relative;
    width: 400px;
    height: 370px;
}
.measure .box {
    display: flex;
    justify-content: center;
}
.measure .measureOption1,
.measure .measureOption2 {
    margin: 16px 0;
    /* border: 1px solid green; */
    display: flex;
    justify-content: space-between;
}
.measure .measureOption1 > div,
.measure .measureOption2 > div {
    display: inline-block;
}
.measure .measureOption1 > div:hover {
    color: rgba(45, 133, 240, 0.8);
    cursor: pointer;
}
.measure .measureOption2 > div:hover {
    color: rgba(45, 133, 240, 0.8);
    cursor: pointer;
}
.measure .measureOption1 > div div,
.measure .measureOption2 > div div {
    width: 60px;
    height: 60px;
    line-height: 60px;
    margin-bottom: 10px;
    /* border: 1px solid green; */
    border-radius: 50%;
    text-align: center;
}
.measure .measureOption1 .one {
    background-color: rgb(215, 116, 9);
}
.measure .measureOption1 .two {
    background-color: rgb(91, 228, 245);
}
.measure .measureOption1 .three {
    background-color: rgb(154, 210, 42);
}
.measure .measureOption2 .four {
    background-color: rgb(76, 187, 61);
}
.measure .measureOption2 .five {
    background-color: rgb(102, 213, 160);
}
.measure .content .measureOption1 img,
.measure .content .measureOption2 img {
    width: 40px;
    height: 40px;
    vertical-align: middle;
}
.measure .conversion {
    margin-bottom: 16px;
}
</style>
