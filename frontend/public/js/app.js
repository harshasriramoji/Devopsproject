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
        const message = data?.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }
    return data;
};

// Enhanced API fetch with loading states
const apiFetchWithLoading = async(path, options = {}, loadingElement = null) => {
    if (loadingElement) {
        loadingElement.classList.add('loading');
        loadingElement.disabled = true;
    }

    try {
        const result = await apiFetch(path, options);
        return result;
    } finally {
        if (loadingElement) {
            loadingElement.classList.remove('loading');
            loadingElement.disabled = false;
        }
    }
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
    element.style.opacity = '1';

    // Auto-hide success messages after 5 seconds
    if (!isError) {
        setTimeout(() => {
            element.style.opacity = '0';
            setTimeout(() => {
                element.textContent = '';
                element.style.opacity = '1';
            }, 300);
        }, 5000);
    }
};

// Utility function to show loading state on buttons
const setButtonLoading = (button, isLoading = true) => {
    if (!button) return;

    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Loading...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
        }
    }
};

// Utility function to format dates
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Utility function to create status badges
const createStatusBadge = (status, text) => {
    const badge = document.createElement('span');
    badge.className = `status-badge status-${status.toLowerCase().replace(' ', '-')}`;
    badge.textContent = text || status;
    return badge;
};

// Utility function to show confirmation dialog
const showConfirmDialog = (message, onConfirm, onCancel = null) => {
    const confirmed = confirm(message);
    if (confirmed && onConfirm) {
        onConfirm();
    } else if (!confirmed && onCancel) {
        onCancel();
    }
    return confirmed;
};

window.app = {
    apiFetch,
    bindRolePills,
    setFormMessage,
};