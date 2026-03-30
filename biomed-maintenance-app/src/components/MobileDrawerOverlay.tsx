import React from 'react';

interface MobileDrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileDrawerOverlay: React.FC<MobileDrawerOverlayProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <div
        className={`fixed left-0 top-0 h-screen w-72 bg-[#030712] transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="pt-16 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};
