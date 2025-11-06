import Link from 'next/link';

export const Header = () => {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Agentage
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
            <Link href="/status" className="text-gray-700 hover:text-gray-900">
              Status
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};
