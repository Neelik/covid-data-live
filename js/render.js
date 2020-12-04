export const render = function(data) {
    // Remove old charts
    d3.select(".pm-group").remove();
    d3.select(".totals-group").remove();

    // set the dimensions and margins of the graph
    var width = 900;
    var margin = {
        "left": 100,
        "right": 2,
        "top": 15,
        "bottom": 100
    };
    var height = 300;

    // Render the charts
    // renderTotalsChart(data, width, height, margin);
    renderPerMillionChart(data, width, height, margin);
}


export const renderPerMillionChart = function(data, width, height, margin) {
    var pmsvg = d3.select("#perMillionChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var perMillionGroup = pmsvg.append("g")
        .attr("class", "pm-group");

    // Set up X-axis
    var dateMin = d3.min(data, d => d.date);
    var dateMax = d3.max(data, d => d.date);

    var pmXAxis = d3.scaleTime()
        .domain([dateMin, dateMax])
        .rangeRound([ 0, width ]);

    // Set up Y-Axis
    var pmYAxesMinOptions = new Array(6);
    pmYAxesMinOptions.push(d3.min(data, d => d.total_cases_per_million));
    pmYAxesMinOptions.push(d3.min(data, d => d.total_deaths_per_million));
    var pmYAxesMaxOptions = new Array(6)
    pmYAxesMaxOptions.push(d3.max(data, d => d.total_cases_per_million));
    pmYAxesMaxOptions.push(d3.max(data, d => d.total_deaths_per_million));
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

    var cLineData = cLineFn(data);

    var caseLine = perMillionGroup.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("path")
        .datum(cLineData)
        .attr("d", cLineData)
        .attr("stroke", "#FF8C00")
        .attr("stroke-width", 3)
        .style("fill", "none")

    // Line for Deaths Per Million
    var dLineFn = d3.line()
        .x(d => pmXAxis(d.date))
        .y(d => pmYAxis(d.total_deaths_per_million))

    var dLineData = dLineFn(data);

    var deathLine = perMillionGroup.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("path")
        .datum(dLineData)
        .attr("d", dLineData)
        .attr("stroke", "#9400D3")
        .attr("stroke-width", 3)
        .style("fill", "none")

    var zoomPerMillion = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    var reset = d3.select('#resetZoom');
    reset.text("Reset Zoom");
    reset.on("click", function() {
        pmsvg.transition().call(zoomPerMillion.transform, d3.zoomIdentity);
    });

    pmsvg.call(zoomPerMillion);

    function zoomed() {
        if (d3.event.sourceEvent != null) {
            if (d3.event.sourceEvent.target.id == "perMillionChart") {
                var newXAxis = d3.event.transform.rescaleX(pmXAxis);
                cLineFn.x(d => newXAxis(d.date));
                dLineFn.x(d => newXAxis(d.date));
                var newCPlot = cLineFn(data);
                var newDPlot = dLineFn(data);
                caseLine.attr("d", newCPlot);
                deathLine.attr("d", newDPlot);
                gpmX.call(d3.axisBottom(newXAxis));
                pmsvg.append("defs").append("clipPath").attr("id","clip")
                      .append("rect").attr("width",width).attr("height",height);
                caseLine.attr("clip-path","url(#clip)");
                deathLine.attr("clip-path","url(#clip)");
            }
        } else {
            render(data);
        }
    }
}


export const renderTotalsChart = function(data, width, height, margin) {
    // append the svg object to the body of the page
    var tsvg = d3.select("#totalsChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var totalsGroup = tsvg.append("g")
        .attr("class", "totals-group");

    // Set up X-axis
    var dateMin = d3.min(data, d => d.date);
    var dateMax = d3.max(data, d => d.date);

    var xAxis = d3.scaleTime()
        .domain([dateMin, dateMax])
        .rangeRound([ 0, width ]);

    // Set up Y-axis
    var yAxesMinOptions = new Array(6);
    yAxesMinOptions.push(d3.min(data, d => d.total_cases));
    yAxesMinOptions.push(d3.min(data, d => d.total_deaths));
    var yAxesMaxOptions = new Array(6)
    yAxesMaxOptions.push(d3.max(data, d => d.total_cases));
    yAxesMaxOptions.push(d3.max(data, d => d.total_deaths));
    var yMin = d3.min(yAxesMinOptions);
    var yMax = d3.max(yAxesMaxOptions);

    var yAxis = d3.scaleLinear()
        .domain( [yMin, yMax * 1.25])
        .range([ height, 0 ]);

    // Set up Groups for Totals Chart
    var gtX = totalsGroup.append("g")
        .attr("height", margin.bottom)
        .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top) + ")")
        .attr("class", "axis axis--x")
        .call(xAxis);
    gtX.append("g")
        .call(d3.axisBottom(xAxis));

    var gtY = totalsGroup.append("g")
        .attr("width", margin.left)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "axis axis--y")
        .call(yAxis);
    gtY.append("g")
        .call(d3.axisLeft(yAxis));

        // add the X gridlines
    totalsGroup.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top) + ")")
        .call(make_x_gridlines(xAxis)
            .tickSize(-height)
            .tickFormat(""));

    // add the Y gridlines
    totalsGroup.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(make_y_gridlines(yAxis)
            .tickSize(-width)
            .tickFormat(""));

    // Line for Cases
    var cLineFn = d3.line()
        .x(d => xAxis(d.date))
        .y(d => yAxis(d.total_cases))

    var cLineData = cLineFn(data);

    var caseLine = totalsGroup.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("path")
        .datum(cLineData)
        .attr("d", cLineData)
        .attr("stroke", "#FF8C00")
        .attr("stroke-width", 3)
        .style("fill", "none")

    // Line for Deaths
    var dLineFn = d3.line()
        .x(d => xAxis(d.date))
        .y(d => yAxis(d.total_deaths))

    var dLineData = dLineFn(data);

    var deathLine = totalsGroup.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .append("path")
        .datum(dLineData)
        .attr("d", dLineData)
        .attr("stroke", "#9400D3")
        .attr("stroke-width", 3)
        .style("fill", "none")

    // Set up Zoom handling
    var zoomTotals = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    var reset = d3.select('#resetZoom');
    reset.text("Reset Zoom");
    reset.on("click", function() {
        tsvg.transition().call(zoomTotals.transform, d3.zoomIdentity);
    });

    tsvg.call(zoomTotals);

    function zoomed() {
        if (d3.event.sourceEvent != null) {
            if (d3.event.sourceEvent.target.id == "totalsChart") {
                var newXAxis = d3.event.transform.rescaleX(xAxis);
                cLineFn.x(d => newXAxis(d.date));
                dLineFn.x(d => newXAxis(d.date));
                var newCPlot = cLineFn(data);
                var newDPlot = dLineFn(data);
                caseLine.attr("d", newCPlot);
                deathLine.attr("d", newDPlot);
                gtX.call(d3.axisBottom(newXAxis));
                tsvg.append("defs").append("clipPath").attr("id","clip")
                      .append("rect").attr("width",width).attr("height",height);
                caseLine.attr("clip-path","url(#clip)");
                deathLine.attr("clip-path","url(#clip)");
            }
        } else {
            render(data);
        }
    }

}

// gridlines in x axis function
function make_x_gridlines(axis) {
    return d3.axisBottom(axis)
        .ticks(15)
}

// gridlines in y axis function
function make_y_gridlines(axis) {
    return d3.axisLeft(axis)
        .ticks(15)
}
