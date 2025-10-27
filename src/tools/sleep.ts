import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WhoopClient } from "../whoop-client";

export function registerSleepTools(
  server: McpServer,
  whoopClient: WhoopClient
) {
  server.registerTool(
    "whoop_get_sleep",
    {
      title: "Get Sleep Deep Dive",
      description:
        "Get detailed sleep data including sleep performance score, contributors (hours vs needed, consistency, efficiency, sleep stress), and insights for a specific date",
      inputSchema: {
        date: z
          .string()
          .optional()
          .describe(
            "Date in YYYY-MM-DD format (defaults to today if not provided)"
          ),
      },
    },
    async ({ date }) => {
      try {
        const data = await whoopClient.getSleepDeepDive(date);

        const scoreSection = data.sections.find((s: any) =>
          s.items.some((i: any) => i.type === "SCORE_GAUGE")
        );

        const scoreGauge = scoreSection?.items.find(
          (i: any) => i.type === "SCORE_GAUGE"
        );

        let sleepPerformance = null;
        if (scoreGauge) {
          sleepPerformance = {
            score: Math.round(scoreGauge.content.gauge_fill_percentage * 100),
            scoreDisplay: scoreGauge.content.score_display,
            fillPercentage: scoreGauge.content.gauge_fill_percentage,
          };
        }

        const contributorsSection = data.sections.find((s: any) =>
          s.items.some((i: any) => i.type === "CONTRIBUTORS_TILE")
        );

        const contributorsTile = contributorsSection?.items.find(
          (i: any) => i.type === "CONTRIBUTORS_TILE"
        );

        const contributors =
          contributorsTile?.content.metrics.map((m: any) => ({
            id: m.id,
            icon: m.icon,
            title: m.title,
            status: m.status,
            statusSubtitle: m.status_subtitle,
            metricStyle: m.metric_style,
          })) || [];

        let insight = undefined;
        const vowItem = contributorsTile?.content.footer?.items?.find(
          (i: any) => i.type === "WHOOP_COACH_VOW"
        );
        if (vowItem) {
          insight = vowItem.content.vow;
        }

        const result = {
          sleepPerformance,
          contributors,
          insight,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = `Error fetching sleep data: ${error instanceof Error ? error.message : "Unknown error"}`;

        return {
          content: [
            {
              type: "text",
              text: errorMessage,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
