//var viewer = GlobalViewer;
//var scene = viewer.scene;
//var globe = scene.globe;
//var camera = scene.mainCamera;
//var cameraController = camera.cameraController;

//import data from "./data.js";

var Utils = {};

//测试对象
Utils.polylines = [];           //js画线
Utils.polyline3d = null;        //折线
Utils.polygon3d = null;         //多边形
Utils.billboardEntity = null;   //billboard图片
Utils.label3d = null;           //标签
Utils.billboardCollection = null;   //billboard合集
Utils.arclayer = null;          //弧线层
Utils.geoPointLayer = null;     //点层
Utils.geoPickPointLayer = null; //点拾取图层
Utils.GeoJsonModel = null;      //拾取标签
Utils.GeoJsonBillboards = null; //拾取疫情标签
Utils.GeoJsonFeatures = null;   //拾取高亮显示二维面/(核酸率/疫苗率)
Utils.TrackPath = null;         //轨迹
Utils.geoLabelLayer = null;     //标签层
Utils.geoPolylineLayer = null;  //折线层
Utils.geoPolygonLayer = null;   //多边形层
Utils.PolygonQueryLayer = null; 
Utils.heatmap = null;           //热力图
Utils.heatmap3d = null;         //三维热力图
Utils.extrudeEntity = null;     //拉伸多边形
Utils.extrudePipe = null;       //拉伸管线
Utils.tiandituMark = null;      //注记
Utils.tiandituImagery = null;   //影像
Utils.tiandituZone = null;      //区划 
Utils.tilesetLayer = null;      //tileset层, 切换白模与纹理
Utils.BIM_tilesetLayer = null;  //BIM测试
Utils.terrainFlattenMask = null;   //地形修改(压平)
Utils.modelLayer = null;        
Utils.meshLayer1 = null;
Utils.meshLayer2 = null;
Utils.meshLayer3 = null;
Utils.waterLayer = null;
Utils.decalLayer = null;
Utils.decalLayer1 = null;
Utils.shapefileLayer = null;
Utils.DZSB = null;           //电子哨兵
Utils.ThreeAreas = null;    //三区图
Utils.ClipVolume = null;    //裁切体
Utils.FPSController = null; //fps控制器
Utils.pipeLine = null;      //地下管线
Utils.geoFencing = null;    //地理围栏

//StringMap对象的函数 size(), set(vectorSize-1, 11),  push_back(), resize(20, 0), get()

//起始点
Utils.startingPoint = function ()
{
    // let p = Li.Cartographic.fromDegrees(114.054494, 22.540745, 10000);
    // let scene = window.scene;
    // scene.mainCamera.cameraController().flyToCartographic(p, 3, 0, -90, 0);
    //or
    let camera = window.scene.mainCamera;
    camera.flyTo(
        Li.Cartographic.fromDegrees(114.054494, 22.540745, 6000)
      );
}

Utils.flyTo = function (lng, lat, h)
{
    let camera = window.scene.mainCamera;
    camera.flyTo(
        Li.Cartographic.fromDegrees(lng, lat, h)
      );
}

//拾取屏幕点对应的坐标
Utils.pick = function (scene, x, y, includeTerrainSurface)
{
    var globe = scene.globe;
    //var ray = scene.mainCamera.cameraController.getPickRay(x, y);
    var ray = scene.mainCamera.screenPointToRay(x, y);
    var pickPos = Li.Cartesian3.create(0, 0, 0);
    var ret = globe.pick(ray, pickPos);

    if (ret)
    {
        if (includeTerrainSurface)
        {
            var carto = Li.Cartographic.fromCartesian(pickPos);
            var h = globe.getHeight(carto, true);
            carto.height = h;
            return carto.toCartesian3();
        }

        return pickPos;
    }
    
    return Li.Cartesian3.create(0, 0, 0);
}

//获取卡托坐标对应 mesh点高度
Utils.getMeshHeight = function(scene, carto)
{
    let v1 = Li.Cartographic.create(carto.longitude, carto.latitude, 0).toVector3();
    let v2 = Li.Cartographic.create(carto.longitude, carto.latitude, 500).toVector3();
    let ray = Li.Ray.create(v2, Li.Vector3.subtract(v1, v2).normalize());
    var hit = new Li.RaycastHit();
    
    let result = null;
    if (scene.raycast(ray, hit))
    {
        console.log("hit");
        result = hit.point.toCartographic();
    }
    hit.delete();

    return (result == null) ? 0.0 : result.height;
}


//计算角度, 两个向量求角度
Utils.angleBetweenTwoVectors = function (vec1, vec2)
{
    let v1 = vec1.normalize();
    let v2 = vec2.normalize();

    let dot = Li.Vector3.dot(v1, v2);
    let angle = Math .acos(dot) * 180.0 / Math.PI;
    return angle;
}

//计算夹角, 这个示例是用两条向量
Utils.calculateAngle = function (list)
{
    if (list.lenght < 3)
        return;
    
    let vec1 = Li.Vector3.subtract(list[1], list[0]) ; //向量1
    let vec2 = Li.Vector3.subtract(list[1], list[2]);   //向量2

    return Utils.angleBetweenTwoVectors(vec1, vec2);
}

//角度测试
Utils.getAngleTest = function ()
{
    let list = [];
    list.push(Li.Vector3.create(-2402532.2333403523, 5383391.446522082, 2426504.212788312));
    list.push(Li.Vector3.create(-2402680.7006334886, 5383313.57741301, 2426531.4581943545));
    list.push(Li.Vector3.create(-2402629.022286989, 5383269.794494778, 2426678.6273100832));

    let angle = Utils.calculateAngle(list);

    console.log("角度是: " + angle);
}

//正北
Utils.trueNorth = function(scene, canvas)
{
    if (scene == undefined || canvas == undefined)
        return;
    
    var globe = scene.globe;
    if (!globe)
        return;
    
    var screenCenterX = canvas.width / 2.0;
    var screenCenterY = canvas.height / 2.0;
    var pickPt = Utils.pick(scene, screenCenterX, screenCenterY, false);
    var pick_carto = pickPt.toCartographic();

    var camera = scene.mainCamera;
    pick_carto.height = camera.transform.cartographic.height;
    pickPt = pick_carto.toCartesian3();
    camera.flyTo(Li.Cartographic.fromCartesian(pickPt));
}


//scene.sun.castShadow = false; //关闭整个场景的阴影
//entity.renderer.castShadow = false; //单个物体关闭阴影.

//设置太阳参数
Utils.setSun = function(scene, color, intensity, haloSize, castShadow, shadowBias)
{
    var sun = scene.sun;
    sun.color = color;
    sun.intensity = intensity;
    sun.haloSize = haloSize;
    sun.castShadow = castShadow;
    sun.shadowBias = shadowBias;
}

//设置日期时间
Utils.setDataTime = function(timeSystem, year, month, day, hour, minute)
{
    timeSystem.setYear(year);
    timeSystem.setMonth(month);
    timeSystem.setDay(day);
    timeSystem.setHour(hour);
    timeSystem.setMinute(minute);
}

//设置时间
Utils.setHour = function(timeSystem, hour)
{
    timeSystem.setHour(hour);
}

//创建事件监听
Utils.frameAction = null;
Utils.createFrameAction = function (scene)
{
    if (Utils.frameAction == null)
    {
        var frameAction = new Li.FrameAction();
        // frameAction._onTriggered = function (deltaSeconds) {
        //     // run in every frame update, if is enabled
        //     console.log('actionframe : ' + deltaSeconds);
        // };
    
        frameAction.onTriggered(Utils.rotateAround);
        scene.rootEntity.addComponent(frameAction); 
        Utils.frameAction = frameAction;
    }
    else
    {
        Utils.frameAction.delete();
        Utils.frameAction = null;
    }
}

Utils.rotateAround = function (dt)
{
    console.log('actionframe : ' + dt);
}

//基于视点旋转
Utils.rotateAroundViewPoint = function ()
{
    // let scene = window.scene;
    // let camController = scene.mainCamera.cameraController()

    // var camPos = scene.mainCamera.transform.position;
    // var pitch = -30;
    // var angle = 360 / 30;
    // var distance = 5000;

    // var initialHeading = camController.heading;
    // var initialPitch = camController.pitch;

    // Utils.createFrameAction(scene);
}

//加载精模
Utils.cfjmModel = null; //长富模型
Utils.neoModel = null;  //neo模型
Utils.syscModel = null; //sysc模型
Utils.cfjmMark = null;  //长富遮罩
Utils.neoMark = null;   //neo遮罩
Utils.syscMark = null; //sysc遮罩
Utils.bimMark = null;   //bim遮罩

//测试加载长富大厦, neo大厦, sysc大厦
Utils.loadModels = function (scene, baseUrl)
{
    if (Utils.cfjmModel == null)
    {
        Utils.cfjmModel = Utils.loadCFJMModel();
    }
    else
    {
        //Utils.cfjmModel.enabled = !Utils.cfjmModel.enabled;  //显示/隐藏
        ////or
        if(Utils.tilesetLayer)
            Utils.removeFlatenMask(Utils.tilesetLayer.tileset(), Utils.cfjmMark);
        Utils.cfjmModel.delete(); //删除测试
        Utils.cfjmModel = null;
    }
    // if (Utils.neoModel == null)
    // {
    //     Utils.neoModel = Utils.loadNEOModel();
    // }
    
    // if (Utils.syscModel == null)
    // {
    //     Utils.syscModel = Utils.loadSyscModel();
    // }
}

//加载长富大厦模型
Utils.loadCFJMModel = function ()
{
    let cfjmUrl = baseUrl + "data/gltf/CFJM/CFJM-0425.gltf"; //
    let cfjmPos = Li.Cartographic.fromDegrees(114.0553576, 22.5099829, 191.5144);
    let cfjmRotation = Li.Vector3.create(0, 0, 45);
    let cfjmOffset = Li.Vector3.create(0, 0, 0);
    var cfjmModel = Utils.modelLayer(cfjmUrl, cfjmPos, cfjmRotation, cfjmOffset);
    //Utils.loadModel(scene, cfjmUrl, cfjmPos, cfjmRotation);
     
    if (Utils.tilesetLayer != null)
    {
        let list = [];
        list.push(Li.Vector3.create(-2402532.2333403523, 5383391.446522082, 2426504.212788312));
        list.push(Li.Vector3.create(-2402680.7006334886, 5383313.57741301, 2426531.4581943545));
        list.push(Li.Vector3.create(-2402629.022286989, 5383269.794494778, 2426678.6273100832));
        list.push(Li.Vector3.create(-2402484.4256239715, 5383347.953930089, 2426647.7725969264));
        list.push(Li.Vector3.create(-2402532.2333403523, 5383391.446522082, 2426504.212788312));

        //添加遮罩
        Utils.cfjmMark = Utils.addFlattenMask(Utils.tilesetLayer.tileset(), list); 
    }
        
    return cfjmModel;
}

//加载neo模型
Utils.loadNEOModel = function ()
{
    let neoUrl = baseUrl + "data/gltf/NEO/NEO-0425.gltf";
    let neoPos = Li.Cartographic.fromDegrees(114.02084264, 22.5393992, 200);
    let neoRotation = Li.Vector3.create(0, 0, 0);
    let neoOffset = Li.Vector3.create(0, 0, 0);
    var neoModel = Utils.modelLayer(neoUrl, neoPos, neoRotation, neoOffset);

    //neo 遮罩 (隐藏3dtiles对应区域)
    if (Utils.tilesetLayer != null)
    {
        let list = [];
        list.push(Li.Vector3.create(-2399702.16502949,5383207.798358155,2429704.9761463483));
        list.push(Li.Vector3.create(-2399743.642248111,5383247.283280651,2429571.2955604224));
        list.push(Li.Vector3.create(-2399539.5176623305,5383354.440184869,2429538.426504724));
        list.push(Li.Vector3.create(-2399516.690768532,5383335.791957523,2429601.0303096455));
        list.push(Li.Vector3.create(-2399513.3719522506,5383328.512336286,2429618.8469450516));
        list.push(Li.Vector3.create(-2399515.2752947095,5383318.727486096,2429637.738557574));
        list.push(Li.Vector3.create(-2399523.3791697742,5383305.646435599,2429659.0809916845));
        list.push(Li.Vector3.create(-2399541.1034346432,5383288.96676806,2429678.9860466123));
        list.push(Li.Vector3.create(-2399568.228461326,5383271.342859137,2429692.860472606));
        list.push(Li.Vector3.create(-2399702.16502949,5383207.798358155,2429704.9761463483));

        Utils.neoMark = Utils.addFlattenMask(Utils.tilesetLayer.tileset(), list);
    }

    return neoModel;
}

//加载sysc模型
Utils.loadSyscModel = function ()
{
    let syscUrl = baseUrl + "data/gltf/SYSC/SYSC-0425.gltf";
    let syscPos = Li.Cartographic.fromDegrees(114.065037165749, 22.559966691104, 206.6998);
    let syscRotation = Li.Vector3.create(0, 0, 0);
    let syscffset = Li.Vector3.create(0, 0, 0);

    var syscModel = Utils.modelLayer(syscUrl, syscPos, syscRotation, syscffset);
    //sysc 遮罩 (隐藏3dtiles对应区域)
    if (Utils.tilesetLayer != null)
    {
        let list = [];
        list.push(Li.Vector3.create(-2403198.9658984966, 5380579.397321981, 2432081.5000611595));
        list.push(Li.Vector3.create(-2402733.961750327, 5380794.805185519, 2432067.660209918));
        list.push(Li.Vector3.create(-2402814.965064281, 5380938.887983297, 2431667.431221078));
        list.push(Li.Vector3.create(-2402858.708241017, 5380936.505087338, 2431629.320584699));
        list.push(Li.Vector3.create(-2403259.983664783, 5380754.760363507, 2431620.1955265347));
        list.push(Li.Vector3.create(-2403261.990760002, 5380743.992725455, 2431641.4402389554));
        list.push(Li.Vector3.create(-2403199.6508022393, 5380579.338718324, 2432080.975680422));
        list.push(Li.Vector3.create(-2403198.9658984966, 5380579.397321981, 2432081.5000611595));

        Utils.syscMark = Utils.addFlattenMask(Utils.tilesetLayer.tileset(), list);
    }

    return syscModel;
}

//后期处理
// const viewer = GlobalViewer;
// let postRender = viewer.RenderSystem.postRendering;
// saturation
// contrast
// sharpen
// exposure
// autoExposure
// brightThreshold
// bloomValue

//飞到长富大厦
Utils.flyToCFJM = function (scene)
{
    var p = Li.Cartographic.fromDegrees(114.04905529, 22.5056175, 205.91);
    scene.mainCamera.cameraController().flyToCartographic(p, 3, 27.2361, -21.032, 0);
}

//飞到neo大厦
Utils.flyToNEO = function (scene)
{
    var p = Li.Cartographic.fromDegrees(114.0231305, 22.5406607, 108.978);
    scene.mainCamera.cameraController().flyToCartographic(p, 3, 146.5576, -14.04752, 0);
}

//飞到sysc大厦
Utils.flyToSYSC = function (scene)
{
    var p = Li.Cartographic.fromDegrees(114.070118, 22.557971, 131.062);
    scene.mainCamera.cameraController().flyToCartographic(p, 3, 299.864, -11.37, 0);
}

//加载modellayer
Utils.modelLayer = function(url, carto, rotation, offset)
{
    let modelLayer = new Li.ModelLayer();
    modelLayer.url = url;
    modelLayer.cartographic = carto;
    modelLayer.rotation = rotation;
    modelLayer.offset = offset;
    modelLayer.componentComplete();

    return modelLayer;
}

// add gltf/obj/fbx/dae/... 模型
Utils.loadModelSrs = function( url, srs)
{
    var model = new Li.Model(url);
    model.srs = srs;
    return model;
}

Utils.modelWithCoordinates = null;
Utils.modelCoordinates = null;
Utils.addModel = function (scene, baseUrl)
{
    if (Utils.modelWithCoordinates == null)
    //if (Utils.modelCoordinates == null)
    {
        //let url = baseUrl + "data/香蜜湖中区-TK.fbx";//xmh1.FBX   
        let url = baseUrl + "data/4403060070013900046.fbx";
        let srs = "EPSG:4547";
        let model = Utils.loadModelSrs( url, srs);

        Utils.modelCoordinates = model;
        var entity = new Li.Entity();
        entity.addComponent(model);                 
        scene.addEntity(entity);                    //添加到rootEntity的子节点中
        Utils.modelWithCoordinates = entity;
    }
    else
    {
        console.log("model enabled changed!");
        //删除
        // Utils.modelWithCoordinates.delete();
        // Utils.modelWithCoordinates = null;
        //or 显示/隐藏
        Utils.modelWithCoordinates.enabled = !Utils.modelWithCoordinates.enabled;
        
        //or
        //Utils.modelCoordinates.entity.enabled = !Utils.modelCoordinates.entity.enabled;

        // let camera = scene.mainCamera;
        // let t = Utils.modelCoordinates.transform;
        // if (t)
        // {
        //     let cartoPos = t.cartographic;    
        //     camera.flyTo(cartoPos);
        //     console.log("fly to 香蜜湖中区")
        // }
    }
}


//添加DEM
Utils.addTerrain = function(globe, baseUrl)
{
    globe.setTerrainProviderUrl(baseUrl + 'data/ft-dem-max14');
    //globe.setTerrainProviderUrl(url);
}

//设置默认地形
Utils.setDefaultTerrain = function(globe)
{
    globe.setDefaultTerrain();
}


//arcgis DOM
Utils.addArcGisMapServerImageryLayer = function(globe)
{
    globe.addArcGisMapServerImageryLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer');
}

//加载丰图wmts服务
Utils.FTWMTS = null;
Utils.addWMTSLayer = function (globe)
{
    if (Utils.FTWMTS == null)
    {
        globe.lightingEnabled = false;
        var imageryLayer = globe.addWmsImageryLayer("IgnoreAxisOrientation=1&IgnoreGetMapUrl=1&IgnoreReportedLayerExtents=1&InvertAxisOrientation=1&crs=EPSG:4326&dpiMode=7&format=image/png&layers=wmts_4326_440300&styles=default&tileMatrixSet=c&url=https://jingzhe.szft.gov.cn/sfmap/MapTileService/wmts?SERVICE%3DWMTS%26REQUEST%3DGetCapabilities%26STORETYPE%3Dmerged-dat%26LAYER%3Dwmts_4326_440300%26PROJECTION%3D4326");
        Utils.FTWMTS = imageryLayer;
        return imageryLayer;
    }
    else
    {
        globe.lightingEnabled = !globe.lightingEnabled;    
    }
   
}


//添加dom
Utils.imageLayer = null;
Utils.addImageryLayer = function(globe, minLevel, maxLevel, url, rectangle)
{
    // if (minLevel < 0)
    //     minLevel = 0;
    // if (maxLevel > 21)
    //     maxLevel = 21;
    
    if (url == undefined)
        url = "http://10.253.102.69/gw/OGC/Map/SZ_VEC_W4490_bld3d_2021/rest/w_shenzhen3d_2021/EPSG:4490/EPSG:4490:{z}/{y}/{x}?format=image%2Fpng";
    
    if (rectangle == undefined)
        rectangle = Li.Rectangle.create(-180, -90, 180, 90);
    
    var imageryProvider = new Li.UrlTemplateImageryProvider(
      url,    // url
      false,   // useWebMercator
      maxLevel,     // maximumLevel
      minLevel,      // minimumLevel
      256,    // tileWidth
      256,    // tileHeight
      true    // hasAlphaChannel
    );
    imageryProvider.setUrlFunctor(function (x, y, level) {
        var url = "http://10.253.102.69/gw/OGC/Map/SZ_VEC_W4490_bld3d_2021/rest/w_shenzhen3d_2021/EPSG:4490/EPSG:4490:" + (level - 9) + "/" + y + "/" + x + "?format=image%2Fpng";
        //consolg.log("url" + url);
        //imageryProvider.setImageUrl(x, y, level, url);
        return url;
        })

    imageryProvider.setHeader("szvsud-license-key",
        "XbZrKCXAKXNnu5cRuyXoCmg2DU8E0ztA8/27O2AS3EtAsqU6Fymn8hqiJicChJyg");
    var imageryLayer = new Li.ImageryLayer(imageryProvider, rectangle);

    Utils.imageLayer = imageryLayer;
    globe.addImageryLayer(imageryLayer);

     //删除用
    //globe.removeImageryLayer(Utils.imageLayer);

//or
    
    // var imageryLayer = globe.addWmsImageryLayer("http://10.253.102.69/gw/OGC/Map/SZ_VEC_B4490/");
    // imageryLayer.imageryProvider.setHeader("szvsud-license-key",
    // "XbZrKCXAKXNnu5cRuyXoCmg2DU8E0ztA8/27O2AS3EtAsqU6Fymn8hqiJicChJyg");
}


// type=  cva_c : 注记 img_c : 影像  vec_c : 区划
//return "https://t" + index + ".tianditu.gov.cn/DataServer?T=" + type
// + "&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff";
//Utils.tiandituMark = null; //注记
Utils.addTiandituMark = function ()
{
    if (Utils.tiandituMark == null)
    {
        var tianditu = new Li.TiandituImageryLayer();
        tianditu.url = 'https://t1.tianditu.gov.cn/DataServer?T=cva_c&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff';
        tianditu.useWebMercator = false;
        tianditu.tileWidth = 256;
        tianditu.tileHeight = 256;
        tianditu.minimumLevel = 1; 
        tianditu.maximumLevel = 17;
        tianditu.hasAlphaChannel = true;
        tianditu.isLabel = true;
        tianditu.componentComplete();
        Utils.tiandituMark = tianditu;
    }
    else
    {
        Utils.tiandituMark.enabled = !Utils.tiandituMark.enabled;
    }
}

//Utils.tiandituImagery = null;//天地图影像
Utils.addTiandituImagery = function ()
{
    if (Utils.tiandituImagery == null)
    {
        var tianditu = new Li.TiandituImageryLayer();
        tianditu.url = "https://t2.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff";     
        tianditu.useWebMercator = false;
        tianditu.tileWidth = 256;
        tianditu.tileHeight = 256;
        tianditu.minimumLevel = 1; 
        tianditu.maximumLevel = 17;
        tianditu.hasAlphaChannel = false;
        tianditu.isLabel = false;
        tianditu.componentComplete();
        Utils.tiandituImagery = tianditu;
    }
    else
    {
        Utils.tiandituImagery.enabled = !Utils.tiandituImagery.enabled;
    }
}

//Utils.tiandituZone = null; //天地图区划 
Utils.addTiandituZone = function ()
{
    if (Utils.tiandituZone == null)
    {
        var tianditu = new Li.TiandituImageryLayer();
        tianditu.url = "https://t3.tianditu.gov.cn/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=5ec3e996393521a1a9fb1681f13201ff";     
        tianditu.useWebMercator = false;
        tianditu.tileWidth = 256;
        tianditu.tileHeight = 256;
        tianditu.minimumLevel = 1; 
        tianditu.maximumLevel = 17;
        tianditu.hasAlphaChannel = false;
        tianditu.isLabel = false;
        tianditu.componentComplete();
        Utils.tiandituZone = tianditu;
    }
    else
    {
        Utils.tiandituZone.enabled = !Utils.tiandituZone.enabled;
    }
}

//添加tileset
Utils.addTilesetLayer = function (baseUrl)
{
    if (Utils.tilesetLayer == null)
    {
        let tilesetLayer = new Li.TilesetLayer();
        //tilesetLayer.url = baseUrl + "data/0326/tileset.json";
        //tilesetLayer.url = baseUrl + "data/tileset/tileset.json";
        tilesetLayer.url = baseUrl + "data/tileset_skip2_1024/tileset.json"; 
        //tilesetLayer.url = "http://124.70.80.44:8080/api/nfsfile//ningbo3d/3DTile/ningboroad/tileset.json"; //道路
   
        tilesetLayer.color = Li.Color.fromRgb(255, 251, 240, 255);
        // tilesetLayer.renderStyle = Li.RenderStyle.ColorStyle;  
        tilesetLayer.clipLevelOfDetail = true;
        tilesetLayer.componentComplete();
        Utils.tilesetLayer = tilesetLayer;
    }
    else
    {   
        //模型的渲染样式
        if (Utils.tilesetLayer.renderStyle == Li.RenderStyle.ColorStyle)
            Utils.tilesetLayer.renderStyle = Li.RenderStyle.TextureStyle;   //使用纹理渲染
        else
            Utils.tilesetLayer.renderStyle = Li.RenderStyle.ColorStyle;   //纯色渲染

        // var tileset = Utils.tilesetLayer.tileset()
        // var rect = tileset.rectangle;
        // console.log("rect:" + rect);
    }
}

//添加BIM
Utils.addBIM = function (globe, baseUrl)
{
    if (Utils.BIM_tilesetLayer == null)
    {
        var tilesetLayer = new Li.TilesetLayer();
        tilesetLayer.url = baseUrl + "data/3DTiles_JZ_0526/tileset.json";        //BIM  
        tilesetLayer.color = Li.Color.fromRgb(255, 251, 240, 255);
        tilesetLayer.clipLevelOfDetail = true;
        tilesetLayer.componentComplete();
        Utils.BIM_tilesetLayer = tilesetLayer;
       
        Utils.flyTo(113.997754, 22.549968, 500);

        if (Utils.tilesetLayer != null)
        {
            let list = [];
            list.push(Li.Vector3.create(-2396838.4163258723,5384061.074629714,2430715.5603749393));
            list.push(Li.Vector3.create(-2397026.8121557618,5383971.929765949,2430731.316087347));
            list.push(Li.Vector3.create(-2397060.3226712397,5383959.864400212,2430723.7015070166));
            list.push(Li.Vector3.create(-2397104.0552196135,5383937.611659675,2430731.6472430932));
            list.push(Li.Vector3.create(-2397085.228647451,5383913.016420042,2430806.2543280446));
            list.push(Li.Vector3.create(-2396990.5191654707,5383952.860541011,2430816.3930785935));
            list.push(Li.Vector3.create(-2396813.327910718,5384031.22613269,2430812.198456245));
            list.push(Li.Vector3.create(-2396838.4163258723,5384061.074629714,2430715.5603749393));
     
            //添加遮罩
            Utils.bimMark = Utils.addFlattenMask(Utils.tilesetLayer.tileset(), list); 
        }
        
        var plist = []; //压平的点范围
        plist.push(Li.Vector3.create(-2396827.023072084,5384044.761579189,2430762.3997741495));
        plist.push(Li.Vector3.create(-2396844.6154899057,5384059.126565873,2430713.5635993653));
        plist.push(Li.Vector3.create(-2397020.6863658414,5383973.673166854,2430729.113606531));
        plist.push(Li.Vector3.create(-2397009.208190486,5383954.839482979,2430781.792805401));
        plist.push(Li.Vector3.create(-2396827.023072084,5384044.761579189,2430762.3997741495));
        Utils.terrainFlattenMask = Utils.addTerrainFlattenMask(globe, plist, 40.2);
    }
    else
    {   
        //Utils.BIM_tilesetLayer.enabled = !Utils.BIM_tilesetLayer.enabled; //显示隐藏
        //or
        Utils.BIM_tilesetLayer.delete();  //删除bim
        Utils.BIM_tilesetLayer = null;
        if(Utils.terrainFlattenMask)
            globe.removeFlattenMask(Utils.terrainFlattenMask); //删除压平
    }
}


//tilesetlayer 显示/隐藏 测试
Utils.tilesetLayersetEnabled = function ()
{
    if (Utils.tilesetLayer != null)
    {
        Utils.tilesetLayer.enabled = !Utils.tilesetLayer.enabled;
    }
}

//加载3Dtiles 
Utils.load3DTiles = function (scene, url)
{
    var tileset = new Li.Tileset(url);
    // tileset.streamingMode = true;    // default 流式加载
    // tileset.skipLevelOfDetail = true; // default 跳过层级
    // tileset.genMeshNormals = false; // default   生成法线
    var entity = new Li.Entity();
    entity.addComponent(tileset);
    scene.addEntity(entity);
    return tileset;
}

//为3Dtiles添加遮罩
//tileset: 3dtiles对象
//list: Vector3列表(通过在屏幕pick获取的坐标列表)
Utils.addFlattenMask = function(tileset, list)
{
    //小于等于2, 不能构成一个遮罩面
    if (list.length <= 2)
    {
        return;
    }

    var mask = new Li.FlattenMask();
    mask.maskHeight = 0; // maskHeight only useful for terrain mask
    
    mask.setPoints(list);
    tileset.addFlattenMask(mask);

    return mask;
}

//地形压平
Utils.addTerrainFlattenMask = function (globe, list, height)
{
     //小于等于2, 不能构成一个遮罩面
     if (list.length <= 2)
     {
         return;
     }
 
     var mask = new Li.FlattenMask();
     mask.maskHeight = height; //设置地形高度
     
    mask.setPoints(list);
    globe.addFlattenMask(mask); //添加压平遮罩到地形
     return mask;
}

//删除遮罩
Utils.removeFlatenMask = function (tileset, mask)
{
    if (tileset != null && mask != null)
    {
        tileset.removeFlattenMask(mask);
        mask.delete();
    }
}

//树
Utils.addMeshLayer = function (baseUrl)
{
    if (Utils.meshLayer3 == null)
    {
        var shapefileLayer = new Li.ShapefileLayer();
        shapefileLayer.srs = "EPSG:4547";
        shapefileLayer.url = baseUrl + "data/trees.shp";
        shapefileLayer.componentComplete();
        Utils.shapefileLayer = shapefileLayer;
    
        var meshLayer = new Li.MeshLayer();
        meshLayer.color = Li.Color.fromRgb(77, 108, 43, 255);
        meshLayer.renderStyle = Li.RenderStyle.ColorStyle;
        meshLayer.url = baseUrl + "data/tree3.glb";
        //meshLayer.offset = Li.Vector3.create(0.0, 0.0, 0.0);
        //meshLayer.scale = Li.Vector3.create(0.01, 0.015, 0.01);
        //meshLayer.rotation = Li.Vector3.create(90, 0, 0);
        
        meshLayer.setInstances(Utils.shapefileLayer);
        meshLayer.componentComplete();
        Utils.meshLayer3 = meshLayer;
        console.log("load tree complete!");

        // if (Utils.decalLayer1 == null)
        // {
        //     var decalLayer = new Li.DecalLayer();
        //     decalLayer.addSourceLayer(meshLayer);
        //     decalLayer.componentComplete();

        //     Utils.decalLayer1 = decalLayer;
        // }
        // else
        // {
        //     Utils.decalLayer1.addSourceLayer(meshLayer);
        //     Utils.decalLayer1.changStyle();
        // }
    }
    else
    {
        Utils.meshLayer3.enabled = !Utils.meshLayer3.enabled;
        //Utils.decalLayer1.enabled = !Utils.decalLayer1.enabled;
    }
}

//绿地 道路
Utils.addDecalLayer = function (baseUrl)
{
    if (Utils.decalLayer == null)
    {
        //sx_py_1000.mesh dlm_py_1000.mesh zb_py_1000.mesh
        var meshLayer1 = new Li.MeshLayer();
        meshLayer1.color = Li.Color.fromRgb(116, 139, 171, 255);
        meshLayer1.url = baseUrl + "data/roads_sk.mesh";
        meshLayer1.url = baseUrl + "data/dlm_py_1000.mesh";
        //or
        // meshLayer1.url = baseUrl + "data/ft-road.mesh";
        // meshLayer1.componentComplete();
        // Utils.meshLayer1 = meshLayer1;

        var meshLayer2 = new Li.MeshLayer();
        meshLayer2.color = Li.Color.fromRgb(0, 128, 0, 128);
        //meshLayer2.url = baseUrl + "data/green_sk.mesh";  
        meshLayer2.url = baseUrl + "data/zb_py_1000.mesh";
        meshLayer2.componentComplete();
        Utils.meshLayer2 = meshLayer2;
        
        var decalLayer = new Li.DecalLayer();
        decalLayer.addSourceLayer(meshLayer1);
        decalLayer.addSourceLayer(meshLayer2);
        
        decalLayer.componentComplete();

        Utils.decalLayer = decalLayer;

    }
    else
    {   //隐藏/显示测试
        //Utils.decalLayer.enabled = !Utils.decalLayer.enabled;
        Utils.meshLayer1.enabled = !Utils.meshLayer1.enabled;
        console.log("mesh layer1 :" + Utils.meshLayer1.enabled);
        
        Utils.meshLayer2.enabled = !Utils.meshLayer2.enabled;
        console.log("mesh layer2 :" + Utils.meshLayer2.enabled);
    }
    
}

//创建存放顶点数据的浮点数组
Utils.getPolylineVertexData = function(pointList)
{
    if (pointList.length < 2)
        return;
    
    var length = pointList.length;
    var vertices = new Float32Array(length * 3);

    for (var i = 0; i < length; i++)
    {
        var point = pointList[i];
        vertices[i * 3 + 0] = point.x;
        vertices[i * 3 + 1] = point.y;
        vertices[i * 3 + 2] = point.z;
    }
    return vertices;
}

//使用底层库画线
Utils.drawLine = function(scene, pointList, tag)
{
    if (scene == undefined || pointList.length < 2)
        return;
    
    var polylines = this.polylines;
    if (polylines.length != 0)
    {
        for (var k = 0; k < this.polylines.length; k++)
        {
            if (polylines[k].name == tag)
                polylines.splice(k, 1);
        }
    }

    var vertexArray = Utils.getPolylineVertexData(pointList);
    var stripSize = 3 * 4; //步长（ x,y,z  * float） 
    var vertexBuffer = Li.Buffer.createVertexBuffer(vertexArray, stripSize);
    var posAttr = Li.GeometryAttribute.createPositionAttribute(vertexBuffer, 0, 3);

    var geometry = new Li.Geometry();   //创建集合体
    geometry.addAttribute(posAttr);

    var material = new Li.Material();   //创建材质
    material.bothSided = true;          //双面材质
    material.opacity = 1.0;             //透明度
    material.shadingModel = Li.ShadingModel.Unlit; //无光照
    material.color = Li.Color.fromRgb(255, 0, 0, 255);  //材质颜色 RGBA
    
    var renderer = new Li.GeometryRenderer(); //创建几何渲染器
    renderer.castShadow = true;                 //投射阴影
    renderer.type = Li.GeometryRendererType.Symbol; //符号类型渲染
    renderer.primitiveType = Li.PrimitiveType.LineStrip;    //openGL PrimitiveType： 线带
    renderer.geometry = geometry;
    renderer.material = material;

    //var boundingsphere = Li.BoundingSphere.create(pointList[0], 1000);
    //var boundingVolume = Li.BoundingVolume.fromBoundingSphere(boundingsphere);
    
    var entity = new Li.Entity();
    entity.addComponent(renderer);
    scene.addEntity(entity);
    entity.name = tag;      //添加tag, 用于删除重复物体

    polylines.push(entity);
}

//画线
Utils.createPolyline3D = function(baseUrl)
{
    if (Utils.polyline3d == null)
    {
        var polyline = new Li.Polyline3D(); //创建画线对象
        polyline.setWidth(10);             //线宽
        // polyline.alpha = 0.9;               //透明度
        //or
        polyline.setAltitudeMethod(Li.AltitudeMethod.Absolute);
        polyline.setAltitude(30);

        //添加画线所需要的点
        polyline.addPoint(Li.Vector3.create(-2401102.17803038, 5381837.221917883, 2431322.4088967624));
        polyline.addPoint(Li.Vector3.create(-2401217.6519644577, 5382036.858405292, 2430770.1142349862));
        polyline.addPoint(Li.Vector3.create(-2402878.7401228216, 5381281.544949363, 2430800.6906644125));
        polyline.addPoint(Li.Vector3.create(-2402770.937031862, 5381018.617677656, 2431484.598601653));
        polyline.addPoint(Li.Vector3.create(-2402302.095332233, 5381063.218309714, 2431846.686779186));
        polyline.addPoint(Li.Vector3.create(-2401703.776193555, 5381301.782318114, 2431909.346477503));

        polyline.color = Li.Color.fromRgb(255, 0, 0, 255); //设置线颜色

        //发光和动画组合, 纹理贴图+动画组合(Repeat在有纹理时有效), 贴图优先级高于发光
        polyline.setGlowMaterial(true); //发光
        polyline.animationRun = true;   //动画
        polyline.setImageUrl(baseUrl + "symbols/images/arrow-2.png");
        polyline.setRepeat(20);     //纹理动画的重复数量(箭头一类动画)
        //polyline.animationTimer = 3000; //动画一个周期的时间(ms), 控制动画速度

        polyline.draw();    //绘制
        polyline.end();     //end之后不能添加点
        Utils.polyline3d = polyline;
    }
    else
    {
        //Utils.polyline3d.setWidth(5.0);   //修改线宽
        //Utils.polyline3d.redraw();        //重新绘制
        //or
        Utils.polyline3d.delete();          //删除线段对象
        Utils.polyline3d = null;
    }
}

//画面
Utils.createPolygon3D = function()
{
    if (Utils.polygon3d == null)
    {
        var polygon3d = new Li.Polygon3D(); //创建画面对象
        polygon3d.color = Li.Color.fromRgb(0, 240, 120, 128);//颜色
        polygon3d.alpha = 0.5;      //透明度
        polygon3d.fillAlpha = 0.9;  //填充透明度
        polygon3d.setFillColor(Li.Color.fromRgb(33, 123, 183, 255), Li.BrushStyle.SolidPattern);

        polygon3d.addPoint(Li.Vector3.create(-2401407.954, 5382591.947, 2429380.474));
        polygon3d.addPoint(Li.Vector3.create(-2401490.6719, 5382552.657, 2429385.5099));
        polygon3d.addPoint(Li.Vector3.create(-2401492.175, 5382588.7119, 2429305.993));
        polygon3d.addPoint(Li.Vector3.create(-2401416.810, 5382619.619, 2429308.5397));
        //polygon3d.setAltitude(90);
        //polygon3d.setAltitudeMethod(Li.AltitudeMethod.Absolute); //绝对模式, 贴于地形之上
        //polygon3d.waterShader = true;   //填充水面材质, 画水面, 淹没分析之类的应用

        //默认的贴地模式有效. TerrainOnly: 覆盖地面 WholeScene: 覆盖范围内的所有场景
        //polygon3d.setSceneMode(Li.TextureProjectionSceneMode.TerrainOnly); 
        polygon3d.draw();   //绘制
        polygon3d.end();    //end之后不能添加点
        Utils.polygon3d = polygon3d;
    }
    else
    {
        Utils.polygon3d.delete();   //删除面对象
        Utils.polygon3d = null;
    }
}

//更换字体测试
Utils.fontList = ["宋体", "仿宋", "黑体", "楷体", "隶书", "幼圆", "等线", "微软雅黑",
    "方正舒体", "方正姚体", "华文彩云", "华文仿宋", "华文琥珀", "华文楷体",
    "华文隶书", "华文宋体", "华文细黑", "华文行楷", "华文新魏", "华文中宋"];
Utils.fontType = 0;
Utils.changedFont = function ()
{
    Li.FontManager.setFont(Utils.fontList[Utils.fontType]);
    Utils.fontType++;
    if (Utils.fontType >= Utils.fontList.length)
        Utils.fontType = 0;     
}

//创建一个billboard物体
Utils.createBillBoardEntity = function (baseUrl)
{
    if (Utils.billboardEntity == null)
    {
        let bbEntity = new Li.BillboardEntity();
        bbEntity.position = Li.Vector3.create(-2.39296e+06, 5.38694e+06, 2.42807e+06);
        bbEntity.scale = 1.0;
        bbEntity.imageWidth = 50;
        bbEntity.imageHeight = 35;
        bbEntity.url = baseUrl + "symbols/images/bg.png"; 


        // let strMap = new Li.StringMap();
        // strMap.set("name", "背景图片");
        // strMap.set("pos", "蛇口红树湾");
        // bbEntity.setProperties(strMap);
        // strMap.delete();
        //or
        bbEntity.addProperty("name", "背景图片");
        bbEntity.addProperty("pos", "蛇口红树湾");

        if (Utils.billboardCollection == null)
        {
            var bbcollection = new Li.BillboardCollection();
            Utils.billboardCollection = bbcollection;
        }
        bbEntity.setCollection(Utils.billboardCollection);
        Utils.billboardEntity = bbEntity;
    }
    else
    {
        Utils.billboardEntity.delete();
        Utils.billboardEntity = null;

        if (Utils.billboardCollection != null)
        {
            Utils.billboardCollection.delete();
            Utils.billboardCollection = null;
        }
    }
}

//创建一个billboard标签, 标签包含文字和图片, 可以使用外框, 如果需要图片做背景, 那么打开mix属性
Utils.createLabel3D = function (baseUrl)
{
    if (Utils.label3d == null)
    {
        var label3d = new Li.Label3D();
        label3d.position = Li.Vector3.create(-2.40124e+06, 5.38168e+06, 2.43154e+06); //
        // //label3d.url = baseUrl + "symbols/images/bank_64x64.png";
        // //or
        // //label3d.frameUrl = baseUrl + "symbols/images/Picture_Frame_127x93.png"; //frame_blue_136x115.png
        // //label3d.frameUrl = baseUrl + "symbols/images/frame_blue_136x115.png"; //gallery_frame_70x71.png
        // //label3d.frameUrl = baseUrl + "symbols/images/gallery_frame_70x71.png";
        label3d.url = baseUrl + "symbols/images/site.png";
        // //console.log(baseUrl);
        label3d.text = "中国人民银行";
        //label3d.background = Li.Color.fromRgb(0, 0, 200, 200);
        label3d.imageWidth = 20;
        label3d.imageHeight = 20; 
        label3d.fontSize = 14;
        //label3d.mix = true;
        label3d.setAltitude(100.0);
        label3d.setAltitudeMethod(Li.AltitudeMethod.Absolute);
        //label3d.lineColor = Li.Color.fromRgb(0, 0, 200, 200);
        label3d.setLineToGround(true);

        if (Utils.billboardCollection == null)
        {
            var bbcollection = new Li.BillboardCollection();
            Utils.billboardCollection = bbcollection;
        }
        
        label3d.setCollection(Utils.billboardCollection);
        //label3d.createLabel();
        Utils.label3d = label3d;
        
        // for (let i = 0; i < 10; i++)
        // {
        //     let label3d = new Li.Label3D();
        //     //label3d.position = Li.Vector3.create(-2.40124e+06, 5.38168e+06, 2.43154e+06); //
        //     label3d.position = Li.Cartographic.fromDegrees(114.0616452, 22.5586, 20 + i * 5).toVector3();
        //     label3d.url = baseUrl + "symbols/images/site.png";
        //     label3d.addProperty("name", i.toString());
        //     label3d.text = i.toString();

        //     //label3d.setCollection(Utils.billboardCollection);
        //     label3d.setCollection(Li.BillboardCollection.Instance());
        //     if (i == 5)
        //         Utils.label3d = label3d;
        //     console.log(i);
        // }
    }
    else
    {
        Utils.label3d.delete();
        Utils.label3d = null;

        ////所有标签类共用
        // if (Utils.billboardCollection != null)
        // {
        //     Utils.billboardCollection.delete();
        //     Utils.billboardCollection = null;
        // }
    }
}

//标签拾取测试
Utils.BBEntityPick = function (feature, pos)
{
    if (feature)
    {
        let bbEntity = Li.BillboardEntity.getSelect(feature);
        if (bbEntity)
        {
            Utils.getFeatureProperty(feature);
            console.log("拾取成功, 修改坐标");
            bbEntity.position = pos;
        }
    }
}

//label3d拾取测试
Utils.Label3DPick = function (feature, pos)
{
    if (feature)
    {
        let label = Li.Label3D.getSelect(feature);
        if (label)
        {
            Utils.getFeatureProperty(feature);
            console.log("拾取成功, 修改坐标");
            label.position = pos;
        }
    }
}

//geojsonpointlayer 拾取测试
Utils.PointLayerPick = function (feature)
{
    if (feature)
    {
        let pointLayer = Li.GeoJsonPointLayer.getSelect(feature);
        if (pointLayer)
        {
            Utils.getFeatureProperty(feature); 
            let id = feature.getProperty("id");
            let keys = pointLayer.getKeys();

            let size = keys.size();

            for (let i = 0; i < size; i++)
            {
                let key = keys.get(i);   
                console.log(  key + " : " +  pointLayer.getPropertie(id, key));
            }

        }
    }    
}

//获取feature中的所有属性
Utils.getFeatureProperty = function (feature)
{
    if (feature == null || feature == undefined)
        return;
    
    let nameList = feature.propertyNames();
    let size = nameList.size();

    for (let i = 0; i < size; i++)
    {
        let key = nameList.get(i);   
        let value = feature.getProperty(key);
        console.log(key + " : " + value);
    }
}


//创建一个投影标签(贴地形)
Utils.createLabelProjection = function()
{
    var labelProjection = new Li.LabelProjection();
    labelProjection.text = "labelprojection";
    labelProjection.position = Li.Vector3.create(-2.39296e+06, 5.38694e+06, 2.42807e+06);
    labelProjection.width = 100;
    labelProjection.height = 100;
}

//创建一个图片投影(贴地形)
Utils.createTextureProjection = function (scene, baseUrl)
{
    //textureProjection
    var texImage = new Li.TextureImage();
    texImage.loadImage(baseUrl + "data/bg.png");
    var tex = new Li.Texture();
    tex.addTextureImage(texImage);

    var textureProjection = new Li.TextureProjection();
    textureProjection.texture = tex;  
    textureProjection.blendMode = Li.TextureProjectionBlendMode.AlphaBlend;
    textureProjection.projectionType = Li.ProjectionType.OrthographicProjection;
    textureProjection.width = 500.0;
    textureProjection.height = 500.0;
    textureProjection.nearPlane = 1.0;
    textureProjection.farPlane = 1000.0;
    textureProjection.showFrustum = true;

    var entity = new Li.Entity();
    entity.addComponent(textureProjection);

    var pos = Li.Cartesian3.create(-2402689.89, 5382787.65, 2427702.439); 
    var carto = pos.toCartographic();
    entity.transform.cartographic = Li.Cartographic.create(carto.longitude, carto.latitude, carto.height + 100.0);
    entity.transform.lookAt(pos.toVector3());
    scene.addEntity(entity);
}

//飞线层
Utils.createArcLayer = function (baseUrl)
{
    if (Utils.arclayer == null)
    {
        var arclayer = new Li.ArcLayer();
        //arclayer.setNDJsonFile(baseUrl + "data/heathrow-flights.ndjson");
        var startPoint = Li.Cartographic.fromDegrees(114.01744008667717, 22.582023967806496, 263);

        for (var i = 0; i < 10; i++)
        {
            for(var j=0;j<10;j++)
            {
                let lon = startPoint.longitude * 180 / Math.PI + (i-5) * 1e-3;
                let lat = startPoint.latitude * 180 / Math.PI + (j-5) * 1e-3;
                let endPoint = Li.Cartographic.fromDegrees(lon, lat, 0);
                let height= window.scene.globe.getHeight(endPoint,false);
                console.log('height is :'+height);  
                let baseData = {
                    "name":"深圳市",
                    "country":"china",
                    "start":[startPoint.longitude*180/Math.PI,startPoint.latitude*180/Math.PI,startPoint.height],
                    "end":[lon,lat,50]

                };
                arclayer.addString(JSON.stringify(baseData));
            }
        }

        arclayer.animationRun = true;   //是否播放动画
        arclayer.animationTimer = 1;    //动画播放周期时间3秒
        arclayer.lineWidth = 10.0;       //线宽
        arclayer.setStartColor(Li.Color.fromRgb(0, 200, 0, 0));
        arclayer.setEndColor(Li.Color.fromRgb(0, 0, 200, 0));
        arclayer.height = 1;

        arclayer.setImageUrl(baseUrl + "symbols/images/arrow-2.png");
        arclayer.create();
        Utils.arclayer = arclayer;
    }
    else
    {
        Utils.arclayer.delete();
        Utils.arclayer = null;
    }
}

//点图层
Utils.createPointLayer = function (baseUrl)
{
    if (Utils.geoPointLayer == null)
    {
        var geoPointLayer = new Li.GeoJsonPointLayer();
        //geoPointLayer.geoJson = baseUrl + "data/futian-point-179.json";
        geoPointLayer.geoJson = baseUrl + "data/futian-point.geojson";
        geoPointLayer.url = baseUrl + "symbols/images/dot_red_32x32.png";
        geoPointLayer.clustered = true; //点聚合  true: 聚合 false: 不聚合,  默认不聚合
        geoPointLayer.create(); 
        Utils.geoPointLayer = geoPointLayer;
    }
    else
    {
        Utils.geoPointLayer.delete();
        Utils.geoPointLayer = null;
    }
}

//具有拾取功能的物体
Utils.createPickPointLayer = function (baseUrl)
{
    if (Utils.geoPickPointLayer == null)
    {
        var geoPickPointLayer = new Li.GeoJsonPickPointLayer();
        geoPickPointLayer.geoJson = baseUrl + "data/futian-point-179.json";
        //geoPickPointLayer.geoJson = baseUrl + "data/addr_work/0221.geojson";
        //geoPickPointLayer.setAltitudeMethod(Li.AltitudeMethod.Absolute);
        geoPickPointLayer.color = Li.Color.fromRgb(255, 0, 0, 128);
        geoPickPointLayer.setAltitudeMethod(Li.AltitudeMethod.OnTerrain);
        geoPickPointLayer.heightOffset = 20.0;
        
        geoPickPointLayer.create(); 
        Utils.geoPickPointLayer = geoPickPointLayer;
    }
    else
    {
        // Utils.geoPickPointLayer.delete();
        // Utils.geoPickPointLayer = null;
        Utils.geoPickPointLayer.enabled = !Utils.geoPickPointLayer.enabled;
    }
}

//geojson标签, 可以拾取标签属性(参考电子哨兵)
Utils.createGeoJsonModel = function (baseUrl)
{
    if (Utils.GeoJsonModel == null)
    {      
        var GeoJsonModel = new Li.GeoJsonModel();
        GeoJsonModel.iconUrl = baseUrl + "symbols/images/fivestar1.png";
        GeoJsonModel.iconSize = Li.Vector2.create(114, 40);
        GeoJsonModel.height = 0.0;
        GeoJsonModel.labelField = "name"; //MC
        GeoJsonModel.scaleByDistance = Li.Vector2.create(1.0e4, 0.5);
        GeoJsonModel.load(baseUrl + "data/street.geojson");
        if (Utils.tilesetLayer != null)
            GeoJsonModel.setBase3DTileset(Utils.tilesetLayer.tileset());
        
            var GeoJsonModel1 = new Li.GeoJsonModel();
            // GeoJsonModel1.iconUrl = baseUrl + "symbols/images/fivestar2.png";
            // GeoJsonModel1.iconSize = Li.Vector2.create(1, 1);
            GeoJsonModel1.labelOffset = Li.Vector2.create(5, 10); //x, y偏移值
            GeoJsonModel1.height = 0.0;
            GeoJsonModel1.labelField = "num"; //MC
            GeoJsonModel1.load(baseUrl + "data/street.geojson");
            if (Utils.tilesetLayer != null)
                GeoJsonModel1.setBase3DTileset(Utils.tilesetLayer.tileset());

        Utils.GeoJsonModel = GeoJsonModel;     
    }
    else
    {
        Utils.GeoJsonModel.show = false;
        // Utils.GeoJsonModel.delete(); 
        // Utils.GeoJsonModel = null;
    }
}

Utils.testString = "{\"type\":\"FeatureCollection\",\"name\":\"lhdzsbsj1\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:OGC:1.3:CRS84\"}},\"features\":[{\"type\":\"Feature\",\"properties\":{\"FID\":0,\"设备编号\":\"006020220222000175\",\"设备MAC地址\":\"B8:60:FE:10:21:F6\",\"创建人\":\"超级管理员\",\"厂家名\":\"深圳市红门智慧停车科技有限公司\",\"是否白名单\":\"否\",\"经度\":113.99656,\"纬度\":22.668182,\"区\":\"龙华区\",\"街道\":\"大浪街道\",\"社区\":\"同胜社区\",\"卡口\":\"三合A2村（靠布龙路，大门岗亭）\",\"扫码次数\":0},\"geometry\":{\"type\":\"Point\",\"coordinates\":[113.99656,22.668182]}},{\"type\":\"Feature\",\"properties\":{\"FID\":1,\"设备编号\":\"1877401\",\"设备MAC地址\":\"ac:0c:29:a3:9b:6d\",\"创建人\":\"超级管理员\",\"厂家名\":\"深圳鲲云信息科技有限公司\",\"是否白名单\":\"否\",\"经度\":113.99656,\"纬度\":22.668184,\"区\":\"龙华区\",\"街道\":\"大浪街道\",\"社区\":\"同胜社区\",\"卡口\":\"三合A2村（靠布龙路，大门岗亭）1\",\"扫码次数\":1},\"geometry\":{\"type\":\"Point\",\"coordinates\":[113.99656,22.668184]}},{\"type\":\"Feature\",\"properties\":{\"FID\":2,\"设备编号\":\"006020210141002521\",\"设备MAC地址\":\"358820211025217\",\"创建人\":\"超级管理员\",\"厂家名\":\"深圳市红门智慧停车科技有限公司\",\"是否白名单\":\"否\",\"经度\":113.99656,\"纬度\":22.668184,\"区\":\"龙华区\",\"街道\":\"大浪街道\",\"社区\":\"同胜社区\",\"卡口\":\"三合A2村（靠布龙路，大门岗亭）2\",\"扫码次数\":2},\"geometry\":{\"type\":\"Point\",\"coordinates\":[113.99656,22.668184]}},{\"type\":\"Feature\",\"properties\":{\"FID\":3,\"设备编号\":\"006020220222000174\",\"设备MAC地址\":\"B8:60:FE:10:21:F5\",\"创建人\":\"超级管理员\",\"厂家名\":\"深圳市红门智慧停车科技有限公司\",\"是否白名单\":\"否\",\"经度\":113.99612,\"纬度\":22.670994,\"区\":\"龙华区\",\"街道\":\"大浪街道\",\"社区\":\"同胜社区\",\"卡口\":\"三合华侨c区（靠华荣路，大门岗亭）\",\"扫码次数\":0},\"geometry\":{\"type\":\"Point\",\"coordinates\":[113.99612,22.670994]}},{\"type\":\"Feature\",\"properties\":{\"FID\":4,\"设备编号\":\"1877039\",\"设备MAC地址\":\"ac:0c:29:a3:9b:6d\",\"创建人\":\"超级管理员\",\"厂家名\":\"深圳鲲云信息科技有限公司\",\"是否白名单\":\"否\",\"经度\":114.000944,\"纬度\":22.667984,\"区\":\"龙华区\",\"街道\":\"大浪街道\",\"社区\":\"同胜社区\",\"卡口\":\"三合华侨c区（靠华荣路，大门岗亭）1\",\"扫码次数\":3},\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.000944,22.667984]}},{\"type\":\"Feature\",\"properties\":{\"FID\":5,\"设备编号\":\"006020210141002518\",\"设备MAC地址\":\"358820211025183\",\"创建人\":\"超级管理员\",\"厂家名\":\"深圳市红门智慧停车科技有限公司\",\"是否白名单\":\"否\",\"经度\":113.996115,\"纬度\":22.670995,\"区\":\"龙华区\",\"街道\":\"大浪街道\",\"社区\":\"同胜社区\",\"卡口\":\"三合华侨c区（靠华荣路，大门岗亭）2\",\"扫码次数\":0},\"geometry\":{\"type\":\"Point\",\"coordinates\":[113.996115,22.670995]}}]}";
//电子哨兵
Utils.addDZSB = function ()
{
    if (Utils.DZSB == null)
    {
        var GeoJsonModel = new Li.GeoJsonModel();
        GeoJsonModel.fontSize = 10;
        GeoJsonModel.iconUrl = baseUrl + "symbols/images/哨兵.png";
        GeoJsonModel.selectedIconUrl = baseUrl + "symbols/images/哨兵hover.png"; //
        GeoJsonModel.iconSize = Li.Vector2.create(48, 48);
        //GeoJsonModel.iconOffset = Li.Vector2.create(0, -12);
        GeoJsonModel.height = 3.0;
        //GeoJsonModel.heightField = "hight";
        //GeoJsonModel.addField("使用单位"); //需要获取的属性添加进去, 可以添加多个属性
        GeoJsonModel.addField("FID");
        GeoJsonModel.addField("设备编号");
        GeoJsonModel.addField("街道");
        GeoJsonModel.addField("社区");
        
        //GeoJsonModel.labelField = "卡口";
        GeoJsonModel.labelField = "进出类型";   //文字标签字段
        GeoJsonModel.labelOffset = Li.Vector2.create(10, 12); //x, y偏移值
        
        if (Utils.tilesetLayer != null)
            GeoJsonModel.setBase3DTileset(Utils.tilesetLayer.tileset());
        
        
        GeoJsonModel.load(baseUrl + "data/电子哨兵0407.geojson"); //加载geojson文件
        //or
        //GeoJsonModel.addString(Utils.testString);   //添加string (geojson格式 string)
        Utils.DZSB = GeoJsonModel;
    }
}


//键盘事件 keydown
document.onkeydown=function(event){
    var e = event || window.event || arguments.callee.caller.arguments[0];
    //console.log(e.keyCode);
    if (e && e.keyCode == 70)// 按键F
    { 
        Utils.GeoJsonBillboards.setIconEnabled(1, true);    //密接显示
        Utils.GeoJsonBillboards.setIconEnabled(2, true);    //次密接显示
    }
    // if (e && e.keyCode)
    // {
    // }

};

Utils.selectRect = [];
Utils.selectPolygon = [];
//鼠标点击 拾取物体 / 拾取属性
document.onclick = function (event) 
{
    var e = event || window.event;
    var posX = 0, posY = 0;
    posX = e.clientX;
    posY = e.clientY;

    if (e)
    {
        var scene = window.scene;
        var ray = scene.mainCamera.screenPointToRay(posX, posY);
        var hit = new Li.RaycastHit();
        let pickPoint = Li.Vector3.create(-2.40124e+06, 5.38168e+06, 2.43154e+06);
        
        //raycast 拾取物体,
        if (scene.raycast(ray, hit))
        {
            var entity = hit.entity;
            if (entity)
            {
                console.log(entity.tag);
                console.log(entity.objectName);
                
                if (entity.objectName == "监控电子眼_180")
                {
                    console.log("播放监控视频");    
                }
                //let radius = entity.renderer.boundingVolume.boundingSphere.center;
            }
            pickPoint = hit.point;

            let point = hit.point.toCartesian3();
            let carto = Li.Cartographic.fromCartesian(point);
           
            console.log("pick Entity: " + carto.longitude * 180 / Math.PI + " " + carto.latitude * 180 / Math.PI + " " + carto.height);
            console.log(point.x + " " + point.y + " " + point.z);

            let cameraCarto = scene.mainCamera.transform.cartographic;
            console.log("camera Pos: " + cameraCarto.longitude * 180 / Math.PI + " " + cameraCarto.latitude * 180 / Math.PI + " " + cameraCarto.height);
            
            let CController = scene.mainCamera.cameraController();
            console.log(" heading, pitch, roll: " +  CController.heading * 180 / Math.PI , CController.pitch * 180 / Math.PI , CController.roll * 180 / Math.PI);
            
            let h = Utils.getMeshHeight(window.scene, carto);
            console.log("mesh height: " + h);
        }
        hit.delete();

        //新的建筑拾取高亮
        //const sceneFeature = scene.getFeatureByMouse();
        //scene.setSelectedFeature(sceneFeature);

        // if (Utils.GeoJsonFeatures != null)
        // {
        //     if (Utils.SelectType == 0)//单选
        //     {
        //         let gjFeature = Utils.GeoJsonFeatures.pickFeatureByMouse();
        //         if (gjFeature)
        //         {
        //             //Utils.GeoJsonFeatures.highlightFeature(gjFeature); //建筑高亮
        //             console.log(gjFeature.getProperty('TYDZBM'));   //拾取楼栋编码
        //             console.log(gjFeature.getProperty('MC'));       //楼栋名称
        //         }
        //     }
        //     else if (Utils.SelectType == 1)//框选演示, 项目需要在mousemove中做
        //     { 
        //         Utils.selectRect.push(pickPoint);
        //         if (Utils.selectRect.length >= 2)
        //         {
        //             let extent = new Li.Rectangle();
        //             extent.combinePoint(Utils.selectRect[0]);
        //             extent.combinePoint(Utils.selectRect[Utils.selectRect.length - 1]);

        //             let sw = extent.southwest().toVector3();
        //             let nw = extent.northwest().toVector3();
        //             let ne = extent.northeast().toVector3();
        //             let se = extent.southeast().toVector3();
        //             extent.delete();

        //             let pointVector = new Li.PointVector();
        //             pointVector.push_back(sw);
        //             pointVector.push_back(nw);
        //             pointVector.push_back(ne);
        //             pointVector.push_back(se);
        //             var list = Utils.GeoJsonFeatures.selectFeatures(pointVector, true); //设置要高亮的范围, 返回范围内的楼栋编码

        //             let len = list.size();
        //             for (let i = 0; i < len; i++)
        //             {
        //                 console.log(list.get(i));  //楼栋编码
        //             }
                     
        //             pointVector.delete();
        //             Utils.selectRect.length = 0;
        //         }
        //     }
        //     else if (Utils.SelectType == 2)//多边形选择
        //     {
        //         Utils.selectPolygon.push(pickPoint);
        //         if (Utils.selectPolygon.length >= 3)
        //         {
        //             let points = new Li.PointVector();
                    
        //             for (let i = 0; i < Utils.selectPolygon.length; i++)
        //             {
        //                 points.push_back(Utils.selectPolygon[i].toVector3());
        //             }

        //             if (points.size())
        //             {
        //                 Utils.GeoJsonFeatures.selectFeatures(points);
        //             }
        //             points.delete();
        //         }
        //     }
        //     else if (Utils.SelectType == 3) //多选
        //     {
        //         const feature2 = Utils.GeoJsonFeatures.pickFeatureByMouse();
        //         if (feature2)
        //         {
        //             let bm = feature2.getProperty('TYDZBM');
        //             console.log(bm);
        //             if (Utils.GeoJsonFeatures.isSelected(feature2))
        //                 Utils.GeoJsonFeatures.deselectFeature(feature2);
        //             else
        //                 Utils.GeoJsonFeatures.selectFeature(feature2);
        //         }
        //     }
        // }
    
        //拾取标签属性 (Utils.DZSB 电子哨兵)
        let feature = Li.GeoJsonModel.getSelectedFeature();
        if (feature)
        {
            console.log("pick feature");
            //let property = feature.getProperty("使用单位"); //要查询的属性
            let property = feature.getProperty("设备编号"); //要查询的属性
            if (property)
            {
                console.log("设备编号: " + property);
            }
        }

        //三区图属性拾取
        let threeAreaFeature = Li.ProjectionLayer.globalInstance().getFeatureByMouse();
        if (threeAreaFeature)
        {
            let area = threeAreaFeature.getProperty("area"); 
            console.log("面积: " + area);

            // let area = threeAreaFeature.getProperty("adcode"); 
            // console.log("区域代码: " + area);
        }

        if (Utils.BIM_tilesetLayer != null) //拾取bim属性
        {
            let bimfeature = scene.getFeatureByMouse();
            if (bimfeature)
            {
                Utils.getFeatureProperty(bimfeature);
            }
        }

        //轨迹点拾取
        if (Utils.TrackPath)
        {
            let tpSelected = Utils.TrackPath.getSelectedByMouse();
            if (tpSelected != -1)
            {
                console.log("轨迹点 " + tpSelected);    
            }
        }


        //标签拾取测试
        if (Utils.billboardEntity)
        {
            console.log("bbEntity pick");
            let f = scene.getFeatureByMouse();
            Utils.BBEntityPick(f, pickPoint);
        }

        if (Utils.label3d)
        {
            console.log("label3d pick");
            let f = scene.getFeatureByMouse();
            Utils.Label3DPick(f, pickPoint);
        }

        if (Utils.geoPointLayer)
        {
            console.log("point layer pick");
            let f = scene.getFeatureByMouse();
            Utils.PointLayerPick(f);
        }
    }
}

//读取json文件
function XHR_CB(url, callback) {
    console.log("httpRequest");
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'text';
    xhr.open('GET', url, true);
    xhr.onload = function() {
        var response = xhr.response;
        var text = xhr.responseText;
        //console.log(text);

        if (callback != null) {
            //callback.setJson(text);
            callback.setJson(text, true, true);   //text:字符串, true: 是否替换, true:是否异步加载 
            console.log("XHR_CB setJson");
        }
    }
    xhr.send();
}

//楼栋聚合标签
Utils.BillboardsCount = 0;
Utils.createGeoJsonBillboards = function (baseUrl)
{
    if (Utils.GeoJsonBillboards == null)
    {
        const iconScale = 0.6;
        const iconSize = Li.Vector2.create(150 * iconScale, 38 * iconScale);
        
        const geojson = new Li.GeoJsonBillboards();
        geojson.iconUrl = baseUrl + "symbols/images/确密次.png";
        geojson.iconSize = iconSize;
        //geojson.iconOffset = Li.Vector2.create(0, -10);
        geojson.fontSize = 12;

        geojson.labelField = 'ldmc';
        geojson.labelOffset = Li.Vector2.create(0, -8);
        geojson.iconTextOffset = Li.Vector2.create(63, 22);
        geojson.iconTextFontSize = 18;
        geojson.iconTextColor = Li.Color.fromRgb(255, 255, 255, 255);
        //geojson.displayMode = 0;
        // if (Utils.tilesetLayer != null)
        //     geojson.setBase3DTileset(Utils.tilesetLayer.tileset());
        //geojson.load(baseUrl + 'data/json/0318结果.geojson');

        XHR_CB(baseUrl + 'data/ft4.json', geojson);
        console.log("create GeoJsonBillboards");
        geojson.setIconEnabled(0, true);  //确诊标签显示
        Utils.GeoJsonBillboards = geojson;
        Utils.BillboardsCount++;
    }
    else
    {
        //Utils.GeoJsonBillboards.show = !Utils.GeoJsonBillboards.show;
        // Utils.GeoJsonBillboards.delete(); 
        // Utils.GeoJsonBillboards = null;
        
        switch (Utils.BillboardsCount)
        {
            case 1:
                XHR_CB(baseUrl + 'data/疫情数据/1.json', Utils.GeoJsonBillboards);
                break;
            case 2:
                XHR_CB(baseUrl + 'data/疫情数据/2.json', Utils.GeoJsonBillboards);
                break;
            default:
                Utils.BillboardsCount = 0;
                break;
        }
        Utils.BillboardsCount++;
        
    }
}

//高亮用的建筑面, 用来拾取feature
Utils.HS = 0;
Utils.createGeoJsonFeatures = function (baseUrl)
{
    // if (Utils.GeoJsonFeatures == null)
    // {
    //     var geojsonFeatures = new Li.GeoJsonFeatures();  
    //     //geojsonFeatures.addField('TYDZBM'); // 统一地址编码
    //     geojsonFeatures.setKeyField('TYDZBM');
    //     geojsonFeatures.load(baseUrl + "data/futian.geojson");

    //     //XHR_CB(baseUrl + 'data/采样率转换后.json', geojsonFeatures);
    //     Utils.GeoJsonFeatures = geojsonFeatures;
    //     Utils.HS++;
    // }
    // else
    // {
    //     if (Utils.HS == 1)
    //     {
    //         //Utils.GeoJsonFeatures.enabled = true;
    //         XHR_CB(baseUrl + 'data/采样率转换后.json', Utils.GeoJsonFeatures);
    //     }
    //     else
    //     {
    //         XHR_CB(baseUrl + 'data/采样率转换后.json', Utils.GeoJsonFeatures);
    //         //Utils.GeoJsonFeatures.setJson("");
    //         //Utils.GeoJsonFeatures.enabled = !Utils.GeoJsonFeatures.enabled;
    //     }
    //     Utils.HS++;
    // }
}


Utils.createGJsonFeatures = function ()
{
    if (Utils.GeoJsonFeatures == null)
    {
        var geojsonFeatures = new Li.GeoJsonFeatures();  
        //geojsonFeatures.addField('TYDZBM'); // 统一地址编码
        geojsonFeatures.setKeyField('TYDZBM');
        geojsonFeatures.addField("MC");
        geojsonFeatures.load(baseUrl + "data/futian.geojson"); 
        console.log("创建属性拾取features");

        Utils.GeoJsonFeatures = geojsonFeatures;
    }
}
Utils.SelectType = 0;
//框选
Utils.selectByRectangle = function ()
{
    Utils.createGJsonFeatures();
    Utils.SelectType = 1;
}

//多边形选择
Utils.selectByPolygon = function ()
{
    Utils.createGJsonFeatures();
    Utils.SelectType = 2;
}

//多选
Utils.multiSelect = function ()
{
    Utils.createGJsonFeatures();
    Utils.SelectType = 3;
}

Utils.buildingName = null;
Utils.addBuildingName = function () {
  var GeoJsonModel = new Li.GeoJsonModel();
  GeoJsonModel.fontSize = 14;

  GeoJsonModel.height = 1.0;
  //GeoJsonModel.addField("MC");
  //GeoJsonModel.iconUrl = baseUrl + "symbols/images/dot_red_32x32.png";
  //GeoJsonModel.iconSize = Li.Vector2.create(12, 12);

  GeoJsonModel.labelField = "MC"; //文字标签字段
  //GeoJsonModel.labelOffset = Li.Vector2.create(10, 12); //x, y偏移值
//   GeoJsonModel.lineToGround = true;
//   GeoJsonModel.lineColor = Li.Color.fromRgb(255, 0, 0, 255);
    GeoJsonModel.distance = Li.Vector2.create(1.0, 5000);
    GeoJsonModel.clustered = true;  //聚合

  if (Utils.tilesetLayer != null)
    GeoJsonModel.setBase3DTileset(Utils.tilesetLayer.tileset());

  GeoJsonModel.load(baseUrl + "data/ft0618-centroid.geojson"); //加载geojson文件
  //or
  //GeoJsonModel.addString(Utils.testString);   //添加string (geojson格式 string)
  Utils.buildingName = GeoJsonModel;
};

Utils.areaString = "{\"type\":\"FeatureCollection\",\"name\":\"ft-area\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:OGC:1.3:CRS84\"}},\"features\":[{\"type\":\"Feature\",\"properties\":{\"id\":\"35595e43-ab52-11ec-8411-712e366880eb\",\"name\":\"园岭\",\"adcode\":440304002,\"pid\":440304,\"level\":4,\"description\":null,\"attachments\":null,\"entity_id\":null},\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[114.099151279734002,22.568112483325802],[114.099179541444997,22.566475099581599],[114.099224811360003,22.563709970203298],[114.099310852331001,22.559063850420898],[114.099320352106005,22.558524306286099],[114.099320796827001,22.558498784587499],[114.099389714411998,22.554595075328599],[114.099431420648997,22.5522608970468],[114.099436074115999,22.551880394158001],[114.096072351434998,22.551829131181201],[114.091077514106004,22.551752880228001],[114.087849419443998,22.551703517717801],[114.086607425333,22.551684508456901],[114.081510492218996,22.551606397176499],[114.081461676577007,22.554351648182202],[114.081448683166002,22.558360076177699],[114.081466292862004,22.558382621692498],[114.082201714942002,22.5594439220318],[114.085089111895996,22.563836328337],[114.086448086957006,22.565993054760199],[114.087103069362001,22.5668392288846],[114.087190357699996,22.566789496925502],[114.087744755192006,22.566635190789999],[114.089240662172998,22.566998617417099],[114.090914270759001,22.5673931242276],[114.092374721000994,22.567746519953999],[114.093520937446002,22.568014698563399],[114.094540037901993,22.5682714716677],[114.095057103610003,22.568407065563498],[114.095725154693994,22.5686442852945],[114.096109342863997,22.568806226266702],[114.098085802702002,22.569645147121101],[114.098469829330995,22.569816541266398],[114.098878895734003,22.570011963920201],[114.099099990476006,22.570118160179099],[114.099100675675999,22.5700985198784],[114.09913169264,22.569210061475498],[114.099151279734002,22.568112483325802]]]}}]}";

//添加三区图 (面投影, 可以拾取面属性)
Utils.createThreeAreas = function (baseUrl)
{
    if (Utils.ThreeAreas == null)
    {
        const threeArea1 = new Li.ProjectionDataSource();
        threeArea1.setColor(Li.Color.fromRgb(0, 0, 255, 80));
        threeArea1.setSelectedColor(Li.Color.fromRgb(0, 0, 255, 128));
        //threeArea1.setStrokeWidth(1);
        threeArea1.setStrokeColor(Li.Color.fromRgb(0, 0, 255, 255));
        //threeArea1.addField("类型");  //需要拾取的属性
        threeArea1.addField("area");
        //threeArea1.enabled = false;
        threeArea1.loadGeoJson(baseUrl + 'data/threeAreas/3月7日21时/防范区.geojson');
        Li.ProjectionLayer.globalInstance().addDataSource(threeArea1);

        const threeArea2 = new Li.ProjectionDataSource();
        threeArea2.setColor(Li.Color.fromRgb(255, 255, 0, 120));
        threeArea2.setSelectedColor(Li.Color.fromRgb(255, 255, 0, 200));
        //threeArea2.setStrokeWidth(1);
        threeArea2.setStrokeColor(Li.Color.fromRgb(255, 255, 0, 255));
        threeArea2.addField("area");    //需要拾取的属性
        //threeArea2.enabled = false;
        threeArea2.loadGeoJson(baseUrl + 'data/threeAreas/3月7日21时/管控区.geojson');
        Li.ProjectionLayer.globalInstance().addDataSource(threeArea2);

        const threeArea3 = new Li.ProjectionDataSource();
        threeArea3.setColor(Li.Color.fromRgb(255, 0, 0, 120));
        threeArea3.setSelectedColor(Li.Color.fromRgb(255, 0, 0, 200));
        //threeArea3.setStrokeWidth(1);
        threeArea3.setStrokeColor(Li.Color.fromRgb(255, 0, 0, 255));
        threeArea3.addField("area"); //需要拾取的属性
        //threeArea3.enabled = false;
        threeArea3.loadGeoJson(baseUrl + 'data/threeAreas/3月7日21时/封控区.geojson');
        Li.ProjectionLayer.globalInstance().addDataSource(threeArea3);

        /*const threeArea3 = new Li.ProjectionDataSource();
        threeArea3.setColor(Li.Color.fromRgb(94, 166, 199, 120));
        threeArea3.setSelectedColor(Li.Color.fromRgb(0, 160, 200, 160));
        threeArea3.setStrokeWidth(2);
        threeArea3.setStrokeColor(Li.Color.fromRgb(31, 209, 255, 255));
        threeArea3.addField("adcode"); //需要拾取的属性
        //threeArea3.enabled = false;
        //threeArea3.loadGeoJson(baseUrl + 'data/threeAreas/3月7日21时/封控区.geojson');
        threeArea3.addString(Utils.areaString);
        Li.ProjectionLayer.globalInstance().addDataSource(threeArea3);*/

        Utils.ThreeAreas = Li.ProjectionLayer.globalInstance();
    }    
}

//莲花街道
Utils.lianHua = [
    114.06345743236554,22.569165783561886,
    114.06201649615537,22.568609854422533,
    114.05963185640482,22.5672443087123,
    114.05742274860677,22.56633414689809,
    114.05535404306671,22.565781786992194,
    114.05311027600229,22.565782543913784,
    114.04984022842893,22.56607456962834,
    114.04777174729448,22.566075197607567,
    114.045808373932,22.565848029734163,
    114.04303847581505,22.565067966541935,
    114.03517161655205,22.563598502343787,
    114.03206579598145,22.563210058488348,
    114.02819236957767,22.562638064736653,
    114.02622467099235,22.56228121393691,
    114.02619530101683,22.562275764406408,
    114.02617877537006,22.562272415040127,
    114.02625068633253,22.561617567227195,
    114.0262769387961,22.56148835699032,
    114.0263510832455,22.561222753840692,
    114.02670615120866,22.560670607987625,
    114.02699717990858,22.560365290879695,
    114.02769078868874,22.55984614744839,
    114.02990644247201,22.558145489055185,
    114.03042662373059,22.557715851042524,
    114.03289265780778,22.555800335089657,
    114.03425234993936,22.554739246871232,
    114.03441442919035,22.55381339505269,
    114.03514555094158,22.549482042217118,
    114.03524517352021,22.549227139009513,
    114.03537649260859,22.548390244832024,
    114.03612671982172,22.54366513381141,
    114.03629360774421,22.542733613937298,
    114.03699111516497,22.54283731313165,
    114.03976340602327,22.54318562788702,
    114.04246211253366,22.54353369574411,
    114.04490545754504,22.54347797068379,
    114.05244486934554,22.543501861437814,
    114.06353116252157,22.543607604195774,
    114.06345281507227,22.554513067239427,
    114.06345743236554,22.569165783561886
];

Utils.lianHuaSubDistrict = null;
Utils.lianHuaProjectionLayer = null;
//莲花街道区域面
Utils.createSubDistrict = function ()
{
    //Utils.createXiangMiHu1();
    //Utils.createXiangMiHu2();

    if (Utils.lianHuaSubDistrict == null)
    {
        var points = new Li.CartographicVector();
        let len = Utils.lianHua.length;
        for (let i = 0; i < len; i += 2)
        {
            const lng = parseFloat(Utils.lianHua[i ]);
            const lat = parseFloat(Utils.lianHua[i + 1]);
            const carto = Li.Cartographic.fromDegrees(lng, lat, 0);
            points.push_back(carto); //加入到数组
        }

        //测试画三区
        var lianhua = new Li.ProjectionNode();
        //lianhua.setColor(Li.Color.fromRgb(39, 41, 123, 200));
        //lianhua.setStrokeColor(Li.Color.fromRgb(81, 35, 235, 255));
        lianhua.setColor(Li.Color.fromRgb(255, 0, 0, 200));
        lianhua.setStrokeColor(Li.Color.fromRgb(255, 255, 235, 255));
        lianhua.setStrokeWidth(1);
        lianhua.setPoints(points);
        //Li.ProjectionLayer.globalInstance().addNode(lianhua);
        var projectLayer = new Li.ProjectionLayer();
        projectLayer.addNode(lianhua);

        Utils.lianHuaProjectionLayer = projectLayer;

        points.delete();    //删除

        Utils.lianHuaSubDistrict = lianhua;
    }
    else
    {
        Utils.lianHuaSubDistrict.enabled = !Utils.lianHuaSubDistrict.enabled; //显示/隐藏测试
    }
}

Utils.xiangMiHu1 = [114.025325687993, 22.5602599073528, 114.025354310443, 22.5601311323531, 114.025433323408, 22.5598667437317, 114.025798480427, 22.559320307521, 114.026095073034, 22.5590196484762, 114.02679811095, 22.5585115757359, 114.02904466238, 22.5568462876703, 114.029572655526, 22.5564249582423, 114.032073495152, 22.5545488130229, 114.033452468491, 22.5535094333025, 114.033631532296, 22.5525862875553, 114.034442113061, 22.548267164437, 114.034546402823, 22.5480138780076, 114.034693075739, 22.5471791891697, 114.035529985945, 22.5424666689564, 114.035713959093, 22.5415379321984, 114.028612541016, 22.5403178110575, 114.020813112006, 22.5389960921984, 114.011035547015, 22.5373205861298, 114.00874905402, 22.5369622848461, 114.007212216749, 22.5367053007522, 113.999279006112, 22.5353446150327, 113.996408378875, 22.5348736343556, 113.995392259676, 22.5348032734344, 113.99419688616, 22.5348201800362, 113.992747331063, 22.5350071428351, 113.9921877006, 22.5387379031894, 113.992111007894, 22.5392341925694, 113.992058066586, 22.5394888292632, 113.991741680128, 22.5415037839246, 113.991417240399, 22.5436511182868, 113.991408347242, 22.544133657098, 113.991356728765, 22.5445486822495, 113.991348040556, 22.5450200864387, 113.991414468273, 22.5451028268203, 113.99137824691, 22.5457668626634, 113.991338040361, 22.5459964237102, 113.991225086289, 22.5462693827665, 113.992018930985, 22.5476571546545, 113.992127323018, 22.5478498194365, 113.992217010107, 22.5480081591688, 113.992113793907, 22.5481678252979, 113.991953593905, 22.5484894422132, 113.991721596366, 22.5488003818133, 113.991561921715, 22.549093403478, 113.991448906776, 22.5492738505314, 113.991328707029, 22.5494793508289, 113.991321377295, 22.5495040532255, 113.991275887254, 22.5496573626936, 113.991285422338, 22.5496685293156, 113.991575963863, 22.5499655415401, 113.991597775478, 22.5499832670401, 113.991739136404, 22.5504615201201, 113.992030410162, 22.5504168851475, 113.992200300548, 22.5509286597613, 113.992482967521, 22.550981685353, 113.9925108637, 22.5510508541151, 113.992581650333, 22.5513076017233, 113.992719822673, 22.551487739148, 113.993126289743, 22.5516604567228, 113.993542748184, 22.5517316700694, 113.993830276967, 22.5517823789214, 113.994336912109, 22.5518181104437, 113.994625231384, 22.5518370986689, 113.994772328986, 22.5519949558785, 113.99483552734, 22.5521682776859, 113.994918298104, 22.552360372733, 113.994916694817, 22.5525793409635, 113.994798674718, 22.5527277243483, 113.994617400839, 22.5527970535199, 113.994147989727, 22.5529003348854, 113.993867515082, 22.5530066146219, 113.993685294538, 22.5531790527466, 113.993570471827, 22.5534725250918, 113.993491930123, 22.5536525584211, 113.993405806368, 22.5538378342279, 113.993323876186, 22.5542268508442, 113.993261872573, 22.5545657567989, 113.993194731324, 22.5549707215529, 113.993250735996, 22.5551886759526, 113.993341984536, 22.555779859018, 113.99340441102, 22.5563042701789, 113.993444252541, 22.5567503668097, 113.99305314395, 22.5571116585314, 113.992898028827, 22.5573106188788, 113.992784031122, 22.557456839322, 113.994514960611, 22.5566296008399, 113.995060033924, 22.5563964562247, 113.99608657803, 22.5560048551758, 113.996955805832, 22.5557995994562, 113.997988047095, 22.5557222185322, 114.001193563232, 22.5557547423095, 114.003236979967, 22.5558783580269, 114.003922938141, 22.5560170018568, 114.004977982718, 22.5563988137357, 114.008112610205, 22.5577271032192, 114.01166475321, 22.5592435427526, 114.01230622872, 22.5595187833276, 114.012804877955, 22.5596519456075, 114.013399535146, 22.5598045222393, 114.014224743469, 22.5599965276244, 114.014993787027, 22.5600981461414, 114.016456115287, 22.5602285767488, 114.019252110741, 22.5601472732887, 114.021274490503, 22.5602148663235, 114.022582038551, 22.5603786099779, 114.024918782812, 22.5608463295758, 114.02524175602, 22.5609135184063, 114.025325687993, 22.5602599073528];


Utils.xiangMiHu2 = [114.02532434710619, 22.56026018347708, 114.02524041523834, 22.560913794647064, 114.02491744196634, 22.56084660585623, 114.0225806972464, 22.560378886548612, 114.0212731489598, 22.560215143072075, 114.0192507688613, 22.56014755034185, 114.01645477297406, 22.56022885425051, 114.0149924444568, 22.560098423850402, 114.01422340075652, 22.559996805437187, 114.01339819226753, 22.559804800150403, 114.01280353495382, 22.559652223587157, 114.0123048856148, 22.559519061363865, 114.01166340995147, 22.559243820845296, 114.00811126610363, 22.557727381625714, 114.00497663787527, 22.556399092420726, 114.0039215930598, 22.556017280645854, 114.00323563475102, 22.555878636900925, 114.00119221766633, 22.555755021482465, 113.99798670101032, 22.555722498199536, 113.99695445959641, 22.555799879296636, 113.99608523169174, 22.55600513518413, 113.99505868749216, 22.556396736454907, 113.99451361413425, 22.556629881191927, 113.99278268451681, 22.55745712007452, 113.99289668221388, 22.557310899590444, 113.99305179732585, 22.557111939187436, 113.99344290591408, 22.556750647347677, 113.99340306430656, 22.55630455065253, 113.99334063771738, 22.55578013941842, 113.99324938905652, 22.555188956273785, 113.99319338433628, 22.55497100184834, 113.99326052552304, 22.554566037019814, 113.99332252908411, 22.554227131001863, 113.99340445920875, 22.55383811431135, 113.99349058294459, 22.55365283846178, 113.99356912462824, 22.553472805091843, 113.9936839473052, 22.553179332682337, 113.99386616784649, 22.553006894501944, 113.9941466425174, 22.552900614704974, 113.99461605368583, 22.55279733324999, 113.99479732758125, 22.552728004039157, 113.99491534767297, 22.55257962061253, 113.99491695092043, 22.552360652347094, 113.99483418010826, 22.552168557282545, 113.99477098171317, 22.5519952354576, 113.994623884059, 22.55183737824597, 113.99433556473423, 22.551818390062706, 113.99382892950533, 22.551782658613746, 113.99354140066698, 22.551731949798516, 113.99312494214658, 22.551660736505518, 113.99271847497998, 22.55148801896677, 113.9925803025852, 22.551307881535138, 113.99250951589475, 22.55105113389732, 113.99248161969817, 22.55098196512865, 113.99219895267039, 22.550928939572593, 113.99202906216459, 22.550417164904324, 113.99173778836806, 22.550461799929405, 113.99159642733304, 22.549983546795833, 113.99157461571117, 22.549965821296414, 113.99128407408614, 22.54966880907024, 113.9912745389994, 22.54965764244791, 113.99132002901997, 22.54950433294849, 113.99132735875054, 22.54947963054688, 113.99144755847972, 22.54927413019815, 113.99156057340382, 22.54909368309858, 113.9917202480273, 22.548800661362705, 113.99195224554784, 22.54848972167733, 113.99211244551749, 22.548168104686127, 113.99221566170517, 22.548008438515744, 113.99212597457243, 22.54785009877233, 113.9920175824875, 22.547657433976763, 113.99122373741432, 22.546269661993037, 113.99133669145453, 22.545996702876067, 113.99137689796878, 22.545767141786634, 113.99141311921767, 22.54510310583292, 113.99134669147494, 22.545020365448604, 113.9913553796006, 22.544548961183537, 113.99140699801059, 22.544133935958378, 113.9914158910815, 22.543651397069475, 113.99174033047521, 22.541504062317163, 113.99205671661943, 22.53948910728791, 113.99210965789024, 22.539234470545612, 113.99218635051898, 22.538738181075164, 113.99274598039815, 22.53500742004373, 113.99419553569271, 22.534820456989415, 113.99539090939743, 22.534803550198628, 113.99640702877228, 22.53487391097262, 113.99927765655367, 22.535344891276864, 114.00721086870702, 22.53670557597505, 114.00874770626994, 22.536962559870105, 114.01103419969569, 22.537320860854074, 114.02081176655501, 22.53899636566368, 114.02861119705301, 22.540318083516116, 114.03571261648737, 22.54153820374307, 114.03552864347766, 22.542466940676547, 114.0346917339892, 22.5471794617655, 114.03454506120018, 22.54801415075825, 114.03444077146709, 22.548267437243975, 114.03363019135338, 22.552586561171605, 114.03345112768608, 22.553509707092637, 114.03207215431384, 22.55454908719242, 114.02957131462652, 22.556425233098306, 114.0290433214722, 22.556846562675172, 114.026796769983, 22.55851185135422, 114.02609373204668, 22.559019924284527, 114.02579713944593, 22.559320583423048, 114.02543198246796, 22.559867019777094, 114.02535296953758, 22.560131408452616, 114.02532434710619, 22.56026018347708];

Utils.xiangMiHu3 = [114.062387932855998, 22.568396739921099, 114.062652551164007, 22.553746120865402, 114.062931230667999, 22.542843514785499, 114.051848590831, 22.542562067215702, 114.044310789437006, 22.5424186785358, 114.041866801851995, 22.542435667760799, 114.039174910818005, 22.542044876318801, 114.036409452296994, 22.541652671690802, 114.035713959093002, 22.541537932198398, 114.035529985945004, 22.542466668956401, 114.034693075739, 22.5471791891697, 114.034546402822997, 22.548013878007598, 114.034442113061004, 22.548267164437, 114.033631532295999, 22.5525862875553, 114.033452468491006, 22.553509433302501, 114.032073495152005, 22.554548813022901, 114.029572655525996, 22.5564249582423, 114.029044662380002, 22.5568462876703, 114.026798110949997, 22.558511575735899, 114.026095073034, 22.559019648476198, 114.025798480427, 22.559320307520998, 114.025433323407995, 22.5598667437317, 114.025354310443007, 22.560131132353099, 114.025325687993003, 22.560259907352801, 114.025241756019994, 22.560913518406299, 114.025258217512999, 22.560917129211099, 114.025287482715996, 22.5609230434541, 114.027248313645998, 22.561311029792702, 114.031110619540996, 22.561944333363002, 114.034208814394006, 22.562381947530302, 114.042047440678999, 22.563975885329899, 114.044802572931999, 22.564799736415999, 114.046761466326004, 22.5650579904956, 114.048829637455995, 22.5650901484427, 114.052104543810003, 22.564849996888402, 114.054347977389, 22.564884804241899, 114.056406213252998, 22.565469871736799, 114.058598255232994, 22.566414913543401, 114.060957434263997, 22.567818054001101, 114.062387932855998, 22.568396739921099];

Utils.xiangMiHu4 =[ 114.06238659937438,
    22.568397011554854,
    114.0609561004488,
    22.56781832576635,
    114.05859692078631,
    22.566415185454545,
    114.0564048782852,
    22.56547014384024,
    114.05434664198519,
    22.564885076573635,
    114.05210320804157,
    22.564850269564428,
    114.0488283012061,
    22.565090421667193,
    114.04676012973881,
    22.565058264037376,
    114.04480123598513,
    22.564800010222328,
    114.04204610314191,
    22.56397615943536,
    114.03420747531338,
    22.562382222605557,
    114.03110927988556,
    22.561944608852,
    114.02724697325738,
    22.56131130578357,
    114.02528614194267,
    22.560923319689252,
    114.02525687673437,
    22.560917405449885,
    114.02524041523834,
    22.560913794647064,
    114.02532434710619,
    22.56026018347708,
    114.02535296953758,
    22.560131408452616,
    114.02543198246796,
    22.559867019777094,
    114.02579713944593,
    22.559320583423048,
    114.02609373204668,
    22.559019924284527,
    114.026796769983,
    22.55851185135422,
    114.0290433214722,
    22.556846562675172,
    114.02957131462652,
    22.556425233098306,
    114.03207215431384,
    22.55454908719242,
    114.03345112768608,
    22.553509707092637,
    114.03363019135338,
    22.552586561171605,
    114.03444077146709,
    22.548267437243975,
    114.03454506120018,
    22.54801415075825,
    114.0346917339892,
    22.5471794617655,
    114.03552864347766,
    22.542466940676547,
    114.03571261648737,
    22.54153820374307,
    114.03640810982382,
    22.541652943145145,
    114.03917356885836,
    22.542045147404114,
    114.04186546039395,
    22.54243593848824,
    114.04430944836703,
    22.542418948879586,
    114.05184725099365,
    22.542562336407038,
    114.0629298926563,
    22.54284378229356,
    114.06265121507707,
    22.553746390141026,
    114.06238659937438,
    22.568397011554854
];

Utils.createXiangMiHu1 = function ()
{
    var points = new Li.CartographicVector();
    let len = Utils.xiangMiHu3.length;
    for (let i = 0; i < len; i += 2)
    {
        const lng = parseFloat(Utils.xiangMiHu3[i ]);
        const lat = parseFloat(Utils.xiangMiHu3[i + 1]);
        const carto = Li.Cartographic.fromDegrees(lng, lat, 0);
        points.push_back(carto); //加入到数组
    }

    //测试画三区
    var lianhua = new Li.ProjectionNode();
    //lianhua.setColor(Li.Color.fromRgb(39, 41, 123, 200));
    //lianhua.setStrokeColor(Li.Color.fromRgb(81, 35, 235, 255));
    lianhua.setColor(Li.Color.fromRgb(128, 0, 0, 100));
    lianhua.setStrokeColor(Li.Color.fromRgb(255, 255, 0, 255));
    lianhua.setStrokeWidth(1);
    lianhua.setPoints(points);
    //Li.ProjectionLayer.globalInstance().addNode(lianhua);
    var projectLayer = new Li.ProjectionLayer();
    projectLayer.addNode(lianhua);
    points.delete();    //删除
}

Utils.createXiangMiHu2 = function ()
{
    var points = new Li.CartographicVector();
    let len = Utils.xiangMiHu4.length;
    for (let i = 0; i < len; i += 2)
    {
        const lng = parseFloat(Utils.xiangMiHu4[i ]);
        const lat = parseFloat(Utils.xiangMiHu4[i + 1]);
        const carto = Li.Cartographic.fromDegrees(lng, lat, 0);
        points.push_back(carto); //加入到数组
    }

    //测试画三区
    var lianhua = new Li.ProjectionNode();
    //lianhua.setColor(Li.Color.fromRgb(39, 41, 123, 200));
    //lianhua.setStrokeColor(Li.Color.fromRgb(81, 35, 235, 255));
    lianhua.setColor(Li.Color.fromRgb(0, 128, 0, 100));
    lianhua.setStrokeColor(Li.Color.fromRgb(0, 255, 255, 255));
    lianhua.setStrokeWidth(1);
    lianhua.setPoints(points);
    //Li.ProjectionLayer.globalInstance().addNode(lianhua);
    var projectLayer = new Li.ProjectionLayer();
    projectLayer.addNode(lianhua);
    points.delete();    //删除

}

//添加路径轨迹
Utils.createTrackPath = function (baseUrl)
{
    if (Utils.TrackPath == null)
    {
        console.log("create track path");
        var trackPath = new Li.TrackPathRenderer();
        trackPath.setWidth(4);
        trackPath.setColor(Li.Color.fromRgb(16, 125, 255, 255));
        trackPath.setIconUrl(baseUrl + "symbols/images/circle.png");
        trackPath.setSelectedIconUrl(baseUrl + "symbols/images/circle_selected.png");
        trackPath.setIconSize(Li.Vector2.create(24, 24));
        trackPath.setIconOffset(Li.Vector2.create(0, 0));
        trackPath.setArrowIconUrl(baseUrl + "symbols/images/arrow.png");
        trackPath.setArrowIconSize(Li.Vector2.create(18, 18));
        trackPath.setArrowIconRotation(-90);
        trackPath.setFontSize(14);
        trackPath.setLabelColor(Li.Color.fromRgb(255, 255, 255, 255));
        trackPath.setLabelOffset(Li.Vector2.create(0, -10));

        var c1 = Li.Cartographic.fromDegrees(114.054494, 22.540745, 0);
        var c2 = Li.Cartographic.fromDegrees(114.064494, 22.560745, 0);
        var c3 = Li.Cartographic.fromDegrees(114.074494, 22.580745, 0);
        var c4 = Li.Cartographic.fromDegrees(114.084494, 22.500745, 0);
        trackPath.addPoint(c1, "03-21 13:00");
        trackPath.addPoint(c2, "03-22 11:14");
        trackPath.addPoint(c3, "03-23 13:34");
        trackPath.addPoint(c4, "03-24 18:27");
        Utils.TrackPath = trackPath;

        //计算轨迹路径范围
        var extent = new Li.Rectangle();
        extent.combinePoint(c1);
        extent.combinePoint(c2);
        extent.combinePoint(c3);
        extent.combinePoint(c4);
        var cameraCon = window.scene.mainCamera.cameraController();
        ////rectangle, 2sec, pitch, head, roll
        cameraCon.flyToRectangle(Li.Rectangle.create(extent.west - 0.0001, extent.south - 0.0001, extent.east + 0.0001, extent.north + 0.0001), 2, 0, -90, 0);  
        extent.delete();

        // var selected = trackPath.getSelectedByMouse();
        // console.log("selected : " + selected);
    }
    else
    {
        //Utils.TrackPath.enabled = !Utils.TrackPath.enabled;  //无效
        // var pos = Utils.TrackPath.getScreenPosition(1);
        // console.log(pos.x + " : " + pos.y);
        Utils.TrackPath.delete();
        Utils.TrackPath = null;
    }
}

Utils.cartographicToRectangle = function ()
{
    let c1 = Li.Cartographic.fromDegrees(114.054494, 22.540745, 0);
    let rect = Li.Rectangle.create(c1.longitude - 0.00001, c1.latitude - 0.00001, c1.longitude + 0.00001, c1.latitude + 0.00001); 
    return rect;
}


//分类标签
Utils.createLabelLayer = function (baseUrl)
{
    if (Utils.geoLabelLayer == null)
    {
        var geoLabelLayer = new Li.GeoJsonLabelLayer();
        // geoLabelLayer.geoJson = baseUrl + "data/futian-point.geojson";
        // geoLabelLayer.url = baseUrl + "symbols/images/dot_red_32x32.png";
        // geoLabelLayer.setNameField('name');
        
        var vdf = new Li.VDistanceDisplayField();
        var fields = new Li.StringVector();
        fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");
        // fields.push_back("DLMC");

        var categorys = new Li.StringVector(); 
        categorys.push_back("基础地名");
        // categorys.push_back("交通设施");
        // categorys.push_back("政府机关");
        // categorys.push_back("科技教育");
        // categorys.push_back("旅游观光");
        // categorys.push_back("宾馆酒楼");
        // categorys.push_back("知名企事业");
        // categorys.push_back("医疗卫生");
        // categorys.push_back("文化体育");
        // categorys.push_back("公共服务");
        // categorys.push_back("购物中心");
        // categorys.push_back("邮政通讯");
        // categorys.push_back("连锁餐饮");
        // categorys.push_back("金融机构");
        
        vdf.push_back({ field: "L19", distanceDisplay: Li.Cartesian2.create(1.0, 500), scaleByDistance: Li.Cartesian4.create(100, 1.5, 2000, 0.5) });
        vdf.push_back({ field: "L18", distanceDisplay: Li.Cartesian2.create(1.0, 1000), scaleByDistance: Li.Cartesian4.create(200, 1.5, 4000, 0.5) });
        vdf.push_back({ field: "L17", distanceDisplay: Li.Cartesian2.create(1.0, 2000), scaleByDistance: Li.Cartesian4.create(400, 1.5, 6000, 0.5) });
        vdf.push_back({ field: "L16", distanceDisplay: Li.Cartesian2.create(1.0, 3500), scaleByDistance: Li.Cartesian4.create(600, 1.5, 8000, 0.5) });
        vdf.push_back({ field: "L15", distanceDisplay: Li.Cartesian2.create(1.0, 6000), scaleByDistance: Li.Cartesian4.create(800, 1.5, 10000, 0.5) });
        vdf.push_back({ field: "L14", distanceDisplay: Li.Cartesian2.create(1.0, 10000), scaleByDistance: Li.Cartesian4.create(1000, 1.5, 15000, 0.5) });
        vdf.push_back({ field: "L13", distanceDisplay: Li.Cartesian2.create(1.0, 20000), scaleByDistance: Li.Cartesian4.create(1200, 1.5, 20000, 0.8) });

        //geoLabelLayer.geoJson = baseUrl + "data/db.geojson";
        geoLabelLayer.geoJson = baseUrl + "data/db-4w.geojson";
        geoLabelLayer.setNameField('ALIAS');
        geoLabelLayer.setTerrainField("RH");
        geoLabelLayer.setCategory(fields, categorys);
        geoLabelLayer.setFieldsDDC(vdf);

        geoLabelLayer.create();
        Utils.geoLabelLayer = geoLabelLayer;
    }
    else
    {
        Utils.geoLabelLayer.delete();
        Utils.geoLabelLayer = null;
    }
}

Utils.categoryCount = 0;
Utils.categoryEnabled = false;
Utils.category = ["基础地名", "交通设施", "政府机关", "科技教育", "旅游观光", "宾馆酒楼", "知名企事业",
                "医疗卫生", "文化体育", "公共服务", "购物中心", "邮政通讯", "连锁餐饮", "金融机构"];

Utils.testCategory = function ()
{
    if (Utils.geoLabelLayer != null)
    {
        Utils.geoLabelLayer.setCategoryEnabled(Utils.category[Utils.categoryCount], Utils.categoryEnabled);
        Utils.categoryCount++;

        if (Utils.categoryCount >= 12)
        {
            Utils.categoryCount = 0;
            Utils.categoryEnabled = !Utils.categoryEnabled;
        }  
    }
}

//创建线图层
Utils.createPolylineLayer = function (baseUrl)
{
    if (Utils.geoPolylineLayer == null)
    {
        var geoPolylineLayer = new Li.GeoJsonPolylineLayer();
        geoPolylineLayer.geoJson = baseUrl + "data/futian-polyline-1370.geojson";
        geoPolylineLayer.color = Li.Color.fromRgb(0, 0, 255, 128);
        geoPolylineLayer.alpha = 0.5;
        geoPolylineLayer.width = 1.0;
        geoPolylineLayer.create();
        Utils.geoPolylineLayer = geoPolylineLayer;
    }
    else
    {
        Utils.geoPolylineLayer.delete();
        Utils.geoPolylineLayer = null;
    }
}

//创建面图层
Utils.createPolygonLayer = function (baseUrl)
{
    if (Utils.geoPolygonLayer == null)
    {
        var geoPolygonLayer = new Li.GeoJsonPolygonLayer();
        //geoPolygonLayer.geoJson = baseUrl + "data/futian-polygon.geojson";
        geoPolygonLayer.geoJson = baseUrl + "data/polygon(10-30).geojson";
        //geoPolygonLayer.geoJson = baseUrl + "data/futian.geojson";
        
        //线框
        // geoPolygonLayer.entityType = Li.EntityType.LINE;
        // geoPolygonLayer.lineColor = Li.Color.fromRgb(0, 255, 0, 128);
        // geoPolygonLayer.lineAlpha = 0.5;
        ///or 拉伸面
        geoPolygonLayer.entityType = Li.EntityType.PLANE;
        geoPolygonLayer.fillColor = Li.Color.fromRgb(0, 183, 235, 128);
        geoPolygonLayer.fillAlpha = 0.5;
        ///or 拉伸单体建筑
        // geoPolygonLayer.entityType = Li.EntityType.SINGLEBUILDING;
        // geoPolygonLayer.extrudeHeightField = "BLDG_HEIGH";
        //or 拉伸渐变建筑
        //geoPolygonLayer.entityType = Li.EntityType.RAMPBUILDING;
        
        geoPolygonLayer.floorsField = "UP_BLDG_FL";  //
        geoPolygonLayer.nameField = "batchid";
        geoPolygonLayer.idField = "batchid";
        //or
        // geoPolygonLayer.floorsField = "dscs"; 
        // geoPolygonLayer.nameField = "MC";
        
        
        geoPolygonLayer.create();
        Utils.geoPolygonLayer = geoPolygonLayer;
    }
    else
    {
        //Utils.geoPolygonLayer.delete();
        //Utils.geoPolygonLayer = null;
        //or
        Utils.geoPolygonLayer.enabled = !Utils.geoPolygonLayer.enabled;
    }
}

//二维面数据查询
Utils.createPolygonQueryLayer = function (baseUrl)
{
    if (Utils.PolygonQueryLayer == null)
    {
        console.log("createPolygonQueryLayer");
        var geoPolygonQueryLayer = new Li.GeoJsonPolygonQueryLayer();
        geoPolygonQueryLayer.geoJson = baseUrl + "data/futian.geojson";
        
        geoPolygonQueryLayer.create();
        Utils.PolygonQueryLayer = geoPolygonQueryLayer;
    }
    else
    {
        //Utils.createPolygonQueryLayer.delete();
        //Utils.createPolygonQueryLayer = null;
        //or
        var name = Utils.PolygonQueryLayer.properties(1, "MC");
        var buildingId = Utils.PolygonQueryLayer.properties(1, "TYDZBM");
        console.log(name);
        console.log(buildingId);
        //Utils.PolygonQueryLayer.enabled = !Utils.PolygonQueryLayer.enabled;
    }
}

//创建拉伸体
Utils.createExtrudeEntity = function (scene)
{
    if (Utils.extrudeEntity == null)
    {
        var outer = new Li.Cartesian3Vector();
        outer.push_back(Li.Cartesian3.create(-2399253.5188909904, 5383180.656950178, 2430203.7026347457));
        outer.push_back(Li.Cartesian3.create(-2399682.922521186, 5382957.781043241, 2430279.841859043));
        outer.push_back(Li.Cartesian3.create(-2399813.905771529, 5383105.28294499, 2429823.4304483947));
        outer.push_back(Li.Cartesian3.create(-2399453.33867049, 5383303.194977048, 2429733.859280858));
   
        //var extrudeEntity = new Li.ExtrudeEntity();
        var extrudeEntity = new Li.ExtrudeEntity();
        extrudeEntity.setOuter(outer);
        extrudeEntity.extrudeHeight = 10.0;
        extrudeEntity.run();

        var mat = new Li.Material();
        mat.color = Li.Color.fromRgb(0, 255, 1, 255);
        //mat.bothSided = true;
        mat.opacity = 1.0;
        //mat.shadingModel = Li.ShadingModel.MetallicRoughness;
        var ent = extrudeEntity.createEntity(mat);
        Utils.extrudeEntity = ent;
        scene.addEntity(ent);
        extrudeEntity.delete();
    }
    else
    {
        Utils.extrudeEntity.delete();
        Utils.extrudeEntity = null;
    }
}

//创建拉伸管线
Utils.createExtrudePipe = function ()
{
    if (Utils.extrudePipe == null)
    {
        var positions = new Li.Cartesian3Vector();
        positions.push_back(Li.Cartesian3.create(-2.4005e+06, 5.3824e+06, 2.43068e+06));
        positions.push_back(Li.Cartesian3.create(-2.4004e+06, 5.38233e+06, 2.43093e+06));
        positions.push_back(Li.Cartesian3.create(-2.40026e+06, 5.38242e+06, 2.43088e+06));
        positions.push_back(Li.Cartesian3.create(-2.40015e+06, 5.38235e+06, 2.43112e+06));
        positions.push_back(Li.Cartesian3.create(-2.40025e+06, 5.38225e+06, 2.43126e+06));

        var shape = Li.GisUtil.computeShape2D(3.0, 6);

        //var extrudePipe = new Li.ExtrudePipe();
        var extrudePipe = new Li.ExtrudePipe();
        extrudePipe.setPositions(positions);
        extrudePipe.setShape(shape);
        extrudePipe.run();

        var mat = new Li.Material();
        mat.color = Li.Color.fromRgb(255, 0, 0, 255);
        var ent = extrudePipe.createEntity(mat);
        Utils.extrudePipe = ent;
        scene.addEntity(ent);
        extrudePipe.delete();
    }
    else
    {
        Utils.extrudePipe.delete();
        Utils.extrudePipe = null;
    }
}

//计算物体的体积(那之前的拉伸体做测试)
Utils.geometryVolume = function ()
{
    if (Utils.extrudeEntity != null)
    {
        var renderer = Utils.extrudeEntity.renderer;
        var f = Li.GisUtil.calculateGeometryVolume(renderer);

        f.then(function (value) {
            console.log("geometry volume : " + value);
        });
    }
}

//体积
function geometryVolumeResult(value)
{
    console.log("geometry volume is: " + value);
}

// BMP GIF JPG JPEG PNG PBM PGM PPM XBM XPM
// 4k: 4096 x 2160
// 8k: 7680 x 4320
// 15260 x 4320 //显存太小， 调用会崩溃
// 16k: 15260 x 8640 不支持
//截图
Utils.saveImage = function ()
{
    //console.log("save image");
    //Li.FileSystem.saveRenderImage(1920, 1080, "renderimage", "PNG");
    //Li.FileSystem.saveRenderImage(4096, 2160, "renderimage", "JPEG"); 
    //Li.FileSystem.saveRenderImage(7680, 4320, "renderimage", "JPEG"); 
    //Li.FileSystem.saveRenderImage(15260, 4320, "renderimage", "JPEG"); 

    Li.saveImage2Base64(400, 300, 'PNG').then(function (value)
    {
        console.log(value);
        let byteArray = Li.ByteArray.fromPtr(value); //拿到一个Li.ByteArray 对象
        let base64 = byteArray.data();  //拿到base64内存数据
        console.log(base64);
    });
}

//裁切体测试
Utils.testClipVolume = function (scene)
{
    if (Utils.ClipVolume == null)
    {
        let pos = Li.Cartographic.fromDegrees(114.0553576, 22.5099829, 30.0);
        let rotation = Li.Quaternion.fromEulerAngles(0, 0, 0);
        let cvEntity = this.addClipVolume(scene, pos, rotation);  
        Utils.ClipVolume = cvEntity;

        let p = Li.Cartographic.fromDegrees(114.0553576, 22.5099829, 500);
        scene.mainCamera.cameraController().flyToCartographic(p, 3, 0, -90, 0);
    }
    else
    {
        Utils.ClipVolume.delete();
        Utils.ClipVolume = null;
    }
}

//添加裁切体
Utils.addClipVolume = function (scene, position, rotation)
{
    let cv = new Li.ClipVolume();
    cv.shape = Li.ClipVolumeShape.Cube;         //剪切形状, 默认立方体
    cv.clipFlag = Li.ClipVolumeFlag.ClipAll;    //默认是全部剪切, 可选ClipGlobe, ClipScene, ClipAll
    cv.size = Li.Vector3.create(100, 100, 100); // 100 x 100 x 100 米的剪切体
    cv.showDebugVolume = true;                  //是否显示剪切的轮廓
    cv.objectName = "cv_test";                  //添加一个名称标识

    var entity = new Li.Entity();
    entity.transform.cartographic = position;   //坐标点
    var childEntity = new Li.Entity();          //子物体
    childEntity.parent = entity;                //设置父子结构
    childEntity.transform.rotation = rotation;  //旋转角度(四元数)
    childEntity.addComponent(cv);               //添加组件  
    scene.addEntity(entity);                    //添加到rootEntity的子节点中

    return entity;
}

//添加fps控制器(键盘鼠标, w,s,a,d键控制, 鼠标x轴控制左右旋转, 鼠标y轴控制上下旋转)
// w: 向前 s:向后 a: 左移 d:右移,
// 鼠标左键X轴拖动:左右旋转 鼠标左键Y轴拖动: 上下旋转
// 鼠标中键按下, 向下: 下移, 向上:上移
// w,s,a,d 组合 -/+ : 减速/ 加速
//BIM室内模式浏览时打开
Utils.CameraFov = 50;   //保存相机fov
Utils.addFPSController = function ()
{
    if (Utils.FPSController == null)
    {
        let FPSCtrl = new Li.FPSController();
        FPSCtrl.setAction(true);
        Utils.FPSController = FPSCtrl;
        Utils.CameraFov = window.scene.mainCamera.fov;
        window.scene.mainCamera.fov = 75;

        console.log("old fov: " + Utils.CameraFov);
    }
    else
    {
        Utils.FPSController.setAction(!Utils.FPSController.action());

        //设置原来的相机fov
        if (!Utils.FPSController.action())
        {
            window.scene.mainCamera.fov = Utils.CameraFov;
        }
    } 
}

//添加地下管线
Utils.addPipe = function (scene, baseUrl)
{
    if (Utils.pipeLine == null)
    {
        let tilesetLayer = new Li.TilesetLayer();
        //tilesetLayer.url = baseUrl + "data/futian-pipe/tileset.json";
        //tilesetLayer.url = baseUrl + "data/YS/tileset.json";
        tilesetLayer.url = baseUrl + "data/WS/tileset.json";
     
        tilesetLayer.color = Li.Color.fromRgb(255, 251, 240, 255);
        // tilesetLayer.renderStyle = Li.RenderStyle.ColorStyle;  
        tilesetLayer.clipLevelOfDetail = true;
         tilesetLayer.componentComplete();
        Utils.pipeLine = tilesetLayer;
        //scene.globe.show = false; //隐藏地形
        //or
        //scene.globe.setDefaultTerrain();  //设置默认地形, 高度为0
        //or
        scene.globe.opacity = 0.8;  //设置地面的透明度
        //Utils.flyTo(114.05140245, 22.5344496, 100);

        let camera = window.scene.mainCamera;
        
        var p = Li.Cartographic.fromDegrees(114.068417, 22.51753, 39.7);
        camera.cameraController().flyToCartographic(p, 3, 346.72, -14.55, 0);
    }
    else
    {   //显示/隐藏地形
        //scene.globe.show = !scene.globe.show;
        //or
        //scene.globe.setTerrainProviderUrl(window.baseUrl + 'data/ft-dem-max14');
        //or
        scene.globe.opacity = 1.0;
    }
}

//地理围栏测试
Utils.addGeoFencing = function ()
{
    if (Utils.geoFencing == null)
    {
        let vec3 = Li.Vector3.create(-2.4008e+06, 5.38223e+06, 2.43075e+06);
        let circle = Li.GisUtil.computeShape2GeodeticSurface(1000.0, 60, vec3); // 1000: 半径 , 60:圆弧细分数 , vec3: 中心点
        //or
        // let positions = new Li.Cartesian3Vector();
        // positions.push_back(Li.Cartesian3.create(-2401337.658521618, 5382318.731108139, 2430032.3037992488));
        // positions.push_back(Li.Cartesian3.create(-2403067.038169773, 5381539.839092472, 2430047.6816503555));
        // positions.push_back(Li.Cartesian3.create(-2403265.691728874, 5381964.447919825, 2428918.2055893387));
        // positions.push_back(Li.Cartesian3.create(-2401564.0811817464, 5382723.96959504, 2428918.1918774224));

        let geoFencing = new Li.GeoFencing();
        geoFencing.setOuter(circle);    //设置外轮廓坐标列表, 可以根据需要传入一组坐标列表
        //or
        //geoFencing.setOuter(positions); 

        geoFencing.setExtrudeHeight(300.0); //拉伸高度
        geoFencing.setAnimationRun(true);   //是否有动画
        geoFencing.setRange(0.01);
        //geoFencing.setColorRamp(Li.Color.fromRgb(0, 255, 0, 255), Li.Color.fromRgb(255, 0, 0, 255)); //渐变颜色(底部到顶部渐变)
        geoFencing.create();

        Utils.geoFencing = geoFencing;
    }
    else
    {   
        //显示/隐藏测试
        //Utils.geoFencing.enabled = !Utils.geoFencing.enabled;

        //删除测试
        Utils.geoFencing.delete();
        Utils.geoFencing = null;
    }
    
}

//热力图
Utils.createHeatmap = function (baseUrl)
{
    if (Utils.heatmap == null)
    {
        var heatmap = new Li.Heatmap();
        //heatmap.geoJson = baseUrl + "data/futian-point.geojson";
        //heatmap.geoJson = baseUrl + "data/data-home.geojson";
        heatmap.addString(Utils.headMapData);
        heatmap.setColorRamp(Li.Color.fromRgb(0, 255, 0, 255), Li.Color.fromRgb(255, 0, 0, 255));
        heatmap.radius = 500;
        heatmap.create();
        Utils.heatmap = heatmap;
    }
    else
    {
        Utils.heatmap.delete();
        Utils.heatmap = null;
    }
}

//三维热力图
Utils.createHeatmap3D = function (baseUrl)
{
    if (Utils.heatmap3d == null)
    {
        let heatmap3d = new Li.Heatmap3D();
        heatmap3d.geoJson = baseUrl + "data/futian-point.geojson";
        heatmap3d.setColorRamp(Li.Color.fromRgb(0, 255, 0, 255), Li.Color.fromRgb(255, 0, 0, 255));
        heatmap3d.radius = 500;
        heatmap3d.create();
        Utils.heatmap3d = heatmap3d;
    }    
}

Utils.BIMTileset = null;
Utils.TilesetEntity = null;
Utils.BIMPullOut = null;
Utils.addBIMFloors = function (scene, baseUrl)
{
    if (Utils.BIMTileset == null)
    {
        //let tileset = new Li.Tileset(baseUrl + "data/xiangmihu_3dtiles/tileset.json");
        //let tileset = new Li.Tileset(baseUrl + "data/BIM/深圳香蜜湖国际交流中心(分层)/tileset.json"); 
        let tileset = new Li.Tileset(baseUrl + "data/BIM/MXY_MAX_3DTILES_g1/tileset.json");
        //113.99841, 22.5495, 500
        //let tileset = new Li.Tileset(baseUrl + "data/BIM/福田妇儿医院/tileset.json");
        // 114.06555, 22.545489, 500
        //let tileset = new Li.Tileset(baseUrl +"data/BIM/福投控大厦建筑模型/tileset.json");
        //114.06125, 22.569636, 500
        //let tileset = new Li.Tileset(baseUrl +"data/BIM/恒裕金龙大厦/tileset.json");
        //114.04977, 22.51002, 500
        //let tileset = new Li.Tileset(baseUrl +"data/BIM/深港科创综合服务中心/tileset.json");
        //114.03633, 22.55215, 500
        //let tileset = new Li.Tileset(baseUrl + "data/BIM/天健天骄西筑项目/tileset.json");
        //114.023858, 22.54714, 500
        //let tileset = new Li.Tileset(baseUrl +"data/BIM/香蜜湖/tileset.json");
        //114.04255, 22.566128, 500
        //let tileset = new Li.Tileset(baseUrl +"data/BIM/中粮大悦城/tileset.json");
        
        // let tileset = new Li.Tileset("http://10.253.102.69/gw/TILE_3D_MODEL/3D/QX_FT/tileset.json");
        // tileset.setHeater("XbZrKCXAKXNnu5cRuyXoCmg2DU8E0ztA8/27O2AS3EtAsqU6Fymn8hqiJicChJyg");

        let entity = new Li.Entity();
        entity.addComponent(tileset);
        scene.addEntity(entity);

        Utils.BIMTileset = tileset;
        Utils.TilesetEntity = entity;
        
        //Utils.flyTo(114.023858, 22.54714, 500);
        let p = Li.Cartographic.fromDegrees(114.0337386, 22.603996, 500);
        scene.mainCamera.cameraController().flyToCartographic(p, 3, 0, -90, 0);
        tileset.readyPromise.then(function () {
            console.log("then ");
            setTimeout(function () {
            console.log("create BIMPullOut");
            let bimPullOut = new Li.BIMPullOut(Utils.BIMTileset);
            Utils.BIMPullOut = bimPullOut;

            let floors = bimPullOut.floors();   //取出所有的楼层名称
            let size = floors.size();

            for (let i = 0; i < size; i++)
            {
                let floorName = floors.get(i);   
                console.log( "floor: " + floorName);  //楼层名称
            }
            }, 10000)
        });
    }
    
}

//抽出一层
Utils.bimPullOut = function ()
{
   
    if (Utils.BIMPullOut != null)
    {
        console.log("bim pull out");
        //Utils.BIMPullOut.move("F04_AS", Li.Vector3.create(0.0, 0.0, 100.0)); // F04_AS 楼层名称,  vector3: lng, lat, height (单位是米, 会转换为对应经纬度值)
        Utils.BIMPullOut.move("29", Li.Vector3.create(0, 0.0, 80.0));
    }
}

//还原
Utils.bimReset = function ()
{
    if (Utils.BIMPullOut != null)
    {
        console.log("bim reset");
        Utils.BIMPullOut.reset();    
    }
}

Utils.buildingHeight = null;
//建筑控高分析
Utils.buildingHeightRestriction = function ()
{
    console.log("building Height Restriction");
    if (Utils.buildingHeight == null)
    {
        let plane = new Li.Polygon3D();
        plane.color = Li.Color.fromRgb(0, 240, 120, 128);//颜色
        plane.alpha = 0.5;      //透明度
        plane.fillAlpha = 0.5;  //填充透明度
        plane.setAltitude(50);
        plane.setAltitudeMethod(Li.AltitudeMethod.Absolute); //绝对模式, 贴于地形之上
        plane.setFillColor(Li.Color.fromRgb(0, 255, 0, 128), Li.BrushStyle.SolidPattern);
        plane.addPoint(Li.Vector3.create(-2401469.458, 5382345.588, 2429863.9276));
        plane.addPoint(Li.Vector3.create(-2403508.326, 5381397.997, 2429943.705));
        plane.addPoint(Li.Vector3.create(-2403778.869, 5381775.772, 2428843.392));
        plane.addPoint(Li.Vector3.create(-2401615.949, 5382759.165, 2428806.615));
        plane.draw();   //绘制
        plane.end();    //end之后不能添加点
        plane.tag = "plane";
    
        let polygon = new Li.Polygon3D();
        polygon.color = Li.Color.fromRgb(255, 0, 0, 255);//颜色
        polygon.alpha = 0.5;      //透明度
        polygon.fillAlpha = 0.5;  //填充透明度
        polygon.setAltitudeMethod(Li.AltitudeMethod.OnTerrain); //贴于地形之上
        polygon.setFillColor(Li.Color.fromRgb(255, 0, 0, 255), Li.BrushStyle.SolidPattern);
        polygon.addPoint(Li.Vector3.create(-2401469.458, 5382345.588, 2429863.9276));
        polygon.addPoint(Li.Vector3.create(-2403508.326, 5381397.997, 2429943.705));
        polygon.addPoint(Li.Vector3.create(-2403778.869, 5381775.772, 2428843.392));
        polygon.addPoint(Li.Vector3.create(-2401615.949, 5382759.165, 2428806.615));
        polygon.setLimitHeight(50.1);
       
        polygon.draw();   //绘制
        polygon.end();    //end之后不能添加点
        polygon.tag = "polygon";

        let entity = new Li.Entity();
        plane.parent = entity;
        polygon.parent = entity;
        Utils.buildingHeight = entity;

        window.scene.addEntity(entity);
    }
    else
    {
        
    }
}

//监控摄像头模型, 点击播放视频
Utils.CCTVCamera = null;
Utils.addCameraModel = function ()
{
    if (Utils.CCTVCamera == null)
    {
        let cctvUrl = baseUrl + "data/camera_180.glb"; 
        let cctvmPos = Li.Cartographic.fromDegrees(114.051514, 22.510255, 4.0000);
        let cctvRotation = Li.Vector3.create(0, 0, 0);
        let cctvOffset = Li.Vector3.create(0, 0, 0);
        var cctvModel = Utils.modelLayer(cctvUrl, cctvmPos, cctvRotation, cctvOffset);

        let camera = window.scene.mainCamera;
        var p = Li.Cartographic.fromDegrees(114.051507, 22.510365, 9.6);
        camera.cameraController().flyToCartographic(p, 3, 175, -11.6, 0);
    }
}

Utils.cutAndFillVolume = null;
Utils.cutAndFillVolumeState = false;
Utils.addCutFillVolume = function ()
{
    if (Utils.cutAndFillVolume == null)
    {
        let cutAndFillVolume = new Li.CutAndFillVolume();
        //cutAndFillVolume.baseHeight = 35;
        //cutAndFillVolume.lineColor = Li.Color.fromRgb(255, 0, 0, 255);
        //cutAndFillVolume.fillVolumeColor = Li.Color.fromRgb(0, 255, 0, 255);
        //cutAndFillVolume.cutVolumeColor = Li.Color.fromRgb(0, 0, 255, 255);
        cutAndFillVolume.addPoint(Li.Vector3.create(-2401102.17803038, 5381837.221917883, 2431322.4088967624));
        cutAndFillVolume.addPoint(Li.Vector3.create(-2401217.6519644577, 5382036.858405292, 2430770.1142349862));
        cutAndFillVolume.addPoint(Li.Vector3.create(-2402878.7401228216, 5381281.544949363, 2430800.6906644125));
        cutAndFillVolume.addPoint(Li.Vector3.create(-2402770.937031862, 5381018.617677656, 2431484.598601653));
        cutAndFillVolume.addPoint(Li.Vector3.create(-2402302.095332233, 5381063.218309714, 2431846.686779186));
        cutAndFillVolume.addPoint(Li.Vector3.create(-2401703.776193555, 5381301.782318114, 2431909.346477503));
        cutAndFillVolume.computeCutVolume();

        cutAndFillVolume.readyPromise.then(function () {
            console.log("minHeight : maxHeight : cutVolume : fillVolume: " + cutAndFillVolume.minHeight()
            + cutAndFillVolume.maxHeight()
            + cutAndFillVolume.cutVolume()
            + cutAndFillVolume.fillVolume());
        });
        Utils.cutAndFillVolume = cutAndFillVolume;
    }
    else
    {
        if (!Utils.cutAndFillVolumeState)
        {
            Utils.cutAndFillVolume.baseHeight = 40;
            Utils.cutAndFillVolume.computeCutVolume();
            Utils.cutAndFillVolumeState = true;
        }
        else
        {
            Utils.cutAndFillVolumeState = false;
            Utils.cutAndFillVolume.delete();
            Utils.cutAndFillVolume = null;
        }
    }
}

//创建粒子效果
Utils.createParticle = function (lonlat, options) {
    // emitter
    var emitter = new Li.ParticleEmitter();
    emitter.shapeType = options.shapeType;
    emitter.shapeSize = options.shapeSize;
    emitter.fillShape = options.fillShape;
    emitter.size = options.size;
    emitter.endSize = options.endSize;
    emitter.sizeVariation = options.sizeVariation;
    emitter.emitRate = options.emitRate;
    emitter.lifeSpan = options.lifeSpan;

    // velocity
    var vec = new Li.ParticlePointDirection();
    vec.x = options.velocity[0];
    vec.y = options.velocity[1];
    vec.z = options.velocity[2];
    vec.xVariation = options.velocityVariation[0];
    vec.yVariation = options.velocityVariation[1];
    vec.zVariation = options.velocityVariation[2];
    emitter.velocity = vec;

    // acceleration
    var acc = new Li.ParticlePointDirection();
    acc.x = options.acceleration[0];
    acc.y = options.acceleration[1];
    acc.z = options.acceleration[2];
    acc.xVariation = options.accelerationVariation[0];
    acc.yVariation = options.accelerationVariation[1];
    acc.zVariation = options.accelerationVariation[2];
    emitter.acceleration = acc;

    // renderer
    var renderer = new Li.ImageParticleRenderer();
    renderer.color = options.color;
    renderer.colorVariation = options.colorVariation;
    renderer.alpha = options.alpha;
    renderer.alphaVariation = options.alphaVariation;
    renderer.alignedAxis = options.alignedAxis;
    renderer.blendMode = options.blendMode;
    renderer.image = window.baseUrl + options.image;

    // particle
    var particleSystem = new Li.ParticleSystem();
    particleSystem.addEmitter(emitter);
    particleSystem.addRenderer(renderer);

    // entity
    var entity = new Li.Entity();
    entity.transform.cartographic = lonlat;
    entity.addComponent(particleSystem);
    GlobalViewer.scene.addEntity(entity);

    return particleSystem;
}

//火
Utils.addFire = function ()
{
    // create fire
    Utils.createParticle(
    Li.Cartographic.fromDegrees(114.054494, 22.540745, 30),
    {
        shapeType: Li.ParticleShapeType.Rectangle, // [Line, Rectangle, Ellipse]
        shapeSize: Li.Vector2.create(40, 20),
        fillShape: true,
        emitRate: 200,
        lifeSpan: 4000,
        size: Li.Vector2.create(16, 16),
        endSize: Li.Vector2.create(2, 2),
        sizeVariation: Li.Vector2.create(0, 0),
        velocity: [0, 0, 0],
        velocityVariation: [1, 1, 0],
        acceleration: [0, 0, 8],
        accelerationVariation: [1, 1, 0],
        alignedAxis: Li.Vector3.create(0, 0, 0),
        blendMode: Li.ParticleBlendMode.NormalBlend,   //NormalBlend   AdditiveBlend
        color: Li.Color.fromRgbF(1, 0.25, 0.06, 1),
        //color: Li.Color.fromRgb(235, 50, 0, 255),
        colorVariation: 0.1,
        alpha: 0.70,
        alphaVariation: 0.1,
        image: "symbols/particle/glowdot2.png", //glowdot.png"
    });
}

//烟
Utils.addSmoke = function ()
{
    // create white/gray/black smoke
    Utils.createParticle(
    Li.Cartographic.fromDegrees(114.054494, 22.540745, 30),
    {
        shapeType: Li.ParticleShapeType.Rectangle, // [Line, Rectangle, Ellipse]
        shapeSize: Li.Vector2.create(40, 20),
        fillShape: true,
        emitRate: 120,
        lifeSpan: 10000,
        size: Li.Vector2.create(8, 8),
        endSize: Li.Vector2.create(35, 35),
        sizeVariation: Li.Vector2.create(6, 6),
        velocity: [0.5, 0.5, 0.2],
        velocityVariation: [2, 2, 0],
        acceleration: [1, 1, 4],
        accelerationVariation: [1, 1, 1],
        alignedAxis: Li.Vector3.create(0, 0, 0),
        blendMode: Li.ParticleBlendMode.NormalBlend,
        //color: Li.Color.fromRgb(50, 50, 50, 255), //灰烟
        color: Li.Color.fromRgb(25, 25, 25, 255), //黑烟
        //color: Li.Color.fromRgbF(1, 1, 1, 1),  //白烟
        colorVariation: 0,
        alpha: 0.15, //0.4
        alphaVariation: 0.05,
        image: "symbols/particle/smoke.png",
    });
}

//水柱
Utils.addWater = function ()
{
    // create water
    Utils.createParticle(
    Li.Cartographic.fromDegrees(114.054, 22.540755, 30),
    {
        shapeType: Li.ParticleShapeType.Ellipse, // [Line, Rectangle, Ellipse]
        shapeSize: Li.Vector2.create(1, 1),
        fillShape: true,
        emitRate: 1200,
        lifeSpan: 1500,
        size: Li.Vector2.create(1, 1),
        endSize: Li.Vector2.create(3, 3),
        sizeVariation: Li.Vector2.create(0, 0),
        velocity: [15, 0, 0],
        velocityVariation: [0, 0, 1.2],
        acceleration: [20, 0, 0],
        accelerationVariation: [0, 0, 0.5],
        alignedAxis: Li.Vector3.create(1, 0, 0),
        blendMode: Li.ParticleBlendMode.AdditiveBlend,
        color: Li.Color.fromRgb(220, 235, 255, 255),
        colorVariation: 0,
        alpha: 0.8,
        alphaVariation: 0,
        image: "symbols/particle/pressuriseWater.png",
    });
}

//雨
Utils.addRain = function ()
{
    console.log("create rain");
    Utils.createParticle(
        Li.Cartographic.fromDegrees(114.054494, 22.541745, 1500),
        {
            shapeType: Li.ParticleShapeType.Rectangle, // [Line, Rectangle, Ellipse]
            shapeSize: Li.Vector2.create(3000, 3000),
            fillShape: true,
            emitRate: 3000,
            lifeSpan: 3000,
            size: Li.Vector2.create(12, 30),
            endSize: Li.Vector2.create(12, 30),
            sizeVariation: Li.Vector2.create(2, 6),
            velocity: [0, 0, -400],
            velocityVariation: [1, 1, 0],
            acceleration: [0, 0, -300],
            accelerationVariation: [1, 1, 0],
            alignedAxis: Li.Vector3.create(0.1, 0.1, 1),
            blendMode: Li.ParticleBlendMode.AdditiveBlend,
            color: Li.Color.fromRgb(220, 235, 255, 255),
            colorVariation: 0,
            alpha: 0.6,
            alphaVariation: 0.2,
            image: "symbols/particle/rain.png",
        });
}

//雪
Utils.addSnow = function ()
{
    console.log("create snow");
    Utils.createParticle(
        Li.Cartographic.fromDegrees(114.054494, 22.541745, 1000),
        {
            shapeType: Li.ParticleShapeType.Rectangle, // [Line, Rectangle, Ellipse]
            shapeSize: Li.Vector2.create(2000, 2000),
            fillShape: true,
            emitRate: 1300,
            lifeSpan: 35000,
            size: Li.Vector2.create(3, 3),
            endSize: Li.Vector2.create(3, 3),
            sizeVariation: Li.Vector2.create(1, 1),
            velocity: [0, 0, -2],
            velocityVariation: [2, 2, 0],
            acceleration: [0, 0, -2],
            accelerationVariation: [1, 1, 0],
            alignedAxis: Li.Vector3.create(0, 0, 0),
            blendMode: Li.ParticleBlendMode.AdditiveBlend,
            color: Li.Color.fromRgb(255, 255, 255, 255),
            colorVariation: 0,
            alpha: 0.8,
            alphaVariation: 0.0,
            image: "symbols/particle/snow.png",
        });
}

//雾
Utils.addFog = function ()
{
    console.log("create fog");
    Utils.createParticle(
        Li.Cartographic.fromDegrees(114.054494, 22.541745, 50),
        {
            shapeType: Li.ParticleShapeType.Ellipse, // [Line, Rectangle, Ellipse]
            shapeSize: Li.Vector2.create(280, 250),
            fillShape: true,
            emitRate: 350,
            lifeSpan: 10000,
            size: Li.Vector2.create(12, 12),
            endSize: Li.Vector2.create(12, 12),
            sizeVariation: Li.Vector2.create(5, 5),
            velocity: [0.2, 0.2, 0.2],
            velocityVariation: [0.2, 0.2, 0.2],
            acceleration: [0.5, 0.5, -0.8],
            accelerationVariation: [1, 1, 1],
            alignedAxis: Li.Vector3.create(0, 0, 0),
            blendMode: Li.ParticleBlendMode.NormalBlend,
            color: Li.Color.fromRgb(180, 180, 180, 255),
            colorVariation: 0,
            alpha: 0.08,
            alphaVariation: 0.0,
            image: "symbols/particle/smoke.png",
        });
}

