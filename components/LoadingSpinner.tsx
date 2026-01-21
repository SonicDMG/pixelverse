export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="pixel-dot animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="pixel-dot animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="pixel-dot animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

// Made with Bob
