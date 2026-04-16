const asyncHandler = require('express-async-handler');
const SystemSetting = require('../models/SystemSetting');

const defaultSettings = [
    { key: 'anomalyThreshold', value: 1.2, description: 'Alert if usage is 20% above normal baseline' },
    { key: 'defaultRatePerUnit', value: 0.05, description: 'Default water price per unit' },
    { key: 'reportSchedule', value: '0 0 * * *', description: 'Daily report CRON schedule' },
];

const bootstrapSettings = async () => {
    for (const setting of defaultSettings) {
        // eslint-disable-next-line no-await-in-loop
        await SystemSetting.updateOne({ key: setting.key }, { $setOnInsert: setting }, { upsert: true });
    }
};

const getSystemSettings = asyncHandler(async (req, res) => {
    await bootstrapSettings();
    const settings = await SystemSetting.find().sort({ key: 1 });
    return res.json(settings);
});

const updateSystemSetting = asyncHandler(async (req, res) => {
    const setting = await SystemSetting.findOne({ key: req.params.key });
    if (!setting) {
        return res.status(404).json({ message: 'Setting not found' });
    }
    setting.value = req.body.value;
    if (req.body.description !== undefined) {
        setting.description = req.body.description;
    }
    const updated = await setting.save();
    return res.json(updated);
});

const getAutomationStatus = asyncHandler(async (req, res) => {
    return res.json({
        cronJobsRunning: true,
        lastDailyReportRun: new Date(Date.now() - 1000 * 60 * 60 * 6),
        lastAnomalyScan: new Date(Date.now() - 1000 * 60 * 10),
        pipelineStatus: 'Healthy',
    });
});

module.exports = {
    getSystemSettings,
    updateSystemSetting,
    getAutomationStatus,
};
