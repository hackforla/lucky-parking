import typography from '../tokens/typography';
import React from 'react';

type TagProps = {
    children: React.ReactNode;
    color: 'blue' | 'purple' | 'green';
};
const colorHexMap = {
    'blue': '#D4E7FA',
    'purple': '#EBDBFB',
    'green': '#B3ECEC',
};

const typographyMap = typography['large']['Paragraph 1 Regular'];

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

