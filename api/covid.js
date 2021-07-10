const COVID_API_URL = "https://disease.sh/v3/covid-19";

export const getWorldWideData = async () => {
  const response = await fetch(`${COVID_API_URL}/all`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error("Could not fetch world wide data at the moment");
  }
  return data;
};

export const getVaccineData = async () => {
  const response = await fetch(`${COVID_API_URL}/vaccine/coverage/countries`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error("Could not fetch world wide data at the moment");
  }
  const vaccineReport = [];
  for (const report in data) {
    const d = [data[report]["country"], sum(data[report]["timeline"])];
    vaccineReport.push(d);
  }
  return vaccineReport;
};

export const getCountryData = async (country, dataKey) => {
  const response = await fetch(`${COVID_API_URL}/countries/${country}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error("Could not fetch world wide data at the moment");
  }
  const countryReport = data[dataKey];

  return countryReport;
};

function sum(obj) {
  return Object.keys(obj).reduce(
    (sum, key) => sum + parseFloat(obj[key] || 0),
    0
  );
}
