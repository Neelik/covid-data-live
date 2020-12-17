export const render = function(data) {
    // Remove old charts
    d3.select(".pm-group").remove();
    d3.select("legend-group").remove();

    // set the dimensions and margins of the graph
    var width = 900;
    var margin = {
        "left": 100,
        "right": 2,
        "top": 15,
        "bottom": 100
    };
    var height = 500;

    // Render the chart
    renderPerMillionChart(data, width, height, margin);
}


export const renderPerMillionChart = function(data, width, height, margin) {
    let pmsvg = d3.select("#perMillionChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    let perMillionGroup = pmsvg.append("g")
        .attr("class", "pm-group");

    // Set up X-axis -- using index 0 because all dates are all same range
    let dateMin = d3.min(data[0], d => d.date);
    let dateMax = d3.max(data[0], d => d.date);

    let pmXAxis = d3.scaleTime()
        .domain([dateMin, dateMax])
        .rangeRound([ 0, width ]);

    // Set up Y-Axis
    let pmYAxesMinOptions = new Array(6);
    let pmYAxesMaxOptions = new Array(6)
    data.forEach((item, i) => {
        pmYAxesMinOptions.push(d3.min(item, d => d.total_cases_per_million));
        pmYAxesMinOptions.push(d3.min(item, d => d.total_deaths_per_million));
        pmYAxesMaxOptions.push(d3.max(item, d => d.total_cases_per_million));
        pmYAxesMaxOptions.push(d3.max(item, d => d.total_deaths_per_million));
    });

    let pmYMin = d3.min(pmYAxesMinOptions) == 0 ? 10 : d3.min(pmYAxesMinOptions);
    let pmYMax = d3.max(pmYAxesMaxOptions);

    let pmYAxis = d3.scaleLog()
        .domain( [pmYMin, pmYMax])
        .range([ height, 0 ])
        .clamp(true)
        .nice();

    // Set up groups for the Per Million Chart
    let gpmX = perMillionGroup.append("g")
        .attr("height", margin.bottom)
        .attr("transform", "translate(" + (margin.left) + "," + (height + margin.top) + ")")
        .attr("class", "axis axis--x")
        .call(pmXAxis);
    gpmX.append("g")
        .call(d3.axisBottom(pmXAxis));

    let gpmY = perMillionGroup.append("g")
        .attr("width", margin.left)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "axis axis--y")
        .call(pmYAxis);
    gpmY.append("g")
        .call(d3.axisLeft(pmYAxis).ticks(10, d3.format(".2s")));

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
    let cLineFn = d3.line()
        .x(d => pmXAxis(d.date))
        .y(d => pmYAxis(d.total_cases_per_million))

    let caseColor = d3.scaleOrdinal().domain(data)
        .range(["#FF6633", "#FFC300" , "#581845"]);

    let cLines = perMillionGroup.append("g")
        .attr("class", "case-lines");

    cLines.selectAll(".case-lines-group")
        .data(data).enter()
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "case-lines-group")
        .on("mouseover", function(d, i) {
            perMillionGroup.append("text")
                .attr("class", "case-title-text")
                .style("fill", caseColor(i))
                .text(d[0].location + " (Cases)")
                .attr("text-anchor", "middle")
                .attr("x", (width / 2) + margin.left)
                .attr("y", margin.top - 3);
        })
        .on("mouseout", function(d) {
            perMillionGroup.select(".case-title-text").remove();
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
    let dLineFn = d3.line()
        .x(d => pmXAxis(d.date))
        .y(d => pmYAxis(d.total_deaths_per_million));
    //
    let deathColor = d3.scaleOrdinal().domain(data)
        .range(["#D7BDE2", "#76448A", "#FF66CC"]);

    let dLines = perMillionGroup.append("g")
        .attr("class", "death-lines");

    dLines.selectAll(".death-lines-group")
        .data(data).enter()
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "death-lines-group")
        .on("mouseover", function(d, i) {
            perMillionGroup.append("text")
                .attr("class", "death-title-text")
                .style("fill", deathColor(i))
                .text(d[0].location + " (Deaths)")
                .attr("text-anchor", "middle")
                .attr("x", (width / 2) + margin.left)
                .attr("y", margin.top - 3);
        })
        .on("mouseout", function(d) {
            perMillionGroup.select(".death-title-text").remove();
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

    let cellLabels = [];
    data.forEach((item, i) => {
        cellLabels.push({ "name": item[0].location + " (Cases)", "color": caseColor(i) });
        cellLabels.push({ "name": item[0].location + " (Deaths)", "color": deathColor(i) });
    });
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
