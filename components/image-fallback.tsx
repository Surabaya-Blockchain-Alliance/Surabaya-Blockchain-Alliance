import { useState } from 'react';

interface ImageWithFallbackProps {
    src: string;
    alt?: string;
}

export default function ImageWithFallback({ src, alt = 'Event image' }: ImageWithFallbackProps) {
    const [hasError, setHasError] = useState(false);

    return (
        <div className="relative h-96 w-full">
            {!hasError ? (
                <img
                    src={src}
                    alt={alt}
                    className="h-full w-full object-cover border rounded-lg"
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-600 border rounded-lg">
                    <span>Failed to load image</span>
                </div>
            )}
        </div>
    );
}
