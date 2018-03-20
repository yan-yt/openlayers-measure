var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
// var closer = document.getElementById('popup-closer');

//弹窗
var overlay = new ol.Overlay(({
    element: container,
    autoPan: true,
    autoPanAnimation:{
        duration:250
    }
}));
//iserverWorld底图
var iserverWorld = new ol.layer.Tile({
    type:"base",
    title:"iserverWorld",
    source:new ol.source.XYZ({
        url:"http://192.168.18.45:8090/iserver/services/map-world/rest/maps/World/zxyTileImage/{z}/{x}/{y}.png"
    })
})
//天地图底图
var tianditu = new ol.layer.Group({
    type:"base",
    title:"tianditu",
    combine:true,
    layers:[
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url:"http://t5.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}"
            })
        }),
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url:"http://t5.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}"
            })
        })
    ]
})
//百度地图底图
var projection = ol.proj.get("EPSG:3857");  
var resolutions = [];  
for (var i = 0; i < 19; i++) {  
    resolutions[i] = Math.pow(2, 18 - i);  
}  
var tilegrid = new ol.tilegrid.TileGrid({  
    origin: [0, 0],  
    resolutions: resolutions  
});  
var baidu_source = new ol.source.TileImage({  
    projection: projection,  
    tileGrid: tilegrid,  
    tileUrlFunction: function (tileCoord, pixelRatio, proj) {  
        if (!tileCoord) {  return "";  };
        var z = tileCoord[0];  
        var x = tileCoord[1];  
        var y = tileCoord[2];  
        if (x < 0) {  x = "M" + (-x);  };
        if (y < 0) {  y = "M" + (-y);  };  
        return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y + "&z=" + z + "&styles=pl&udt=20151021&scaler=1&p=1";  
    }  
});  
var baidu_layer = new ol.layer.Tile({  
    type:"base",
    title:"baidu_layer",
    source: baidu_source  
});  


// //设置地图
var map = new ol.Map({
    layers:[baidu_layer,tianditu,iserverWorld],
    target:'map',
    overlays:[overlay],
    view: new ol.View({
        center: ol.proj.transform([104.06, 30.67], 'EPSG:4326', 'EPSG:3857'),  
        zoom: 4,
        maxZoom:18
    }),
    controls:ol.control.defaults({
        attributionOptions:{
            collapsible:false
        }
    })
})

//图层控件
var layerSwitcher = new ol.control.LayerSwitcher({
    tipLabel:"切换图层"
})
map.addControl(layerSwitcher);
map.on('click',function (evt) {
    //坐标
    var coordinate = evt.coordinate;
    console.log(coordinate);
    // ol.proj.transform(coordinate, source, destination)来转换不同的坐标点，
    var hdms = ol.proj.transform(evt.coordinate,'EPSG:3857','EPSG:4326')
    console.log(hdms);
    content.innerHTML = '<ul>'+'<li>'+"坐标:"+'<span>'+'<code>'+hdms+'</code>'+'</span>'+'</li>'+'</ul>';  
    overlay.setPosition(coordinate);

});

//1 查询人口大于1亿的首都
var url =  "http://192.168.18.45:8090/iserver/services/map-world/rest/maps/World/queryResults.rjson?returnPostAction=true&getMethodForm=true&returnContent=true";
var queryMode = "SqlQuery", attributeFilter = "POP%26gt;10000000",startRecord=0,expectCount=1000,name="Capitals@World#1";
mapQuery(url,queryMode,attributeFilter,startRecord,expectCount,name,function(data){
    var allPoints = [],cap_coord_pop=[],coords=[];
    var result = JSON.parse(data);
    features =result.recordsets[0].features;
    for(var i = 0;i<features.length;i++){
        cap_coord_pop[i]= [features[i].fieldValues[9],features[i].fieldValues[1],features[i].fieldValues[2],features[i].fieldValues[7]];
        coords[i] = [features[i].fieldValues[1],features[i].fieldValues[2]];
    }
    //1)把数组元素从字符串转成number
    for(var i = 0;i<coords.length;i++){
        coords[i]=[Number(coords[i][0]),Number(coords[i][1])];
    }
    //2)设置每一个marker的point和样式，并返回features
    var markerSourceArr = [];
    for(var j = 0;j<coords.length;j++){
        markerSourceArr[j] = getMarkerSource(coords[j]);
    }
    //3)设置source
    var markerSource = new ol.source.Vector({
        features:markerSourceArr
    })
    //4)设置vector图层的title&source
    var markerLayer = new ol.layer.Vector({
        title:"cap>1yi",
        source:markerSource
    })
    map.addLayer(markerLayer)
    // debugger;
});
// debugger;



//2 查询各个中国省市
var uri="http://192.168.18.45:8090/iserver/services/data-China100/rest/data/featureResults.rjson?returnContent=true";
var datasetNames = ["China:China_Province_pg"];
getProvinceSource(uri,datasetNames,function(features){
    var allPoints = [];
     //获得每个资源的geometry；      
     function getPoints(i){
        var linepoint = [];
            // console.log(features);
            var points = features[i].geometry.points;
            // console.log(points);
            for(var j =0;j<points.length;j++){
                var arr = [points[j].x,points[j].y];
                linepoint.push(arr);
            }
            // console.log(linepoint);   
        return linepoint;
    };
    for(var i = 0;i<features.length;i++){
        allPoints.push(getPoints(i));
    };
    console.log(allPoints[0]);
    var provinceSourceArr = [];
    for(var x = 0;x<allPoints.length;x++){
        var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6);
        provinceSourceArr[x] = getProvinceFeatures(allPoints[x],color);
    };
    var provinceSource = new ol.source.Vector({
        features:provinceSourceArr
    });
    var provinceLayer = new ol.layer.Vector({
        title:"provinceLayer",
        source:provinceSource
    });
    map.addLayer(provinceLayer);
    // debugger;
});




//3 查询河流
var riversPoints = [];
getChinaRiversFeatures(function(features){
    function getPoints(i){
        var linepoint = [];
            // console.log(features);
            var points = features[i].geometry.points;
            // console.log(points);
            for(var j =0;j<points.length;j++){
                var arr = [points[j].x,points[j].y];
                linepoint.push(arr);
            }
            // console.log(linepoint);   
        return linepoint;
    }
    for(var i = 0;i<features.length;i++){
        riversPoints.push(getPoints(i));
    }
    var riversSourceArr=[];
    console.log(riversPoints[0]);
    for(var j = 0;j<riversPoints.length;j++){
        var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6);
        riversSourceArr[j] = getRiversSource(riversPoints[j],color);
    };
    var riversSource = new ol.source.Vector({
        features:riversSourceArr
    })
    var riversLayer = new ol.layer.Vector({
        title:"riversLayer",
        source:riversSource
    });
    debugger;
    map.addLayer(riversLayer);
});

