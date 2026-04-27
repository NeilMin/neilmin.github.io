import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../app/App";

describe("App", () => {
  it("renders the landing call to action", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /开始测试/i })).toBeInTheDocument();
  });

  it("shows the first question after starting the assessment", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /开始测试/i }));

    expect(screen.getByText(/周五傍晚突然塞来脏活/i)).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(7);
  });

  it("moves to the next question after answering and clicking next", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /开始测试/i }));
    fireEvent.click(screen.getAllByRole("radio")[0]);
    fireEvent.click(screen.getByRole("button", { name: /下一题/i }));

    expect(screen.getByText(/接到陌生需求时/i)).toBeInTheDocument();
  });

  it("shows a result screen after answering all questions", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /开始测试/i }));

    for (let index = 0; index < 19; index += 1) {
      fireEvent.click(screen.getAllByRole("radio")[0]);
      fireEvent.click(screen.getByRole("button", { name: /下一题/i }));
    }

    fireEvent.click(screen.getAllByRole("radio")[0]);
    fireEvent.click(screen.getByRole("button", { name: /查看结果/i }));

    expect(screen.getAllByText("COPW").length).toBeGreaterThan(0);
  });
});
