import logger from "../config/logger.js";

const requestLogger = (req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const [s, ns] = process.hrtime(start);
    const ms = (s * 1e3 + ns / 1e6).toFixed(2);
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${ms} ms`,
      {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        responseTimeMs: Number(ms),
      },
    );
  });

  next();
};

export default requestLogger;
