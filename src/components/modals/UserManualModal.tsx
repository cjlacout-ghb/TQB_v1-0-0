'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Language, UserManualSection } from '@/lib/types';
import { userManualEN } from '@/data/userManualEN';
import { userManualES } from '@/data/userManualES';

interface UserManualModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserManualModal({ isOpen, onClose }: UserManualModalProps) {
    const [language, setLanguage] = useState<Language>('en');
    const [activeSection, setActiveSection] = useState<string>('introduction');

    const content: UserManualSection[] = language === 'en' ? userManualEN : userManualES;

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className="modal-content animate-slide-up"
                role="dialog"
                aria-modal="true"
                aria-labelledby="manual-title"
            >
                <div className="card max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="card-header flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 id="manual-title" className="text-xl font-bold text-white">
                                📖 {language === 'en' ? 'User Manual' : 'Manual de Usuario'}
                            </h2>

                            {/* Language Toggle */}
                            <div className="flex items-center bg-dark-700 rounded-lg p-1">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${language === 'en'
                                            ? 'bg-primary-500 text-white'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    ENG
                                </button>
                                <button
                                    onClick={() => setLanguage('es')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${language === 'es'
                                            ? 'bg-primary-500 text-white'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    ESP
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Navigation */}
                        <nav className="w-56 flex-shrink-0 border-r border-dark-500 overflow-y-auto p-4 hidden md:block">
                            <ul className="space-y-1">
                                {content.map((section) => (
                                    <li key={section.id}>
                                        <button
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${activeSection === section.id
                                                    ? 'bg-primary-500/20 text-primary-400 border-l-2 border-primary-500'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {section.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Mobile Section Selector */}
                        <div className="md:hidden p-4 border-b border-dark-500 flex-shrink-0">
                            <select
                                value={activeSection}
                                onChange={(e) => setActiveSection(e.target.value)}
                                className="input text-sm"
                            >
                                {content.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {content.map((section) => (
                                <div
                                    key={section.id}
                                    className={activeSection === section.id ? 'block' : 'hidden'}
                                >
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        {section.title}
                                    </h3>
                                    <div
                                        className="prose prose-invert prose-sm max-w-none
                      prose-headings:text-white prose-headings:font-semibold
                      prose-p:text-gray-300 prose-p:leading-relaxed
                      prose-li:text-gray-300
                      prose-strong:text-white
                      prose-code:text-primary-400 prose-code:bg-dark-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-dark-700 prose-pre:border prose-pre:border-dark-500
                      prose-table:border-collapse
                      prose-th:bg-dark-700 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:border prose-th:border-dark-500
                      prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-dark-500
                      prose-hr:border-dark-500
                    "
                                        dangerouslySetInnerHTML={{
                                            __html: parseMarkdown(section.content)
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Simple markdown parser (basic implementation)
function parseMarkdown(text: string): string {
    let html = text;

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-400 hover:underline">$1</a>');

    // Tables
    html = html.replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.some(c => /^[-:]+$/.test(c.trim()))) {
            return ''; // Skip separator rows
        }
        const isHeader = match.includes('Column') || match.includes('Columna') ||
            match.includes('Game') || match.includes('Partido');
        const tag = isHeader ? 'th' : 'td';
        return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
    });

    // Wrap tables
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<table>$&</table>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Paragraphs (simple: split by double newlines)
    html = html.split(/\n\n+/).map(p => {
        p = p.trim();
        if (p.startsWith('<') || !p) return p;
        return `<p>${p}</p>`;
    }).join('\n');

    // Clean up newlines within paragraphs
    html = html.replace(/\n(?!<)/g, '<br>');

    return html;
}
