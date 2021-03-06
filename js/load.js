import { loadTables } from "./tables.js";
import { preprocess } from "./data.js";
import { render } from "./render.js";

// Add event listener to add charts after page load
document.addEventListener("DOMContentLoaded", function() {
    loadCharts();
});

// Set up reset default button
let resetDefault = d3.select("#resetDefaults");
resetDefault.text("Reset Defaults");

function loadCharts() {
    let today = new Date();
    let month = today.toLocaleString("default", {month: "short"});
    let year = today.getFullYear();
    // Set chart chartTitle
    $(".chartTitle").text("Cases and Deaths Per Million (Log Scale), Dec. 2019 - " + month + ". " + year);

    let nations, selectedNation;
    let opts = {
          lines: 13, // The number of lines to draw
          length: 38, // The length of each line
          width: 17, // The line thickness
          radius: 45, // The radius of the inner circle
          scale: 1, // Scales overall size of the spinner
          corners: 1, // Corner roundness (0..1)
          speed: 1, // Rounds per second
          rotate: 0, // The rotation offset
          animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
          direction: 1, // 1: clockwise, -1: counterclockwise
          color: '#A9A9A9', // CSS color or array of colors
          fadeColor: 'transparent', // CSS color or array of colors
          top: '50%', // Top position relative to parent
          left: '50%', // Left position relative to parent
          shadow: '0 0 1px transparent', // Box-shadow for the lines
          zIndex: 2000000000, // The z-index (defaults to 2e9)
          className: 'spinner', // The CSS class to assign to the spinner
          position: 'absolute', // Element positioning
    };
    let charts = document.getElementById("container-main");
    let target = document.getElementById("spinner");
    let spinner = new Spin.Spinner(opts).spin(target);
    // Begin processing data and rendering charts
    d3.csv("https://covid.ourworldindata.org/data/owid-covid-data.csv", function(data) {
        spinner.stop();
        resetDefault.style("visibility", "visible");
        charts.style.visibility = "visible";
        let preset = "United States";
        let preprocessed = preprocess(data);
        nations = Array.from(loadNations(data));
        selectedNation = loadNationData(data, preset);

        loadTables(data, nations);

        // add the options to the button
        d3.select("#nation-select")
            .selectAll('myOptions')
                .data(nations)
            .enter()
                .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        // Set the selected option to United States
        d3.select("#nation-select").property("value", preset);
        $("#nation-select").selectpicker("render");
        render([selectedNation]);
        resetDefault.on("click", function() {
            d3.select("#nation-select").property("value", preset);
            $("#nation-select").selectpicker("render");

            selectedNation = loadNationData(data, preset);
            render([selectedNation]);
        });

        function update(selectedNations) {
            // Create new data with the selection?
            let dataFilter = [];
            selectedNations.forEach((item, i) => {
                dataFilter.push(loadNationData(data, item));
            });

            render(dataFilter);
        }

        // When the button is changed, run the updateChart function
        $("#nation-select").on("changed.bs.select", function(e, clickedIndex, isSelected, perviousValue) {
            // Get array of selected items
            let selected = $(this).find("option:selected");
            let arrSelected = [];
            selected.each(function() {
                arrSelected.push($(this).val());
            });

            // Trigger rendering of chart with selected options
            update(arrSelected);
        });
    });
}

function loadNations(data) {
    let fn = (arr, n) => arr.map(x => x[n]);
    let extracted = fn(data, "location");
    return new Set(extracted);
}

function loadNationData(data, nation) {
    return data.filter(n => n.location === nation);
}
