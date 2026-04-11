const token = localStorage.getItem('token');

const apiFetch = async(url, options = {}) => {
    const response = await fetch(window.API_BASE_URL + url, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        ...options,
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
};

const setMessage = (selector, text, isError = true) => {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
        element.style.color = isError ? '#dc2626' : '#16a34a';
    }
};

const renderStats = (counts) => {
    const container = document.getElementById('adminStats');
    container.innerHTML = `
        <div class="stat-card"><h3>Students</h3><p>${counts.studentCount}</p></div>
        <div class="stat-card"><h3>Staff</h3><p>${counts.staffCount}</p></div>
        <div class="stat-card"><h3>Rooms</h3><p>${counts.roomCount}</p></div>
        <div class="stat-card"><h3>Open Complaints</h3><p>${counts.openComplaints}</p></div>
    `;
};

const renderStudents = (students) => {
    const table = document.getElementById('studentTable');
    table.innerHTML = `<tr><th>Name</th><th>Email</th><th>Room</th><th>Actions</th></tr>`;
    students.forEach((student) => {
        table.innerHTML += `
            <tr>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.room ? student.room.number : 'Unassigned'}</td>
                <td>
                    <button onclick="editStudent('${student._id}')">Edit</button>
                    <button onclick="deleteStudent('${student._id}')">Delete</button>
                </td>
            </tr>
        `;
    });
};

const renderStaff = (staff) => {
    const table = document.getElementById('staffTable');
    table.innerHTML = `<tr><th>Name</th><th>Email</th><th>Actions</th></tr>`;
    staff.forEach((member) => {
        table.innerHTML += `
            <tr>
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>
                    <button onclick="editStaff('${member._id}')">Edit</button>
                    <button onclick="deleteStaff('${member._id}')">Delete</button>
                </td>
            </tr>
        `;
    });
};

const renderRooms = (rooms) => {
    const table = document.getElementById('roomTable');
    const selectRoom = document.getElementById('allocateRoomSelect');
    const selectStudent = document.getElementById('allocateStudentSelect');

    table.innerHTML = `<tr><th>Number</th><th>Type</th><th>Capacity</th><th>Status</th><th>Occupants</th><th>Actions</th></tr>`;
    selectRoom.innerHTML = '<option value="">Select room</option>';

    rooms.forEach((room) => {
        table.innerHTML += `
            <tr>
                <td>${room.number}</td>
                <td>${room.type}</td>
                <td>${room.capacity}</td>
                <td>${room.status}</td>
                <td>${room.occupants.length}</td>
                <td>
                    <button onclick="editRoom('${room._id}')">Edit</button>
                    <button onclick="deleteRoom('${room._id}')">Delete</button>
                </td>
            </tr>
        `;
        selectRoom.innerHTML += `<option value="${room._id}">${room.number}</option>`;
    });
};

const renderNotices = (notices) => {
    const table = document.getElementById('noticeTable');
    table.innerHTML = `<tr><th>Title</th><th>Message</th><th>Author</th></tr>`;
    notices.forEach((notice) => {
        table.innerHTML += `
            <tr>
                <td>${notice.title}</td>
                <td>${notice.message}</td>
                <td>${notice.author}</td>
            </tr>
        `;
    });
};

const renderReports = (summary) => {
    const container = document.getElementById('reportSummary');
    container.innerHTML = `
        <div class="stat-card"><h3>Total Students</h3><p>${summary.students}</p></div>
        <div class="stat-card"><h3>Total Staff</h3><p>${summary.staff}</p></div>
        <div class="stat-card"><h3>Total Rooms</h3><p>${summary.rooms}</p></div>
        <div class="stat-card"><h3>Open Complaints</h3><p>${summary.openComplaints}</p></div>
        <div class="stat-card"><h3>Maintenance Rooms</h3><p>${summary.maintenanceRooms}</p></div>
    `;
};

const updateStudentListOptions = async() => {
    const students = await apiFetch('/api/admin/students');
    const selectStudent = document.getElementById('allocateStudentSelect');
    selectStudent.innerHTML = '<option value="">Select student</option>';
    students.forEach((student) => {
        selectStudent.innerHTML += `<option value="${student._id}">${student.name}</option>`;
    });
};

const loadAdminData = async() => {
    try {
        const dashboard = await apiFetch('/api/admin/dashboard');
        renderStats(dashboard.counts);
        renderStudents(await apiFetch('/api/admin/students'));
        renderStaff(await apiFetch('/api/admin/staff'));
        renderRooms(await apiFetch('/api/admin/rooms'));
        await loadComplaints({ tableId: 'complaintTable', filterId: 'complaintFilter', showActions: true });
        renderNotices(await apiFetch('/api/admin/notices'));
        renderReports((await apiFetch('/api/admin/reports')).summary);
        updateStudentListOptions();
    } catch (error) {
        setMessage('#studentMessage', error.message);
    }
};

const handleStudentForm = async(event) => {
    event.preventDefault();
    const name = document.getElementById('studentName').value;
    const email = document.getElementById('studentEmail').value;
    const password = document.getElementById('studentPassword').value;

    try {
        await apiFetch('/api/admin/students', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        setMessage('#studentMessage', 'Student added successfully', false);
        document.getElementById('studentForm').reset();
        loadAdminData();
    } catch (error) {
        setMessage('#studentMessage', error.message);
    }
};

const handleStaffForm = async(event) => {
    event.preventDefault();
    const name = document.getElementById('staffName').value;
    const email = document.getElementById('staffEmail').value;
    const password = document.getElementById('staffPassword').value;

    try {
        await apiFetch('/api/admin/staff', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        setMessage('#staffMessage', 'Staff added successfully', false);
        document.getElementById('staffForm').reset();
        loadAdminData();
    } catch (error) {
        setMessage('#staffMessage', error.message);
    }
};

const handleRoomForm = async(event) => {
    event.preventDefault();
    const number = document.getElementById('roomNumber').value;
    const type = document.getElementById('roomType').value;
    const capacity = Number(document.getElementById('roomCapacity').value);

    try {
        await apiFetch('/api/admin/rooms', {
            method: 'POST',
            body: JSON.stringify({ number, type, capacity }),
        });
        setMessage('#roomMessage', 'Room created successfully', false);
        document.getElementById('roomForm').reset();
        loadAdminData();
    } catch (error) {
        setMessage('#roomMessage', error.message);
    }
};

const handleAllocateForm = async(event) => {
    event.preventDefault();
    const roomId = document.getElementById('allocateRoomSelect').value;
    const studentId = document.getElementById('allocateStudentSelect').value;

    if (!roomId || !studentId) {
        return setMessage('#allocateMessage', 'Please choose a room and student');
    }

    try {
        await apiFetch(`/api/admin/rooms/${roomId}/allocate`, {
            method: 'POST',
            body: JSON.stringify({ studentId }),
        });
        setMessage('#allocateMessage', 'Room allocated successfully', false);
        loadAdminData();
    } catch (error) {
        setMessage('#allocateMessage', error.message);
    }
};

window.editStudent = async(id) => {
    const name = prompt('New student name:');
    const email = prompt('New student email:');

    if (!name || !email) {
        return;
    }

    await apiFetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, email }),
    });
    loadAdminData();
};

window.deleteStudent = async(id) => {
    if (!confirm('Delete this student?')) {
        return;
    }
    await apiFetch(`/api/admin/students/${id}`, { method: 'DELETE' });
    loadAdminData();
};

window.editStaff = async(id) => {
    const name = prompt('New staff name:');
    const email = prompt('New staff email:');

    if (!name || !email) {
        return;
    }

    await apiFetch(`/api/admin/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, email }),
    });
    loadAdminData();
};

window.deleteStaff = async(id) => {
    if (!confirm('Delete this staff member?')) {
        return;
    }
    await apiFetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    loadAdminData();
};

window.editRoom = async(id) => {
    const number = prompt('New room number:');
    const type = prompt('New room type:');
    const capacity = prompt('New capacity:');

    if (!number || !type || !capacity) {
        return;
    }

    await apiFetch(`/api/admin/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ number, type, capacity: Number(capacity) }),
    });
    loadAdminData();
};

window.deleteRoom = async(id) => {
    if (!confirm('Delete this room?')) {
        return;
    }
    await apiFetch(`/api/admin/rooms/${id}`, { method: 'DELETE' });
    loadAdminData();
};

window.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
};

window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};

const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
};

const init = () => {
    if (!token) {
        window.location.href = '/';
        return;
    }

    document.getElementById('studentForm').addEventListener('submit', handleStudentForm);
    document.getElementById('staffForm').addEventListener('submit', handleStaffForm);
    document.getElementById('roomForm').addEventListener('submit', handleRoomForm);
    document.getElementById('allocateForm').addEventListener('submit', handleAllocateForm);
    document.getElementById('logoutButton').addEventListener('click', logout);

    const complaintFilter = document.getElementById('complaintFilter');
    if (complaintFilter) {
        complaintFilter.addEventListener('change', () => {
            loadComplaints({ tableId: 'complaintTable', filterId: 'complaintFilter', showActions: true });
        });
    }

    loadAdminData();
};

window.addEventListener('DOMContentLoaded', init);