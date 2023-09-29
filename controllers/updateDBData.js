/**
 * @module controllers/updateDBData.js
 * @author Ozkar Alvarez
 */

const {
    fetchJobDetail,
    fetchLicenseData,
    fetchCertificateData,
    fetch,
} = require("../services/careerOnestop.service");
const {
    getCareerTechnicalSkills,
    getRIASECCode,
} = require("../services/onet.service");
const Utils = require("../utils.js");

const getStage1Structure = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const location = req.query.location;
        let stage1Structure = {};

        const allDetail = await fetch(keyword, location);
        if (!allDetail) {
            throw new Error(
                "Data retrieval failed. Career Onestop returned undefined."
            );
        }
        let stateGrowth = allDetail?.Projections.Projections.find(
            (obj) => obj.StateName !== "United States"
        )?.PerCentChange;
        let nationalGrowth = allDetail?.Projections.Projections.find(
            (obj) => obj.StateName === "United States"
        )?.PerCentChange;

        const growthObject = {
            state: parseFloat(stateGrowth),
            national: parseFloat(nationalGrowth),
        };
        let TransformedAnnualWageList = await Utils.tranformAnnualWageData(
            allDetail
        );
        stage1Structure.code = allDetail.OnetCode;
        stage1Structure.title = allDetail.OnetTitle;
        stage1Structure.description = allDetail.OnetDescription;
        stage1Structure.growth = growthObject;
        stage1Structure.education = allDetail.EducationTraining.EducationType;
        stage1Structure.salary = TransformedAnnualWageList;

        res.send({ stage1Structure });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: err.message });
    }
};

const getStage2Structure = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const location = req.query.location;
        let stage2Structure = {};
        const allDetail = await fetch(keyword, location);
        const jobDetailData = await fetchJobDetail(keyword);
        const techSkillsData = await getCareerTechnicalSkills(keyword);
        const riasecCode = await getRIASECCode(keyword);
        const licenseData = await fetchLicenseData(keyword, location);
        const certificateData = await fetchCertificateData(keyword);

        if (!allDetail || !jobDetailData) {
            throw new Error(
                "Data retrieval failed. Career Onestop returned undefined."
            );
        }
        let stateGrowth = allDetail?.Projections.Projections.find(
            (obj) => obj.StateName !== "United States"
        );
        let nationalGrowth = allDetail?.Projections.Projections.find(
            (obj) => obj.StateName === "United States"
        );

        const growthObject = {
            state: {
                percentChange: parseFloat(stateGrowth?.PerCentChange),
                estimatedEmployment: parseFloat(
                    stateGrowth?.EstimatedEmployment.replace(/,/g, "")
                ),
                projectedEmployment: parseFloat(
                    stateGrowth?.ProjectedEmployment.replace(/,/g, "")
                ),
            },

            national: {
                percentChange: parseFloat(nationalGrowth?.PerCentChange),
                estimatedEmployment: parseFloat(
                    nationalGrowth?.EstimatedEmployment.replace(/,/g, "")
                ),
                projectedEmployment: parseFloat(
                    nationalGrowth?.ProjectedEmployment.replace(/,/g, "")
                ),
            },
        };

        let top10CompaniesArr = jobDetailData?.Companies.slice(0, 10);
        top10CompaniesArr = top10CompaniesArr.map((company) => ({
            name: company.CompanyName,
            jobcount: parseFloat(company.JobCount),
        }));
        let TransformedAnnualWageList = await Utils.tranformAnnualWageData(
            allDetail
        );
        stage2Structure.certificates = certificateData;
        stage2Structure.CA_licenses = licenseData;
        stage2Structure.code = allDetail?.OnetCode;
        stage2Structure.technical_skills = techSkillsData ?? [];
        stage2Structure.onet_riasec_code = riasecCode;
        stage2Structure.onestop_riasec_code = allDetail?.InterestDataList ?? [];
        stage2Structure.growth = growthObject;
        stage2Structure.tasks = allDetail?.Tasks.map(
            (task) => task.TaskDescription
        );
        stage2Structure.related_onet_codes = allDetail?.RelatedOnetTitles ?? [];
        stage2Structure.salary = TransformedAnnualWageList;
        stage2Structure.title = allDetail?.OnetTitle;
        stage2Structure.description = allDetail?.OnetDescription;
        stage2Structure.education = allDetail?.EducationTraining.EducationType;
        stage2Structure.video = allDetail?.COSVideoURL;
        stage2Structure.job_data = {
            area: {
                short_name: jobDetailData?.JobsKeywordLocations.Location,
                types: ["country", "political"],
            },
            data: [
                {
                    _jobcount: parseFloat(jobDetailData.Jobcount),
                    _companycount: jobDetailData?.Companies.length,
                },
            ],
            top10companies: top10CompaniesArr,
        };

        // res.send({ allDetail, jobDetailData, techSkillsData, riasecCode });
        res.send(stage2Structure);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: err.message });
    }
};
const getAllAvailableData = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const location = req.query.location;

        const allDetail = await fetch(keyword, location);
        const jobDetailData = await fetchJobDetail(keyword, location);
        const techSkillsData = await getCareerTechnicalSkills(keyword);
        const riasecCode = await getRIASECCode(keyword);
        const licenseData = await fetchLicenseData(keyword, location);

        res.send({
            allDetail,
            jobDetailData,
            licenseData,
            techSkillsData,
            riasecCode,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: err.message });
    }
};

module.exports = {
    getStage1Structure,
    getStage2Structure,
    getAllAvailableData,
};
