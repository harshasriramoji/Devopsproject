const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');
const submitButton = registerForm.querySelector('button[type="submit"]');

registerForm.addEventListener('submit', async(event) => {
    event.preventDefault();
    setFormMessage(registerMessage, '');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!name || !email || !password || !role) {
        setFormMessage(registerMessage, 'Please complete all fields.');
        return;
    }

    if (name.length < 2) {
        setFormMessage(registerMessage, 'Name must be at least 2 characters long.');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFormMessage(registerMessage, 'Please enter a valid email address.');
        return;
    }

    if (password.length < 6) {
        setFormMessage(registerMessage, 'Password must be at least 6 characters long.');
        return;
    }

    setButtonLoading(submitButton, true);

    try {
        const data = await apiFetchWithLoading('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role }),
        }, submitButton);

        setFormMessage(registerMessage, data.message || 'Registration successful! Redirecting to login...', false);
        registerForm.reset();

        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);

    } catch (error) {
        setFormMessage(registerMessage, error.message || 'Registration failed. Please try again.');
    } finally {
        setButtonLoading(submitButton, false);
    }
});