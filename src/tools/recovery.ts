import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WhoopClient } from "../whoop-client";

export function registerRecoveryTools(
  server: McpServer,
  whoopClient: WhoopClient
) {
  server.registerTool(
    "whoop_get_recovery",
    {
      title: "Get Whoop Recovery Deep Dive",
      description:
        "Get comprehensive recovery analysis including recovery score, HRV, RHR, respiratory rate, sleep performance, and recovery contributors with trends",
      inputSchema: {
        date: z
          .string()
          .optional()
          .describe(
            "Date in YYYY-MM-DD format (defaults to today if not provided)"
          ),
      },
      outputSchema: {
        title: z.string(),
        recoveryScore: z.object({
          score: z.string(),
          percentage: z.number(),
          style: z.string(),
        }),
        contributors: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            value: z.string(),
            baseline: z.string(),
            status: z.string(),
            icon: z.string(),
          })
        ),
        coachInsight: z.string().nullable(),
      },
    },
    async ({ date }) => {
      try {
        const data = await whoopClient.getRecoveryDeepDive(date);

        const scoreSection = data.sections.find((s: any) =>
          s.items.some((i: any) => i.type === "SCORE_GAUGE")
        );
        const scoreGauge = scoreSection?.items.find(
          (i: any) => i.type === "SCORE_GAUGE"
        )?.content;

        const contributorsSection = data.sections.find((s: any) =>
          s.items.some((i: any) => i.type === "CONTRIBUTORS_TILE")
        );
        const contributorsTile = contributorsSection?.items.find(
          (i: any) => i.type === "CONTRIBUTORS_TILE"
        )?.content;

        const contributors =
          contributorsTile?.metrics.map((metric: any) => ({
            id: metric.id,
            title: metric.title,
            value: metric.status,
            baseline: metric.status_subtitle,
            status: metric.status_type,
            icon: metric.icon,
          })) || [];

        const coachInsight =
          contributorsTile?.footer?.items?.find(
            (i: any) => i.type === "WHOOP_COACH_VOW"
          )?.content?.vow || null;

        const output = {
          title: data.header.title,
          recoveryScore: {
            score: scoreGauge?.score_display || "N/A",
            percentage: scoreGauge?.gauge_fill_percentage || 0,
            style: scoreGauge?.progress_fill_style || "UNKNOWN",
          },
          contributors,
          coachInsight,
        };

        const lines = [
          "💪 RECOVERY DEEP DIVE",
          "═══════════════════",
          "",
          `📅 ${data.header.title}`,
          "",
          "🎯 RECOVERY SCORE",
          "─────────────────",
          `  ${output.recoveryScore.score}% (${output.recoveryScore.style.replace(/_/g, " ")})`,
          "",
          "📊 CONTRIBUTORS",
          "───────────────",
        ];

        contributors.forEach((contributor: any) => {
          const statusEmoji =
            contributor.status === "HIGHER_POSITIVE"
              ? "📈"
              : contributor.status === "LOWER_POSITIVE"
                ? "📉"
                : contributor.status === "HIGHER_NEGATIVE"
                  ? "⬆️"
                  : contributor.status === "LOWER_NEGATIVE"
                    ? "⬇️"
                    : "➡️";

          lines.push(
            `  ${statusEmoji} ${contributor.title}`,
            `     Current: ${contributor.value}`,
            `     Baseline (30-day): ${contributor.baseline}`,
            ""
          );
        });

        if (output.coachInsight) {
          lines.push(
            "💡 COACH INSIGHT",
            "───────────────",
            output.coachInsight,
            ""
          );
        }

        const formattedText = lines.join("\n");

        return {
          content: [{ type: "text", text: formattedText }],
          structuredContent: output,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: `Error fetching Whoop recovery data: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
