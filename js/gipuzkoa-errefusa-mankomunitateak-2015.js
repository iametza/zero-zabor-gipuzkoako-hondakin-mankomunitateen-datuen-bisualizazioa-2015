(function() {

    // Zein herrialdetako datuak bistaratu nahi diren hemen zehazten da:
    // Aukerak:
    //		"araba"
    // 		"bizkaia"
    //		"gipuzkoa"
    //		"nafarroa"
    var hautatutako_herrialdea = "gipuzkoa";

    var herrialdeak = {
        "gipuzkoa": {
            kodea: 20,
            datuak1: "datuak/gipuzkoa-birziklapena-mankomunitateak-2014.csv",
            datuak2: "datuak/gipuzkoa-birziklapena-mankomunitateak-2015.csv",
            json_izena: "hondakin-mankomunitateak-gipuzkoa",
            topoJSON: "topoJSON/hondakin-mankomunitateak-gipuzkoa.json",
            proiekzioa: {
                erdia: {
                    lat: -2.165,
                    lng: 43.15
                },
                eskala: 43500
            },
            altuera: 535,
            zabalera: 680

        },
        "bizkaia": {
            kodea: 48,
            datuak: "",
            json_izena: "",
            topoJSON: "",
            proiekzioa: {
                erdia: {
                    lat: -2.93,
                    lng: 43.22
                },
                eskala: 37000
            },
            altuera: 430,
            zabalera: 680
        },
        "araba": {
            kodea: "01",
            datuak: "",
            json_izena: "",
            topoJSON: "",
            proiekzioa: {
                erdia: {
                    lat: -2.75,
                    lng: 42.85
                },
                eskala: 33000
            },
            altuera: 600,
            zabalera: 680
        },
        "nafarroa": {
            kodea: "31",
            datuak: "",
            json_izena: "",
            topoJSON: "",
            proiekzioa: {
                erdia: {
                    lat: -1.615,
                    lng: 42.61
                },
                eskala: 19000
            },
            altuera: 650,
            zabalera: 680
        }
    }

    // Maparen svg elementuaren neurriak.
    var width = herrialdeak[hautatutako_herrialdea].zabalera,
        height = herrialdeak[hautatutako_herrialdea].altuera;

    // Maparen proiekzioaren xehetasunak.
    var projection = d3.geo.mercator()
        .center([herrialdeak[hautatutako_herrialdea].proiekzioa.erdia.lat, herrialdeak[hautatutako_herrialdea].proiekzioa.erdia.lng])
        .scale(herrialdeak[hautatutako_herrialdea].proiekzioa.eskala)
        .translate([width / 2, height / 2]);

    // Maparen bidearen generatzailea.
    var path = d3.geo.path()
        .projection(projection);

    // Maparen svg elementua DOMera gehitu eta neurriak ezarri.
    var svg = d3.select("#mapa").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Hautatutako herrialdeko datuak irakurri.
    d3.csv(herrialdeak[hautatutako_herrialdea].datuak1, function(error, datuak1) {

        d3.csv(herrialdeak[hautatutako_herrialdea].datuak2, function(error, datuak2) {

            if (error) {
                return console.error(error);
            }

            // Hautatutako herrialdearen datu geografikoak irakurri dagokion topoJSONetik.
            d3.json(herrialdeak[hautatutako_herrialdea].topoJSON, function(error, eh) {

                if (error) {
                    return console.error(error);
                }

                // Emaitzak eta topoJSON-a bateratzeko ideia hemendik hartu dut, behar bada badago modu hobe bat.
                // http://stackoverflow.com/questions/22994316/how-to-reference-csv-alongside-geojson-for-d3-rollover

                // 2014ko mankomunitate bakoitzeko birziklapen datuak dagokion mapako elementuarekin lotu.
                // d: Emaitzen arrayko mankomunitate bakoitzaren propietateak biltzen dituen objektua.
                // i: indizea
                datuak2.forEach(function(d, i) {

                    // e: Datu geografikoetako mankomunitatearen propietateak
                    // j: indizea
                    topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features.forEach(function(e, j) {

                        if (d.mankomunitatea === e.properties.hondakinak) {
                            e.properties.datuak = d;
                        }

                    });

                });

                // Unitate guztiak.
                svg.selectAll(".unitateak")
                    .data(topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features)
                    .enter().append("path")
                    .attr("fill", function(d) {

                        if (d.properties.datuak) {

                            if (d.properties.datuak.errefusa) {

                                if (d.properties.datuak.errefusa <= 100) {

                                    return "#DCDCDC";

                                } else if (d.properties.datuak.errefusa > 100 && d.properties.datuak.errefusa <= 150) {

                                    return "#989898";

                                } else if (d.properties.datuak.errefusa > 150 && d.properties.datuak.errefusa <= 200) {

                                    return "#747474";

                                } else if (d.properties.datuak.errefusa > 200 && d.properties.datuak.errefusa <= 250) {

                                    return "#565656";

                                } else if (d.properties.datuak.errefusa > 250 && d.properties.datuak.errefusa <= 300) {

                                    return "#343434";

                                } else if (d.properties.datuak.errefusa > 300) {

                                    return "#222";

                                }

                            } else {

                                return "#FCDC72";

                            }

                        }

                        // Daturik ez badago...
                        return "#ffffff";

                    })
                    .attr("class", "unitateak")
                    .attr("id", function(d) { return "unitatea_" + d.properties.hondakinak; })
                    .attr("d", path)
                    .on("mouseover", function(d) {

                        $(".hasierako-mezua").hide();

                        // Elementu geografiko guztiek ez daukate iz_euskal propietatea,
                        // ez badauka ud_iz_e erabili.
                        if (d.properties.iz_euskal) {

                            $("#unitatea-izena").text(d.properties.hondakinak);

                        }

                        if (!d.properties.datuak) {

                            $(".datuak-taula").hide();

                            $(".daturik-ez").hide();

                        } else if(d.properties.datuak.errefusa) {

                            $(".datuak-taula .birziklapen-tasa").text(d.properties.datuak.errefusa);

                            $(".daturik-ez").hide();

                            $(".datuak-taula").show();

                        } else {

                            $(".datuak-taula").hide();

                            $(".daturik-ez").show();

                        }

                    });

                // Eskualdeen arteko mugak (a !== b)
                svg.append("path")
                    .datum(topojson.mesh(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena], function(a, b) { return a !== b; }))
                    .attr("d", path)
                    .attr("class", "eskualde-mugak");

                // Kanpo-mugak (a === b)
                svg.append("path")
                    .datum(topojson.mesh(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena], function(a, b) { return a === b; }))
                    .attr("d", path)
                    .attr("class", "kanpo-mugak");

                console.log(topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features);
                var radius = d3.scale.sqrt()
                    .domain([0,
                            d3.max(topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features,
                                   function(d) {
                                       console.log(d.properties.hondakinak);
                                       console.log(d.properties.datuak.errefusa_guztira);
                                       return d.properties.datuak.errefusa_guztira;
                                   }
                            )
                    ])
                    .range([0, 25]);

                svg.append("g")
                    .attr("class", "bubble")
                    .selectAll("circle")
                    .data(topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features)
                    .enter().append("circle")
                    .attr("transform", function(d) {
                        return "translate(" + path.centroid(d) + ")";
                    })
                    .attr("r", function(d) {
                        return radius(d.properties.datuak.errefusa_guztira);
                    });
            });

        });

    });

}());
