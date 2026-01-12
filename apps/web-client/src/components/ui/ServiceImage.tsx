'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ServiceImageProps extends Omit<ImageProps, 'src'> {
    src: string;
    fallbackSrc?: string;
    category?: 'service' | 'header' | 'icon';
}

const FALLBACK_IMAGES = {
    service: '/images/placeholders/service-def.png',
    header: '/images/placeholders/header-def.jpg',
    icon: '/images/placeholders/icon-def.svg'
};

export function ServiceImage({
    src,
    fallbackSrc,
    category = 'service',
    alt,
    className,
    ...props
}: ServiceImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc || FALLBACK_IMAGES[category]);
        }
    };

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt || 'Service Image'}
            className={`${className} ${hasError ? 'opacity-80 grayscale' : ''}`}
            onError={handleError}
        />
    );
}
