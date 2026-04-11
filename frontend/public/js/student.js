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

const renderProfile = (student) => {
    const profileInfo = document.getElementById('profileInfo');
    profileInfo.innerHTML = `
        <div class="card">
            <h3>${student.name}</h3>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Role:</strong> ${student.role}</p>
        </div>
    `;
};

const renderRoom = (room) => {
    const roomInfo = document.getElementById('roomInfo');
    if (!room) {
        roomInfo.innerHTML = `<div class="card"><p>No room assigned yet.</p></div>`;
        return;
    }

    roomInfo.innerHTML = `
        <div class="card">
            <h3>Room ${room.number}</h3>
            <p><strong>Type:</strong> ${room.type}</p>
            <p><strong>Status:</strong> ${room.status}</p>
            <p><strong>Capacity:</strong> ${room.capacity}</p>
        </div>
    `;
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

const loadStudentDashboard = async() => {
    try {
        const profile = await apiFetch('/api/student/profile');
        renderProfile(profile);
        const roomResult = await apiFetch('/api/student/room');
        renderRoom(roomResult.room);
        renderNotices(await apiFetch('/api/student/notices'));
    } catch (error) {
        setMessage('#complaintMessage', error.message);
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

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    loadStudentDashboard();
};

window.addEventListener('DOMContentLoaded', init);