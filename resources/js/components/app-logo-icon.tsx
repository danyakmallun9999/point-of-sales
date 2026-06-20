import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            src="/logoPOS.png" 
            alt="Brew & Bytes POS" 
            className={`${className || ''} object-contain`}
            {...props} 
        />
    );
}