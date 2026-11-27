import type { Meta, StoryObj } from "@storybook/react-vite";
import Card from "./Card";
import PageLayout from "./PageLayout";

const meta = {
  title: "UI/PageLayout",
  component: PageLayout,
  // The layout is the whole page: no Storybook padding around it
  parameters: { layout: "fullscreen" },
  args: {
    title: "Ginásio Demo",
    children: <Card title="Um cartão">Conteúdo</Card>,
  },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OnPhone: Story = { globals: { viewport: { value: "mobile1" } } };
