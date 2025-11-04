export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen backdrop-blur-xs text-white">
      <h1 className="md:text-6xl text-3xl font-bold text-amber-500">404</h1>
      <p className="mt-4 text-sm">Oops — this page couldn’t be found.</p>
      <a
        href="/"
        className="mt-6 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition"
      >
        Go Home
      </a>
    </div>
  );
}
