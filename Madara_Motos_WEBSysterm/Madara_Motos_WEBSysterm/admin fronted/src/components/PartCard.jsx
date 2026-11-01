import React from 'react';
import { Eye, ImageOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PartCard = ({ part }) => {
  const navigate = useNavigate();
  const isLowStock = (part.stockQty || part.quantity || 0) <= (part.lowStockLimeted || 5);

  
  const hasImage = part.imageUrl && part.imageUrl !== "" && part.imageUrl !== "null";

  return (
    <div 
      className="border rounded-3xl overflow-hidden transition-all duration-300 group flex flex-col h-full"
      style={{ 
        backgroundColor: 'var(--bg-card)', 
        borderColor: 'var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
      }}
    >
      
      <div className="relative h-48 w-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
        {hasImage ? (
          <img 
            src={`http://localhost:8080/images/${part.imageUrl}`} 
            alt={part.productName}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
            onError={(e) => { 
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <ImageOff size={40} strokeWidth={1} />
            <span className="text-[10px] mt-2 font-medium uppercase tracking-widest">No Image</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] text-orange-400 font-bold border border-orange-500/20 uppercase">
          {part.partCategory}
        </div>
      </div>
      
      {/* --- Info Section --- */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-bold text-sm leading-tight group-hover:text-orange-400 transition-colors" style={{ color: 'var(--text-main)' }}>
            {part.productName}
          </h3>
          <p className="text-[11px] mt-1.5 uppercase font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>
            {part.brand} • {part.model}
          </p>
        </div>
        
        {/* Price and Stock */}
        <div className="mt-auto grid grid-cols-2 gap-2 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <span className="text-[10px] block uppercase font-bold tracking-tighter" style={{ color: 'var(--text-muted)' }}>Price</span>
            <span className="text-orange-500 font-black text-lg">
              <span className="text-xs mr-0.5">LKR</span>{part.sellingPrice?.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] block uppercase font-bold tracking-tighter" style={{ color: 'var(--text-muted)' }}>Stock</span>
            <span className={`font-black text-sm ${isLowStock ? 'text-red-500' : 'text-green-500'}`}>
              {part.stockQty || part.quantity || 0} <span className="text-[10px] opacity-70">Units</span>
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <button 
          onClick={() => navigate(`/part-details/${part.id || part.productCode}`)}
          className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white text-xs font-black transition-all duration-300 border border-orange-500/20 shadow-sm cursor-pointer"
        >
          <Eye size={16} strokeWidth={2.5} /> VIEW DETAILS
        </button>
      </div>
    </div>
  );
};

export default PartCard;