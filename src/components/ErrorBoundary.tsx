import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);
      return (
        <div className="flex min-h-screen items-center justify-center bg-birch-50 px-6">
          <div className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center">
            <h1 className="font-serif text-xl text-charcoal">페이지를 표시하는 중 오류가 발생했습니다</h1>
            <p className="mt-3 text-sm text-red-600">{this.state.error.message}</p>
            <pre className="mt-4 max-h-48 overflow-auto rounded-xl bg-red-50 p-3 text-left text-xs text-red-700">
              {this.state.error.stack}
            </pre>
            <button onClick={this.reset} className="btn-outline mt-6 text-sm">다시 시도</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
