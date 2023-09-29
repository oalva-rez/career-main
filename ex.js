let OLD_API_URI = "https://infinite-spire-51367.herokuapp.com/";
let API_URI = "http://localhost:3000/";

const MESA_PROGRAM_URI = "http://www.sdmesa.edu/academics/v2/programs/";

// Global chart objects for updating data
var wagesChart, jobPostingsChart, companyListingChart;

(async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        //         const id = params.get("id") ? params.get("id") : "13-2011.01";
        const id = params.get("id") ? params.get("id") : "15-1211.01";

        const career = await getCareer(id);

        document.title =
            career["title"] +
            " | Career and Salary Details | San Diego Mesa College";

        const breadcrumb = document.querySelector(".breadcrumb li.active");
        breadcrumb.innerHTML = career["title"];

        // Hero Elements
        let title = document.querySelector("#career_title h1");
        //         let tagline = document.getElementById("career_description_glance");

        title.innerHTML = career["title"];
        // //         tagline.innerHTML = truncateDescription(career["_description"]);
        console.log({ career });
        buildSummaryComponent(career);
        buildWagesComponent(career);
        buildRelatedWagesElement();
        buildTopCompaniesElement(career["job_data"]);
        buildProjectedEmploymentElement(career["growth"]);
        populateGrowthData(career["growth"]);
        buildRelatedPrograms(career["related_programs"]);
        buildCALicenses(career["CA_licenses"]);
    } catch (error) {
        console.log("career.js failed:", error.message);
    }
})();

async function getCareer(
    code = "13-2011.01",
    location = "San Diego, CA",
    radius = 50
) {
    var OLD_CAREER_URI = OLD_API_URI + "career/" + "11-9111.00";
    OLD_API_URI += location ? "/" + location : "US";
    OLD_API_URI += radius ? "/" + radius : "25";

    let CAREER_URL = new URL(API_URI + "career/stage2");
    CAREER_URL.searchParams.append("location", location);
    CAREER_URL.searchParams.append("keyword", code);
    try {
        var res = await fetch(CAREER_URL);
        res = await res.json();
        console.log(res);
        return res;
    } catch (error) {
        console.error(error);
    }
}

function buildSummaryComponent(career) {
    buildVideoElement(career.code);
    buildDescriptionElement(career["description"], career["title"]);
    buildEducationElement(career["education"]);
    buildTechnicalSkillsElement(career["technical_skills"]);
    // // buildSalaryGlanceElement(career["salary"]["NationalWagesList"][0]);
    // // buildGrowthGlanceElement(career["growth"]);
    buildTasksElement(career["tasks"]);
}

function buildWagesComponent(career) {
    buildWagesElement(career["salary"]);
}

/**
 * Generates detailed salary element on page.
 *
 * Builds a chart containing detailed salary information based on the
 * smallest locality available in location. Wage information is broken
 * into 10th, 25th, 50th, 75th, and 90th percentiles.
 *
 * @see buildDetailedSalaryChart
 *
 * @param {Object} salary                   Salary data for current occupation
 * @param {Array}  salary.BLSAreaWagesList  Local (zip code) salary data
 * @param {Array}  salary.StateWagesList    State salary data
 * @param {Array}  salary.NationalWagesList National salary data
 * @param {Object} location                 User's specified location (zip, county, or state)
 * @param {string} location.zip             Zip code of location
 *
 * @return {void}
 */
function buildWagesElement(salary, location) {
    // location = location.zip ? location.zip : location.county ? location.county : location.state ? location.state : "hi";

    location = "US";
    // document.getElementById("wages_title").innerHTML = "Wages for " + location;
    var el = document.querySelector(".wages");
    el = document.getElementById("wages");
    var s = Object.keys(salary).length > 0 ? salary : null;

    if (s) {
        var id = "salaryCanvas";

        // buildWagesString(s, el);
        if (document.getElementById(id)) {
            document.getElementById(id).remove();
        }

        var ctx = document.createElement("canvas");
        ctx.id = id;
        el.appendChild(ctx);
        var options = {
            scales: {
                xAxes: [
                    {
                        gridLines: {
                            drawBorder: false,
                        },
                    },
                ],
                yAxes: [
                    {
                        ticks: {
                            display: true,
                            min: 0,
                            max: findLargestNumber(s),
                        },
                    },
                ],
            },
        };
        wagesChart = buildWageComparisonLineGraph(s, id, options);
    } else {
        let d = document.createElement("div");
        d.innerHTML = "No wage data available for this career.";
        el.appendChild(d);
    }
}

function populateGrowthData(growth) {
    const stateGrowthEle = document.getElementById("state-growth");
    const nationalGrowthEle = document.getElementById("national-growth");

    const stateGrowthIcon = document.getElementById("state-arrow");
    const nationalGrowthIcon = document.getElementById("national-arrow");

    const stateGrowthDifferenceEle = document.getElementById("ca-proj");
    const nationalGrowthDifferenceEle = document.getElementById("us-proj");

    const stateGrowthDifference =
        growth["state"].projectedEmployment -
        growth["state"].estimatedEmployment;
    const nationalGrowthDifference =
        growth["national"].projectedEmployment -
        growth["national"].estimatedEmployment;
    stateGrowthDifferenceEle.textContent = `${stateGrowthDifference.toLocaleString()} jobs`;
    nationalGrowthDifferenceEle.textContent = `${nationalGrowthDifference.toLocaleString()} jobs`;

    const statePercentChange = parseFloat(growth["state"].percentChange);
    const nationalPercentChange = parseFloat(growth["national"].percentChange);

    stateGrowthEle.textContent = `${statePercentChange}%`;
    nationalGrowthEle.textContent = `${nationalPercentChange}%`;

    if (statePercentChange > 0) {
        stateGrowthIcon.src = "/academics/v2/careers/assets/arrow-up.svg";
    }
    if (statePercentChange < 0) {
        stateGrowthIcon.src = "/academics/v2/careers/assets/arrow-down.svg";
    }
    if (statePercentChange === 0) {
        stateGrowthIcon.src = "#";
    }
    if (nationalPercentChange > 0) {
        nationalGrowthIcon.src = "/academics/v2/careers/assets/arrow-up.svg";
    }
    if (nationalPercentChange < 0) {
        nationalGrowthIcon.src = "/academics/v2/careers/assets/arrow-down.svg";
    }
    if (nationalPercentChange === 0) {
        nationalGrowthIcon.src = "#";
    }
}

function buildRelatedWagesElement() {
    var el = document.querySelector(".related-wages");
    el = document.getElementById("related-wages");

    var id = "relatedWagesCanvas";

    // buildWagesString(s, el);

    if (document.getElementById(id)) {
        document.getElementById(id).remove();
    }

    var ctx = document.createElement("canvas");
    ctx.id = id;
    el.appendChild(ctx);
    buildRelatedWagesChart({}, id, null);
}

function buildProjectedEmploymentElement(growth) {
    var el = document.getElementById("projected-chart");
    var id = "projectedCanvas";

    // buildWagesString(s, el);

    if (document.getElementById(id)) {
        document.getElementById(id).remove();
    }

    var ctx = document.createElement("canvas");
    ctx.id = id;
    el.appendChild(ctx);
    buildEmploymentProjectionChart(growth, id);
}
/**
 * Generates all academic program links to Mesa website.
 *
 * Creates individual elements for each academic program associated
 * with occupation containing the program title and all degrees &
 * certificates under that program. Each program element links
 * to the respective academic program page on the Mesa website.
 *
 * @param {Array} programs List of academic program associated with occupation
 *
 * @return {void}
 */
function buildRelatedPrograms(programs) {
    const TEMP_PROGRAMS = [
        {
            title: "Education",
            code: 22,
            degree_types: ["ADT"],
            url: "education",
        },
        {
            title: "Health Information Technology",
            code: 30,
            degree_types: ["AS Degree"],
            url: "health-information-technology",
        },
        {
            title: "Child Development",
            code: 14,
            degree_types: [
                "AS Degree",
                "Certificate of Performance",
                "Certificate of Achievement",
            ],
            url: "child-development",
        },
    ];

    var container = document.getElementById("related_programs");
    TEMP_PROGRAMS.forEach(function (program) {
        var a = document.createElement("a");
        // 		a.href = MESA_PROGRAM_URI + program["url"] + ".shtml";
        // updated to go to the index of each program
        a.href = MESA_PROGRAM_URI + program["url"];
        a.target = "_blank";

        var e = document.createElement("div");
        e.id = program.title;

        var program_title = document.createElement("h5");
        program_title.innerHTML = program.title;

        var degree_type = document.createElement("cite");
        degree_type.innerHTML = program.degree_types.join(", ");

        e.appendChild(program_title);
        e.appendChild(degree_type);
        a.appendChild(e);

        container.appendChild(a);
    });
    document.querySelector(".preloader").remove();
}
function buildCALicenses(licenses) {
    var container = document.getElementById("CA_licenses");
    console.log({ licenses });
    licenses.LicenseList.forEach(function (license) {
        var a = document.createElement("a");
        a.href = license.LicenseAgency.Url;
        a.target = "_blank";
        var e = document.createElement("div");
        var license_title = document.createElement("h5");
        license_title.innerHTML = license.Title;
        var license_agency = document.createElement("div");
        license_agency.innerHTML = license.LicenseAgency.Name.replace(
            "~",
            " - "
        );
        e.appendChild(license_title);
        e.appendChild(license_agency);
        a.appendChild(e);
        container.appendChild(a);
    });
}
/**
 * Generates occupational task elements on page.
 *
 * Builds a list of tasks associated with current occupation. If there are
 * more than 5 tasks in the list, an accordion-style element is generated
 * to allow the user to shrink/expand the list.
 *
 * @param {Array} tasks List of all tasks associated with current occupation
 *
 * @return {void}
 */
function buildTasksElement(tasks) {
    var container = document.getElementById("tasks");
    var el = document.createElement("div");
    var ul = document.createElement("ul");
    el.id = "tasks--inner";

    if (!document.getElementById(el.id)) {
        tasks.forEach(function (task, index) {
            var e = document.createElement("li");
            e.innerHTML = task;

            if (index + 1 > 5) {
                e.classList.add("hidden");
                e.classList.add("overflow");
            }

            ul.appendChild(e);
        });
        el.appendChild(ul);

        if (tasks.length > 5) {
            // Build accordion element if number of tasks is greater than 5
            var expand = document.createElement("div");
            expand.classList.add("more");
            var hide = document.createElement("div");
            hide.classList.add("more");

            expand.onclick = function () {
                document
                    .querySelectorAll("#tasks--inner li.overflow")
                    .forEach(function (li) {
                        return li.classList.toggle("hidden");
                    });
                hide.classList.toggle("hidden");
                expand.classList.toggle("hidden");
            };

            hide.onclick = function () {
                document
                    .querySelectorAll("#tasks--inner li.overflow")
                    .forEach(function (li) {
                        return li.classList.toggle("hidden");
                    });
                hide.classList.toggle("hidden");
                expand.classList.toggle("hidden");
            };

            hide.innerHTML = "See less";
            expand.innerHTML = "See more";
            hide.classList.add("hidden");

            el.appendChild(expand);
            el.appendChild(hide);
        }

        container.appendChild(el);
    }
}

/**
 * Generates occupation education data on page.
 *
 * Builds bar chart containing percentages of professionals in
 * current occupation that attained various education levels, e.g.
 * high school diploma, Associate's degree, Bachelor's degree, etc.
 *
 * @see buildEducationChart
 *
 * @param {Object} data             Job occupation data
 * @param {Array}  data.education   Education level data for current occupation
 *
 * @return {void}
 */
function buildEducationElement(education) {
    var id = "educationCanvas";

    if (document.getElementById(id)) {
        document.getElementById(id).remove();
    }

    var ctx = document.createElement("canvas");
    ctx.id = id;
    document.getElementById("education").appendChild(ctx);
    buildEducationChart(education, id);
}

/**
 * Generates occupation technical skills elements on page.
 *
 * Creates a list of technical skills associated with current occupation.
 *
 * @param {Array} skills
 *
 * @return {void}
 */
function buildTechnicalSkillsElement(skills) {
    var container = document.getElementById("technical_skills");

    if (!container.hasChildNodes()) {
        skills.forEach(function (skill, index) {
            var e = document.createElement("div");
            e.classList.add("skill");
            e.innerHTML = skill;
            container.appendChild(e);
        });
    }
}
function buildTopCompaniesElement(job_data) {
    const companiesContainer = document.getElementById("comp__data");
    console.log(companiesContainer);
    for (let i = 0; i < job_data.top10companies.length; i++) {
        const compRow = document.createElement("div");
        compRow.classList.add("comp__row");
        const compName = document.createElement("div");
        const compCount = document.createElement("div");
        compCount.classList.add("comp__cell");
        compName.classList.add("comp__cell");
        compName.textContent = job_data.top10companies[i].name;
        compCount.textContent = job_data.top10companies[i].jobcount;
        compRow.appendChild(compName);
        compRow.appendChild(compCount);
        companiesContainer.appendChild(compRow);
    }
}
function buildVideoElement(code) {
    // 	var videoQuery = url.substring(url.indexOf("?"));
    // 	if (videoQuery !== "No video for this occupation") {
    // 		var video = document.createElement("iframe");
    // 		var videoURI = url.substring(
    // 			0,
    // 			url.indexOf("careeronestop-videos")
    // 		);
    const video = document.createElement("iframe");
    video.src = `https://cdn.careeronestop.org/OccVids/OccupationVideos/${code}.mp4`;
    video.frameBorder = 0;
    video.scrolling = "no";
    video.setAttribute("allowFullScreen", "");
    const _el = document.createElement("div");
    _el.setAttribute("style", "padding-top: 56.25%");
    _el.classList.add("iframe-wrapper");
    _el.append(video);
    document.getElementById("video").append(_el);
    // 	} else {
    // 		console.log("No video exists for this occupation.");
    // 	}
}

function buildDescriptionElement(description, title) {
    let e = document.getElementById("description");
    e.innerHTML =
        title + " " + description[0].toLowerCase() + description.slice(1);
}

function truncateDescription(text) {
    return text.substring(0, text.indexOf(".") + 1);
}

function buildWagesString(s, el) {
    var salaryStr = "New workers start around $"
        .concat(toCommas(s.Pct10), ". Normal pay is $")
        .concat(
            toCommas(s.Median),
            ". Highly experienced workers can earn up to $"
        )
        .concat(toCommas(s.Pct90), ".");

    if (!document.getElementById("wage_description")) {
        var e = document.createElement("p");
        e.id = "wage_description";
        e.innerHTML = salaryStr;
        el.appendChild(e);
    } else {
        document.getElementById("wage_description").innerHTML = salaryStr;
    }
}
