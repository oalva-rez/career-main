const express = require("express");
const axios = require("axios");
const router = express.Router();
const {
    getStage1Structure,
    getStage2Structure,
    getAllAvailableData,
} = require("../controllers/updateDBData");
const { getTimeseriesData } = require("../services/bls.service");

// get all available data
router.get("/all", getAllAvailableData);

// form and get stage 1 structure
router.get("/stage1", getStage1Structure);
// form and get stage 2 structure
router.get("/stage2", getStage2Structure);

// get both structure
router.get("/stages", async (req, res) => {});
// update combined structure DB
router.post("/stages", async (req, res) => {});

// query DB Data
router.get("/stages/query", async (req, res) => {});

router.get("/timeseries", async (req, res) => {
    const seriesID = req.query.seriesID;
    const data = await getTimeseriesData(2019, 2020, seriesID);
    res.json(data);
});
module.exports = router;
