const csvPath = "football.csv";
const summaryCsvPath = "summary_fin.csv";
const years = new Set();
const fifoData = {};
const yearSelect = d3.select("#year");
let fifaCsvRawData;
let fifaCsvSummaryRawData;
function drawWorldmap() {
    return new Promise((resolve,reject)=>{

    const svg = d3.select("svg")
            .attr("class", "choropleth"),
        width = svg.attr("width")-200,
        height = svg.attr("height")-100,


        path = d3.geoPath(),
        worldmap = "world.geojson";


    let centered, world;

    const projection = d3.geoRobinson()
        .scale(130)
        .translate([width / 2, height / 2]);


    const colorScale = d3.scaleThreshold()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    .range(d3.schemeCategory20b);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.queue()
        .defer(d3.json, worldmap)
        .defer(d3.csv, csvPath, function (d) {
            fifoData[d.year] = fifoData[d.year] || d3.map();
            fifoData[d.year].set(d.code, +d.position, +d.year);
            years.add(d.year);
            return d;
        })
        .await(ready);


    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", click);



    function ready(error, topo) {
        const sortedYears = Array.from(years).sort();
        yearSelect.selectAll("option")
            .data(sortedYears)
            .enter().append("option")
            .text(d => d)
            .attr("value", d => d);



        let mouseOver = function (d) {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", .5)
                .style("stroke", "transparent");
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black");
            tooltip.style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
                .transition().duration(400)
                .style("opacity", 1)
                .text(d.properties.name + ': ' + Math.round(d.total));
        }

        let mouseLeave = function () {
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "transparent");
            tooltip.transition().duration(300)
                .style("opacity", 0);
        }


        const onYearChange = () => {
            drawBarGraph();
            drawDataTable();
            world = svg.append("g")
                .attr("class", "world");
            const selectedYear = document.querySelector('#year').value;
            const data = fifoData[selectedYear];
            world.selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                .attr("d", d3.geoPath().projection(projection))
                .attr("data-name", function (d) {
                    return d.properties.name
                })
                .attr("fill", function (d) {
                    d.total = data.get(d.id) || 0;
                    return colorScale(d.total);
                })
                .style("stroke", "transparent")
                .attr("class", function (d) {
                    return "Country"
                })
                .attr("id", function (d) {
                    return d.id
                })
                .style("opacity", 1)
                .on("mouseover", mouseOver)
                .on("mouseleave", mouseLeave)
                .on("click", click);
            const x = d3.scaleLinear()
                .domain([2.6, 75.1])
                .rangeRound([600, 860]);

            const legend = svg.append("g")
                .attr("id", "legend")
                .attr("transform", `translate(750,2.5) rotate(0)`);

            const legend_entry = legend.selectAll("g.legend")
                .data(colorScale.range().map(function (d) {
                    d = colorScale.invertExtent(d);
                    if (d[0] == null) d[0] = x.domain()[0];
                    if (d[1] == null) d[1] = x.domain()[1];
                    return d;
                }))
                .enter().append("g")
                .attr("class", "legend_entry");

            const ls_w = 20,
                ls_h = 20;

            legend_entry.append("rect")
                .attr("x", 20)
                .attr("y", function (d, i) {
                    return height - (i * ls_h) - 2 * ls_h;
                })
                .attr("width", ls_w)
                .attr("height", ls_h)
                .style("fill", function (d) {
                    return colorScale(d[0]);
                })
                .style("opacity", 0.8);

            legend_entry.append("text")
                .attr("x", 50)
                .attr("y", function (d, i) {
                    return height - (i * ls_h) - ls_h - 6;
                })
                .text(function (d, i) {
                    if (i === 0) return "< " + d[1];
                    if (d[1] < d[0]) return d[0];
                    return d[0] + " - " + d[1];
                });

            legend.append("text").attr("x", 10).attr("y", 130).text("Position");


        }
        onYearChange()
        yearSelect.on('change', onYearChange);
        resolve();


    }

    function click(d) {

        var x, y, k;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = -(centroid[0] * 6);
            y = (centroid[1] * 6);
            k = 3;
            centered = d;
            //drawStackedBarCountrySpecific(d.properties.name)
            drawBarGraphCountrySpecific(d.properties.name)

        } else {
            x = 0;
            y = 0;
            k = 1;
            centered = null;
            //drawStackedBarGraph()
            drawBarGraph()
            drawDataTable()
        }

        world.selectAll("path")
            .classed("active", centered && function (d) { return d === centered; });

        world.transition()
            .duration(750)
            .attr("transform", "translate(" + x + "," + y + ") scale(" + k + ")");
    }
})
}

function drawBarGraph() {
    d3.select("#barChart svg").remove();
    d3.select("#barChart div").remove();

    const margin = { top: 10, right: 30, bottom: 26, left: 100 },
        width = 580 - margin.left - margin.right,
        height = 280 - margin.top - margin.bottom;
    // Filter the data to get the position 1 country of the 2022 year
    const selectedYear = d3.select("#year").node().value;
    const filteredData = fifaCsvRawData.filter(function (d) {
        return d.position === "1" && d.year === selectedYear;
    });

    const svg = d3.select("#barChart")

        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    const x = d3.scaleBand()
        .range([0, width])
        .domain(["Win", "Draw", "Loss"])
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "middle");

    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function (d) {
            return parseInt(d.Win) + parseInt(d.Draw) + parseInt(d.Loss);
        })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll("mybar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x("Win");
        })
        .attr("y", function (d) {
            return y(parseInt(d.Win));
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(parseInt(d.Win));
        })
        .attr("fill", "#275A47")

    svg.selectAll("mybar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x("Draw");
        })
        .attr("y", function (d) {
            return y(parseInt(d.Draw));
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(parseInt(d.Draw));
        })
        .attr("fill", "#F4B350")

    svg.selectAll("mybar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return x("Loss");
        })
        .attr("y", function (d) {
            return y(parseInt(d.Loss));
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(parseInt(d.Loss));
        })
        .attr("fill", "#E35B5A")

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 100)
        .text("Win, Draw, Loss");

// Add x axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 100)
        .text("Win, Draw, Loss");

// Add y axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top - 100)
        .text("Value");

    
}


function drawBarGraphCountrySpecific(country) {
    d3.select("#barChart svg").remove();
    d3.select("#barChart div").remove();

    var margin = { top: 10, right: 30, bottom: 26, left: 100 },
        width = 580 - margin.left - margin.right,
        height = 280 - margin.top - margin.bottom;


        var svg = d3.select("#barChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        svg.append('text').text(`    Highlighted Country: ${country}`).attr('y','2')
        const selectedYear = d3.select("#year").node().value;

        const filteredData = fifaCsvRawData.filter(d => d.country == country && d.year == selectedYear);

        if (filteredData.length === 0) {
            drawBarGraph();
            return;
        }

        const winLossDraw = filteredData.reduce(function (prev,d) {

            const temp = [{ category: 'Win', value: parseInt(d.Win) },
                { category: 'Draw', value: parseInt(d.Draw) },
                { category: 'Loss', value: parseInt(d.Loss) }];
                prev.push(...temp);
                return prev;
        },[]);

        var x = d3.scaleBand()
            .range([0, width])
            .domain(["Win", "Draw", "Loss"])
            .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "middle");

        var y = d3.scaleLinear()
            .domain([0, d3.max(winLossDraw, function (d) {
                return d.value;
            })])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll("mybar")
            .data(winLossDraw)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return x(d.category);
            })
            .attr("y", function (d) {
                return y(d.value);
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return height - y(d.value);
            })
            .attr("fill", function (d) {
                if (d.category === 'Win') {
                    return "#275A47";
                } else if (d.category === 'Draw') {
                    return "#F4B350";
                } else {
                    return "#E35B5A";
                }
            });

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 100)
            .text("Win, Draw, Loss");

        // Add x axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 100)
            .text("Win, Draw, Loss");

        // Add y axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top - 100)
            .text("Value");

}
function drawDataTable() {
    d3.select("#dataTable svg").remove();
    d3.select("#dataTable").selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 26, left: 100 },
        width = 580 - margin.left - margin.right,
        height = 280 - margin.top - margin.bottom;

    const table = d3.select("#dataTable")
        .append("table")
        .attr("id", "dataTable")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const thead = table.append("thead");

    thead.append("tr")
        .selectAll("th")
        .data(["Year", "Champion", "Runner Up"])
        .enter()
        .append("th")
        .text(function(d) { return d; });

    const tbody = table.append("tbody");

        var selectedYear = d3.select("#year").node().value;
        var filteredData = fifaCsvSummaryRawData.filter(function(d) {
            return d.YEAR === selectedYear;
        });

        const tr = tbody.selectAll("tr")
            .data(filteredData)
            .enter()
            .append("tr");

        tr.append("td")
            .text(function(d) { return d.YEAR; });

        tr.append("td")
            .text(function(d) { return d.CHAMPION; });

        tr.append("td")
            .text(function(d) { return d['RUNNER UP']; });

        tr.each(function(d) {
            var td = d3.select(this).selectAll("td").nodes();

            d3.select(td[1])
                .append("img")
                .attr("src", function() { return d.Champ_URL; })
                .attr("height", "20px")
                .attr("width", "30px");

            d3.select(td[2])
                .append("img")
                .attr("src", function() { return d.Runner_URL; })
                .attr("height", "20px")
                .attr("width", "30px");
        });

}

window.onload = async()=>{
    fifaCsvRawData = await getCsvjson(csvPath);
    fifaCsvSummaryRawData = await getCsvjson(summaryCsvPath);
    await drawWorldmap();
    drawBarGraph();
    drawDataTable();
}

async function getCsvjson(url) {
    return new Promise((resolve,reject)=>{
        d3.csv(url, function (data) {
            resolve(data);
        
        })
    })
}

