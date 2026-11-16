import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import SegmentedControl from "./SegmentedControl";

const meta = {
  title: "UI/SegmentedControl",
  component: SegmentedControl,
  args: {
    label: "Período",
    options: [
      { value: "today", label: "Hoje" },
      { value: "week", label: "7 dias" },
      { value: "month", label: "30 dias" },
      { value: "quarter", label: "3 meses" },
    ],
    value: "week",
    onChange: fn(),
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TwoOptions: Story = {
  args: {
    label: "Vista",
    options: [
      { value: "list", label: "Lista" },
      { value: "timeline", label: "Linha do tempo" },
    ],
    value: "timeline",
  },
};
