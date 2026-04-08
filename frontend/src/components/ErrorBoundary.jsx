import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree and displays fallback UI
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error("Error caught by boundary:", error, errorInfo);
        }

        // You can also log to an error reporting service here
        // Example: logErrorToService(error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="rounded-full bg-red-100 p-4">
                                <AlertTriangle className="w-12 h-12 text-red-600" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Đã xảy ra lỗi
                        </h1>

                        {/* Description */}
                        <p className="text-gray-600 mb-6">
                            Xin lỗi, có lỗi xảy ra khi hiển thị trang này. Vui lòng thử làm mới trang hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục.
                        </p>

                        {/* Error Details (Development only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mb-6 text-left bg-gray-100 rounded p-4">
                                <summary className="cursor-pointer font-semibold text-sm text-gray-700 mb-2">
                                    Chi tiết lỗi (Dev mode)
                                </summary>
                                <pre className="text-xs text-red-600 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => window.location.href = "/"}
                                className="px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 transition-colors font-medium"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
