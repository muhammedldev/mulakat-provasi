import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Beklenmedik uygulama hatası:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-shell">
        <div className="screen intro-screen">
          <div className="intro-badge">😕 Bir şeyler ters gitti</div>
          <h1 style={{ marginTop: 16 }}>Uygulama beklenmedik bir hatayla karşılaştı</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 12 }}>
            İlerlemen bu cihazda saklı, kaybolmadı. Sayfayı yenileyerek devam edebilirsin.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={this.handleReload}>
            Yeniden Yükle
          </button>
        </div>
      </main>
    );
  }
}
