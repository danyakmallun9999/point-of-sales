import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            src="/logoPOS.png" 
            alt="POSO" 
            className={`${className || ''} object-contain`}
            {...props} 
        />
    );
}