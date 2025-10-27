import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WhoopClient } from "../whoop-client";

export function registerHomeTools(server: McpServer, whoopClient: WhoopClient) {
  server.registerTool(
    "whoop_get_overview",
    {
      title: "Get Whoop Overview",
      description:
        "Get comprehensive Whoop data overview including cycle info, live metrics (recovery, strain, sleep, calories), gauges, activities, and key health statistics for a specific date",
      inputSchema: {
        date: z
          .string()
          .optional()
          .describe(
            "Date in YYYY-MM-DD format (defaults to today if not provided)"
          ),
      },
      outputSchema: {
        cycleInfo: z.object({
          cycleId: z.number(),
          cycleDay: z.string(),
          cycleDateDisplay: z.string(),
          sleepState: z.string(),
        }),
        liveMetrics: z.object({
          recoveryScore: z.number(),
          dayStrain: z.number(),
          sleepHours: z.number(),
          calories: z.number(),
        }),
        gauges: z.array(
          z.object({
            title: z.string(),
            scoreDisplay: z.string(),
            scoreSuffix: z.string().nullable(),
            fillPercentage: z.number(),
            progressStyle: z.string(),
          })
        ),
        journal: z.object({
          completed: z.boolean(),
          hasRecovery: z.boolean(),
          enabled: z.boolean(),
        }),
        activities: z.array(
          z.object({
            title: z.string(),
            type: z.string(),
            scoreDisplay: z.string(),
            startTime: z.string(),
            endTime: z.string(),
            status: z.string(),
          })
        ),
        statistics: z.array(
          z.object({
            title: z.string(),
            currentValue: z.string(),
            thirtyDayAverage: z.string(),
            state: z.string(),
          })
        ),
      },
    },
    async ({ date }) => {
      try {
        const data = await whoopClient.getHomeData(date);

        const overviewPillar = data.pillars.find(
          (p: any) => p.type === "OVERVIEW"
        );

        const activities: any[] = [];
        if (overviewPillar) {
          for (const section of overviewPillar.sections) {
            for (const item of section.items) {
              if (item.type === "ITEMS_CARD" && item.content.items) {
                for (const activity of item.content.items) {
                  if (activity.type === "ACTIVITY") {
                    activities.push({
                      title: activity.content.title,
                      type: activity.content.type,
                      scoreDisplay: activity.content.score_display,
                      startTime: activity.content.start_time_text,
                      endTime: activity.content.end_time_text,
                      status: activity.content.status,
                    });
                  }
                }
              }
            }
          }
        }

        const statistics: any[] = [];
        if (overviewPillar) {
          for (const section of overviewPillar.sections) {
            for (const item of section.items) {
              if (item.type === "KEY_STATISTIC") {
                statistics.push({
                  title: item.content.title,
                  currentValue: item.content.current_value_display,
                  thirtyDayAverage: item.content.thirty_day_value_display,
                  state: item.content.state,
                });
              }
            }
          }
        }

        const output = {
          cycleInfo: {
            cycleId: data.metadata.cycle_metadata.cycle_id,
            cycleDay: data.metadata.cycle_metadata.cycle_day,
            cycleDateDisplay: data.metadata.cycle_metadata.cycle_date_display,
            sleepState: data.metadata.cycle_metadata.sleep_state,
          },
          liveMetrics: {
            recoveryScore: data.metadata.whoop_live_metadata.recovery_score,
            dayStrain: data.metadata.whoop_live_metadata.day_strain,
            sleepHours:
              data.metadata.whoop_live_metadata.ms_of_sleep / (1000 * 60 * 60),
            calories: data.metadata.whoop_live_metadata.calories,
          },
          gauges: data.header.content.gauges.map((gauge) => ({
            title: gauge.title,
            scoreDisplay: gauge.score_display,
            scoreSuffix: gauge.score_display_suffix,
            fillPercentage: gauge.gauge_fill_percentage,
            progressStyle: gauge.progress_fill_style,
          })),
          journal: {
            completed: data.metadata.journal_metadata.journal_completed,
            hasRecovery: data.metadata.journal_metadata.has_recovery,
            enabled: data.metadata.journal_metadata.journal_enabled,
          },
          activities,
          statistics,
        };

        const lines = ["🏠 WHOOP OVERVIEW", "═════════════════", ""];

        lines.push(
          `📅 Date: ${output.cycleInfo.cycleDay} (${output.cycleInfo.cycleDateDisplay})`,
          `🔄 Cycle ID: ${output.cycleInfo.cycleId}`,
          `💤 Sleep State: ${output.cycleInfo.sleepState}`,
          "",
          "📊 LIVE METRICS",
          "───────────────",
          `  Recovery: ${output.liveMetrics.recoveryScore}%`,
          `  Strain: ${output.liveMetrics.dayStrain.toFixed(1)}`,
          `  Sleep: ${output.liveMetrics.sleepHours.toFixed(1)} hours`,
          `  Calories: ${output.liveMetrics.calories}`,
          ""
        );

        if (output.gauges.length > 0) {
          lines.push("🎯 SCORES", "─────────");
          output.gauges.forEach((gauge) => {
            lines.push(
              `  ${gauge.title}: ${gauge.scoreDisplay}${gauge.scoreSuffix || ""} (${Math.round(gauge.fillPercentage * 100)}%)`
            );
          });
          lines.push("");
        }

        if (activities.length > 0) {
          lines.push("📋 TODAY'S ACTIVITIES", "─────────────────");
          activities.forEach((activity, index) => {
            lines.push(
              `  ${index + 1}. ${activity.title} (${activity.type})`,
              `     Score: ${activity.scoreDisplay}`,
              `     Time: ${activity.startTime} - ${activity.endTime}`,
              ""
            );
          });
        }

        if (statistics.length > 0) {
          lines.push("📈 KEY STATISTICS", "─────────────────");
          statistics.forEach((stat) => {
            const stateEmoji = stat.state.includes("POSITIVE")
              ? "✅"
              : stat.state.includes("NEGATIVE")
                ? "⚠️"
                : "➡️";
            lines.push(
              `  ${stateEmoji} ${stat.title}`,
              `     Current: ${stat.currentValue}`,
              `     30-day avg: ${stat.thirtyDayAverage}`,
              ""
            );
          });
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
              text: `Error fetching Whoop overview data: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
