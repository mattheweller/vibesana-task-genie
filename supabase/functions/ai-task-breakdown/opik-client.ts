
import { Opik } from "npm:opik@latest";
import { opikApiKey } from "./config.ts";

let opikClient: Opik | null = null;

export const initializeOpik = (): Opik | null => {
  if (!opikApiKey) {
    console.log('Opik API key not found - skipping tracking initialization');
    return null;
  }
  
  try {
    opikClient = new Opik({
      apiKey: opikApiKey,
      host: "https://www.comet.com/opik/api",
      projectName: "Vibesana",
      workspaceName: "mattheweller",
    });
    console.log('Opik client initialized successfully');
    return opikClient;
  } catch (error) {
    console.error('Failed to initialize Opik client:', error);
    return null;
  }
};

export const getOpikClient = (): Opik | null => {
  if (!opikClient) {
    return initializeOpik();
  }
  return opikClient;
};
