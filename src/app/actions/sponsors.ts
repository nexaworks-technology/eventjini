"use server";

export type SponsorshipTier = {
  id: string;
  name: string;
  price: number;
  slotsTotal: number;
  slotsAvailable: number;
  benefits: string[];
};

export type SponsorAnalyticsData = {
  jobTitles: { name: string; value: number }[];
  companySizes: { name: string; value: number }[];
};

// Mock data
let mockTiers: SponsorshipTier[] = [
  {
    id: "tier-1",
    name: "Platinum",
    price: 15000,
    slotsTotal: 2,
    slotsAvailable: 1,
    benefits: ["Prime booth location", "Logo on main stage", "5 VIP tickets"],
  },
  {
    id: "tier-2",
    name: "Gold",
    price: 10000,
    slotsTotal: 5,
    slotsAvailable: 3,
    benefits: ["Standard booth", "Logo on website", "3 VIP tickets"],
  },
];

export async function getSponsorshipTiers(_eventId: string): Promise<SponsorshipTier[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockTiers;
}

export async function createSponsorshipTier(data: Omit<SponsorshipTier, "id">): Promise<SponsorshipTier> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newTier: SponsorshipTier = {
    ...data,
    id: `tier-${Math.random().toString(36).substr(2, 9)}`,
  };
  mockTiers.push(newTier);
  return newTier;
}

export async function updateSponsorshipTier(id: string, data: Partial<Omit<SponsorshipTier, "id">>): Promise<SponsorshipTier | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const index = mockTiers.findIndex((t) => t.id === id);
  if (index === -1) return null;
  
  mockTiers[index] = { ...mockTiers[index], ...data };
  return mockTiers[index];
}

export async function getSponsorAnalytics(_eventId: string): Promise<SponsorAnalyticsData> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    jobTitles: [
      { name: "C-Level", value: 400 },
      { name: "VP/Director", value: 300 },
      { name: "Manager", value: 300 },
      { name: "Individual Contributor", value: 200 },
    ],
    companySizes: [
      { name: "1-50", value: 100 },
      { name: "51-200", value: 250 },
      { name: "201-1000", value: 450 },
      { name: "1000+", value: 400 },
    ],
  };
}
