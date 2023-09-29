const BLS_API_KEY = "8c4220e554f645ef98a00e1c03de3945";
const axios = require("axios");

const getBLSData = async (seriesId) => {
    const response = await fetch(
        `https://api.bls.gov/publicAPI/v2/timeseries/data/${seriesId}?registrationkey=${BLS_API_KEY}&startyear=2010&endyear=2020`
    );
    const data = await response.json();
    return data;
};
const getTimeseriesData = async (startYear, endYear, seriesID) => {
    const apiURL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
    const payload = {
        seriesid: [seriesID],
        startyear: startYear,
        endyear: endYear,
        catalog: true,
        calculations: true,
        annualaverage: true,
        aspects: true,
        registrationkey: "8c4220e554f645ef98a00e1c03de3945", // Replace with your actual registration key
    };

    try {
        const response = await axios.post(apiURL, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
        throw error;
    }
};
module.exports = {
    getBLSData,
    getTimeseriesData,
};
