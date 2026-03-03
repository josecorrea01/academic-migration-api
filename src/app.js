const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const applicationRoutes = require("./modules/applications/application.routes");

const healthRoutes = require("./routes/health.routes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", applicationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;