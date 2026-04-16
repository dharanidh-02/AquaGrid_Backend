const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../../client/src/pages/Dashboard.jsx');
let content = fs.readFileSync(dashPath, 'utf8');

// Universal Action Helper
const toastLogic = `
    const triggerAction = (msg) => {
        setAdminMessage(msg);
        setTimeout(() => setAdminMessage(''), 3000);
    };

    const downloadCSV = () => {
        triggerAction('Downloading CSV...');
        const blob = new Blob(["Date,Usage\\n2023-10-01,100"], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "reports.csv";
        a.click();
    };
`;

// Insert the functions near handleUpdateSettingSubmit
content = content.replace(
    /const handleUpdateSetting = async /g,
    toastLogic + 'const handleUpdateSetting = async '
);

// 1. Export CSV
content = content.replace(
    /<button className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors shadow-sm">Export CSV<\/button>/g,
    `<button onClick={downloadCSV} className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors shadow-sm">Export CSV</button>`
);

// 2. Pay Bill (both places)
content = content.replace(
    /<button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors">Pay Bill<\/button>/g,
    `<button onClick={() => triggerAction('Redirecting to secure payment gateway...')} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors">Pay Bill</button>`
);
content = content.replace(
    /<button className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all">Pay Now<\/button>/g,
    `<button onClick={() => triggerAction('Payment processing via mock gateway... Success!')} className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all">Pay Now</button>`
);

// 3. Report Issue
content = content.replace(
    /<button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">Report Issue<\/button>/g,
    `<button onClick={() => triggerAction('Issue reported successfully. Maintenance notified.')} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">Report Issue</button>`
);

// 4. Download Receipt
content = content.replace(
    /<button className="px-4 py-2 shadow-sm border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors">Download Receipt<\/button>/g,
    `<button onClick={() => triggerAction('Generating receipt PDF...')} className="px-4 py-2 shadow-sm border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors">Download Receipt</button>`
);

// 5. Update Profile (Save Changes)
content = content.replace(
    /<button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Save Changes<\/button>/g,
    `<button onClick={() => triggerAction('Profile settings saved successfully.')} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Save Changes</button>`
);

// 6. Change Password
content = content.replace(
    /<button className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200">Change Password<\/button>/g,
    `<button onClick={() => triggerAction('Password reset link sent to your email.')} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200">Change Password</button>`
);

// 7. Start Work (Maintenance)
content = content.replace(
    /<button className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors">Start Work<\/button>/g,
    `<button onClick={() => triggerAction('Work order initiated.')} className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors">Start Work</button>`
);

// 8. Add Manual Log (Maintenance)
content = content.replace(
    /<button className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl hover:bg-slate-50 font-medium">Add Manual Log<\/button>/g,
    `<button onClick={() => triggerAction('Manual log recorded.')} className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl hover:bg-slate-50 font-medium">Add Manual Log</button>`
);

// 9. Update Status (Faulty Meters)
content = content.replace(
    /<button className="px-3 py-1\.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg">Update Status<\/button>/g,
    `<button onClick={() => triggerAction('Meter status updated to Active.')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg">Update Status</button>`
);


fs.writeFileSync(dashPath, content, 'utf8');
console.log('Successfully wired up dummy actions to buttons.');
