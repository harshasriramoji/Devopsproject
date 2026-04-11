const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

const setMessage = (text, isError = true) => {
    message.textContent = text;
    message.style.color = isError ? '#dc2626' : '#16a34a';
};

loginForm.addEventListener('submit', async(event) => {
    event.preventDefault();
    setMessage('');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!email || !password) {
        setMessage('Please enter both email and password.');
        return;
    }

    try {
        const response = await fetch(window.API_BASE_URL + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();
        if (!response.ok) {
            setMessage(data.message || 'Login failed.');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);

        if (data.role === 'admin') {
            window.location.href = '/views/admin/admin-dashboard.html';
        } else if (data.role === 'staff') {
            window.location.href = '/views/staff/staff-dashboard.html';
        } else {
            window.location.href = '/views/student/student-dashboard.html';
        }
    } catch (error) {
        setMessage('Unable to login at this time.');
    }
});