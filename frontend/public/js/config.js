// Configuration for API base URL
const API_BASE_URL = window.location.origin.includes('localhost') ?
    window.location.origin :
    'https://devopsproject-9tcb.onrender.com';

// Export for use in other JS files
window.API_BASE_URL = API_BASE_URL;