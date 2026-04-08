import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { cn } from '../../lib/utils';

const Image = ({ src, alt, className, ...props }) => {
    return (
        <LazyLoadImage
            alt={alt}
            src={src}
            effect="blur"
            wrapperClassName={cn("w-full h-full", className)}
            className="w-full h-full object-cover"
            {...props}
        />
    );
};

export default Image;
