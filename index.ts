import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { createWhoopMcpServer } from "./src/server";

const WHOOP_EMAIL = process.env.WHOOP_EMAIL;
const WHOOP_PASSWORD = process.env.WHOOP_PASSWORD;

if (!WHOOP_EMAIL || !WHOOP_PASSWORD) {
  console.error("Error: WHOOP_EMAIL and WHOOP_PASSWORD are required");
  console.error("\nSet your Whoop credentials:");
  console.error("  export WHOOP_EMAIL='your-email@example.com'");
  console.error("  export WHOOP_PASSWORD='your-password'");
  process.exit(1);
}

const server = createWhoopMcpServer({
  email: WHOOP_EMAIL,
  password: WHOOP_PASSWORD,
});

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || "3000");
app
  .listen(port, () => {
    console.log(`Whoop MCP Server running on http://localhost:${port}/mcp`);
    console.log(`Authenticated as: ${WHOOP_EMAIL}`);
    console.log(`\nAvailable tools:`);
    console.log(
      `  - whoop_get_overview: Comprehensive overview with metrics, activities & stats`
    );
    console.log(`  - whoop_get_sleep: Detailed sleep analysis and performance`);
    console.log(
      `  - whoop_get_recovery: Recovery score with HRV, RHR & trends`
    );
    console.log(
      `  - whoop_get_strain: Strain score with HR zones & activities`
    );
    console.log(`  - whoop_get_healthspan: Biological age & pace of aging`);
  })
  .on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
