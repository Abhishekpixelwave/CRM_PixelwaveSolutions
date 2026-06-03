import { fetchRevenueShareAction } from "@/app/(dashboard)/revenue-share/actions";
import { ShareRevenueButton } from "@/components/share-revenue-button";

export async function ShareRevenueHeaderButton() {
  try {
    const { summary } = await fetchRevenueShareAction();
    return (
      <ShareRevenueButton
        size="sm"
        pendingAmount={summary.totalPending}
      />
    );
  } catch {
    return <ShareRevenueButton size="sm" />;
  }
}
