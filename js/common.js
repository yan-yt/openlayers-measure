
// POST创建featuresResult资源,获取geometry；
function getProvinceSource(uri,datasetNames,callback){
    //设置请求体参数
    var entry={
    getFeatureMode:"SQL",
    datasetNames:datasetNames,
    maxFeatures:1000,
    queryParameter:{
        "attributeFilter":"SMID%26gt;0", 
    }
    };
    $.ajax({
        url:uri,
        type: 'POST',
        data: JSON.stringify(entry),
        success: success,
        error: error
    });
    function success(data) {
        console.log(JSON.parse(data));
        var features = JSON.parse(data).features;
        console.log(features);
        callback(features);
    };
    
    function error(error) {
        console.log(error)
    };
}
// debugger; 

//1 创建SQL查询
function mapQuery(url,queryMode,attributeFilter,startRecord,expectCount,name,callback){
    //设置请求体参数
    var entry = {
        "queryMode": queryMode,
        "bounds": {
            "leftBottom": {
                "x": 0,
                "y": 0
            },
            "rightTop": {
                "x": 100,
                "y": 100
            }
        },
        "distance": 1,
        "queryParameters": {
            "queryParams": [{
                "attributeFilter":attributeFilter ,
                "name": name
            }],
            "startRecord": startRecord,
            "expectCount": expectCount,
            "networkType": "LINE",
            "queryOption": "ATTRIBUTEANDGEOMETRY"
        },
        "keywords": "",
        "spatialQueryMode": "INTERSECT"
    };
    $.ajax({
        url:url,
        type: 'POST',
        //dataType:'jsonp',
        data: JSON.stringify(entry),
        success: success,
        error: error
        // async: false
    });

    function success(data) {
        callback(data);
    }
    function error(error) {
        console.log(error)
    }
}

// debugger;
//3 查询河流
function getChinaRiversFeatures(callback){
    var uri = "http://117.122.248.69:8090/iserver/services/data-world/rest/data/featureResults.rjson?returnContent=true";
    //设置请求体参数
    var entry={
        getFeatureMode:"SQL", 
        // targetEpsgCode:3857,
        datasetNames:["World:Countries"], 
        maxFeatures:1000, 
        queryParameter:{
            "attributeFilter":"CAPITAL = \"北京\""
        }
    };
    //post中国的范围
    $.ajax({
        url:uri,
        type:'POST',
        data: JSON.stringify(entry),
        success: success,
        error: function(error){
            console.log(error);
        },
        // async: false
    })
    function success(data){
        // console.log(JSON.parse(data).features[0].geometry);
        var geometry = JSON.parse(data).features[0].geometry;
        //post 中国的河流
        var entry1={
            getFeatureMode:"SPATIAL", 
            targetEpsgCode:3857,
            datasetNames:["World:Rivers"], 
            geometry:geometry,
            maxFeatures:1000, 
            spatialQueryMode:"CONTAIN"
        };
        $.ajax({
            url:uri,
            type:"POST",
            data: JSON.stringify(entry1),
            success:success1,
            error:function(error){
                console.log(error);
            },
            // async: false
        })
        function success1(data){
            // callback(data);
            console.log(JSON.parse(data));
            var features = JSON.parse(data).features;
            callback(features);
            // function getPoints(i){
            //     var linepoint = [];
            //         // console.log(features);
            //         var points = features[i].geometry.points;
            //         // console.log(points);
            //         for(var j =0;j<points.length;j++){
            //             var arr = [points[j].x,points[j].y];
            //             linepoint.push(arr);
            //         }
            //         // console.log(linepoint);   
            //     return linepoint;
            // }
            // for(var i = 0;i<features.length;i++){
            //     riversPoints.push(getPoints(i));
            // }
        }
        // console.log(riversPoints[0]);
    }
}


//给marker设置point和样式；
function getMarkerSource(arr){
    var marker = new ol.Feature({
        geometry:new ol.geom.Point(ol.proj.fromLonLat(arr))
    });
    // console.log(marker);
    marker.setStyle(new ol.style.Style({
        image:new ol.style.Icon({
            src:"./image/marker.png"
        })
    }));
    return marker;
};



// polygon封装到Feature --> feature添加到source --> 通过source创建vector layer --> 把layer添加到map上
function getProvinceFeatures(arr,color){
    var polygon = new ol.Feature({
        geometry:new ol.geom.Polygon([arr])
    })
    polygon.setStyle(new ol.style.Style({
        stroke:new ol.style.Stroke({
            color:color,
            width:2
        })
    }))
    return polygon;
}



function getRiversSource(arr,color){
    var polyline = new ol.Feature({
        geometry:new ol.geom.LineString(arr)
    })
    console.log(arr);
    // debugger;
    polyline.setStyle(new ol.style.Style({
        stroke:new ol.style.Stroke({
            color:color,
            width:4
        })
    }))
    return polyline;
}