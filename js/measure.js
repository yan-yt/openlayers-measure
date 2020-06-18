$(function () {
  //初始化地图
  var map = new ol.Map({
    target: "map",
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
    view: new ol.View({
      center: new ol.proj.fromLonLat([114.425, 23.089]),
      zoom: 18,
      maxZoom: 20,
    }),
  });
  //绘制计数
  var drawCount = 0;

  //存储features的数组
  var featuresArr = [];
  //存储覆盖物
  var measureInfoArr = [];
  var measureToolArr = [];

  //创建一个当前要绘制的对象
  var sketch = new ol.Feature();
  //创建一个帮助提示框对象
  var helpTooltipElement;
  //创建一个帮助提示信息对象
  var helpTooltip;
  //创建一个测量提示框对象
  var measureTooltipElement;
  //创建一个测量提示信息对象
  var measureTooltip;
  //继续绘制多边形的提示信息
  var continuePolygonMsg = "单击加点，双击结束";
  //继续绘制线段的提示信息
  var continueLineMsg = "单击加点，双击结束";
  var draw;
  //定义输出变量
  var output;
  var currentArr, currentOverlay;

  //定义矢量数据源
  var source = new ol.source.Vector();
  //定义矢量图层
  var vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(255,255,255,0.6)",
      }),
      stroke: new ol.style.Stroke({
        //实线
        color: "#569cf1",
        width: 3,
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
          color: "#fff",
        }),
        stroke: new ol.style.Stroke({
          //实线
          color: "#569cf1",
          width: 2,
        }),
      }),
    }),
  });
  //将矢量图层添加到地图中

  map.addLayer(vector);

  var measureLength = document.getElementById("length");
  var measureArea = document.getElementById("area");
  var measureClear = document.getElementById("clear");

  measureLength.onclick = function () {
    output = null;
    if (sourceTem) {
      for (var i = 0; i < sourceTem.length; i++) {
        source.removeFeature(sourceTem[i]);
      }
    }
    if (measureToolTem) {
      for (var j = 0; j < measureToolTem.length; j++) {
        map.removeOverlay(measureToolTem[j]);
      }
    }
    sourceTem = [];
    measureToolTem = [];
    map.removeEventListener("pointermove");
    type = "LineString";
    map.removeInteraction(draw);
    drawPloy(type);
  };
  measureArea.onclick = function () {
    output = null;
    if (sourceTem) {
      for (var i = 0; i < sourceTem.length; i++) {
        source.removeFeature(sourceTem[i]);
      }
    }
    if (measureToolTem) {
      for (var j = 0; j < measureToolTem.length; j++) {
        map.removeOverlay(measureToolTem[j]);
      }
    }
    sourceTem = [];
    measureToolTem = [];
    map.removeEventListener("pointermove");
    type = "Polygon";
    map.removeInteraction(draw);
    drawPloy(type);
  };
  measureClear.onclick = function () {
    output = null;
    if (sourceTem) {
      for (var i = 0; i < sourceTem.length; i++) {
        source.removeFeature(sourceTem[i]);
      }
    }
    if (measureToolTem) {
      for (var j = 0; j < measureToolTem.length; j++) {
        map.removeOverlay(measureToolTem[j]);
      }
    }
    sourceTem = [];
    measureToolTem = [];
    map.removeEventListener("pointermove");

    map.removeInteraction(draw);
    vector.getSource().clear(); //清除绘制
    map.getOverlays().clear(); //清除覆盖物
    measureInfoArr = []; //清空覆盖物
    featuresArr = [];
    drawCount = 0;
    sourceTem = [];
    measureToolTem = [];
  };

  //鼠标移动触发的函数
  var pointerMoveHandler = function (evt) {
    //如果是平移地图则直接结束
    if (evt.dragging) {
      return;
    }
    //帮助提示信息
    var helpMsg = "单击加点，双击结束";

    if (sketch) {
      //获取绘图对象的几何要素
      var geom = sketch.getGeometry();
      //如果当前绘制的几何要素是多边形，则将绘制提示信息设置为多边形绘制提示信息
      //如果当前绘制的几何要素是多线段，则将绘制提示信息设置为多线段绘制提示信息
      if (geom instanceof ol.geom.Polygon) {
        helpMsg = continuePolygonMsg;
      } else if (geom instanceof ol.geom.LineString) {
        helpMsg = continueLineMsg;
      }
    }
    //设置帮助提示要素的内标签为帮助提示信息
    if (output) {
      if (type === "LineString") {
        helpTooltipElement.innerHTML =
          "<span>" +
          helpMsg +
          '</span></br><span>总长：<span class="measureInfo">' +
          output +
          "</span></span>";
      } else {
        helpTooltipElement.innerHTML =
          "<span>" +
          helpMsg +
          '</span></br><span>总面积：<span class="measureInfo">' +
          output +
          "</span></span>";
      }
    } else {
      helpTooltipElement.innerHTML = "<span>" + helpMsg + "</span>";
    }

    //设置帮助提示信息的位置

    helpTooltip.setPosition(evt.coordinate);
    //移除帮助提示要素的隐藏样式
    $(helpTooltipElement).removeClass("hidden");
  };

  var sourceTem = [];
  var measureToolTem = [];
  var output;
  //添加交互式绘图对象的函数
  function drawPloy(type) {
    var sourceArr = [];
    //最后一个点的坐标
    var lastPoint;
    //定义一个事件监听
    var listener;
    //定义一个控制鼠标点击次数的变量
    var count = 0;
    //触发pointermove事件
    map.addEventListener("pointermove", pointerMoveHandler);
    //创建一个交互式绘图对象
    draw = new ol.interaction.Draw({
      //绘制的数据源
      source: source,
      //绘制类型
      type: type,
      //样式
      style: new ol.style.Style({
        //虚线
        fill: new ol.style.Fill({
          color: "rgba(255,255,255,0.2)",
        }),
        stroke: new ol.style.Stroke({
          color: "#569cf1",
          lineDash: [10, 10],
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: "#569cf1",
          }),
          fill: new ol.style.Fill({
            color: "rgba(255,255,255,0.2)",
          }),
        }),
      }),
    });
    //将交互绘图对象添加到地图中
    map.addInteraction(draw);

    //创建测量提示框
    if (type === "LineString") {
      createMeasureTooltip();
    }
    //创建帮助提示框
    createHelpTooltip();

    //绘制开始事件
    draw.on(
      "drawstart",
      function (evt) {
        // //清除双击缩放
        // this.map.getInteractions().item(1).setActive(false);
        sketch = evt.feature;
        //提示框的坐标
        var tooltipCoord;
        //监听几何要素的change事件
        listener = sketch.getGeometry().on("change", function (evt) {
          //获取绘制的几何对象
          var geom = evt.target;
          if (geom instanceof ol.geom.Polygon) {
            // map.removeEventListener('singleclick');
            map.removeEventListener("dblclick");
            //输出多边形的面积
            output = formatArea(geom);
            //获取多变形内部点的坐标
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
            a = evt.target.getCoordinates();
          } else if (geom instanceof ol.geom.LineString) {
            //输出多线段的长度
            output = formatLength(geom);
            //获取多线段的最后一个点的坐标
            tooltipCoord = geom.getLastCoordinate();
            //设置测量提示框的内标签为最终输出结果
            measureTooltipElement.innerHTML =
              '<div style = "position: absolute; font-size: 12px; font-family: MicrosoftYaHei; white-space: nowarp; height: 17px; background-color: #fff; color: #666; border: 1px solid #d4d4d4">' +
              '<div style = "padding: 0 4px; position: relative; display: inline; height: 17px; line-height: 140%; white-space: nowrap">' +
              "<strong>" +
              output +
              "</strong>" +
              "</div></div>";
          }
          //设置测量提示信息的位置坐标
          lastPoint = tooltipCoord;
        });

        //地图单击事件
        map.on("singleclick", function (evt) {
          var point, featurePoint;
          if (type === "Polygon") {
            lastPoint = evt.coordinate;
          }
          //设置测量提示信息的位置坐标，用来确定鼠标点击后测量提示框的位置
          measureTooltip.setPosition(evt.coordinate);
          //如果是第一次点击 且 为测量距离，则设置测量提示框的文本内容为起点
          if (count === 0 && type === "LineString") {
            measureTooltipElement.innerHTML =
              '<div style = "position: absolute; font-size: 12px; font-family: MicrosoftYaHei; white-space: nowarp; height: 17px; background-color: #fff; color: #666; border: 1px solid #d4d4d4">' +
              '<div style = "padding: 0 4px; position: relative; display: inline; height: 17px; line-height: 140%; white-space: nowrap">' +
              "<strong>起点</strong>" +
              "</div></div>";
          }
          //根据鼠标点击位置生成一个点
          point = new ol.geom.Point(evt.coordinate);
          //将该点要素添加到矢量数据源中
          featurePoint = new ol.Feature(point);
          source.addFeature(featurePoint);
          //更改测量提示框的样式，使测量提示框可见
          measureTooltipElement.className = "tooltip tooltip-static";
          //创建测量提示框
          createMeasureTooltip();
          //点击次数增加
          count++;
          sourceArr.push(featurePoint);
          sourceTem.push(featurePoint);
        });
      },
      this
    );
    //绘制结束事件
    draw.on(
      "drawend",
      function (evt) {
        var c = evt.feature.getGeometry().getCoordinates();
        var length = c[0].length;
        var clear, currentArr, currentOverlay;
        sourceArr.push(evt.feature);
        sourceTem.push(evt.feature);
        featuresArr.push(sourceArr);
        measureInfoArr.push(measureToolArr);
        //设置最后一个测量信息框位置
        measureTooltip.setPosition(lastPoint);
        //获取 当前绘制的features数组
        currentArr = featuresArr[drawCount];
        //获取 当前覆盖物的数组
        currentOverlay = measureInfoArr[drawCount];
        //添加最后的测量信息
        if (type === "LineString") {
          //设置最后一个点
          var point = new ol.geom.Point(lastPoint);
          var featurePoint = new ol.Feature(point);
          source.addFeature(featurePoint);
          sourceArr.push(featurePoint);
          sourceTem.push(featurePoint);
          measureTooltipElement.innerHTML =
            '<div style = "position: absolute; white-space: nowrap;font-size: 13px;font-family: MicrosoftYaHei;color: #666666 ">' +
            '<span style="padding: 4px 4px;border: 1px solid #4a90e2;background-color:#fff">' +
            "总长" +
            ":" +
            '<strong style = "color : #4a90e2">' +
            output +
            "</strong></span>" +
            '<span id = "measureDis' +
            drawCount +
            '" class="supermapol-icons-clear" style = "padding:4px 4px;width:22px;height:22px;background-color: #FFFFFF;color:#4A90E2;line-height:22px;text-align:center;cursor: pointer;border: 1px solid #4A90E2;position:relative;top:0px;left:2px;">X' +
            "</span></div>";
          clear = $("#measureDis" + drawCount);
        } else {
          var point = new ol.geom.Point(c[0][c[0].length - 2]);
          var featurePoint = new ol.Feature(point);
          source.addFeature(featurePoint);
          sourceArr.push(featurePoint);
          sourceTem.push(featurePoint);
          measureTooltipElement.innerHTML =
            '<div style = "position: absolute; white-space: nowrap;font-size: 13px;font-family: MicrosoftYaHei;color: #666666 ">' +
            '<span style="padding: 4px 4px;border: 1px solid #4a90e2;background-color:#fff">' +
            "总面积" +
            ":" +
            '<strong style = "color : #4a90e2">' +
            output +
            "</strong></span>" +
            '<span id = "measureArea' +
            drawCount +
            '" class="supermapol-icons-clear" style = "padding:4px 4px;width:22px;height:22px;background-color: #FFFFFF;color:#4A90E2;line-height:22px;text-align:center;cursor: pointer;border: 1px solid #4A90E2;position:relative;top:0px;left:2px;">X' +
            "</span></div>";
          clear = $("#measureArea" + drawCount);
        }
        clear.on("click", function () {
          //清除features
          for (var i = 0; i < currentArr.length; i++) {
            source.removeFeature(currentArr[i]);
          }
          //清除覆盖物
          for (var j = 0; j < currentOverlay.length; j++) {
            map.removeOverlay(currentOverlay[j]);
          }
        });
        sourceTem = [];
        measureToolTem = [];
        measureToolArr = [];
        count = 0;
        drawCount++;
        //设置测量提示框的样式
        measureTooltipElement.className = "tooltip tooltip-static";
        //Set the offset for this overlay.
        //设置偏移量
        measureTooltip.setOffset([0, -5]);
        //清空绘制要素
        sketch = null;
        //清空测量结果
        output = null;
        //清空测量提示要素
        measureTooltipElement = null;
        //创建测量提示框
        createMeasureTooltip();
        //Removes an event listener using the key returned by on() or once().
        //移除事件监听
        ol.Observable.unByKey(listener);
        //移除地图单击事件
        map.removeEventListener("singleclick");
        map.removeInteraction(draw); //删除指定交互
        $(helpTooltipElement).addClass("hidden");
        map.removeEventListener("pointermove"); //取消pointermove的监听
      },
      this
    );
  }
  //创建帮助提示框
  function createHelpTooltip() {
    //如果已经存在帮助提示框则移除
    if (helpTooltipElement) {
      helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    //创建帮助提示要素的div
    helpTooltipElement = document.createElement("div");
    //设置帮助提示要素的样式
    helpTooltipElement.className = "tooltip-help";
    //创建一个帮助提示的覆盖标注
    helpTooltip = new ol.Overlay({
      element: helpTooltipElement,
      offset: [15, 0],
      positioning: "center-left",
      id: "helpTooltip",
    });
    //将帮助提示的覆盖标注添加到地图中
    map.addOverlay(helpTooltip);
  }
  //创建测量提示框
  function createMeasureTooltip() {
    //创建测量提示框的div
    measureTooltipElement = document.createElement("div");
    measureTooltipElement.setAttribute("id", "lengthLabel");
    //设置测量提示要素的样式
    measureTooltipElement.className = "tooltip tooltip-measure";
    //创建一个测量提示的覆盖标注
    measureTooltip = new ol.Overlay({
      //覆盖物
      element: measureTooltipElement,
      offset: [7, -15],
      positioning: "bottom-center",
    });
    //将测量提示的覆盖标注添加到地图中
    map.addOverlay(measureTooltip);
    measureToolArr.push(measureTooltip);
    measureToolTem.push(measureTooltip);
  }

  //格式化测量长度
  var formatLength = function (line) {
    //定义长度变量
    var length;
    length = ol.Sphere.getLength(line);
    //length = Math.round(line.getLength() * 100) / 100;
    //定义输出变量
    var output;
    //如果长度大于1000，则使用km单位，否则使用m单位
    if (length > 1000) {
      output = Math.round((length / 1000) * 100) / 100 + " " + "km"; //换算成KM单位
    } else {
      output = Math.round(length * 100) / 100 + " " + "m"; //m为单位
    }
    return output;
  };

  //格式化测量面积
  var formatArea = function (polygon) {
    //定义面积变量
    var area;
    //获取平面面积
    area = ol.Sphere.getArea(polygon);
    // area = polygon.getArea();
    //定义输出变量
    var output;
    //当面积大于10000时，转换为平方千米，否则为平方米
    if (area > 10000) {
      output =
        Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
    } else {
      output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
    }
    return output;
  };
});
