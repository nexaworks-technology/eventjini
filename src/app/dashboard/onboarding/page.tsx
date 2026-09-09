import OnboardingClient from "./onboarding-client";

export const metadata = {
  title: "Create Workspace | EventJini",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <OnboardingClient />
    </div>
  );
}
