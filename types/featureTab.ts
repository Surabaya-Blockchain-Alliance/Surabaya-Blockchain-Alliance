export type FeatureTab = {
  id: number;
  title: string;
  desc1: string;
  desc2: string;
  videoUrl: string;
};

export type FeatureTabGroup = {
  tab_name: string;
  description: string;
  features: FeatureTab[];
};
