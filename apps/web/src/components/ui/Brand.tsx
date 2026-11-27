import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { ICON } from "./icon";

/**
 * The mark and the name. "/" sends each role to its own home (RoleHome), so
 * the way back is the same on every page. 44 px tall: an easy tap target.
 */
export default function Brand() {
  const { t } = useTranslation();

  return (
    <Link to="/" title={t("common.goHome")} className="flex min-h-11 w-fit items-center gap-2.5 rounded-lg">
      {/* Flat lime roundel: the brand mark (no logo file, by decision) */}
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-accent text-on-accent">
        <Dumbbell {...ICON} />
      </span>
      <span className="text-[15px] font-semibold text-ink">{t("layout.appName")}</span>
    </Link>
  );
}
