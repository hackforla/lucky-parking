type Typography = {
    [key: string]: {
            [key: string]: {
                fontFamily: string;
                fontSize: string;
                fontWeight: number;
                lineHeight: number;
                letterSpacing?: string;
            };
    };
};

const typography: Typography =  {
    large: {
        'Headline 1': {
            fontFamily: 'Work Sans',
            fontSize: '55px',
            fontWeight: 600,
            lineHeight: 1.2,
        }, 
        'Headline 2': {
            fontFamily: 'Work Sans',
            fontSize: '40px',
            fontWeight: 600,
            lineHeight: 1.2,
        },
        'Headline 3': {
            fontFamily: 'Work Sans',
            fontSize: '30px',
            fontWeight: 600,
            lineHeight: 1.2,
        },
        'Headline 4': {
            fontFamily: 'Work Sans',
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: 1.2,
        },
        'Headline 5': {
            fontFamily: 'Work Sans',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: 1.2,
        },
        'Paragraph 1 Regular': {
            fontFamily: 'Work Sans',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: 1.40,
        },
        'Paragraph 1 Medium': {
            fontFamily: 'Work Sans',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: 1.40,
        },
        'Paragraph 1 SemiBold': {
            fontFamily: 'Work Sans',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: 1.40,
        },
        'Paragraph 2 Regular': {
            fontFamily: 'Work Sans',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 1.40,
        },
        'Paragraph 2 Medium': {
            fontFamily: 'Work Sans',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.40,
        },
        'Paragraph 2 SemiBold': {
            fontFamily: 'Work Sans',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 1.40,
        },
        'Paragraph 3 Regular': {
            fontFamily: 'Work Sans',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: 1.40,
        },
        'Paragraph 3 Medium': {
            fontFamily: 'Work Sans',
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: 1.40,
        },
        'Paragraph 3 SemiBold': {
            fontFamily: 'Work Sans',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: 1.40,
        },
        'BUTTON': {
            fontFamily: 'Work Sans',
            fontSize: '14px',
            fontWeight: 700,
            lineHeight: 1.40,
            letterSpacing: '0.03em',
        },
    },
    small: {
        'Headline 1 Small': {
            fontFamily: 'Work Sans',
            fontSize: '34px',
            fontWeight: 400,
            lineHeight: 1.50,
            letterSpacing: '0.25px'
        },
        'Headline 2 Small': {
            fontFamily: 'Work Sans',
            fontSize: '24px',
            fontWeight: 600,
            lineHeight: 1.50,
        },
        'Headline 3 M': {
            fontFamily: 'Work Sans',
            fontSize: '22px',
            fontWeight: 500,
            lineHeight: 1.50,
            letterSpacing: '0.15px'
        },
        'Subtitle 1': {
            fontFamily: 'Work Sans',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: 1.50,
            letterSpacing: '0.15px'
        },
        'Body 1 Small': {
            fontFamily: 'Work Sans',
            fontSize: '18px',
            fontWeight: 500,
            lineHeight: 1.50,
            letterSpacing: '0.5px'
        },
        'Body 2 Small': {
            fontFamily: 'Work Sans',
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: 1.50,
            letterSpacing: '0.25px'
        },
        'BUTTON SMALL': {
            fontFamily: 'Work Sans',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: 1.50,
            letterSpacing: '1.25px'
        },
        'OVERLINE': {
            fontFamily: 'Work Sans',
            fontSize: '12px',
            fontWeight: 700,
            lineHeight: 1.50,
            letterSpacing: '1.5px'
        },
        'Caption': {
            fontFamily: 'Work Sans',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: 1.50,
            letterSpacing: '0.4px'
        },
    }
};
export default typography;