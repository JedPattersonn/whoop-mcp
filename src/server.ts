import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WhoopClient } from "./whoop-client";
import { registerHomeTools } from "./tools/home";
import { registerSleepTools } from "./tools/sleep";
import { registerRecoveryTools } from "./tools/recovery";
import { registerStrainTools } from "./tools/strain";
import { registerHealthspanTools } from "./tools/healthspan";

export interface WhoopMcpServerConfig {
  email?: string;
  password?: string;
}

export function createWhoopMcpServer(config: WhoopMcpServerConfig) {
  const server = new McpServer({
    name: "whoop-mcp-server",
    version: "1.0.0",
  });

  const whoopClient = new WhoopClient(config);

  registerHomeTools(server, whoopClient);
  registerSleepTools(server, whoopClient);
  registerRecoveryTools(server, whoopClient);
  registerStrainTools(server, whoopClient);
  registerHealthspanTools(server, whoopClient);

  return server;
}
