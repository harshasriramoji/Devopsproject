// Main frontend application helpers
// This file provides shared fetch utilities and UI behaviors

const apiFetch = async(path, options = {}) => {
    const baseUrl = window.API_BASE_URL || window.location.origin;
    const response = await fetch(`${baseUrl}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const message = data?.message || 'Request failed';
        throw new Error(message);
    }
    return data;
};

const bindRolePills = () => {
    const roleLabels = document.querySelectorAll('.role-pill');
    roleLabels.forEach((label) => {
        const input = label.querySelector('input');
        if (!input) return;

        const updateStyle = () => {
            if (input.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        };

        input.addEventListener('change', () => {
            roleLabels.forEach((other) => other.classList.remove('selected'));
            updateStyle();
        });

        updateStyle();
    });
};

const setFormMessage = (element, message, isError = true) => {
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? '#dc2626' : '#16a34a';
};

window.app = {
    apiFetch,
    bindRolePills,
    setFormMessage,
};