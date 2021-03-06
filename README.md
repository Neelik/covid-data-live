# World Wide Covid-19 Data

**NOTE** This project can be viewed at [Covid Live Data](https://covid-data-live.herokuapp.com/)

## Beta Version Description

This project has evolved a little since the original description was submitted.

### Change Log

 - Removed Unlock/Lock Zoom button
 - Added "Reset Zoom" button
 - Combined Deaths and Cases into a single chart, now scaled to Per Million values
 - Added three new tables (# of Case, # of Deaths, and # of Tests)
 - Moved link to source data to the top
 - Made line colors static to violet for Deaths and orange for Cases


## Planned Description

Two charts that display the total number of cases and deaths for Covid-19 from December 2019 to November 2020. The charts display the data for one
nation at a time, with a provided drop down to select a nation. The charts support simultaneous or individual zoom/pan with a toggle button at the top
of the page. The data used in the charts was obtained from Our World in Data.

As a starting point for this assignment, I referenced my previous assignments stock market line chart. Since I aimed to implement two charts related to
Covid -- Deaths and Cases over time -- it made sense to use the stock market line chart as a starting point. Instead of switching between market open and
close values, I built the Covid charts to allow swapping between various nations in the world. My first milestone was getting a single chart created with
just the count of cases. Once that was done, I used your A4 example to modularize the code and allow for easy manipulation of two SVGs. After modularization
I added the second chart with the ability to zoom and pan. The final piece was the toggle linking the zoom/pan behavior together.

The largest hiccup I ran into on this assignment was missing data. Any values that were missing in the total_cases or total_deaths columns I replaced with zeros.
The cleaned version with these data replacements is stored in the "data/owid-covid-data.fillna.csv" file.


**Who is your intended audience and what do they want to see?**

My intended audience for these visualizations is the general public. What they will want to see is trends in the number of cases, tests, and deaths for Covid-19
in the United States compared to other nations.

**How will you ensure your text is clear and readable?**

I will ensure the text is clear and readable by choosing appropriate color schemes that reduce eye strain as well as ensure that any annotations and labels are well
spaced and sized.

**What units, legends, and annotations are required?**

The units for the X-axis will be time, and the units for the y-axis will number of cases/tests/deaths. A legend will be needed to annotate what color line belongs to
what nation.

**How are you providing context and comparison?**

The context will be provided through chart title, axes labels, and the chart legends. The comparison will be through multiple lines on the same chart for direct
comparability between the presented data.
