/**
 * @module services/CareerOneStopService
 * @author Devon Rojas
 *
 * @requires {@link https://www.npmjs.com/package/request-promise| request-promise}
 */

const rp = require("request-promise");
const Utils = require("../utils.js");
require("dotenv").config();

const CAREER_ONE_STOP_API_TOKEN = process.env.CAREER_ONE_STOP_API_TOKEN;
const CAREER_ONE_STOP_API_USERID = process.env.CAREER_ONE_STOP_API_USERID;
const CAREER_ONE_STOP_HEADERS = {
    Authorization: "Bearer " + CAREER_ONE_STOP_API_TOKEN,
};
const CAREER_ONE_STOP_BASE_URI = "https://api.careeronestop.org";
const KEYS = [
    "Tasks",
    "Wages",
    "OnetTitle",
    "OnetDescription",
    "EducationTraining",
    "COSVideoURL",
];
/**
 * Retrieves O*NET occupation data from CareerOneStop API.
 *
 * @name fetch
 * @memberof module:services/CareerOneStopService
 * @function
 *
 * @param {string} code              O*NET Occupation code.
 * @param {string} [location='US']   Location to query (city, state, zip code) ex. "San Diego, CA".
 *
 * @return {object} Occupation data.
 */
const fetch = async (code, location = "US") => {
    let locationName =
        typeof location === "string"
            ? encodeURIComponent(location)
            : encodeURIComponent(location.short_name);
    let encodedKeyword = encodeURIComponent(code);
    const OCCUPATION_DETAILS_URI = `/v1/occupation/${CAREER_ONE_STOP_API_USERID}/${encodedKeyword}/${locationName}`;

    let params = {
        training: true,
        videos: true,
        tasks: true,
        wages: true,
        interest: true,
        dwas: true,
        stateLMILinks: true,
        skills: true,
        ability: true,
        knowledge: true,
        relatedOnetTitles: true,
        ooh: true,
        alternateOnetTitles: true,
        projectedEmployment: true,
    };

    let options = buildOptions(OCCUPATION_DETAILS_URI, params);

    try {
        const data = await rp(options);
        if (data.hasOwnProperty("OccupationDetail")) {
            if (Utils.isValidObj(KEYS, data["OccupationDetail"][0])) {
                return data["OccupationDetail"][0];
            } else {
                throw new Error(
                    "Did not receive complete career data from CareerOneStop API. Skipping career..."
                );
            }
        }
    } catch (error) {
        console.error(error);
    }
};

/**
 * Retrieves job posting data for an O*NET Occupation code.
 *
 * @name fetchJobDetail
 * @memberof module:services/CareerOneStopService
 * @function
 *
 * @param {string} code             O*NET Occupation code to fetch data for.
 * @param {string} [location="US"]  Location to query.
 * @param {number} [radius=25]      Radius from location to search.
 * @param {number} [days=30]        Length to retrieve data back to.
 *
 * @return {object} Job posing data for occupation.
 */
const fetchJobDetail = async (
    code,
    location = { short_name: "CA", types: ["country", "political"] },
    radius = 100,
    days = 0
) => {
    let locationName =
        typeof location === "string"
            ? encodeURIComponent(location)
            : encodeURIComponent(location.short_name);
    let encodedKeyword = encodeURIComponent(code);

    const OCCUPATION_JOB_DETAIL_URI = `/v1/jobsearch/${CAREER_ONE_STOP_API_USERID}/${encodedKeyword}/${locationName}/${radius}/${days}`;
    let options = buildOptions(OCCUPATION_JOB_DETAIL_URI);

    try {
        const data = await rp(options);
        return data;
    } catch (error) {
        if (error.name == "RequestError") {
            console.log("Request timed out.");
        } else {
            console.error("Unknown error.");
        }
    }
};
/**
 * Retrieves license data for an O*NET Occupation code.
 * @name fetchLicenseData
 * @memberof module:services/CareerOneStopService
 * @function
 *
 * @param {string} code             O*NET Occupation code to fetch data for.
 * @param {string} [location="US"]  Location to query.
 * @return {object} License data for occupation.
 *
 */
const fetchLicenseData = async (code, location = "CA") => {
    location = location === "San Diego, CA" ? "CA" : location;

    let locationName =
        typeof location === "string"
            ? encodeURIComponent(location)
            : encodeURIComponent(location.short_name);
    let encodedKeyword = encodeURIComponent(code);

    const OCCUPATION_LICENSE_URI = `/v1/license/${CAREER_ONE_STOP_API_USERID}/${encodedKeyword}/${locationName}/0/0/0/10`;
    let options = buildOptions(OCCUPATION_LICENSE_URI);

    try {
        const data = await rp(options);
        return data;
    } catch (error) {
        if (error.name == "RequestError") {
            console.log("Request timed out.");
        } else {
            console.error(error.error);
        }
    }
};
const fetchCertificateData = async (code) => {
    let encodedKeyword = encodeURIComponent(code);

    const OCCUPATION_CERTIFICATE_URI = `/v1/certificationfinder/${CAREER_ONE_STOP_API_USERID}/${encodedKeyword}/0/0/0/0/0/0/0/0/0/0`;
    let options = buildOptions(OCCUPATION_CERTIFICATE_URI);

    try {
        const data = await rp(options);
        return data;
    } catch (error) {
        if (error.name == "RequestError") {
            console.log("Request timed out.");
        } else {
            console.error(error.error);
        }
    }
};
/**
 * @name buildOptions
 * @function
 * @memberof module:services/CareerOneStopService
 * @private
 *
 * @param {string} urin
 * @param {Object} params
 */
const buildOptions = (uri, params) => {
    console.log(CAREER_ONE_STOP_BASE_URI + uri);
    return {
        uri: CAREER_ONE_STOP_BASE_URI + uri,
        qs: params,
        headers: CAREER_ONE_STOP_HEADERS,
        json: true,
        timeout: 10000,
    };
};

module.exports = {
    fetch,
    fetchJobDetail,
    fetchLicenseData,
    fetchCertificateData,
};
