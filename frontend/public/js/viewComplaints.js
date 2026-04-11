const complaintToken = localStorage.getItem('token');

const complaintApiFetch = async(url, options = {}) => {
    const response = await fetch(window.API_BASE_URL + url, {
        headers: {
            Authorization: `Bearer ${complaintToken}`,
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

const getStatusClass = (status) => {
    if (status === 'Pending' || status === 'open') return 'status-pending';
    if (status === 'In Progress') return 'status-in-progress';
    if (status === 'Resolved' || status === 'resolved') return 'status-resolved';
    return 'status-pending';
};

const getStatusBadge = (status) => {
    return `<span class="status-badge ${getStatusClass(status)}">${status}</span>`;
};

const getActionButtons = (id, status) => {
    const allowed = ['Pending', 'In Progress', 'Resolved'];
    return allowed
        .filter((item) => item !== status)
        .map((item) => `<button class="table-button" onclick="changeComplaintStatus('${id}', '${item}', { tableId: 'complaintTable', filterId: 'complaintFilter', showActions: true })">${item}</button>`)
        .join('');
};

const renderComplaintTable = (complaints, tableId, showActions = false) => {
        const table = document.getElementById(tableId);
        if (!table) return;

        table.innerHTML = `
        <tr>
            <th>Student Name</th>
            <th>Room Number</th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            ${showActions ? '<th>Action</th>' : ''}
        </tr>
    `;

        if (!complaints || complaints.length === 0) {
            table.innerHTML += `
            <tr>
                <td colspan="${showActions ? 6 : 5}" style="text-align:center; padding: 20px;">No complaints found.</td>
            </tr>
        `;
            return;
        }

        complaints.forEach((complaint) => {
                    const title = complaint.complaintTitle || complaint.title || 'No title';
                    const description = complaint.complaintDescription || complaint.description || 'No description';
                    table.innerHTML += `
            <tr>
                <td>${complaint.studentName || 'Unknown'}</td>
                <td>${complaint.roomNumber || 'Unknown'}</td>
                <td>${title}</td>
                <td>${description}</td>
                <td>${getStatusBadge(complaint.status)}</td>
                ${showActions ? `<td class="table-action">${getActionButtons(complaint._id, complaint.status)}</td>` : ''}
            </tr>
        `;
    });
};

const loadComplaints = async ({ tableId = 'complaintTable', filterId = null, showActions = false } = {}) => {
    let url = '/api/complaints';
    if (filterId) {
        const filterElement = document.getElementById(filterId);
        if (filterElement) {
            const status = filterElement.value;
            if (status && status !== 'All') {
                url += `?status=${encodeURIComponent(status)}`;
            }
        }
    }

    const complaints = await complaintApiFetch(url);
    renderComplaintTable(complaints, tableId, showActions);
    return complaints;
};

const changeComplaintStatus = async (id, status, options = {}) => {
    await complaintApiFetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });

    await loadComplaints(options);
};

window.loadComplaints = loadComplaints;
window.changeComplaintStatus = changeComplaintStatus;