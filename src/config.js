// Base server URL
let BASE_SERVER_URL;

if (process.env.PIKAP === 'false') {
    BASE_SERVER_URL = 'https://mm-pp-app.onrender.com/';
} else if (process.env.PIKAP === 'true') {
    BASE_SERVER_URL = 'https://mm-pp-app.onrender.com/pk';
} else {
    BASE_SERVER_URL = 'http://127.0.0.1:8000';
}

export default BASE_SERVER_URL;