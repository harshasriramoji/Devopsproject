const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');

const setRegisterMessage = (text, isError = true) => {
    registerMessage.textContent = text;
    registerMessage.style.color = isError ? '#dc2626' : '#16a34a';
};

registerForm.addEventListener('submit', async(event) => {
    event.preventDefault();
    setRegisterMessage('');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!name || !email || !password || !role) {
        setRegisterMessage('Please complete all fields.');
        return;
    }

    try {
        const response = await fetch(window.API_BASE_URL + '/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();
        if (!response.ok) {
            setRegisterMessage(data.message || 'Registration failed.');
            return;
        }

        setRegisterMessage(data.message || 'Registration successful. Redirecting to login...', false);
        registerForm.reset();
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    } catch (error) {
        setRegisterMessage('Unable to register at this time.');
    }
});