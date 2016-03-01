(function() {

    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    function eskuratuKolorea(errefusa) {

        var kolorea = "";

        if (errefusa <= 10000) {

            return "#DCDCDC";

        } else if (errefusa > 10000 && errefusa <= 15000) {

            return "#989898";

        } else if (errefusa > 15000 && errefusa <= 20000) {

            return "#747474";

        } else if (errefusa > 20000 && errefusa <= 30000) {

            return "#565656";

        } else if (errefusa > 30000 && errefusa <= 50000) {

            return "#343434";

        } else if (errefusa > 30000) {

            return "#222";

        }
    }

    function onMouseOut(d) {

        tip.hide();

        if (d.properties.datuak2.errefusa) {
            $("#unitatea_" + d.properties.ud_kodea).css("fill", "#ffffff");
        } else {
            $("#unitatea_" + d.properties.ud_kodea).css("fill", "url('#pattern-stripe')");
        }
    }

    function onMouseOver(d) {

        tip.html(function(d) {

            var katea = "<div class='mankomunitatea'>" + d.properties.hondakinak + "</div>";

            if (!d.properties.datuak2.errefusa) {
                return katea +
                       "<div class='info'>Ez dago 2015eko daturik</div>";
            }
            return katea +
                   "<div class='info'>2015ean " + d.properties.datuak2.errefusa_guztira + " tona errefus.</div>" +
                   "<div class='info'>Gipuzkoa osoko errefusaren %" + d.properties.datuak2.errefusaren_ehunekoa + "</div>";
        });

        tip.show(d);

        $(".hasierako-mezua").hide();

        // Grafikoa bistaratu
        $("#grafikoa").show();
        $("#urtea1").show();
        $("#urtea2").show();

        // Dagokion mankomunitateari kolorea eman.
        $("#unitatea_" + d.properties.ud_kodea).css("fill", "#d50000");

        // Grafikoa eguneratu
        grafikoa.load({
            columns: [
                ["2014", d.properties.datuak1.errefusa_guztira],
                ["2015", d.properties.datuak2.errefusa_guztira]
            ]
        });

        // Barrei dagokien kolorea eman.
        grafikoa.data.colors({
            "2014": eskuratuKolorea(d.properties.datuak1.errefusa_guztira),
            "2015": eskuratuKolorea(d.properties.datuak2.errefusa_guztira)
        });

        // Elementu geografiko guztiek ez daukate iz_euskal propietatea,
        // ez badauka ud_iz_e erabili.
        if (d.properties.iz_euskal) {

            $("#unitatea-izena").text(d.properties.hondakinak);

        }

        if (!d.properties.datuak2) {

            $(".daturik-ez").hide();

        } else if(d.properties.datuak2.errefusa_guztira) {

            $(".daturik-ez").hide();

        } else {

            $(".daturik-ez").show();

        }
    }

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
                    lat: -2.065,
                    lng: 43.15
                },
                eskala: 35000
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
    };

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

    // Maparen svg elementua eskuratu eta neurriak ezarri.
    var svg = d3.select("#mapa svg")
        .attr("width", width)
        .attr("height", height);

    var errefusa_guztira = 0;

    /*
     * Zutabeei kolore desberdinak emateko arazoak izan ditut.
     * Zutabe-talde berean jarriz gero guztiei kolore bera eman behar nien.
     * Zutabe-talde desberdinetan jarriz gero berriz:
     *      * zutabeak elkarren jarraian itsatsita agertzen ziren,
     *        baina CSS bidez lortu dut zutabeen artean tarte pixkat ematea.
     *      * x ardatzaren etiketak ezin erabili. Eskuz gehitu behar izan ditut label-ak erabiliz.
     *      * ...
     *
     */
    var grafikoa = c3.generate({
        bindto: '#grafikoa',
        size: {
            height: 200,
            width: 130
        },
        data: {
            columns: [
                ["2014", 0],
                ["2015", 0]
            ],
            type: 'bar',
            labels: {
                format: {
                    "2014": function (v, id, i, j) {
                        return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    },
                    "2015": function (v, id, i, j) {
                        return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    },
                }
            }
        },
        bar: {
            width: {
                ratio: 1
            }
        },
        legend: {
            show: false
        },
        tooltip: {
            show: false
        },
        interaction: {
            enabled: false
        },
        axis: {
            x: {
                show: false
            },
            y: {
                max: 83124,   // San Marko 2014. Zuzenean jarri ordez hobe litzateke datuetaik ateratzea.
                show: false
            }
        }
    });

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html("")
        .direction('s')
        .offset([0, 40])

    // Hautatutako herrialdeko datuak irakurri.
    d3.csv(herrialdeak[hautatutako_herrialdea].datuak1, function(error, datuak1) {

        if (error) {
            return console.error(error);
        }

        d3.csv(herrialdeak[hautatutako_herrialdea].datuak2, function(error, datuak2) {

            if (error) {
                return console.error(error);
            }

            // Hautatutako herrialdearen datu geografikoak irakurri dagokion topoJSONetik.
            d3.json(herrialdeak[hautatutako_herrialdea].topoJSON, function(error, eh) {

                if (error) {
                    return console.error(error);
                }

                datuak2.forEach(function(d, i) {
                    if (d.errefusa_guztira) {
                        errefusa_guztira = errefusa_guztira + parseInt(d.errefusa_guztira, 10);
                    }
                });

                // Emaitzak eta topoJSON-a bateratzeko ideia hemendik hartu dut, behar bada badago modu hobe bat.
                // http://stackoverflow.com/questions/22994316/how-to-reference-csv-alongside-geojson-for-d3-rollover

                // 2014ko mankomunitate bakoitzeko birziklapen datuak dagokion mapako elementuarekin lotu.
                // d: Emaitzen arrayko mankomunitate bakoitzaren propietateak biltzen dituen objektua.
                // i: indizea
                datuak1.forEach(function(d, i) {

                    // e: Datu geografikoetako mankomunitatearen propietateak
                    // j: indizea
                    topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features.forEach(function(e, j) {

                        if (d.mankomunitatea === e.properties.hondakinak) {
                            e.properties.datuak1 = d;
                        }

                    });

                });

                // 2015eko mankomunitate bakoitzeko birziklapen datuak dagokion mapako elementuarekin lotu.
                // d: Emaitzen arrayko mankomunitate bakoitzaren propietateak biltzen dituen objektua.
                // i: indizea
                datuak2.forEach(function(d, i) {

                    // e: Datu geografikoetako mankomunitatearen propietateak
                    // j: indizea
                    topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features.forEach(function(e, j) {

                        if (d.mankomunitatea === e.properties.hondakinak) {
                            e.properties.datuak2 = d;
                            e.properties.datuak2.errefusaren_ehunekoa = (100 * d.errefusa_guztira / errefusa_guztira).toFixed(1);
                        }

                    });

                });

                // Unitate guztiak.
                svg.selectAll(".unitateak")
                    .data(topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features)
                    .enter().append("path")
                    .attr("fill", function(d) {
                        if (d.properties.datuak2.errefusa) {
                            return "#ffffff";
                        } else {
                            return "url('#pattern-stripe')";
                        }
                    })
                    .attr("class", "unitateak")
                    .attr("id", function(d) { return "unitatea_" + d.properties.ud_kodea; })
                    .attr("d", path)
                    .on("mouseover", function(d) {
                        onMouseOver(d);
                    })
                    .on("mouseout", function(d) {
                        onMouseOut(d);
                    })
                    .call(tip);

                // Kanpo-mugak (a === b)
                svg.append("path")
                    .datum(topojson.mesh(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena], function(a, b) { return a === b; }))
                    .attr("d", path)
                    .attr("class", "kanpo-mugak");

                // Unitateak aurreko planora ekarri.
                svg.selectAll(".unitateak").each(function() {
                    var sel = d3.select(this);
                    sel.moveToFront();
                });

                // Eskualdeen arteko mugak (a !== b)
                svg.append("path")
                    .datum(topojson.mesh(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena], function(a, b) { return a !== b; }))
                    .attr("d", path)
                    .attr("class", "eskualde-mugak");

                var radius = d3.scale.sqrt()
                    .domain([0,
                            d3.max(topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features,
                                   function(d) {
                                       return d.properties.datuak2.errefusa_guztira;
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
                        return radius(d.properties.datuak2.errefusa_guztira);
                    })
                    .attr("fill", function(d) {

                        if (d.properties.datuak2) {

                            if (d.properties.datuak2.errefusa_guztira) {

                                return eskuratuKolorea(d.properties.datuak2.errefusa_guztira);

                            } else {

                                return "#FCDC72";

                            }

                        }

                        // Daturik ez badago...
                        return "#ffffff";

                    })
                    .on("mouseover", function(d) {
                        onMouseOver(d);
                    })
                    .on("mouseout", function(d) {
                        onMouseOut(d);
                    });
            });

        });

    });

}());
