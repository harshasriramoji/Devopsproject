// Configuration for API base URL
const currentOrigin = window.location.origin && window.location.origin !== 'null' ?
    window.location.origin :
    'http://localhost:3000';

const API_BASE_URL = currentOrigin;

// Export for use in other JS files
window.API_BASE_URL = API_BASE_URL;