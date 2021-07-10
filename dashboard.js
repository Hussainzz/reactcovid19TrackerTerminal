import React, { useState, useEffect, useCallback } from "react";
import blessed from "blessed";
import { render } from "react-blessed";
import { Grid, Donut, Table, Bar } from "react-blessed-contrib";
import gradient from "gradient-string";
import figlet from "figlet";
import chalk from "chalk";
import { getWorldWideData, getVaccineData, getCountryData } from "./api/covid";
import Box from "./components/Box";
const App = () => {
  const countryList = ["india", "usa", "uk", "china", "france"];
  const [loadingWorldData, setLoadingWorldData] = useState(true);
  const [activeCasesToday, setActiveCasesToday] = useState(0);
  const [recoveredCasesToday, setRecoveredCasesToday] = useState(0);

  const [recoveredPercent, setRecoveredPercent] = useState(0.0);
  const [casesPercent, setCasesPercent] = useState(0.0);
  const [deathsPercent, setDeathsPercent] = useState(0.0);

  const [vaccineData, setVaccineData] = useState([]);
  const [barChartData, setBarChartData] = useState([0, 0, 0, 0, 0]);
  const [todayBarChartData, setTodayBarChartData] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    const getWorldData = async () => {
      setLoadingWorldData(true);
      getWorldWideData().then((data) => {
        const total = data.recovered + data.cases + data.deaths;
        setRecoveredPercent((data.recovered / total) * 100);
        setCasesPercent((data.cases / total) * 100);
        setDeathsPercent((data.deaths / total) * 100);
        setActiveCasesToday(data.todayCases);
        setRecoveredCasesToday(data.todayRecovered);
        setLoadingWorldData(false);
      });
    };
    getWorldData();
    const interval = setInterval(getWorldData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getVReport = async () => {
      getVaccineData().then((data) => {
        setVaccineData(data);
      });
    };
    getVReport();
    const intervalV = setInterval(getVReport, 300000);
    return () => clearInterval(intervalV);
  }, []);

  useEffect(() => {
    const getCountryReport = async () => {
      const countryD = [];
      const countryTodayD = [];
      for (const c in countryList) {
        getCountryData(countryList[c], "active").then((data) => {
          countryD.push(data);
        });

        getCountryData(countryList[c], "todayCases").then((data) => {
          countryTodayD.push(data);
        });
      }
      setBarChartData(countryD);
      setTodayBarChartData(countryTodayD);
    };
    getCountryReport();
    const intervalC = setInterval(getCountryReport, 300000);
    return () => clearInterval(intervalC);
  }, []);

  function updateDonut(percent, label, color) {
    return [{ percent: percent, label: label, color: color }];
  }

  return (
    <Grid rows={12} cols={12}>
      <Box row={0} col={1} rowSpan={2} colSpan={5} label="Active Cases Today">
        <text top="center" left="center">
          {!loadingWorldData
            ? gradient.atlas.multiline(
                figlet.textSync(activeCasesToday, {
                  font: "Straight",
                })
              )
            : chalk.white.bgRed.bold("Loading...")}
        </text>
      </Box>
      <Box row={0} col={6} rowSpan={2} colSpan={5} label="Recovered Cases">
        <text top="center" left="center">
          {!loadingWorldData
            ? gradient.atlas.multiline(
                figlet.textSync(recoveredCasesToday, {
                  font: "Straight",
                })
              )
            : chalk.white.bgRed.bold("Loading...")}
        </text>
      </Box>

      <Donut
        row={2}
        col={3}
        rowSpan={4}
        colSpan={2}
        {...{
          label: "WorldWide Cases",
          radius: 16,
          arcWidth: 4,
          yPadding: 2,
          data: updateDonut(casesPercent, "Cases", "yellow"),
        }}
      />
      <Donut
        row={2}
        col={1}
        rowSpan={4}
        colSpan={2}
        {...{
          label: "WorldWide Deaths",
          radius: 16,
          arcWidth: 4,
          yPadding: 2,
          data: updateDonut(deathsPercent, "Deaths", "red"),
        }}
      />
      <Donut
        row={2}
        col={5}
        rowSpan={4}
        colSpan={2}
        {...{
          label: "WorldWide Recovered",
          radius: 16,
          arcWidth: 4,
          yPadding: 2,
          data: updateDonut(recoveredPercent, "recovered", "green"),
        }}
      />

      <Table
        row={2}
        col={7}
        rowSpan={4}
        colSpan={4}
        {...{
          keys: true,
          fg: "green",
          label: "Vaccines Rolled Out",
          columnSpacing: 1,
          columnWidth: [24, 10, 10],
        }}
        data={{
          headers: ["Country", "Total"],
          data: vaccineData,
        }}
      />

      <Bar
        row={6}
        col={1}
        rowSpan={4}
        colSpan={3}
        {...{
          label: "Active Cases",
          barWidth: 4,
          barSpacing: 6,
          xOffset: 2,
          maxHeight: 9,
        }}
        data={{ titles: countryList, data: barChartData }}
      />

      <Bar
        row={6}
        col={4}
        rowSpan={4}
        colSpan={3}
        {...{
          label: "Today Cases",
          barWidth: 4,
          barSpacing: 6,
          xOffset: 2,
          maxHeight: 9,
        }}
        data={{ titles: countryList, data: todayBarChartData }}
      />

      <Box row={6} col={7} rowSpan={4} colSpan={4} label="**">
        <text top="center" left="center">
          {chalk.white.bgRed.bold("STAY HOME STAY SAFE!")}
        </text>
      </Box>
    </Grid>
  );
};

const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: "Covid19 Tracker",
});

screen.key(["escape", "q", "C-c"], () => process.exit(0));

render(<App />, screen);
