import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getCountryImageUrl, 
  getCountryGradient, 
  getCountryEmoji 
} from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

const DestinationCard = ({ 
  name, 
  slug, 
  image, 
  description, 
  highlights = [] 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Use the new image function, preferring prop if provided but falling back to country map
  const imageSource = image || getCountryImageUrl(name);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [imageSource]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoaded(true);
    setHasError(true);
  };

  const renderVisual = () => {
    if (hasError) {
      const gradientClass = getCountryGradient(name);
      return (
        <div className={cn("w-full h-full flex flex-col items-center justify-center p-6 text-center gradient-fallback", gradientClass)}>
          <span className="text-6xl mb-2 filter drop-shadow-lg transform scale-110 transition-transform duration-500 hover:scale-125">
            {getCountryEmoji(name)}
          </span>
          <span className="text-2xl font-bold text-white country-overlay drop-shadow-md">
            {name}
          </span>
        </div>
      );
    }

    return (
      <>
        {!isLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full z-10 bg-slate-800" />
        )}
        <img 
          src={imageSource} 
          alt={`Study in ${name}`}
          className={cn(
            "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
            isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent pointer-events-none" />
        <div className="absolute bottom-4 left-4 z-20">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-md">
            {name}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </h3>
        </div>
      </>
    );
  };

  return (
    <Link to={`/destinations/${slug}`} className="group block h-full">
      <Card className="bg-slate-900 border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300 h-full hover:shadow-2xl hover:shadow-blue-900/20 flex flex-col">
        <div className="aspect-[4/3] relative overflow-hidden bg-slate-900">
          {renderVisual()}
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <p className="text-sm text-slate-400 mb-4 line-clamp-3">
            {description || `Discover universities, visa requirements, and opportunities in ${name}.`}
          </p>
          {highlights && highlights.length > 0 && (
             <div className="mt-auto flex flex-wrap gap-2">
                {highlights.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700">
                    {tag}
                  </span>
                ))}
             </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default DestinationCard;