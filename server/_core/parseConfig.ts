// @ts-ignore - parse/node doesn't have type definitions
import Parse from "parse/node.js";

/**
 * Initialize Parse with the provided credentials
 * This should be called once at server startup
 */
export function initializeParse() {
  Parse.initialize(
    process.env.PARSE_APP_ID || "myAppId",
    process.env.PARSE_JS_KEY || "myJavascriptKey"
  );

  Parse.serverURL =
    process.env.PARSE_SERVER_URL ||
    "https://parse-server-example-o1ht.onrender.com/parse";

  Parse.masterKey =
    process.env.PARSE_MASTER_KEY ||
    "myMasterKey";

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
    appId: process.env.PARSE_APP_ID || "myAppId",
    jsKey: process.env.PARSE_JS_KEY || "myJavascriptKey",
    serverURL:
      process.env.PARSE_SERVER_URL ||
      "https://parse-server-example-o1ht.onrender.com/parse",
  };
}

export default Parse;
