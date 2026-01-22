import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Route-level loading component
 * Displayed while the page is loading
 */
export default function Loading() {
  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-pixel text-[#00ff9f] glow-text mb-8">
          PIXELTICKER
        </h1>
        <LoadingSpinner />
      </div>
    </div>
  );
}

// Made with Bob