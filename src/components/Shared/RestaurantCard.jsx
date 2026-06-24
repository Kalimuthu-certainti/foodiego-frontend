import { formatRating } from '../../utils/formatters';

const VegBadge = () => (
  <div className="absolute top-3 right-3 bg-white p-1 rounded shadow-sm">
    <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
      <div className="w-2 h-2 bg-green-600 rounded-full" />
    </div>
  </div>
);

const OfferStrip = ({ badge }) =>
  badge ? (
    <div className="absolute bottom-0 left-0 bg-primary text-white text-[11px] font-extrabold px-3 py-1">
      {badge}
    </div>
  ) : null;

const ClosedOverlay = () => (
  <div className="absolute inset-0 bg-black/60 flex items-center justify-center" style={{ backdropFilter: 'blur(2px)' }}>
    <span className="text-white font-bold text-[15px] uppercase tracking-widest border-2 border-white px-4 py-1">
      Closed Now
    </span>
  </div>
);

const RatingChip = ({ rating }) => (
  <div className="flex items-center gap-1 bg-secondary text-white px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0">
    {formatRating(rating)}
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  </div>
);

/* Main grid card — 3-col restaurant list */
export const RestaurantCardGrid = ({ restaurant }) => {
  const { name, imageUrl, cuisines = [], rating, isOpen, offerBadge, isVeg } = restaurant;
  return (
    <div className="group relative bg-surface rounded-xl overflow-hidden cursor-pointer border border-transparent hover:border-primary/10 hover:shadow-card-lg transition-all duration-200">
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={imageUrl || `https://placehold.co/500x200/f0eded/594137?text=${encodeURIComponent(name)}`}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <OfferStrip badge={offerBadge} />
        {isVeg && <VegBadge />}
        {!isOpen && <ClosedOverlay />}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-[17px] text-on-surface group-hover:text-primary transition-colors truncate mr-2">
            {name}
          </h3>
          <RatingChip rating={rating} />
        </div>
        <p className="text-[12px] text-on-surface-variant truncate">
          {cuisines.slice(0, 3).join(', ')}
        </p>
      </div>
    </div>
  );
};

/* Horizontal card — top picks / offers horizontal scroll */
export const RestaurantCardHorizontal = ({ restaurant }) => {
  const { name, imageUrl, cuisines = [], rating, isOpen, offerBadge, isVeg } = restaurant;
  return (
    <div className="group flex-shrink-0 w-60 bg-white rounded-2xl overflow-hidden cursor-pointer border border-surface-container hover:border-primary/20 hover:shadow-card-lg transition-all duration-200">
      <div className="relative h-44 overflow-hidden">
        <img
          src={imageUrl || `https://placehold.co/240x176/f0eded/594137?text=${encodeURIComponent(name)}`}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Dark gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {offerBadge && (
          <div className="absolute bottom-0 left-0 bg-primary text-white text-[10px] font-extrabold px-3 py-1">
            {offerBadge}
          </div>
        )}
        {isVeg && (
          <div className="absolute top-2 right-2 bg-white p-0.5 rounded shadow-sm">
            <div className="w-3.5 h-3.5 border-2 border-green-600 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
            </div>
          </div>
        )}
        {!isOpen && <ClosedOverlay />}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-[14px] text-on-surface group-hover:text-primary transition-colors leading-tight line-clamp-1">
            {name}
          </h3>
          <RatingChip rating={rating} />
        </div>
        <p className="text-[11px] text-on-surface-variant truncate">{cuisines.slice(0, 3).join(', ')}</p>
      </div>
    </div>
  );
};

/* Compact card — Order Again section */
export const RestaurantCardCompact = ({ restaurant, onReorder }) => {
  const { name, imageUrl, cuisines = [], rating } = restaurant;
  return (
    <div className="bg-surface shadow-card rounded-xl p-4 flex gap-4 hover:shadow-card-lg hover:border-primary/20 border border-transparent transition-all cursor-pointer">
      <img
        src={imageUrl || `https://placehold.co/80x80/f0eded/594137?text=Food`}
        alt={name}
        className="w-20 h-20 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[17px] text-on-surface truncate mb-0.5">{name}</h3>
        <p className="text-[12px] text-on-surface-variant truncate mb-2">{cuisines.join(', ')}</p>
        <div className="flex items-center gap-2">
          <RatingChip rating={rating} />
          {onReorder && (
            <button
              onClick={(e) => { e.stopPropagation(); onReorder(restaurant); }}
              className="text-primary border border-primary px-3 py-1 rounded-full text-[11px] font-bold hover:bg-primary hover:text-white transition-colors"
            >
              Reorder
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
