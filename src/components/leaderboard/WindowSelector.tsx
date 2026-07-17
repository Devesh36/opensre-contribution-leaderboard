import {
  DEFAULT_WINDOW_PRESET,
  WINDOW_PRESET_OPTIONS,
  getWindowPresetOption,
  type WindowPresetId,
} from "@/lib/leaderboard/window-presets";
import { buildLeaderboardHref } from "./nav";
import { SegmentControl, SegmentLink } from "./SegmentControl";

type WindowSelectorProps = {
  currentPreset: WindowPresetId;
  currentView?: "top" | "new";
};

export function WindowSelector({
  currentPreset,
  currentView = "top",
}: WindowSelectorProps) {
  const activeOption = getWindowPresetOption(currentPreset);

  return (
    <section
      aria-label="Time window selection"
      className="doc-card anim-fade-in-up anim-stagger-5 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="doc-kicker">Time window</p>
          <p className="mt-2 text-sm text-[#e5e5e5]">{activeOption.description}</p>
        </div>
        <p className="doc-meta shrink-0 sm:text-right">
          Active: <span className="text-white">{activeOption.label}</span>
        </p>
      </div>

      <div className="mt-4">
        <p className="scroll-hint mb-2 sm:hidden">Swipe for more windows →</p>
        <SegmentControl aria-label="Time window presets" fullWidth>
          {WINDOW_PRESET_OPTIONS.map((option) => {
            const isActive = option.id === currentPreset;
            const href = buildLeaderboardHref({
              window: option.id === DEFAULT_WINDOW_PRESET ? undefined : option.id,
              view: currentView === "top" ? undefined : currentView,
            });

            return (
              <SegmentLink key={option.id} href={href} isActive={isActive}>
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">{option.shortLabel}</span>
              </SegmentLink>
            );
          })}
        </SegmentControl>
      </div>
    </section>
  );
}
