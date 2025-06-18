const cors = require("cors");

const allowedOrigins = [
  "https://swyve-frontend.onrender.com",
  "http://localhost:3000",
  "https://swyve.io",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Ikke tillatt av CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

module.exports = cors(corsOptions);
