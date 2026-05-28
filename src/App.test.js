import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";

jest.mock("@monaco-editor/react", () => ({
  Editor: ({ value, onChange }) => (
    <textarea
      aria-label="Editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

beforeEach(() => {
  localStorage.clear();
});

test("renders the NotepadMac shell", () => {
  render(<App />);

  expect(screen.getByText("NotepadMac")).toBeInTheDocument();
  expect(screen.getByText("Explorer")).toBeInTheDocument();
  expect(screen.getAllByText("untitled.txt").length).toBeGreaterThan(0);
  expect(screen.getByLabelText("Editor").value).toContain("Welcome to NotepadMac");
});

test("creates a new file tab", () => {
  render(<App />);

  fireEvent.click(screen.getAllByLabelText("New file")[0]);

  expect(screen.getAllByText("untitled.txt").length).toBeGreaterThan(1);
  expect(screen.getByLabelText("Editor")).toHaveValue("");
});

test("toggles dark mode", () => {
  render(<App />);

  const darkModeButton = screen.getByLabelText("Dark mode");
  fireEvent.click(darkModeButton);

  expect(darkModeButton).toHaveAttribute("aria-pressed", "true");
});

test("changes the active file language", async () => {
  render(<App />);

  fireEvent.mouseDown(screen.getByLabelText("Language"));
  const listbox = await screen.findByRole("listbox");
  fireEvent.click(within(listbox).getByText("JavaScript"));

  expect(screen.getAllByText("javascript").length).toBeGreaterThan(0);
});
