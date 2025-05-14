import cors from "cors";

const allowedOrigins = [
  "https://repo-web.onrender.com",  // Tu frontend en producción
  "http://localhost:5173"
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
};

export const corsMiddleware = cors(corsOptions);
