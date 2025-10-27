import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WhoopClient } from "../whoop-client";

export function registerStrainTools(
  server: McpServer,
  whoopClient: WhoopClient
) {
  server.registerTool(
    "whoop_get_strain",
    {
      title: "Get Whoop Strain Deep Dive",
      description:
        "Get comprehensive strain analysis including day strain score, heart rate zones, strength training time, steps, activities, and strain contributors with trends",
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
        strainScore: z.object({
          score: z.string(),
          percentage: z.number(),
          target: z.number().nullable(),
          lowerOptimal: z.number().nullable(),
          higherOptimal: z.number().nullable(),
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
        activities: z.array(
          z.object({
            title: z.string(),
            strainScore: z.string(),
            startTime: z.string(),
            endTime: z.string(),
            type: z.string(),
            status: z.string(),
          })
        ),
        coachInsight: z.string().nullable(),
      },
    },
    async ({ date }) => {
      try {
        const data = await whoopClient.getStrainDeepDive(date);

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

        const activitySections = data.sections.filter((s: any) =>
          s.items.some((i: any) => i.type === "ACTIVITY")
        );
        const activities: any[] = [];
        activitySections.forEach((section: any) => {
          section.items.forEach((item: any) => {
            if (item.type === "ACTIVITY") {
              activities.push({
                title: item.content.title,
                strainScore: item.content.score_display,
                startTime: item.content.start_time_text,
                endTime: item.content.end_time_text,
                type: item.content.type,
                status: item.content.status,
              });
            }
          });
        });

        const coachInsight =
          contributorsTile?.footer?.items?.find(
            (i: any) => i.type === "WHOOP_COACH_VOW"
          )?.content?.vow || null;

        const output = {
          title: data.header.title,
          strainScore: {
            score: scoreGauge?.score_display || "N/A",
            percentage: scoreGauge?.gauge_fill_percentage || 0,
            target: scoreGauge?.score_target || null,
            lowerOptimal: scoreGauge?.lower_optimal_percentage || null,
            higherOptimal: scoreGauge?.higher_optimal_percentage || null,
          },
          contributors,
          activities,
          coachInsight,
        };

        const lines = [
          "🔥 STRAIN DEEP DIVE",
          "═══════════════════",
          "",
          `📅 ${data.header.title}`,
          "",
          "🎯 STRAIN SCORE",
          "───────────────",
          `  ${output.strainScore.score} (${Math.round(output.strainScore.percentage * 100)}%)`,
        ];

        if (output.strainScore.target) {
          lines.push(
            `  Target: ${Math.round(output.strainScore.target * 100)}%`
          );
        }
        if (
          output.strainScore.lowerOptimal &&
          output.strainScore.higherOptimal
        ) {
          lines.push(
            `  Optimal Range: ${Math.round(output.strainScore.lowerOptimal * 100)}-${Math.round(output.strainScore.higherOptimal * 100)}%`
          );
        }

        lines.push("", "📊 CONTRIBUTORS", "───────────────");

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
                    : contributor.status === "EQUAL"
                      ? "➡️"
                      : "◯";

          lines.push(
            `  ${statusEmoji} ${contributor.title}`,
            `     Current: ${contributor.value}`,
            `     Baseline (30-day): ${contributor.baseline}`,
            ""
          );
        });

        if (activities.length > 0) {
          lines.push("🏃 TODAY'S ACTIVITIES", "─────────────────");
          activities.forEach((activity: any) => {
            lines.push(
              `  ${activity.title}`,
              `     Strain: ${activity.strainScore}`,
              `     Time: ${activity.startTime} - ${activity.endTime}`,
              `     Type: ${activity.type}`,
              ""
            );
          });
        }

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
              text: `Error fetching Whoop strain data: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
