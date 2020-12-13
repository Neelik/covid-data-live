export const render = function(data) {
    // Remove old charts
    d3.select(".pm-group").remove();

    // set the dimensions and margins of the graph
    var width = 900;
    var margin = {
        "left": 100,
        "right": 2,
        "top": 15,
        "bottom": 100
    };
    var height = 300;

    // Render the chart
    renderPerMillionChart(data, width, height, margin);
}


export const renderPerMillionChart = function(data, width, height, margin) {
    var pmsvg = d3.select("#perMillionChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var perMillionGroup = pmsvg.append("g")
        .attr("class", "pm-group");

    // Set up X-axis -- using index 0 because all dates are all same range
    // console.log(data);
    var dateMin = d3.min(data[0], d => d.date);
    var dateMax = d3.max(data[0], d => d.date);

    var pmXAxis = d3.scaleTime()
        .domain([dateMin, dateMax])
        .rangeRound([ 0, width ]);

    // Set up Y-Axis
    var pmYAxesMinOptions = new Array(6);
    var pmYAxesMaxOptions = new Array(6)
    data.forEach((item, i) => {
        pmYAxesMinOptions.push(d3.min(item, d => d.total_cases_per_million));
        pmYAxesMinOptions.push(d3.min(item, d => d.total_deaths_per_million));
        pmYAxesMaxOptions.push(d3.max(item, d => d.total_cases_per_million));
        pmYAxesMaxOptions.push(d3.max(item, d => d.total_deaths_per_million));
    });

    var pmYMin = d3.min(pmYAxesMinOptions);
    var pmYMax = d3.max(pmYAxesMaxOptions);

    var pmYAxis = d3.scaleLinear()
        .domain( [pmYMin, pmYMax * 1.25])
        .range([ height, 0 ]);

    // Set up groups for the Per Million Chart
    var gpmX = perMillionGroup.append("g")
        .attr("height", margin.bottom)
        .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top) + ")")
        .attr("class", "axis axis--x")
        .call(pmXAxis);
    gpmX.append("g")
        .call(d3.axisBottom(pmXAxis));

    var gpmY = perMillionGroup.append("g")
        .attr("width", margin.left)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "axis axis--y")
        .call(pmYAxis);
    gpmY.append("g")
        .call(d3.axisLeft(pmYAxis));

    // add the X gridlines
    perMillionGroup.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top) + ")")
        .call(make_x_gridlines(pmXAxis)
            .tickSize(-height)
            .tickFormat(""));

    // add the Y gridlines
    perMillionGroup.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(make_y_gridlines(pmYAxis)
            .tickSize(-width)
            .tickFormat(""));

    // Line for Cases Per Million
    var cLineFn = d3.line()
        .x(d => pmXAxis(d.date))
        .y(d => pmYAxis(d.total_cases_per_million))

    var caseColor = d3.scaleOrdinal().domain(data)
        .range(["#FF6633", "#FFC300" , "#581845"]);

    let cLines = pmsvg.append("g")
        .attr("class", "case-lines");

    cLines.selectAll(".case-lines-group")
        .data(data).enter()
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "case-lines-group")
        .on("mouseover", function(d, i) {
            pmsvg.append("text")
                .attr("class", "case-title-text")
                .style("fill", caseColor(i))
                .text(d[0].location + " (Cases)")
                .attr("text-anchor", "middle")
                .attr("x", (width / 2) + margin.left)
                .attr("y", margin.top - 3);
        })
        .on("mouseout", function(d) {
            pmsvg.select(".case-title-text").remove();
        })
        .append("path")
        .attr("class", "case-line")
        .attr("d", d => cLineFn(d))
        .style("stroke", (d, i) => caseColor(i))
        .style("stroke-width", 3)
        .style("fill", "none")
        .on("mouseover", function(d) {
            d3.selectAll(".case-line")
                .style("stroke-width", 5)
                .style("cursor", "pointer");
        })
        .on("mouseout", function(d) {
            d3.selectAll(".case-line")
                .style("stroke-width", 3)
                .style("cursor", "none");
        });

    // Line for Deaths Per Million
    var dLineFn = d3.line()
        .x(d => pmXAxis(d.date))
        .y(d => pmYAxis(d.total_deaths_per_million));
    //
    var deathColor = d3.scaleOrdinal().domain(data)
        .range(["#D7BDE2", "#76448A", "#FF66CC"]);

    let dLines = pmsvg.append("g")
        .attr("class", "death-lines");

    dLines.selectAll(".death-lines-group")
        .data(data).enter()
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "death-lines-group")
        .on("mouseover", function(d, i) {
            pmsvg.append("text")
                .attr("class", "death-title-text")
                .style("fill", deathColor(i))
                .text(d[0].location + " (Deaths)")
                .attr("text-anchor", "middle")
                .attr("x", (width / 2) + margin.left)
                .attr("y", margin.top - 3);
        })
        .on("mouseout", function(d) {
            pmsvg.select(".death-title-text").remove();
        })
        .append("path")
        .attr("class", "death-line")
        .attr("d", d => dLineFn(d))
        .style("stroke", (d, i) => deathColor(i))
        .style("stroke-width", 3)
        .style("fill", "none")
        .on("mouseover", function(d) {
            d3.selectAll(".death-line")
                .style("stroke-width", 5)
                .style("cursor", "pointer");
        })
        .on("mouseout", function(d) {
            d3.selectAll(".death-line")
                .style("stroke-width", 3)
                .style("cursor", "none");
        });

    // Zoom Handling
    // var zoomPerMillion = d3.zoom()
    //     .scaleExtent([1, Infinity])
    //     .extent([[margin.left, 0], [width - margin.right, height]])
    //     .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
    //     .on("zoom", zoomed);
    //
    // var reset = d3.select('#resetZoom');
    // reset.text("Reset Zoom");
    // reset.on("click", function() {
    //     pmsvg.transition().call(zoomPerMillion.transform, d3.zoomIdentity);
    // });
    //
    // pmsvg.call(zoomPerMillion);

    // function zoomed() {
    //     if (d3.event.sourceEvent != null) {
    //         if (d3.event.sourceEvent.target.id == "perMillionChart") {
    //
    //             // Rescale Axes
    //             let newXAxis = d3.event.transform.rescaleX(pmXAxis),
    //                 newYAxis = d3.event.transform.rescaleY(pmYAxis);
    //
    //             cLineFn.x(d => newXAxis(d.date));
    //             cLineFn.y(d => newYAxis(d.total_cases_per_million));
    //             dLineFn.x(d => newXAxis(d.date));
    //             dLineFn.y(d => newYAxis(d.total_deaths_per_million));
    //             //
    //             gpmX.call(d3.axisBottom(newXAxis));
    //             gpmY.call(d3.axisLeft(newYAxis));
    //
    //             // let xt = myTransform.rescaleX(newXAxis),
    //             //     yt = myTransform.rescaleY(newYAxis);
    //             //
    //             // let newCLine = d3.line()
    //             //     .x(d => xt(d.date))
    //             //     .y(d => yt(d.total_cases_per_million));
    //             //
    //             // let newDLine = d3.line()
    //             //     .x(d => xt(d.date))
    //             //     .y(d => yt(d.total_deaths_per_million));
    //             //
    //             // d3.selectAll(".case-line")
    //             //     .enter()
    //             //     .attr("d", d => newCLine(d));
    //
    //
    //             //
    //             pmsvg.selectAll(".case-lines-group")
    //                 .data(data).enter()
    //                 .attr("d", d => cLineFn(data));
    //             //
    //             // dLines.selectAll(".death-lines-group")
    //             //     .data(data).enter()
    //             //     .attr("d", newDPlot);
    //
    //             // caseLine.attr("d", newCPlot);
    //             // deathLine.attr("d", newDPlot);
    //
    //             // pmsvg.append("defs").append("clipPath").attr("id","clip")
    //             //       .append("rect").attr("width",width).attr("height",height);
    //             // caseLine.attr("clip-path","url(#clip)");
    //             // deathLine.attr("clip-path","url(#clip)");
    //         }
    //     } else {
    //         render(data);
    //     }
    // }
}


// gridlines in x axis function
function make_x_gridlines(axis) {
    return d3.axisBottom(axis)
        .ticks(15)
}


// gridlines in y axis function
function make_y_gridlines(axis) {
    return d3.axisLeft(axis)
        .ticks(10)
}
