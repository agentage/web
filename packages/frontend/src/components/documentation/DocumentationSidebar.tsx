'use client';

import { useEffect, useState } from 'react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
}

interface DocumentationSidebarProps {
  title?: string;
  items: NavigationItem[];
  className?: string;
}

export const DocumentationSidebar = ({
  title = 'Table of Contents',
  items,
  className = '',
}: DocumentationSidebarProps) => {
  // Initialize with first item as active
  const [activeSection, setActiveSection] = useState<string>(
    items.length > 0 ? items[0].href.replace('#', '') : ''
  );

  // Handle smooth scrolling to sections
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Update URL without triggering page reload
      window.history.pushState(null, '', href);
      setActiveSection(targetId);
    }
  };

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = items
        .map((item) => document.getElementById(item.href.replace('#', '')))
        .filter(Boolean) as HTMLElement[];

      const scrollPosition = window.scrollY + 100; // Offset for header

      let foundActiveSection = false;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          foundActiveSection = true;
          break;
        }
      }

      // If no section is found (e.g., at the very top), keep the first one active
      if (!foundActiveSection && items.length > 0) {
        setActiveSection(items[0].href.replace('#', ''));
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call handleScroll once to check initial position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  return (
    <div className={`lg:col-span-1 ${className}`}>
      <div className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto">
        <nav className="space-y-1">
          <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
          <div className="space-y-2 text-sm">
            {items.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={`block py-1 border-l-2 pl-3 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-blue-600 border-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600 border-transparent hover:border-blue-600'
                  }`}
                  data-testid={`sidebar-link-${item.id}`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
