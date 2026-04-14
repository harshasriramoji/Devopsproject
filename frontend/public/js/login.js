const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const submitButton = loginForm.querySelector('button[type="submit"]');

loginForm.addEventListener('submit', async(event) => {
    event.preventDefault();
    setFormMessage(message, '');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked') ? .value;

    if (!email || !password || !role) {
        setFormMessage(message, 'Please fill in all fields and select a role.');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormMessage(message, 'Please enter a valid email address.');
        return;
    }

    setButtonLoading(submitButton, true);

    try {
        const data = await apiFetchWithLoading('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, role }),
        }, submitButton);

        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name || email);

        setFormMessage(message, 'Login successful! Redirecting...', false);

        // Redirect based on role
        setTimeout(() => {
            if (data.role === 'admin') {
                window.location.href = '/views/admin/admin-dashboard.html';
            } else if (data.role === 'staff') {
                window.location.href = '/views/staff/staff-dashboard.html';
            } else {
                window.location.href = '/views/student/student-dashboard.html';
            }
        }, 1000);

    } catch (error) {
        setFormMessage(message, error.message || 'Login failed. Please check your credentials.');
    } finally {
        setButtonLoading(submitButton, false);
    }
});

// Initialize role pills on page load
document.addEventListener('DOMContentLoaded', () => {
    bindRolePills();
});