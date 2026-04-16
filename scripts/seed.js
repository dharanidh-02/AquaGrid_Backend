const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

// Import Models
const Apartment = require('../models/Apartment');
const Meter = require('../models/Meter');
const DailyLog = require('../models/DailyLog');
const Alert = require('../models/Alert');

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();
        
        console.log('Clearing existing data...');
        await Apartment.deleteMany();
        await Meter.deleteMany();
        await DailyLog.deleteMany();
        await Alert.deleteMany();

        console.log('Seeding new data...');

        // 1. Create Apartments
        const apt1 = await Apartment.create({ apartmentNumber: '101', residentName: 'John Doe', email: 'john@example.com', block: 'A' });
        const apt2 = await Apartment.create({ apartmentNumber: '102', residentName: 'Jane Smith', email: 'jane@example.com', block: 'A' });

        // 2. Create Meters
        const meter1 = await Meter.create({ apartmentId: apt1._id, meterType: 'Water' });
        const meter2 = await Meter.create({ apartmentId: apt2._id, meterType: 'Water' });

        // 3. Create Daily Logs (Past 7 days)
        const logs = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Generate some random usage
            logs.push({
                meterId: meter1._id,
                date: new Date(date),
                usage: Math.floor(Math.random() * 50) + 200 // Normal usage
            });
            
            if (i === 1) { // yesterday create a spike
                logs.push({
                    meterId: meter2._id,
                    date: new Date(date),
                    usage: 650 // Spike
                });
            } else {
                logs.push({
                    meterId: meter2._id,
                    date: new Date(date),
                    usage: Math.floor(Math.random() * 50) + 180 
                });
            }
        }
        await DailyLog.insertMany(logs);

        // 4. Create Alerts
        console.log('Generating sample alerts...');
        const alerts = [
            { meterId: meter1._id, severity: 'High', message: 'Main line pressure anomaly detected in Block A', status: 'Unresolved' },
            { meterId: meter2._id, severity: 'Medium', message: 'Consumption spike detected late at night', status: 'Unresolved' },
            { severity: 'Critical', message: 'Reservoir tank level critically low (< 20%)', status: 'Unresolved' }
        ];
        await Alert.insertMany(alerts);

        console.log('Data seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();
