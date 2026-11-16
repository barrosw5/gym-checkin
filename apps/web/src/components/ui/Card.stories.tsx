import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "./Button";
import Card from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  args: { children: <p>Conteúdo do cartão.</p> },
  decorators: [(Story) => <div className="max-w-md bg-slate-50 p-4">{Story()}</div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {};
export const WithTitle: Story = { args: { title: "Pedidos de entrada" } };
export const WithTitleAndAction: Story = {
  args: {
    title: "Sessões de hoje",
    action: <Button variant="ghost">Atualizar</Button>,
  },
};
