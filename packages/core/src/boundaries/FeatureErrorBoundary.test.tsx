import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureErrorBoundary } from "./FeatureErrorBoundary";

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("feature error");
  return <span>ok</span>;
}

describe("FeatureErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <FeatureErrorBoundary featureName="Test">
        <span>child</span>
      </FeatureErrorBoundary>
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("catches errors and renders fallback", () => {
    render(
      <FeatureErrorBoundary
        featureName="Test"
        fallback={<div>Feature failed</div>}
      >
        <Thrower shouldThrow={true} />
      </FeatureErrorBoundary>
    );
    expect(screen.getByText("Feature failed")).toBeInTheDocument();
  });

  it("when silent, renders nothing on error", () => {
    const { container } = render(
      <FeatureErrorBoundary featureName="Test" silent>
        <Thrower shouldThrow={true} />
      </FeatureErrorBoundary>
    );
    expect(container.firstChild).toBeNull();
  });

  it("calls reporter when error is caught", () => {
    const reporter = { report: vi.fn() };
    render(
      <FeatureErrorBoundary
        featureName="Test"
        reporter={reporter}
        fallback={<div>Fail</div>}
      >
        <Thrower shouldThrow={true} />
      </FeatureErrorBoundary>
    );
    expect(reporter.report).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ boundaryName: "FeatureErrorBoundary", featureName: "Test" })
    );
  });
});
