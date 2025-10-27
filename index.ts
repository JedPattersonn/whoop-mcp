import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { createWhoopMcpServer } from "./src/server";

const WHOOP_EMAIL = process.env.WHOOP_EMAIL;
const WHOOP_PASSWORD = process.env.WHOOP_PASSWORD;
const MCP_AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;

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

const authMiddleware: express.RequestHandler = (req, res, next) => {
  if (!MCP_AUTH_TOKEN) {
    return next();
  }

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

  if (token !== MCP_AUTH_TOKEN) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid authentication token",
    });
  }

  next();
};

app.post("/mcp", authMiddleware, async (req, res) => {
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
    console.log(
      `\nSecurity: ${MCP_AUTH_TOKEN ? "🔒 Authentication enabled" : "⚠️  Authentication disabled (public access)"}`
    );
    if (MCP_AUTH_TOKEN) {
      console.log(`  Clients must include: Authorization: Bearer <token>`);
    } else {
      console.log(
        `  To enable auth, set: export MCP_AUTH_TOKEN='your-secret-token'`
      );
    }
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
