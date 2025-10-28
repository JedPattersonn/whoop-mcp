import type {
  WhoopConfig,
  WhoopHeaders,
  HomeResponse,
  LoginResponse,
  TokenData,
} from "./types";

export class WhoopClient {
  private config: WhoopConfig;
  private baseUrl: string;
  private tokenData: TokenData | null = null;
  private readonly CLIENT_ID = "";

  constructor(config: WhoopConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || "https://api.prod.whoop.com";
  }

  /**
   * Login with email and password to get access token
   */
  async login(email?: string, password?: string): Promise<void> {
    const loginEmail = email || this.config.email;
    const loginPassword = password || this.config.password;

    if (!loginEmail || !loginPassword) {
      throw new Error("Email and password are required for login");
    }

    const url = `${this.baseUrl}/auth-service/v3/whoop`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Host: "api.prod.whoop.com",
          Accept: "*/*",
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        },
        body: JSON.stringify({
          AuthParameters: {
            USERNAME: loginEmail,
            PASSWORD: loginPassword,
          },
          ClientId: this.CLIENT_ID,
          AuthFlow: "USER_PASSWORD_AUTH",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Login failed: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as LoginResponse;

      if (!data.AuthenticationResult) {
        throw new Error("Login failed: No authentication result received");
      }

      this.tokenData = {
        accessToken: data.AuthenticationResult.AccessToken,
        expiresAt: Date.now() + data.AuthenticationResult.ExpiresIn * 1000,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to login with email ${loginEmail}: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Ensure we have a valid access token, logging in if necessary
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.tokenData) {
      await this.login();
      return;
    }

    const expiresInMs = this.tokenData.expiresAt - Date.now();
    if (expiresInMs < 5 * 60 * 1000) {
      await this.login();
    }
  }

  private async getHeaders(): Promise<WhoopHeaders> {
    await this.ensureValidToken();

    if (!this.tokenData) {
      throw new Error("No valid authentication token available");
    }

    return {
      Host: "api.prod.whoop.com",
      Authorization: `Bearer ${this.tokenData.accessToken}`,
      Accept: "*/*",
      "User-Agent": "iOS",
      "Content-Type": "application/json",
      "X-WHOOP-Device-Platform": "iOS",
      "X-WHOOP-Time-Zone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      Locale: "en_US",
      Currency: "USD",
    };
  }

  /**
   * Get comprehensive home data for a specific date
   */
  async getHomeData(date?: string): Promise<HomeResponse> {
    const dateParam = date || new Date().toISOString().split("T")[0];
    const url = `${this.baseUrl}/home-service/v1/home?date=${dateParam}`;

    let retried = false;

    while (true) {
      try {
        const headers = await this.getHeaders();
        const response = await fetch(url, {
          method: "GET",
          headers: Object.fromEntries(
            Object.entries(headers).map(([key, value]) => [
              key,
              value as string,
            ])
          ),
        });

        if (!response.ok) {
          if (response.status === 401 && !retried) {
            retried = true;
            await this.login();
            continue;
          }

          throw new Error(
            `Whoop API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data as HomeResponse;
      } catch (error) {
        if (
          retried ||
          !(error instanceof Error && error.message.includes("401"))
        ) {
          if (error instanceof Error) {
            throw new Error(`Failed to fetch home data: ${error.message}`);
          }
          throw error;
        }

        retried = true;
        await this.login();
      }
    }
  }

  /**
   * Get sleep deep dive data for a specific date
   */
  async getSleepDeepDive(date?: string): Promise<any> {
    const dateParam = date || new Date().toISOString().split("T")[0];
    const url = `${this.baseUrl}/home-service/v1/deep-dive/sleep?date=${dateParam}`;

    let retried = false;

    while (true) {
      try {
        const headers = await this.getHeaders();
        const response = await fetch(url, {
          method: "GET",
          headers: Object.fromEntries(
            Object.entries(headers).map(([key, value]) => [
              key,
              value as string,
            ])
          ),
        });

        if (!response.ok) {
          if (response.status === 401 && !retried) {
            retried = true;
            await this.login();
            continue;
          }

          throw new Error(
            `Whoop API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (
          retried ||
          !(error instanceof Error && error.message.includes("401"))
        ) {
          if (error instanceof Error) {
            throw new Error(`Failed to fetch sleep data: ${error.message}`);
          }
          throw error;
        }

        retried = true;
        await this.login();
      }
    }
  }

  /**
   * Get recovery deep dive data for a specific date
   */
  async getRecoveryDeepDive(date?: string): Promise<any> {
    const dateParam = date || new Date().toISOString().split("T")[0];
    const url = `${this.baseUrl}/home-service/v1/deep-dive/recovery?date=${dateParam}`;

    let retried = false;

    while (true) {
      try {
        const headers = await this.getHeaders();
        const response = await fetch(url, {
          method: "GET",
          headers: Object.fromEntries(
            Object.entries(headers).map(([key, value]) => [
              key,
              value as string,
            ])
          ),
        });

        if (!response.ok) {
          if (response.status === 401 && !retried) {
            retried = true;
            await this.login();
            continue;
          }

          throw new Error(
            `Whoop API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (
          retried ||
          !(error instanceof Error && error.message.includes("401"))
        ) {
          if (error instanceof Error) {
            throw new Error(`Failed to fetch recovery data: ${error.message}`);
          }
          throw error;
        }

        retried = true;
        await this.login();
      }
    }
  }

  /**
   * Get strain deep dive data for a specific date
   */
  async getStrainDeepDive(date?: string): Promise<any> {
    const dateParam = date || new Date().toISOString().split("T")[0];
    const url = `${this.baseUrl}/home-service/v1/deep-dive/strain?date=${dateParam}`;

    let retried = false;

    while (true) {
      try {
        const headers = await this.getHeaders();
        const response = await fetch(url, {
          method: "GET",
          headers: Object.fromEntries(
            Object.entries(headers).map(([key, value]) => [
              key,
              value as string,
            ])
          ),
        });

        if (!response.ok) {
          if (response.status === 401 && !retried) {
            retried = true;
            await this.login();
            continue;
          }

          throw new Error(
            `Whoop API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (
          retried ||
          !(error instanceof Error && error.message.includes("401"))
        ) {
          if (error instanceof Error) {
            throw new Error(`Failed to fetch strain data: ${error.message}`);
          }
          throw error;
        }

        retried = true;
        await this.login();
      }
    }
  }

  /**
   * Get healthspan data for a specific date
   */
  async getHealthspan(date?: string): Promise<any> {
    const dateParam = date || new Date().toISOString().split("T")[0];
    const url = `${this.baseUrl}/healthspan-service/v1/healthspan/bff?date=${dateParam}`;

    let retried = false;

    while (true) {
      try {
        const headers = await this.getHeaders();
        const response = await fetch(url, {
          method: "GET",
          headers: Object.fromEntries(
            Object.entries(headers).map(([key, value]) => [
              key,
              value as string,
            ])
          ),
        });

        if (!response.ok) {
          if (response.status === 401 && !retried) {
            retried = true;
            await this.login();
            continue;
          }

          throw new Error(
            `Whoop API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (
          retried ||
          !(error instanceof Error && error.message.includes("401"))
        ) {
          if (error instanceof Error) {
            throw new Error(
              `Failed to fetch healthspan data: ${error.message}`
            );
          }
          throw error;
        }

        retried = true;
        await this.login();
      }
    }
  }

  /**
   * Format home data into a human-readable string
   */
  formatHomeData(data: HomeResponse): string {
    const metadata = data.metadata;
    const live = metadata.whoop_live_metadata;
    const cycle = metadata.cycle_metadata;

    const lines = [
      "🏠 WHOOP HOME DATA",
      "══════════════════",
      "",
      `📅 Date: ${cycle.cycle_day} (${cycle.cycle_date_display})`,
      `🔄 Cycle ID: ${cycle.cycle_id}`,
      `💤 Sleep State: ${cycle.sleep_state}`,
      "",
      "📊 LIVE METRICS",
      "───────────────",
      `  Recovery: ${live.recovery_score}%`,
      `  Strain: ${live.day_strain.toFixed(1)}`,
      `  Sleep: ${(live.ms_of_sleep / (1000 * 60 * 60)).toFixed(1)} hours`,
      `  Calories: ${live.calories}`,
      "",
    ];

    // Add gauges from header
    if (data.header?.content?.gauges) {
      lines.push("🎯 SCORES", "─────────");
      data.header.content.gauges.forEach((gauge) => {
        lines.push(
          `  ${gauge.title}: ${gauge.score_display}${gauge.score_display_suffix || ""} (${Math.round(gauge.gauge_fill_percentage * 100)}%)`
        );
      });
      lines.push("");
    }

    return lines.join("\n");
  }
}
