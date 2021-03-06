(function() {

    // http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    function eskalatu() {

        var jatorrizko_zabalera = 680;
        var zabalera = window.innerWidth;
        var altuera = window.innerHeight;

        var eskala = 1;

        // Pantailaren zabalera maparena baino txikiagoa bada.
        if (zabalera < jatorrizko_zabalera) {

            // Eskala kalkulatu.
            eskala = zabalera / jatorrizko_zabalera - 0.04;

        }

        $("#kontainerra").css("transform-origin", "top left");
        $("#kontainerra").css("transform", "scale(" + eskala + ")");

    }

    eskalatu();

    function eskuratuKolorea(ehunekoa) {

        if (ehunekoa <= 40) {

            return "#C7FDB5";

        } else if (ehunekoa > 40 && ehunekoa <= 50) {

            return "#A4FBA6";

        } else if (ehunekoa > 50 && ehunekoa <= 60) {

            return "#4AE54A";

        } else if (ehunekoa > 60 && ehunekoa <= 70) {

            return "#30CB00";

        } else if (ehunekoa > 70 && ehunekoa <= 80) {

            return "#0F9200";

        } else if (ehunekoa > 80) {

            return "#006203";

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
            json_izena: "udalerriak-araba",
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
                        return ("%" + v).replace(/\./g, ',');
                    },
                    "2015": function (v, id, i, j) {
                        return ("%" + v).replace(/\./g, ',');
                    },
                }
            }
        },
        transition: {
            duration: 0
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
                max: 78,   // Debagoiena 2015. Zuzenean jarri ordez hobe litzateke datuetaik ateratzea.
                show: false
            }
        }
    });

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

                // Emaitzak eta topoJSON-a bateratzeko ideia hemendik hartu dut, behar bada badago modu hobe bat.
                // http://stackoverflow.com/questions/22994316/how-to-reference-csv-alongside-geojson-for-d3-rollover

                // 2014ko mankomunitate bakoitzeko birziklapen datuak dagokion mapako elementuarekin lotu.
                // d: Emaitzen arrayko udalerri bakoitzaren propietateak biltzen dituen objektua.
                // i: indizea
                datuak1.forEach(function(d, i) {

                    // e: Datu geografikoetako mankomunitateen propietateak
                    // j: indizea
                    topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features.forEach(function(e, j) {

                        if (d.mankomunitatea === e.properties.hondakinak) {
                            e.properties.datuak1 = d;
                        }

                    });

                });

                // 2014ko mankomunitate bakoitzeko birziklapen datuak dagokion mapako elementuarekin lotu.
                // d: Emaitzen arrayko udalerri bakoitzaren propietateak biltzen dituen objektua.
                // i: indizea
                datuak2.forEach(function(d, i) {

                    // e: Datu geografikoetako mankomunitateen propietateak
                    // j: indizea
                    topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features.forEach(function(e, j) {

                        if (d.mankomunitatea === e.properties.hondakinak) {
                            e.properties.datuak2 = d;
                        }

                    });

                });

                // Mankomunitate guztiak.
                svg.selectAll(".unitateak")
                    .data(topojson.feature(eh, eh.objects[herrialdeak[hautatutako_herrialdea].json_izena]).features)
                    .enter().append("path")
                    .attr("fill", function(d) {

                        if (d.properties.datuak2) {

                            if (d.properties.datuak2.ehunekoa) {

                                return eskuratuKolorea(d.properties.datuak2.ehunekoa);

                            } else {

                                return "url('#pattern-stripe')";;

                            }

                        }

                        // Daturik ez badago...
                        return "#ffffff";

                    })
                    .attr("class", "unitateak birziklapen-tasa")
                    .attr("id", function(d) { return "unitatea_" + d.properties.hondakinak; })
                    .attr("d", path)
                    .on("mouseover", function(d) {

                        $(".hasierako-mezua").hide();

                        // Grafikoa bistaratu
                        $("#grafikoa").show();
                        $("#urtea1").show();
                        $("#urtea2").show();

                        // Grafikoa eguneratu
                        grafikoa.load({
                            columns: [
                                ["2014", d.properties.datuak1.ehunekoa],
                                ["2015", d.properties.datuak2.ehunekoa]
                            ]
                        });

                        // Barrei dagokien kolorea eman.
                        grafikoa.data.colors({
                            "2014": eskuratuKolorea(d.properties.datuak1.ehunekoa),
                            "2015": eskuratuKolorea(d.properties.datuak2.ehunekoa)
                        });

                        // Elementu geografiko guztiek ez daukate iz_euskal propietatea,
                        // ez badauka ud_iz_e erabili.
                        if (d.properties.hondakinak) {

                            $("#unitatea-izena").text(d.properties.hondakinak);

                        }

                        if (!d.properties.datuak2) {

                            $(".daturik-ez").hide();

                        } else if(d.properties.datuak2.ehunekoa) {

                            $(".daturik-ez").hide();

                        } else {

                            $(".daturik-ez").show();

                        }

                    });

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

            });

        });

    });

}());
