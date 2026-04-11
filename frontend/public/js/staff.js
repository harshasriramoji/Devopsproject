const token = localStorage.getItem('token');

const apiFetch = async(url, options = {}) => {
    const response = await fetch(url, {
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
    const container = document.getElementById('staffStats');
    container.innerHTML = `
        <div class="stat-card"><h3>Assigned Students</h3><p>${counts.assignedStudents}</p></div>
        <div class="stat-card"><h3>Open Complaints</h3><p>${counts.openComplaints}</p></div>
        <div class="stat-card"><h3>Maintenance Rooms</h3><p>${counts.roomsInMaintenance}</p></div>
    `;
};

const renderAssignedStudents = (students) => {
    const table = document.getElementById('assignedStudentsTable');
    table.innerHTML = `<tr><th>Name</th><th>Email</th><th>Room</th></tr>`;
    students.forEach((student) => {
        table.innerHTML += `
            <tr>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.room ? student.room.number : 'Unassigned'}</td>
            </tr>
        `;
    });
};


const renderRoomStatuses = async() => {
    const rooms = await apiFetch('/api/staff/rooms');
    const table = document.getElementById('roomStatusTable');
    table.innerHTML = `<tr><th>Number</th><th>Type</th><th>Status</th><th>Actions</th></tr>`;
    rooms.forEach((room) => {
        table.innerHTML += `
            <tr>
                <td>${room.number}</td>
                <td>${room.type}</td>
                <td>${room.status}</td>
                <td>
                    <button onclick="updateRoomStatus('${room._id}', 'available')">Available</button>
                    <button onclick="updateRoomStatus('${room._id}', 'occupied')">Occupied</button>
                    <button onclick="updateRoomStatus('${room._id}', 'maintenance')">Maintenance</button>
                </td>
            </tr>
        `;
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

const loadStaffPage = async() => {
    try {
        const dashboard = await apiFetch('/api/staff/dashboard');
        renderStats(dashboard.counts);
        renderAssignedStudents(await apiFetch('/api/staff/assigned-students'));
        await loadComplaints({ tableId: 'complaintTable', showActions: true });
        renderRoomStatuses();
        renderNotices(await apiFetch('/api/staff/notices'));
    } catch (error) {
        setMessage('#noticeMessageBox', error.message);
    }
};

const updateRoomStatus = async(id, status) => {
    try {
        await apiFetch(`/api/staff/rooms/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        loadStaffPage();
    } catch (error) {
        setMessage('#noticeMessageBox', error.message);
    }
};

const handleNoticeForm = async(event) => {
    event.preventDefault();
    const title = document.getElementById('noticeTitle').value;
    const message = document.getElementById('noticeMessage').value;

    try {
        await apiFetch('/api/staff/notices', {
            method: 'POST',
            body: JSON.stringify({ title, message }),
        });
        setMessage('#noticeMessageBox', 'Notice posted successfully', false);
        document.getElementById('noticeForm').reset();
        loadStaffPage();
    } catch (error) {
        setMessage('#noticeMessageBox', error.message);
    }
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

    document.getElementById('noticeForm').addEventListener('submit', handleNoticeForm);
    document.getElementById('logoutButton').addEventListener('click', logout);
    loadStaffPage();
};

window.changeComplaintStatus = changeComplaintStatus;
window.updateRoomStatus = updateRoomStatus;
window.addEventListener('DOMContentLoaded', init);