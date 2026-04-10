interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'size-5 border-2',
    md: 'size-8 border-2',
    lg: 'size-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} border-zinc-700 border-t-amber-500 rounded-full animate-spin`}
      />
      {message && <p className="text-zinc-400 text-sm">{message}</p>}
    </div>
  );
}

export function PageLoading({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );
}
