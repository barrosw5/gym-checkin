import type { Meta, StoryObj } from "@storybook/react-vite";
import Card from "./Card";
import PageLayout from "./PageLayout";

const meta = {
  title: "UI/PageLayout",
  component: PageLayout,
  // The layout is the whole page: no Storybook padding around it
  parameters: { layout: "fullscreen" },
  args: {
    title: "Bem-vindo, João Silva!",
    subtitle: "Quarto: 501",
    children: (
      <>
        <Card title="Um cartão">Conteúdo</Card>
        <Card title="Outro cartão">Mais conteúdo</Card>
      </>
    ),
  },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Student pages: one column, phone first. */
export const Narrow: Story = {};

/** Reception/admin desks on a PC. */
export const Wide: Story = { args: { width: "wide", title: "Painel da receção", subtitle: "Olá, Maria Receção." } };

export const OnPhone: Story = { globals: { viewport: { value: "mobile1" } } };
