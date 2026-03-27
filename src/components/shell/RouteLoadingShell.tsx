import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PageSpinner } from "@/components/ui/PageSpinner";

export function RouteLoadingShell() {
  return (
    <div className="route-loading-root">
      <SiteHeader />
      <main className="route-loading-main">
        <PageSpinner />
      </main>
      <SiteFooter />
    </div>
  );
}
