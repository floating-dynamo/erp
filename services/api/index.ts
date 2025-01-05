// apiService.js
import apiService from "./api-service";
import mockService from "./mock-service";

// Determine which service to use based on the environment variable
const APIService =
  process.env.NEXT_PUBLIC_APP_MOCK_API === "true" ? mockService : apiService;

export default APIService;
