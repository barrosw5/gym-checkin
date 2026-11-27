import type { Meta, StoryObj } from "@storybook/react-vite";
import Card from "./Card";
import Page from "./Page";

const meta = {
  title: "UI/Page",
  component: Page,
  parameters: { layout: "fullscreen" },
  args: {
    title: "Estatísticas",
    children: <Card title="Um cartão">Conteúdo</Card>,
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Narrow: Story = {};
export const Medium: Story = { args: { width: "medium" } };
export const Wide: Story = { args: { width: "wide" } };
export const WithSubtitle: Story = { args: { title: "Hoje no ginásio", subtitle: "João Silva" } };
