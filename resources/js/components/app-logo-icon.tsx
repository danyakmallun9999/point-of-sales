import type { SVGAttributes } from 'react';

export default function TransactionIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg 
            {...props} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#333333" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Layar / Mesin */}
            <rect x="4" y="4" width="16" height="12" rx="2" ry="2" />
            
            {/* Tombol/Laci bawah */}
            <path d="M2 20h20" />
            <path d="M12 16v4" />
            <path d="M8 16v4" />
            <path d="M16 16v4" />
            
            {/* Detail di layar */}
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="12" y2="12" />
        </svg>
    );
}