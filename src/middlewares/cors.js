import cors from "cors";

const allowedOrigins = ["*"];

const corsOptions = {
  origin: (origin, callback) => {
    // Permite solicitudes sin origen (como Postman) o orígenes en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origen CORS no permitido"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export const corsMiddleware = cors(corsOptions);
