import { config } from "@/config";
import axios from "axios";

export const autoCompletionApi = {
  fetchCities: async (searchTerm: string) => {
    const response = await axios.get(
      `${config.API_BASE_URL}/city?keyword=${encodeURIComponent(searchTerm)}`
    );
    return response.data;
  },
};
