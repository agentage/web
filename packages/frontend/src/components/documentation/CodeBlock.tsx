'use client';

import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock = ({ code, language = 'typescript', className = '' }: CodeBlockProps) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  return (
    <div className={`bg-gray-900 rounded-lg overflow-x-auto ${className}`}>
      <pre className="text-sm !bg-transparent !m-0 !p-4">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};
