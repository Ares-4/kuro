import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Calendar, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReadiness } from '@/contexts/ReadinessContext';
import { cn } from '@/lib/utils';

const FunnelButton = ({ 
  action = 'readiness', 
  text, 
  className = '', 
  size = 'default',
  showIcon = true,
  ...props 
}) => {
  const { openReadinessCheck } = useReadiness();

  const configs = {
    // Primary Action: The main funnel entry point
    readiness: {
      defaultText: 'Start Readiness Check', // Standardized Terminology
      icon: <FileCheck className="mr-2 h-4 w-4" />,
      variant: 'default',
      onClick: openReadinessCheck,
      // Blue branding, prominent shadow
      className: "bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20"
    },
    // Secondary Action: High intent but higher friction
    consultation: {
      defaultText: 'Book Consultation',
      icon: <Calendar className="mr-2 h-4 w-4" />,
      variant: 'outline',
      to: '/contact',
      // Subtle border, good contrast
      className: "border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-500"
    },
    // Tertiary Action: Commitment (Sign up/Apply)
    application: {
      defaultText: 'Start Application',
      icon: <ArrowRight className="mr-2 h-4 w-4" />,
      variant: 'secondary',
      to: '/signup',
      // Distinct from primary, implies moving forward
      className: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
    },
    // Restricted Action: Dashboard/Login
    login: {
      defaultText: 'Student Login',
      icon: <Lock className="mr-2 h-4 w-4" />,
      variant: 'ghost',
      to: '/login',
      className: "text-slate-400 hover:text-white hover:bg-slate-800"
    }
  };

  const config = configs[action] || configs.readiness;
  const contentText = text || config.defaultText;
  
  const content = (
    <>
      {showIcon && config.icon}
      {contentText}
    </>
  );

  const finalClassName = cn(config.className, className);

  // If it's a link type
  if (config.to) {
    return (
      <Link to={config.to}>
        <Button 
          variant={config.variant} 
          size={size} 
          className={finalClassName} 
          {...props}
        >
          {content}
        </Button>
      </Link>
    );
  }

  // If it's a button type (modal trigger)
  return (
    <Button
      variant={config.variant}
      size={size}
      className={finalClassName}
      onClick={config.onClick}
      {...props}
    >
      {content}
    </Button>
  );
};

export default FunnelButton;