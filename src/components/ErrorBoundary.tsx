import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: (error: unknown, reset: () => void) => ReactNode;
  onReset?: () => void;
  onError?: (error: unknown, info: ErrorInfo) => void;
}

interface State {
  error: unknown;
}

/**
 * Catches render-phase errors — including a rejected promise thrown by React's
 * `use()` — and swaps the subtree for a fallback with a retry hook.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private reset = (): void => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error !== null) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}
