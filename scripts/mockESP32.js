const http = require('http');

console.log('--- Mocking ESP32 Tank Sensor ---');

const simulatePing = (level) => {
    const data = JSON.stringify({ level });
    let port = process.env.PORT || 5001; // matches your server.js settings
    
    // Quick test against locally running server
    const req = http.request(
        {
            hostname: 'localhost',
            port: port,
            path: '/api/tank/update',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        },
        (res) => {
            let body = '';
            res.on('data', (c) => body += c);
            res.on('end', () => console.log(`[STATUS ${res.statusCode}] HTTP POST level ${level}%: ${body}`));
        }
    );
    req.on('error', (e) => console.error(`Error connecting to server on port ${port}:`, e.message));
    req.write(data);
    req.end();
}

console.log("Simulating sequence of tank depletion...");
// Send normal
setTimeout(() => simulatePing(85), 500); 
setTimeout(() => simulatePing(80), 1000); 

// Induce sudden drop (by more than 30%)
setTimeout(() => simulatePing(45), 2000); 

// Induce Low Level
setTimeout(() => simulatePing(15), 3000); 

// Induce Critical Level
setTimeout(() => simulatePing(5), 4000); 

// Induce Overflow
setTimeout(() => simulatePing(98), 5000); 
