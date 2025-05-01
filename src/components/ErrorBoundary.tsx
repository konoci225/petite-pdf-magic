import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🛑 Caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo: error.toString() });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 p-4 border border-red-600 rounded">
          <h2>Une erreur est survenue :</h2>
          <pre>{this.state.errorInfo}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
