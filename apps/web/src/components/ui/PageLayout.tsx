import LanguagePicker from "../LanguagePicker";
import ThemeToggle from "../ThemeToggle";
import Brand from "./Brand";
import Page, { type PageProps } from "./Page";

export type PageLayoutProps = PageProps;

/**
 * A page outside the app shell (login, forced password change, server down):
 * a quiet top bar with the name, language and theme, then the content.
 */
export default function PageLayout(props: PageLayoutProps) {
  return (
    <div className="min-h-svh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <LanguagePicker />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <Page {...props} />
    </div>
  );
}
