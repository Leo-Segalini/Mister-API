'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Mettre à jour l'état pour que le prochain rendu affiche l'UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log l'erreur pour le debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez rendre n'importe quelle UI de fallback personnalisée
      return this.props.fallback || (
        <div className="p-2 text-sm text-gray-500">
          {/* Composant temporairement indisponible */}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 