export interface MatchInput {
  myTeamDescription: string;
  opponentsDescription: string;
  image?: string;
}

export interface TacticalPlan {
  summary: string;
  main_target: string;
  tactical_checklist: string[];
  traps_to_avoid: string[];
  offensive_strategy: string[]; // Simplified for checklist
  defensive_strategy: string[]; // Simplified for checklist
}

export interface MatchHistory {
  id: string;
  date: string;
  opponent: string;
  result: string;
  score: string;
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
