import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import DestinationDetailPage from '@/pages/DestinationDetailPage';
import DestinationTemplatePage from '@/pages/DestinationTemplatePage';

const fullPages = ['poland', 'australia', 'usa'];

const DestinationResolver = () => {
  const params = useParams();
  
  // Robust check for params and country property
  if (!params || !params.country) {
    // If no country parameter exists, redirect to main destinations page
    return <Navigate to="/destinations" replace />;
  }

  const slug = params.country.toLowerCase().trim();

  // Route to specific detail page if it's one of the "full" pages
  if (fullPages.includes(slug)) {
    return <DestinationDetailPage />;
  }
  
  // Otherwise use the template page for generic destinations
  return <DestinationTemplatePage />;
};

export default DestinationResolver;