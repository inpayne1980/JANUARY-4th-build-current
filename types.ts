
export interface User {
  id: string;
  email: string;
  username: string;
  subscription: 'free' | 'pro';
  trialEndsAt: string;
  privacySettings?: {
    autoDeleteAfter24Months: boolean;
  };
}

export interface AdCampaign {
  id: string;
  productName: string;
  description: string;
  tone: string;
  status: 'draft' | 'rendering' | 'completed';
  assets: AdAsset[];
  createdAt: string;
}

export interface AdAsset {
  id: string;
  avatarName: string;
  avatarThumb: string;
  script: string;
  duration: number;
  clips: string[];
}

export interface LinkBlock {
  id: string;
  title: string;
  url: string;
  clicks: number;
  type: 'shop' | 'ad' | 'custom';
}

export interface ClickData {
  timestamp: string;
  clicks: number;
  source: string;
}
