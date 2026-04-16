const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../../client/src/pages/Dashboard.jsx');
let content = fs.readFileSync(dashPath, 'utf8');

// 1. Context Update
content = content.replace(
    'const { isDemoMode, demoConsumptionData, demoTankLevel } = useDemo();',
    `const { 
        isDemoMode, demoConsumptionData, demoTankLevel,
        demoApartments, demoUsers, demoMeters, demoAlerts,
        demoBills, demoReportsDaily, demoReportsMonthly, demoSystemSettings
    } = useDemo();`
);

// 2. Merges
content = content.replace(
    /const roleInfo = roleFeatureConfig\[activeRole\] \|\| roleFeatureConfig\.User;([\s\S]*?)const demoTotalUsage = demoConsumptionData\?\.reduce\(\(s, d\) => s \+ d\.current, 0\) \|\| 12800;/m,
    `const roleInfo = roleFeatureConfig[activeRole] || roleFeatureConfig.User;
    
    // Array Merges
    const usersToShow = isDemoMode ? [...(roleData.users || []), ...demoUsers].filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i) : (roleData.users || []);
    const apartmentsToShow = isDemoMode ? [...(roleData.apartments || []), ...demoApartments].filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i) : (roleData.apartments || []);
    const metersToShow = isDemoMode ? [...(roleData.meters || []), ...demoMeters].filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i) : (roleData.meters || []);
    const alertsToShow = isDemoMode ? [...demoAlerts, ...(roleData.alerts || [])].filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i) : (roleData.alerts || []);
    const billsToShow = isDemoMode ? [...(roleData.billing?.bills || []), ...demoBills].filter((v,i,a)=>a.findIndex(t=>(t.apartmentId === v.apartmentId))===i) : (roleData.billing?.bills || []);
    const reportsDailyToShow = isDemoMode ? [...(roleData.reportsDaily || []), ...demoReportsDaily].filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i) : (roleData.reportsDaily || []);
    const reportsMonthlyToShow = isDemoMode ? [...(roleData.reportsMonthly || []), ...demoReportsMonthly].filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i) : (roleData.reportsMonthly || []);
    const settingsToShow = isDemoMode && (roleData.systemSettings?.length === 0) ? demoSystemSettings : (roleData.systemSettings || []);
    
    // DEMO DATA OVERRIDES
    const demoTotalUsage = demoConsumptionData?.reduce((s, d) => s + d.current, 0) || 12800;`
);

// 3. Admin Widgets
content = content.replace(
    /title: 'Open Alerts', value: isDemoMode \? '2' : String\(roleData\.alerts\.length\)/g,
    `title: 'Open Alerts', value: String(alertsToShow.length)`
);
content = content.replace(
    /title: 'Apartments', value: isDemoMode \? '204' : String\(roleData\.apartments\.length\)/g,
    `title: 'Apartments', value: String(apartmentsToShow.length)`
);
content = content.replace(
    /value: isDemoMode \? 'Rs 2\.4L' : \`Rs \$\{Math\.round\(\(roleData\.billing\?\.bills \|\| \[\]\)\.reduce\(\(sum, bill\) => sum \+ \(bill\.estimatedCost \|\| 0\), 0\)\)\}\`/g,
    `value: \`Rs \${Math.round(billsToShow.reduce((sum, bill) => sum + (bill.estimatedCost || 0), 0))}\``
);

// 4. Alerts Panel
content = content.replace(
    /\(roleData\.alerts \|\| \[\]\)\.slice\(0, 5\)/g,
    `alertsToShow.slice(0, 5)`
);

// 5. Analytics Text
content = content.replace(
    /Meters: \{roleData\.meters\.length\}/g,
    `Meters: {metersToShow.length}`
);
content = content.replace(
    /Open alerts: \{roleData\.alerts\.length\}/g,
    `Open alerts: {alertsToShow.length}`
);

// 6. Users mapping
content = content.replace(
    /\(roleData\.users \|\| \[\]\)\.map/g,
    `usersToShow.map`
);

// 7. Apartments Mapping
content = content.replace(
    /roleData\.apartments\.map/g,
    `apartmentsToShow.map`
);

// 8. Meters Mapping
content = content.replace(
    /roleData\.meters\.map/g,
    `metersToShow.map`
);

// 9. Billing Mapping
content = content.replace(
    /\(roleData\.billing\?\.bills \|\| \[\]\)\.map/g,
    `billsToShow.map`
);
content = content.replace(
    /\(roleData\.billing\?\.bills \|\| \[\]\)\.length > 0/g,
    `billsToShow.length > 0`
);
content = content.replace(
    /\(roleData\.billing\?\.bills \|\| \[\]\)\.length === 0/g,
    `billsToShow.length === 0`
);
content = content.replace(
    /\(\(roleData\.billing\?\.bills \|\| \[\]\)\.reduce/g,
    `(billsToShow.reduce`
);

// 10. Reports
content = content.replace(
    /roleData\.reportsDaily\.map/g,
    `reportsDailyToShow.map`
);
content = content.replace(
    /roleData\.reportsMonthly\.map/g,
    `reportsMonthlyToShow.map`
);

// 11. Settings
content = content.replace(
    /roleData\.systemSettings\.map/g,
    `settingsToShow.map`
);

fs.writeFileSync(dashPath, content, 'utf8');
console.log('Successfully updated Dashboard.jsx with pervasive demo records!');
