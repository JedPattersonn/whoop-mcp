import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { createWhoopMcpServer } from "./src/server";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  // Extract config from query parameters (Smithery passes configSchema values as query params)
  const whoopEmail =
    (req.query.whoopEmail as string) || process.env.WHOOP_EMAIL;
  const whoopPassword =
    (req.query.whoopPassword as string) || process.env.WHOOP_PASSWORD;
  const mcpAuthToken =
    (req.query.mcpAuthToken as string) || process.env.MCP_AUTH_TOKEN;

  // Validate required credentials
  if (!whoopEmail || !whoopPassword) {
    return res.status(400).json({
      error: "Bad Request",
      message:
        "whoopEmail and whoopPassword are required (via query params or environment variables)",
    });
  }

  // Optional authentication check
  if (mcpAuthToken) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authorization header is required",
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid authorization format. Use 'Bearer <token>'",
      });
    }

    if (token !== mcpAuthToken) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid authentication token",
      });
    }
  }

  // Create server instance with credentials from query params or env vars
  const server = createWhoopMcpServer({
    email: whoopEmail,
    password: whoopPassword,
  });
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
    console.log(
      `\nConfiguration: Credentials and auth token should be provided via query parameters`
    );
    console.log(`  - whoopEmail: Required`);
    console.log(`  - whoopPassword: Required`);
    console.log(
      `  - mcpAuthToken: Optional (enables Bearer token authentication)`
    );
    console.log(`\nAlternatively, use environment variables:`);
    console.log(`  - WHOOP_EMAIL`);
    console.log(`  - WHOOP_PASSWORD`);
    console.log(`  - MCP_AUTH_TOKEN`);
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
