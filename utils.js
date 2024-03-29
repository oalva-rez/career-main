/**
 * @module helpers/Utils
 * @author Devon Rojas
 */

const rp = require("request-promise");

/**
 * Class containing utility functions for application.
 */
class Utils {
    constructor() {}

    /**
     * Checks if a value is a string.
     *
     * @param {*} val
     * @return {boolean} Whether or not the value is a string.
     */
    static isString(val) {
        return typeof val === "string";
    }

    /**
     * Checks if a value is an array.
     *
     * @param {*} val
     * @return {boolean} Whether or not the value is an array.
     */
    static isArray(val) {
        return Array.isArray(val);
    }

    /**
     * Checks if data is null or contains any null values.
     *
     * @param {*} data Data to check nullity for.
     *
     * @return {boolean} Whether or not the data has any null values.
     */
    static isNull(data) {
        if (data instanceof Array) {
            return !data.every((item) => {
                return !Object.values(item).every(
                    (val) => val !== null && val !== undefined
                );
            });
        } else if (data instanceof Object) {
            return !Object.values(data).every(
                (item) => item !== null && item !== undefined
            );
        } else {
            return typeof data == null;
        }
    }

    /**
     * Checks if an object contains a list of keys and that those key/values are not null or undefined.
     *
     * @param {Array}   keys Array of keys to check object against
     * @param {Object}  obj  An object to check
     *
     * @return {boolean} Whether or not the object is valid
     */
    static isValidObj(keys, obj) {
        if (!keys || !obj) {
            return false;
        }
        if (!Array.isArray(keys)) {
            return false;
        }
        if (typeof obj !== "object") {
            return false;
        }

        keys.forEach((key) => {
            if (!Object.keys(obj).includes(key)) {
                return false;
            } else if (obj[key] === null || obj[key] === undefined) {
                return false;
            }
        });

        return true;
    }

    /**
     * Sets a timeout.
     *
     * @param {number} ms   Amount of time in milliseconds to wait.
     * @return {Promise}    A completed Promise after timeout finishes.
     */
    static timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Asynchronously loops through an array, executing a callback function
     * for each element contained within array.
     *
     * @async
     * @param {Array}     arr   Array to asynchronously loop through
     * @param {Function}  cb    Callback function to execute for each array element.
     */
    static async asyncForEach(arr, cb) {
        for (let i = 0; i < arr.length; i++) {
            await cb(arr[i], i, arr);
        }
    }

    /**
     * Asynchronously executes callback functions per the rateLimitCount and rateLimitTime
     * values passed in to the function.
     *
     * @async
     * @param {Array}   calls           Array of calls to execute
     * @param {number}  rateLimitCount  Amount of calls to make sychronously
     * @param {number}  rateLimitTime   Amount of time to wait between batches
     *
     * @return {Array}  Reponse data from all calls.
     */
    static async throttle(calls, rateLimitCount, rateLimitTime) {
        const totalCalls = calls.length;
        console.log(`Total calls: ${totalCalls}`);
        let p = [];
        let i = 1;
        while (calls.length > 0) {
            // Take a call chunk specified by rateLimitCount
            let callstoExecute = calls.slice(0, rateLimitCount);
            // Remove that chunk from original call array
            calls = calls.slice(rateLimitCount, calls.length);

            let promises = [];
            callstoExecute.forEach((call) => {
                promises.push(
                    new Promise((resolve, reject) => {
                        console.log("Executing call " + i + "/" + totalCalls);
                        call(resolve);
                        i++;
                    })
                );
            });

            // Execute all promises in call chunk
            let res = await Promise.all(promises);
            // Combine response with any previous response data
            p = p.concat(res);
            // Wait for rateLimitTime to pass before moving on to next call chunk
            await Utils.timeout(rateLimitTime);
        }
        return p;
    }

    static buildRiasecQuery(code) {
        code = code.trim();
        const a = code[0] || "";
        const b = code[1] || "";
        const c = code[2] || "";

        return `${a}${b}${c} ${a}${b} ${a} ${a}${c}${b} ${a}${c} ${b}${a}${c} ${b}${a}`;
    }

    /**
     * Pulls JSON data of a Google Spreadsheet and parses it into a object.
     *
     * @param {string} spreadsheetID A Google Spreadsheet ID
     * @return {Object} The parsed JSON object
     */
    /** !no longer works - needs to be updated */
    static async fetchGoogleSheet(spreadsheetID) {
        const spreadsheetURL =
            "https://spreadsheets.google.com/feeds/list/" +
            spreadsheetID +
            "/1/public/full?alt=json";
        let res = await rp(spreadsheetURL, {
            json: true,
        });

        let data = res.feed.entry;
        data = data.map((e) => {
            let obj = {};
            for (let field in e) {
                if (field.substring(0, 3) === "gsx") {
                    let k = field.split("$")[1];
                    switch (k) {
                        case "programcode":
                            obj["code"] = +e[field]["$t"];
                            break;
                        case "programtitle":
                            obj["title"] = e[field]["$t"];
                            break;
                        case "relevancescore":
                            obj["relevance_score"] = +e[field]["$t"];
                            break;
                        case "soccodeblacklist":
                            obj["soc_blacklist"] =
                                e[field]["$t"] == ""
                                    ? []
                                    : e[field]["$t"].split(",");
                            break;
                        case "soccodeadds":
                            obj["soc_adds"] =
                                e[field]["$t"] == ""
                                    ? []
                                    : e[field]["$t"].split(",");
                            break;
                        case "onetkeywordsearch":
                            obj["keywords"] =
                                e[field]["$t"] == ""
                                    ? []
                                    : e[field]["$t"].split(" ");
                            break;
                        case "degreetypes":
                            obj["degree_types"] =
                                e[field]["$t"] == ""
                                    ? []
                                    : e[field]["$t"].split(",");
                        default:
                            obj[k] = e[field]["$t"];
                            break;
                    }
                }
            }
            return obj;
        });
        return data;
    }

    /**
     * Transforms wage data from careeronestop and transforms it to match db format.
     *
     * @param {Object} data "Wages" object from careeronestop data
     * @return {Object} The transformed wage data
     */

    static async tranformAnnualWageData(data) {
        const { NationalWagesList, StateWagesList, BLSAreaWagesList } =
            await data?.Wages;

        const getAnnualWages = (list) => {
            const annualData = list.find((item) => item.RateType === "Annual");
            if (!annualData) return null;
            return {
                Pct10: annualData?.Pct10,
                Pct25: annualData?.Pct25,
                Median: annualData?.Median,
                Pct75: annualData?.Pct75,
                Pct90: annualData?.Pct90,
            };
        };

        return {
            NationalWagesList: getAnnualWages(NationalWagesList)
                ? [getAnnualWages(NationalWagesList)]
                : [],
            StateWagesList: getAnnualWages(StateWagesList)
                ? [getAnnualWages(StateWagesList)]
                : [],
            BLSAreaWagesList: getAnnualWages(BLSAreaWagesList)
                ? [getAnnualWages(BLSAreaWagesList)]
                : [],
        };
    }
}

module.exports = Utils;
