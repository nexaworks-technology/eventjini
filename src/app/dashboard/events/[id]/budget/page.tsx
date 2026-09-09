import { getBudgets } from "@/app/actions/event-management";
import BudgetClient from "./budget-client";

interface BudgetPageProps {
  params: Promise<{ id: string }>;
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const resolvedParams = await params;
  const { data: budgets } = await getBudgets(resolvedParams.id);

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">Budget & Expenses</h1>
      <BudgetClient initialBudgets={budgets || []} />
    </div>
  );
}
