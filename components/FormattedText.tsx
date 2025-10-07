import React from 'react';

// This component will parse a string for markdown-like syntax (**bold**, *italic*)
// and render it as styled React elements.
export const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    // A regex to capture **bold**, *italic*, or _italic_ text.
    const regex = /(\*\*.*?\*\*)|(\*.*?\*)|(_.*?_)/g;
    
    // Process each line separately to preserve line breaks.
    return (
        <>
            {text.split('\n').map((line, lineIndex) => {
                // If a line is empty, render a break to create a paragraph-like gap.
                if (line.trim() === '') {
                    return <br key={lineIndex} />;
                }
                
                const parts = line.split(regex).filter(Boolean);

                return (
                    <p key={lineIndex} className="my-1">
                        {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                            }
                            if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
                                return <em key={partIndex}>{part.slice(1, -1)}</em>;
                            }
                            // Return plain text parts as they are.
                            return <React.Fragment key={partIndex}>{part}</React.Fragment>;
                        })}
                    </p>
                );
            })}
        </>
    );
};
