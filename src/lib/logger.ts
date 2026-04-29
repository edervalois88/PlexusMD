import { v4 as uuidv4 } from "uuid";

class Logger {
  info(message: string, context?: unknown) {
    console.log(JSON.stringify({ level: "INFO", message, context, timestamp: new Date().toISOString() }));
  }

  warn(message: string, context?: unknown) {
    console.warn(JSON.stringify({ level: "WARN", message, context, timestamp: new Date().toISOString() }));
  }

  error(message: string, context?: unknown) {
    const errorId = uuidv4();
    console.error(JSON.stringify({ level: "ERROR", errorId, message, context, timestamp: new Date().toISOString() }));
    return errorId;
  }
}

export const logger = new Logger();

// Helper para lanzar errores seguros al cliente
export const handleSafeError = (message: string, errorObj: unknown) => {
  const detail = errorObj instanceof Error ? errorObj.message : String(errorObj);

  if (process.env.NODE_ENV === "development") {
    throw new Error(`${message}: ${detail}`);
  } else {
    const errorId = logger.error(message, errorObj);
    throw new Error(`Ocurrió un error interno. Código de referencia: ${errorId}`);
  }
};
