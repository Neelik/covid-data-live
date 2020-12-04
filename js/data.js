// This file is a collection of data manipulation functions needed for the Covid-19 charts and tables
export const filterByNation = function(fullData, nation) {
    return fullData.filter(n => n.location === nation);
}

export const loadNations = function(fullData) {
    var fn = (arr, n) => arr.map(x => x[n]);
    var extracted = fn(data, "location");
    return new Set(extracted);
}

export const preprocess = function(data) {
    data.forEach((item, i) => {
        // Properly parse the date
        item.date = d3.timeParse("%Y-%m-%d")(item.date);
        if (item.total_cases == "") {
            item.total_cases = 0.0;
        } else {
            item.total_cases = parseFloat(item.total_cases);
        }

        if (item.total_cases_per_million == "") {
            item.total_cases_per_million = 0.0;
        } else {
            item.total_cases_per_million = parseFloat(item.total_cases_per_million);
        }

        if (item.total_deaths == "") {
            item.total_deaths = 0.0;
        } else {
            item.total_deaths = parseFloat(item.total_deaths);
        }

        if (item.total_deaths_per_million == "") {
            item.total_deaths_per_million = 0.0;
        } else {
            item.total_deaths_per_million = parseFloat(item.total_deaths_per_million);
        }

        if (item.total_tests == "") {
            item.total_tests = 0.0;
        } else {
            item.total_tests = parseFloat(item.total_tests);
        }
    });
    return data;
}
