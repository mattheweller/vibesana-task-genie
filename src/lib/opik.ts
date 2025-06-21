
import { Opik } from 'opik';

export const opikClient = new Opik({
  apiKey: process.env.OPIK_API_KEY || 'h5MdaImX8qNRsTdtUsPcyVmAM',
  apiUrl: "https://www.comet.com/opik/api",
  projectName: "dVibesanaefault",
  workspaceName: "mattheweller>",
});
