'use client';

export default function ErrorPage({ error, reset }) {
  return (
    <main className="bg-grey-100 min-h-[77vh] relative px-6 py-32 flex items-center justify-center">
      <div className="max-w-3xl text-center">
        <div>
          <h2 className="text-4xl sm:text-5xl uppercase font-bold bg-gradient-error bg-clip-text text-transparent mb-5">
            Uh oh! Something went wrong!
          </h2>
          <span className="w-full text-5xl sm:text-6xl">😢 🤯</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold max-w-lg mx-auto mt-5 mb-8">
          {error?.message || 'An unexpected error occurred.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-block bg-primary text-white uppercase text-base rounded-full px-10 py-4 transition-transform hover:-translate-y-0.5"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
