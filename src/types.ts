export interface WhoopConfig {
  email?: string;
  password?: string;
  baseUrl?: string;
  userId?: string;
  accountId?: string;
}

export interface AuthenticationResult {
  AccessToken: string;
  ExpiresIn: number;
  TokenType: string;
  RefreshToken: string;
  IdToken: string;
  NewDeviceMetadata: null;
}

export interface LoginResponse {
  ChallengeName: null;
  Session: null;
  ChallengeParameters: Record<string, unknown>;
  AuthenticationResult: AuthenticationResult;
  AvailableChallenges: null;
}

export interface TokenData {
  accessToken: string;
  expiresAt: number;
}

export interface WhoopHeaders {
  Host: string;
  Authorization: string;
  Accept: string;
  "User-Agent": string;
  "Content-Type": string;
  "X-WHOOP-Device-Platform"?: string;
  "X-WHOOP-Time-Zone"?: string;
  Locale?: string;
  Currency?: string;
  [key: string]: string | undefined;
}

export interface TimeInterval {
  lower_endpoint: string;
  lower_bound_type: string;
  upper_endpoint?: string;
  upper_bound_type?: string;
}

export interface CycleMetadata {
  cycle_id: number;
  cycle_day: string;
  cycle_days: TimeInterval;
  during: TimeInterval;
  cycle_date_display: string;
  previous_cycle_day: string;
  next_cycle_day: string;
  multi_day_cycle: boolean;
  has_multi_day_cycle_cta_tile: boolean;
  sleep_state: string;
  day_zero: boolean;
}

export interface JournalMetadata {
  journal_completed: boolean;
  has_recovery: boolean;
  has_cycle: boolean;
  journal_enabled: boolean;
  display_cycle_state: string;
  should_auto_pop: boolean;
  previous_cycle_during: TimeInterval;
  has_enough_recoveries: boolean;
}

export interface UserMetadata {
  avatar_url: string;
  profile_raf_destination: string | null;
}

export interface WhoopLiveMetadata {
  day_strain: number;
  recovery_score: number;
  ms_of_sleep: number;
  calories: number;
}

export interface Activity {
  title: string;
  score_display: string;
  start_time_text: string;
  end_time_text: string;
  icon_url: string;
  secondary_icon_url: string | null;
  status: string;
  type: string;
  activity_v2_id: string;
  sport_id: number;
  internal_name: string;
  during: TimeInterval;
  detected_activity_metadata: any | null;
  destination: any;
}

export interface KeyStatistic {
  trend_key: string;
  title: string;
  current_value_display: string;
  thirty_day_value_display: string;
  state: string;
  icon: string;
  style: string;
}

export interface Gauge {
  title: string;
  title_end_icon: string;
  destination: any;
  id: string;
  score_display: string;
  score_display_style: string;
  score_display_suffix: string | null;
  gauge_fill_percentage: number;
  score_target: number | null;
  lower_optimal_percentage: number | null;
  higher_optimal_percentage: number | null;
  progress_fill_style: string;
  bar_styles: any | null;
}

export interface HomeMetadata {
  cycle_metadata: CycleMetadata;
  journal_metadata: JournalMetadata;
  user_metadata: UserMetadata;
  whoop_live_metadata: WhoopLiveMetadata;
  autopop_metadata: any;
  ai_context_metadata: any;
  experiment_ids: any[];
}

export interface HomeResponse {
  metadata: HomeMetadata;
  fab_menu: any | null;
  header: {
    content: {
      id: string;
      gauges: Gauge[];
      header_item: any | null;
    };
    type: string;
  };
  pillars: any[];
  day_one_transition: any | null;
}

export interface RecoveryMetric {
  id: string;
  icon: string;
  title: string;
  status: string;
  status_subtitle: string;
  metric_style: string;
  status_icon: string;
  status_type: string;
  destination: any;
  bar_styles: any | null;
}

export interface RecoveryScoreGauge {
  title_image_url: string | null;
  score_display_title: string;
  destination: any;
  id: string;
  score_display: string;
  score_display_style: string | null;
  score_display_suffix: string;
  gauge_fill_percentage: number;
  score_target: number | null;
  lower_optimal_percentage: number | null;
  higher_optimal_percentage: number | null;
  progress_fill_style: string;
  bar_styles: any | null;
}

export interface RecoveryContributorsTile {
  id: string;
  metrics: RecoveryMetric[];
  legend: any | null;
  tile_legend: {
    type: string;
    content: {
      title: string;
      subtitle: string;
      icons: Array<{
        icon: string;
        type: string;
      }>;
    };
  };
  footer: {
    items: Array<{
      type: string;
      content: {
        header: string | null;
        style: string;
        vow: string;
        icon: string | null;
        entrypoint: {
          entry_text: string;
          signature: string;
        };
        destination: any;
      };
    }>;
  };
}

export interface RecoveryDeepDiveHeader {
  title: string;
  end_icon: string;
  deep_dive_score_type: string;
  destination: any;
}

export interface RecoveryDeepDiveSection {
  items: Array<{
    type: string;
    content: RecoveryScoreGauge | RecoveryContributorsTile | { path: string };
  }>;
  id: string | null;
  section_type: string;
}

export interface RecoveryDeepDiveResponse {
  metadata: {
    ai_context_metadata: {
      is_wce_enabled: boolean;
      destination: any;
    };
  };
  header: RecoveryDeepDiveHeader;
  sections: RecoveryDeepDiveSection[];
}

export interface StrainMetric {
  id: string;
  icon: string;
  title: string;
  status: string;
  status_subtitle: string;
  metric_style: string;
  status_icon: string;
  status_type: string;
  destination: any;
  bar_styles: any | null;
}

export interface StrainScoreGauge {
  title_image_url: string | null;
  score_display_title: string;
  destination: any;
  id: string;
  score_display: string;
  score_display_style: string | null;
  score_display_suffix: string | null;
  gauge_fill_percentage: number;
  score_target: number | null;
  lower_optimal_percentage: number | null;
  higher_optimal_percentage: number | null;
  progress_fill_style: string;
  bar_styles: any | null;
}

export interface StrainContributorsTile {
  id: string;
  metrics: StrainMetric[];
  legend: any | null;
  tile_legend: {
    type: string;
    content: {
      title: string;
      subtitle: string;
      icons: Array<{
        icon: string;
        type: string;
      }>;
    };
  };
  footer: {
    items: Array<{
      type: string;
      content: {
        header: string | null;
        style: string;
        vow: string;
        icon: string | null;
        entrypoint: {
          entry_text: string;
          signature: string;
        };
        destination: any;
      };
    }>;
  };
}

export interface StrainActivity {
  title: string;
  score_display: string;
  start_time_text: string;
  end_time_text: string;
  icon_url: string;
  secondary_icon_url: string | null;
  status: string;
  type: string;
  activity_v2_id: string;
  sport_id: number;
  internal_name: string;
  during: TimeInterval;
  detected_activity_metadata: any | null;
  destination: any;
}

export interface StrainDeepDiveHeader {
  title: string;
  end_icon: string;
  deep_dive_score_type: string;
  destination: any;
}

export interface StrainDeepDiveSection {
  items: Array<{
    type: string;
    content:
      | StrainScoreGauge
      | StrainContributorsTile
      | StrainActivity
      | { path: string }
      | any;
  }>;
  id: string | null;
  section_type: string;
}

export interface StrainDeepDiveResponse {
  metadata: {
    ai_context_metadata: {
      is_wce_enabled: boolean;
      destination: any;
    };
  };
  header: StrainDeepDiveHeader;
  sections: StrainDeepDiveSection[];
}

export interface HealthspanAmoeba {
  style_values: {
    age: number;
    pace_of_aging: number;
    years_difference: number;
    years_difference_animation_score: number;
    pace_of_aging_animation_score: number;
  };
  age_value_display: string;
  age_title_display: string;
  age_subtitle_display: string;
  age_subtitle_style: string;
  years_difference_value_display: string;
  years_difference_value_style: string;
  years_difference_subtitle_display: string;
  pace_of_aging_display: string;
  pace_of_aging_subtitle_display: string;
  is_calibrating: boolean;
}

export interface HealthspanDatePicker {
  current_date_range_display: string;
  next_date_time: string | null;
  previous_date_time: string;
}

export interface HealthspanUnlockedContent {
  date_picker: HealthspanDatePicker;
  is_calibrating: boolean;
  whoop_age_amoeba: HealthspanAmoeba;
  previous_whoop_age_amoeba: HealthspanAmoeba;
}

export interface HealthspanResponse {
  metadata: {
    ai_context_metadata: {
      is_wce_enabled: boolean;
      destination: any;
    };
  };
  navigation_title: string;
  navigation_subtitle: string;
  navigation_destination: any;
  unlocked_content: HealthspanUnlockedContent;
}
