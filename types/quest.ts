export interface Quest {
  id: string;
  name: string;
  description: string;
  reward: number;
  rewardsCount: number;
  startDate: string;
  endDate: string;
  tokenPolicyId: string;
  tokenName: string;
  avatars?: string;
  media?: string[];
}
