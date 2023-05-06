import typography from '../tokens/typography';
import colors from '../tokens/colors';
import React from 'react';

type TagProps = {
    children: React.ReactNode;
    color: 'blue' | 'purple' | 'green';
};
const colorHexMap = {
    'blue': colors['primary']['200'],
    'purple': colors['secondary']['200'],
    'green': colors['tertiary']['200'],
};

const typographyMap = typography['screen']['Paragraph 1 Regular'];

export default function Tag({ children, color}: TagProps) {

    const style = {
        backgroundColor: colorHexMap[color],
        padding: '4px 12px',
        borderRadius: '100px',
        color: '#1F1F1F',
        display: 'flex',
        alignItems: 'center',
        width: 'fit-content',
        ...typographyMap
    };
    children = children || "Place (Radius)"
    color = color || "blue"
    return (
        <div style={style}>
            {children}
        </div>
    );
};

Tag.defaultProps = {
    children: "Place (Radius)",
    color: "blue",
};

