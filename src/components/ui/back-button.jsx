import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BackButton = ({ label = "Back", className = "", to }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleBack} 
      className={`gap-2 text-slate-400 hover:text-white mb-6 pl-0 hover:bg-transparent ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
};

export { BackButton };
export default BackButton;