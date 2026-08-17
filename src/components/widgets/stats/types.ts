export type StatsTheme = 'default' | 'dark' | 'radical' | 'merko';

export interface StatsSettings {
  username: string;
  theme: StatsTheme;
  hideIssues: boolean;
  hidePRs: boolean;
  hideContrib: boolean;
}
