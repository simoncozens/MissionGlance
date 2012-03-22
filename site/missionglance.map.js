var po = org.polymaps;
var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 38, lon:135})
    .zoomRange([4, 7])
    .zoom(4.3)
    .add(po.interact());

var zoomType = "country";

var stylist = po.stylist().attr("class", function(d) {
        // Check for zoom level change?
    if (zoomType == "prefecture" && map.zoom() < 6) {
        for (var pref in oldSelected) { // Only one
            onclicker.call(prefFeatures[pref].element); // I hope
        }
    } else if (zoomType == "region" && map.zoom() < 5) {
        zoomType = "country";
        oldSelected = {}; 
        $("#name").html("Japan");
        loadData(missionglanceData.japan);
    }
        if (oldSelected && oldSelected[d.properties.name])
            return "selected";
        return "q5-9"
    })

geoJson = po.geoJson()
    .url("japan.json")
    .on("load", load)
    .on("load", stylist);

map.add(geoJson);

map.add(po.compass()
    .pan("none"));

map.container().setAttribute("class", "Blues");

var prefFeatures = {};

var oldSelected;

var getCentroid = function(feature) {
    var geom = feature.data.geometry;
    if (geom.type == "MultiPolygon") {
        var x = $.map(geom.coordinates[0], function(t) { return t[0][0] });
        var y = $.map(geom.coordinates[0], function(t) { return t[0][1] });
        return {lat: y.average(), lon: x.average()};
    } else {
        var x = $.map(geom.coordinates[0], function(t) { return t[0] });
        var y = $.map(geom.coordinates[0], function(t) { return t[1] });
        return {lat: y.average(), lon: x.average()};
    }
}

Array.prototype.average = function() {
    var sum = 0;
    for (var i = 0;i < this.length;i++) sum += this[i];
    return sum / this.length;
}

commify = function (num) {
    if (!num) return 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var loadChurchStats = function (data, pop) {
    var brate;
    if (data.baptisms) {
        brate = data.baptisms/data.churches;
    }
    $("#churchstats").html("<span class=\"secondary\">Members:</span> "+commify(data.members)+
    " <span class=\"secondary\">("+(100*data.members/pop).toFixed(2)+"% of population)</span>"+
        "<br><span class=\"secondary\">Regular attendance:</span> "+commify(data.attendance)+
    " <span class=\"secondary\">("+(100*data.attendance/pop).toFixed(2)+"% of population)</span>"+
    " <br><span class=\"secondary\">("+(100*data.attendance/data.members).toFixed(2)+"% of Church members)</span>"+
        "<br><span class=\"secondary\">Baptisms per year:</span> "+commify(data.baptisms)+
        "<br><span class=\"secondary\">"+
        (brate != undefined ? (
            brate > 1 ? (brate).toFixed(1)+" baptisms per year per church</span><br><span class=\"secondary\">"
                      : (1/brate).toFixed(1)+" years to see a baptism in each church </span><br><span class=\"secondary\">"
        ): ""
        )+
        "Sunday school attendance:</span> "+commify(data.sunday_school));
}
var loadData = function(data) {
    $("#churches").html(commify(data.churches));
    $("#missionaries").html(commify(data.missionaries));
    var pop = data.wikipedia && data.wikipedia.Population ? data.wikipedia.Population : data.Population;
    if (pop.replace) pop = parseInt(pop.replace(/,/g,""));
    loadChurchStats(data, pop);

    $("#pop").html(commify(pop));

    if (data.churches) $("#churchperpop").html("(1 church for every <br>"+ commify((pop/data.churches).toFixed()) +" people)");

    if (data.missionaries) $("#missionaryperpop").html("(1 missionary for every <br>"+ commify((pop/data.missionaries).toFixed()) +" people)");
    else $("#missionaryperpop").html("");

    if (!data.wikipedia) return;
    $("#nameJapanese").text(data.wikipedia.JapaneseName);
    $("#area").text(commify(data.wikipedia.TotalArea));
    if (data.wikipedia.PopRank) $("#poprank").html("("+data.wikipedia.PopRank+" largest)")
    else $("#poprank").html("");
}

var clearOldSelection = function() {
    for (var pref in oldSelected) {
        prefFeatures[pref].element.setAttribute("class","q5-9");
    }
    oldSelected = {};
    //geoJson.reload();
}

var onclicker = function(e) {
    var pref = this.firstChild.textContent;
    if (map.zoom() < 5) { return }
    if (map.zoom() < 6) {
        var region = data.wikipedia.Region;
        goToRegion(region);
    } else {
        goToPref(pref);
    }
    geoJson.reload();
}

function goToPref (pref) {
    var data = missionglanceData.prefectures[pref];
    var el = prefFeatures[pref].element;
    zoomType = "prefecture";
    $("#name").text(pref);
    loadData(data);
    map.center(getCentroid(prefFeatures[pref]));
    //map.zoom(6);
    clearOldSelection();
    el.setAttribute("class", "selected");
    oldSelected = {}; oldSelected[pref] = 1;
}

function goToRegion(region) {
    zoomType = "region";
    $("#name").text(region);
    $("#nameJapanese").text("");
    var data = missionglanceData.regions[region];
    loadData(data);
    if (oldSelected != undefined && oldSelected != data.prefectures) clearOldSelection();
    oldSelected = {};
    var centroidsLat = [];
    var centroidsLon = [];
    for (var i = 0; i < data.prefectures.length; i++) {
        var feat =  (prefFeatures[data.prefectures[i]]);
        var c = getCentroid(feat);
        centroidsLat.push(c.lat);
        centroidsLon.push(c.lon);
    }
    map.center({lat: centroidsLat.average(), lon: centroidsLon.average()});
    //map.zoom(6);
    geoJson.reload();
    for (var i = 0; i < data.prefectures.length; i++) {
        var feat =  (prefFeatures[data.prefectures[i]]);
        feat.element.setAttribute("class","selected");
        oldSelected[data.prefectures[i]] = 1;
    }
}

var _once = 0;
function load(e) {
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i];
        //if (feature.data.properties.name) feature.element.setAttribute("class", "q5-9");
      feature.element.appendChild(po.svg("title").appendChild(document.createTextNode(feature.data.properties.name))
      .parentNode);
      feature.element.onclick = onclicker;
      prefFeatures[feature.data.properties.name] = feature;
  }
  if (_once == 0 ) today(); _once = 1;
}


function today() {
    var _keys =function (o) {
        var rv = [];
        for (var p in o) { if (o.hasOwnProperty(p)) rv.push(p) };
        return rv;
    }
    var now = new Date();
    var onejan = new Date(now.getFullYear(),0,1);
    var doy = Math.ceil((now - onejan) / 86400000);   
    var day = Math.floor(doy / 3.25892857142857)% (47 + 9);
    if (day < 9) { 
        var region = (_keys(missionglanceData.regions).sort())[day]
        goToRegion(region);
    } else {
        day -= 9;
        var pref = (_keys(missionglanceData.prefectures).sort())[day]
        goToPref(pref);
    }
    map.zoom(6);
    return;
}
