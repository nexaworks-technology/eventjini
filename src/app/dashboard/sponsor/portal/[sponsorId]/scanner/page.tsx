import SponsorScannerClient from "./scanner-client";

export default async function SponsorScannerPage({
  params,
}: {
  params: Promise<{ sponsorId: string }> | { sponsorId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const sponsorId = resolvedParams.sponsorId;
  
  return (
    <div className="flex-1 overflow-y-auto w-full relative">
      <SponsorScannerClient sponsorId={sponsorId} />
    </div>
  );
}
