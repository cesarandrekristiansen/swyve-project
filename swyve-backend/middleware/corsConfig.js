const cors = require("cors");

const corsOptions = {
  origin: [
    "https://swyve-frontend.onrender.com",
    "http://localhost:3000",
    "https://swyve.io",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

module.exports = cors(corsOptions);
