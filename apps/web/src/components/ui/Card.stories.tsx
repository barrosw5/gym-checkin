import type { Meta, StoryObj } from "@storybook/react-vite";
import Card from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  args: { children: <p className="text-sm text-ink-2">Conteúdo do cartão</p> },
  decorators: [(Story) => <div className="max-w-md bg-raised p-4">{Story()}</div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {};
export const WithTitle: Story = { args: { title: "Pedidos de entrada" } };
/** Quiet tabular meta on the right, e.g. a count. */
export const WithMeta: Story = { args: { title: "Sessões de hoje", meta: "2/7" } };
