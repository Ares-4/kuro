import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * A responsive wrapper for admin tables.
 * Renders a standard table on desktop and a list of cards on mobile.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The Table component for desktop view
 * @param {Array} props.data - The data array to map over for mobile view
 * @param {Function} props.renderMobileCard - Function that takes an item and returns a mobile card component
 */
export const AdminTable = ({ children, data = [], renderMobileCard }) => {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
        {children}
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {data.length === 0 ? (
           <div className="text-center py-8 text-slate-500 bg-slate-900 rounded-lg border border-slate-800">
             No data available.
           </div>
        ) : (
          data.map((item, index) => (
            <div key={item.id || index}>
              {renderMobileCard(item)}
            </div>
          ))
        )}
      </div>
    </>
  );
};