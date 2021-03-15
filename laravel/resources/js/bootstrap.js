window.axios = require("axios");

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

window.axios.interceptors.response.use(
    response => response,
    error => error.response || error
);
