"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Logo } from "./Logo";
import i18n from "@/i18n/config";

interface Props   { children: ReactNode; fallback?: ReactNode }
interface State   { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send to error monitoring (e.g. Sentry)
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-dvh bg-offwhite flex flex-col items-center justify-center px-4 py-16 text-center gap-6">
        <Logo size="md" variant="mark" />
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-heading font-bold text-navy">{i18n.t("common.errorTitle")}</h2>
          <p className="text-sm text-navy-400 max-w-sm mx-auto">
            {i18n.t("common.errorDescription")}
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-3 text-start text-xs bg-red-50 text-danger rounded-xl p-4 max-w-sm mx-auto overflow-x-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => this.reset()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> {i18n.t("common.tryAgain")}
          </button>
          <button
            onClick={() => { this.reset(); window.location.href = "/"; }}
            className="btn-primary"
          >
            {i18n.t("common.goHome")}
          </button>
        </div>
      </div>
    );
  }
}
