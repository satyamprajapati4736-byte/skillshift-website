
import { User } from "../types";

// The specific Google Apps Script URL provided by the user
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

      // using text/plain prevents browser from sending OPTIONS preflight request which GAS doesn't handle
      // The Apps Script will still receive the body string and parse it as JSON
      const response = await fetch(SHEET_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      // Check for script-level error
      if (data.status === 'error') {
        throw new Error('Script Error');
      }

      return { success: true };
    } catch (error) {
      console.error("Sheet Sync Failed:", error);
      return { success: false, error: String(error) };
    }
  }
};
