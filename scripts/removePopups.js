const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../../client/src/pages/Dashboard.jsx');
let content = fs.readFileSync(dashPath, 'utf8');

// 1. Add states
content = content.replace(
    /const \[editingUserId, setEditingUserId\] = useState\(null\);/g,
    `const [editingUserId, setEditingUserId] = useState(null);
    const [editUserModal, setEditUserModal] = useState({ show: false, user: null, email: '', dateOfBirth: '' });
    const [editSettingModal, setEditSettingModal] = useState({ show: false, settingKey: '', value: '' });`
);

// 2. Change handleUpdateUserDetails
content = content.replace(
    /const handleUpdateUserDetails = async \(u\) => \{[\s\S]*?finally \{\s*setEditingUserId\(null\);\s*\}\s*\};/m,
    `const handleUpdateUserDetails = (u) => {
        const currentDob = u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().slice(0, 10) : '';
        setEditUserModal({ show: true, user: u, email: u.email || '', dateOfBirth: currentDob });
    };

    const submitUpdateUserDetails = async (e) => {
        e.preventDefault();
        try {
            setEditingUserId(editUserModal.user._id);
            await apiCall(\`/api/auth/users/\${editUserModal.user._id}\`, {
                method: 'PUT',
                body: JSON.stringify({
                    email: editUserModal.email,
                    dateOfBirth: editUserModal.dateOfBirth || null,
                }),
            });
            await refreshAdminData();
            setAdminMessage('User updated successfully.');
            setEditUserModal({ show: false, user: null, email: '', dateOfBirth: '' });
        } catch (error) {
            setAdminMessage(error.message);
        } finally {
            setEditingUserId(null);
        }
    };

    const submitUpdateSettingDetails = async (e) => {
        e.preventDefault();
        try {
            await handleUpdateSetting(editSettingModal.settingKey, editSettingModal.value);
            setEditSettingModal({ show: false, settingKey: '', value: '' });
        } catch (error) {
            setAdminMessage(error.message);
        }
    };`
);

// 3. Update Settings Edit Button
content = content.replace(
    /<button onClick=\{\(\) => \{\s*const value = window\.prompt\(`Update value for \$\{s\.key\}`,\s*typeof s\.value === 'object' \? JSON\.stringify\(s\.value\) : String\(s\.value\)\);\s*if \(value !== null\) handleUpdateSetting\(s\.key, value\);\s*\}\} className="text-blue-600">Edit<\/button>/mg,
    `<button onClick={() => setEditSettingModal({ show: true, settingKey: s.key, value: typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value) })} className="text-blue-600">Edit</button>`
);

// 4. Inject Modals
const modalHtml = `
                {editUserModal.show && (
                    <div className="fixed inset-0 z-[100] bg-black/50">
                        <div className="min-h-screen w-full flex items-center justify-center p-4">
                            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-gray-800">Update User Details</h4>
                                    <button onClick={() => setEditUserModal({ show: false, user: null, email: '', dateOfBirth: '' })} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                                </div>
                                <form onSubmit={submitUpdateUserDetails} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">Email</label>
                                        <input type="email" value={editUserModal.email} onChange={(e) => setEditUserModal(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">Date of Birth</label>
                                        <input type="date" value={editUserModal.dateOfBirth} onChange={(e) => setEditUserModal(p => ({ ...p, dateOfBirth: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500" required />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => setEditUserModal({ show: false, user: null, email: '', dateOfBirth: '' })} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700">Cancel</button>
                                        <button type="submit" disabled={editingUserId} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">{editingUserId ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {editSettingModal.show && (
                    <div className="fixed inset-0 z-[100] bg-black/50">
                        <div className="min-h-screen w-full flex items-center justify-center p-4">
                            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-gray-800">Update Setting</h4>
                                    <button onClick={() => setEditSettingModal({ show: false, settingKey: '', value: '' })} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                                </div>
                                <form onSubmit={submitUpdateSettingDetails} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1">{editSettingModal.settingKey}</label>
                                        <input type="text" value={editSettingModal.value} onChange={(e) => setEditSettingModal(p => ({ ...p, value: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500" required />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => setEditSettingModal({ show: false, settingKey: '', value: '' })} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700">Cancel</button>
                                        <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
`;

content = content.replace(
    /\{\/\* Modals placed outside glass containers to avoid containing-block z-index issues \*\/\}/g,
    `{/* Modals placed outside glass containers to avoid containing-block z-index issues */}${modalHtml}`
);

fs.writeFileSync(dashPath, content, 'utf8');
console.log('Successfully swapped prompt() for seamless inline React Modals.');
