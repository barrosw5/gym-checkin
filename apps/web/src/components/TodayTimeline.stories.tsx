import type { Meta, StoryObj } from "@storybook/react-vite";
import TodayTimeline from "./TodayTimeline";

const at = (time: string) => new Date(`2026-01-07T${time}`);

const meta = {
  title: "Reception/TodayTimeline",
  component: TodayTimeline,
  args: {
    now: at("18:40:00"),
    sessions: [
      { id: "s1", name: "Ana Ferreira", room: "214", entryAt: at("07:10:00"), exitAt: at("08:20:00"), closedBy: "USER" },
      { id: "s2", name: "Rui Costa", room: "102", entryAt: at("07:25:00"), exitAt: at("08:50:00"), closedBy: "USER" },
      { id: "s3", name: "Maria Inês Albuquerque", room: "305", entryAt: at("13:05:00"), exitAt: at("13:50:00"), closedBy: "RECEPTION" },
      { id: "s4", name: "Tiago Matos", room: "411", entryAt: at("18:02:00"), exitAt: null, closedBy: null },
      { id: "s5", name: "Joana Reis", room: "118", entryAt: at("18:20:00"), exitAt: null, closedBy: null },
    ],
  },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
} satisfies Meta<typeof TodayTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Finished visits light, people still inside dark. */
export const Day: Story = {};
/** A forgotten key closed by the job stands out in orange. */
export const AutoClosed: Story = {
  args: {
    sessions: [{ id: "s9", name: "Rui Costa", room: "102", entryAt: at("06:00:00"), exitAt: at("10:00:00"), closedBy: "AUTO" }],
  },
};
