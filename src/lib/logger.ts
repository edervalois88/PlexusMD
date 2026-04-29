import { v4 as uuidv4 } from "uuid";

class Logger {
  info(message: string, context?: any) {
    console.log(JSON.stringify({ level: "INFO", message, context, timestamp: new Date().toISOString() }));
  }

  warn(message: string, context?: any) {
    console.warn(JSON.stringify({ level: "WARN", message, context, timestamp: new Date().toISOString() }));
  }

  error(message: string, context?: any) {
    const errorId = uuidv4();
    console.error(JSON.stringify({ level: "ERROR", errorId, message, context, timestamp: new Date().toISOString() }));
    return errorId;
  }
}

export const logger = new Logger();

// Helper para lanzar errores seguros al cliente
export const handleSafeError = (message: string, errorObj: any) => {
  if (process.env.NODE_ENV === "development") {
    throw new Error(`${message}: ${errorObj.message}`);
  } else {
    const errorId = logger.error(message, errorObj);
    throw new Error(`Ocurrió un error interno. Código de referencia: ${errorId}`);
  }
};
