import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import DestinationDetailPage from '@/pages/DestinationDetailPage';

const DestinationResolver = () => {
  const params = useParams();
  if (!params?.country) return <Navigate to="/destinations" replace />;
  return <DestinationDetailPage />;
};

export default DestinationResolver;
