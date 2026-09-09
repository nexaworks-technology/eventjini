import { getBudgets } from "@/app/actions/os";
import BudgetClient from "./budget-client";

interface BudgetPageProps {
  params: Promise<{ id: string }>;
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const resolvedParams = await params;
  const rawBudgets = await getBudgets(resolvedParams.id);

  const mappedBudgets = rawBudgets.map((b: any) => ({
    id: b.id,
    category: b.category,
    estimated: (b.estimated_amount_cents || 0) / 100,
    actual: (b.actual_amount_cents || 0) / 100,
  }));

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-white tracking-tight">Budget & Expenses</h1>
      <BudgetClient initialBudgets={mappedBudgets} />
    </div>
  );
}
