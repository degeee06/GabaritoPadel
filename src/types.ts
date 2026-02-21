export interface MatchInput {
  myTeamDescription: string;
  opponentsDescription: string;
}

export interface TacticalPlan {
  summary: string;
  main_target: string;
  tactical_checklist: string[];
  traps_to_avoid: string[];
  offensive_strategy: string[];
  defensive_strategy: string[];
}

export interface Match {
  id: string;
  created_at: string;
  my_team_description: string;
  opponents_description: string;
  image_url?: string;
  tactical_plan: TacticalPlan;
  result?: string;
  score?: string;
}
