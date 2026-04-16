const cron = require('node-cron');
const DailyLog = require('../models/DailyLog');
const Meter = require('../models/Meter');
const Alert = require('../models/Alert');
const TankLogs = require('../models/TankLogs');
const Tank = require('../models/Tank');

const USAGE_THRESHOLD = 500; // e.g., 500 Liters/Gallons per day threshold for anomaly

// Schedule tasks to be run on the server.
// Runs every night at midnight
const startCronJobs = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily report and anomaly check...');

        try {
            // Get yesterday's date
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find all daily logs for yesterday
            const logs = await DailyLog.find({
                date: {
                    $gte: yesterday,
                    $lt: today
                }
            });

            console.log(`Found ${logs.length} logs for yesterday. checking anomalies...`);

            for (const log of logs) {
                if (log.usage > USAGE_THRESHOLD) {
                    // Create an anomaly alert
                    await Alert.create({
                        meterId: log.meterId,
                        message: `High usage detected: ${log.usage} units`,
                        severity: log.usage > USAGE_THRESHOLD * 2 ? 'Critical' : 'High',
                    });
                    console.log(`Anomaly Alert created for meter: ${log.meterId}`);
                }
            }

        } catch (error) {
            console.error('Error running daily cron job:', error);
        }
    });

    // Run Tank analytics every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            const tanks = await Tank.find();
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            for (const tank of tanks) {
                // Get logs from the last hour
                const recentLogs = await TankLogs.find({
                    tankId: tank._id,
                    timestamp: { $gte: oneHourAgo }
                }).sort({ timestamp: 1 });

                if (recentLogs.length < 2) continue;

                const oldestLog = recentLogs[0];
                const newestLog = recentLogs[recentLogs.length - 1];
                const dropPercentage = oldestLog.level - newestLog.level;

                // 1) Sudden drop detection (>30% in last hour)
                if (dropPercentage > 30) {
                    await Alert.create({
                        tankId: tank._id,
                        message: `Sudden tank drop detected: ${dropPercentage.toFixed(1)}% drop in the last hour`,
                        severity: 'Critical'
                    });
                }
                
                // 2) Overflow and Low alerts that might not have been caught via REST
                if (newestLog.level < 10) {
                    await Alert.create({ tankId: tank._id, message: `Tank is at Critical Level (${newestLog.level}%)`, severity: 'Critical' });
                } else if (newestLog.level < 20) {
                    await Alert.create({ tankId: tank._id, message: `Tank is at Low Level (${newestLog.level}%)`, severity: 'High' });
                } else if (newestLog.level > 95) {
                    await Alert.create({ tankId: tank._id, message: `Tank Overflow Risk (${newestLog.level}%)`, severity: 'Medium' });
                }

                // We could calculate predict depletion internally here, 
                // but usually the frontend or a specific GET endpoint handles real-time "Empty in X hours" estimation.
                // We'll leave the math here as well for system logging if needed.
            }
        } catch (error) {
            console.error('Error running tank cron job:', error);
        }
    });

    console.log('Cron jobs initialized');
};

module.exports = { startCronJobs };
