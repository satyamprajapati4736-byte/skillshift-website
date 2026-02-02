
import { User } from "../types";

/**
 * Live Google Apps Script Web App URL connected to:
 * https://docs.google.com/spreadsheets/d/1Dfe350SALDp9bz8oXA9xKtomCwWbTVvvDJLMC1zZg6Y
 */
const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw9v27IeMTOQ89xpvfXm_zGRP3J7XPH5Lz_8OSeroml3bHuctzLDVWWG4ECAqFEZ0cj/exec";

export const sheetService = {
  syncToGoogleSheet: async (user: User, roadmapName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const payload = {
        name: user.name,
        contact: user.phone,
        gender: user.gender,
        roadmap: roadmapName
      };

      // Using 'no-cors' to ensure the request is sent to Google Apps Script 
      // even if the script environment doesn't explicitly handle CORS pre-flights.
      await fetch(SHEET_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // With no-cors, we don't get a readable response body, 
      // but if the fetch succeeds, the data is pushed.
      return { success: true };
    } catch (error) {
      console.error("Sheet Sync Failed:", error);
      return { success: false, error: String(error) };
    }
  }
};
