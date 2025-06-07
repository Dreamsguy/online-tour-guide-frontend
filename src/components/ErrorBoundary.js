import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen pt-24 text-center text-lg text-red-500">
          <h2>Произошла ошибка</h2>
          <p>{this.state.error?.message || 'Неизвестная ошибка'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-black text-white p-3 rounded-lg hover:bg-gray-800"
          >
            Обновить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;