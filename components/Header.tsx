'use client';

import { UserButton, useUser } from '@clerk/nextjs';

export default function Header() {
  const { user } = useUser();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              Multi-Outils D&D 5e
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600 hidden sm:inline">
                Bienvenue, {user.firstName || user.emailAddresses[0].emailAddress}
              </span>
            )}
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>
    </header>
  );
}
