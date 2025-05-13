import cors from "cors";

const allowedOrigins = [
  // Origen principal de la aplicación frontend
  `http://0.0.0.0:${process.env.PORT_FRONT || 3000}`,
  // Origen de desarrollo en React/Vite
  "http://localhost:5173",
];

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
