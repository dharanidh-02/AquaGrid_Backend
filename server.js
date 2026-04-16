const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startCronJobs } = require('./scripts/cronJobs');
const User = require('./models/User');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
// Use Render's PORT or default to 5000
const PORT = process.env.PORT || 5001; 
const HOST = '0.0.0.0'; // Explicitly bind to all network interfaces for Render

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // allow frontends to connect
        methods: ["GET", "POST"]
    }
});

// Attach io to the app so controllers can access it
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

const ensureDefaultAdmin = async () => {
    try {
        const username = 'admin';
        const password = 'admin';
        const role = 'Admin';

        const existingAdmin = await User.findOne({ username });
        if (!existingAdmin) {
            await User.create({ username, password, role });
            console.log('Default admin user created: username=admin, password=admin');
        } else {
            console.log('Default admin user already exists');
        }
    } catch (error) {
        console.error(`Error in ensureDefaultAdmin: ${error.message}`);
    }
};

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/zones', require('./routes/zoneRoutes'));
app.use('/api/water', require('./routes/waterRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/apartments', require('./routes/apartmentRoutes'));
app.use('/api/meters', require('./routes/meterRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));
app.use('/api/tank', require('./routes/tankRoutes'));

// Socket.io connection logging
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Start background jobs
startCronJobs();

app.get('/', (req, res) => {
    res.send('AquaGrid AI API is running...');
});

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message || 'Server Error',
    });
});

const startServer = async () => {
    try {
        await connectDB();
        await ensureDefaultAdmin();

        server.listen(PORT, HOST, () => {
            console.log(`Server successfully started!`);
            console.log(`Listening on ${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
