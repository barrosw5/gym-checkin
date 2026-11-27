import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import ImportPanel from "./ImportPanel";

const meta = {
  title: "Admin/ImportPanel",
  component: ImportPanel,
  args: { result: null, busy: false, readOnly: false, onImport: fn(), onClearResult: fn() },
  decorators: [(Story) => <div className="max-w-5xl">{Story()}</div>],
} satisfies Meta<typeof ImportPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Importing: Story = { args: { busy: true } };
export const InDemo: Story = { args: { readOnly: true } };
export const Errors: Story = {
  args: {
    result: {
      ok: false,
      errors: [
        { line: 2, messages: [{ key: "errors.import.nameRequired" }] },
        { line: 3, messages: [{ key: "errors.import.exists", params: { username: "ana.ferreira" } }] },
      ],
    },
  },
};
/** Temporary passwords are shown once, then hidden. */
export const Imported: Story = {
  args: {
    result: {
      ok: true,
      created: [
        { name: "Inês Rocha", username: "ines.rocha", temporaryPassword: "q7Vt2mLx9cNe" },
        { name: "João Pires", username: "joao.pires", temporaryPassword: "Hb4sP0wZr1Ka" },
      ],
    },
  },
};
