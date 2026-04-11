const studentComplaintToken = localStorage.getItem('token');

const complaintApiFetch = async(url, options = {}) => {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${studentComplaintToken}`,
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

const setComplaintMessage = (text, isError = true) => {
    const element = document.querySelector('#complaintMessage');
    if (element) {
        element.textContent = text;
        element.style.color = isError ? '#dc2626' : '#16a34a';
    }
};

const loadComplaintCount = async() => {
    try {
        const complaints = await complaintApiFetch('/api/complaints');
        const countElement = document.getElementById('complaintCount');
        if (countElement) {
            countElement.textContent = complaints.length;
        }
    } catch (error) {
        setComplaintMessage(error.message);
    }
};

const handleComplaintForm = async(event) => {
    event.preventDefault();
    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintDescription').value.trim();
    const roomNumber = document.getElementById('roomNumber').value.trim();

    if (!title || !description || !roomNumber) {
        return setComplaintMessage('All fields are required');
    }

    try {
        await complaintApiFetch('/api/complaints', {
            method: 'POST',
            body: JSON.stringify({ complaintTitle: title, complaintDescription: description, roomNumber }),
        });
        setComplaintMessage('Complaint submitted successfully', false);
        document.getElementById('complaintForm').reset();
        loadComplaintCount();
    } catch (error) {
        setComplaintMessage(error.message);
    }
};

const initStudentComplaint = () => {
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleComplaintForm);
    }
    loadComplaintCount();
};

window.addEventListener('DOMContentLoaded', initStudentComplaint);