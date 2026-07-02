"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 text-white gap-4 p-6">
          <p className="text-sm text-white/80 text-center max-w-md">
            Map failed to load. Try refreshing the page or switching regions again.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover rounded-lg transition-colors"
          >
            Retry map
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
