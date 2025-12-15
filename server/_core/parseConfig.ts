// @ts-ignore - parse/node doesn't have type definitions
import Parse from "parse/node";

/**
 * Initialize Parse with the provided credentials
 * This should be called once at server startup
 */
export function initializeParse() {
  Parse.initialize(
    process.env.PARSE_APP_ID || "mbmRIODb8dv6RfslDMXICBySmNJmToTrqcUHE9Mp",
    process.env.PARSE_JS_KEY || "3WlzfL60InCRU3N9ABe2WXFgmJTq9UNAEpNkMcMr"
  );

  Parse.serverURL =
    process.env.PARSE_SERVER_URL ||
    "https://pg-app-48f9h01vu8tpthu5cwztzjqbuc1qbg.scalabl.cloud/1/";

  Parse.masterKey =
    process.env.PARSE_MASTER_KEY ||
    "Jz5KpkrTDc16Czz1D2tanzWUchp9qJsrNTSMIEYm";

  // Override the Installation class to prevent currentInstallationId errors
  try {
    const OriginalInstallation = Parse.Installation;
    Parse.Installation = class extends OriginalInstallation {
      static currentInstallationId() {
        return null;
      }
      
      static async currentInstallation() {
        return null;
      }
    };
  } catch (e) {
    // If Installation doesn't exist, create a mock
    Parse.Installation = Parse.Object.extend("_Installation", {}, {
      currentInstallationId: () => null,
      currentInstallation: async () => null,
    });
  }

  console.log("[Parse] Initialized with server URL:", Parse.serverURL);
}

/**
 * Get the Parse configuration for client-side use
 */
export function getParseClientConfig() {
  return {
    appId: process.env.PARSE_APP_ID || "mbmRIODb8dv6RfslDMXICBySmNJmToTrqcUHE9Mp",
    jsKey: process.env.PARSE_JS_KEY || "3WlzfL60InCRU3N9ABe2WXFgmJTq9UNAEpNkMcMr",
    serverURL:
      process.env.PARSE_SERVER_URL ||
      "https://pg-app-48f9h01vu8tpthu5cwztzjqbuc1qbg.scalabl.cloud/1/",
  };
}

export default Parse;
