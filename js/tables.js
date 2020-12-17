import { filterByNation, loadNations, preprocess } from "./data.js";

export const loadTables = function (worldData, nationsArray) {
    let maxSize = nationsArray.length;
    let deaths = new Array(maxSize);
    let cases = new Array(maxSize);
    let tests = new Array(maxSize);

    nationsArray.forEach((item, i) => {
        let nationData = filterByNation(worldData, item);
        cases.push({"nation": item, "cases": d3.max(nationData, d => d.total_cases)})
        deaths.push({"nation": item, "deaths": d3.max(nationData, d => d.total_deaths)})
        tests.push({"nation": item, "tests": d3.max(nationData, d => d.total_tests)})
    });

    cases.sort((a, b) => (a.cases < b.cases) ? 1 : -1);
    deaths.sort((a, b) => (a.deaths < b.deaths) ? 1 : -1);
    tests.sort((a, b) => (a.tests < b.tests) ? 1 : -1);

    // Build the markup for the cases table rows
    let caseRows = "";
    cases.slice(1, 6).forEach((item, i) => {
        caseRows += "<tr><td>" + item.nation + "</td><td>" + item.cases.toLocaleString() + "</td></tr>";
    });
    $("#cases-table-body").html(caseRows);

    // Build the markup for the deaths table rows
    let deathRows = "";
    deaths.slice(1, 6).forEach((item, i) => {
        deathRows += "<tr><td>" + item.nation + "</td><td>" + item.deaths.toLocaleString() + "</td></tr>";
    });
    $("#deaths-table-body").html(deathRows);

    // Build the markup for the tests table rows
    let testRows = "";
    tests.slice(0, 5).forEach((item, i) => {
        testRows += "<tr><td>" + item.nation + "</td><td>" + item.tests.toLocaleString() + "</td></tr>";
    });
    $("#tests-table-body").html(testRows);
}

// Calculate the sum of a specified property for an array of fields
function sum(items, prop) {
    return items.reduce( function (a, b) {
        return a + b[prop] || 0;
    }, 0);
}
