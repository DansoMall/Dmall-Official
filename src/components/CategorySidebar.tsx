'use client';

interface Category {
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

const iconMap: Record<string, string> = {
  'fashion':         '/fashion-icon.png',
  'footwear':        '/phones-icon.png',
  'electronics':     '/electronics-icon.png',
  'phones-tablets':  '/phones-icon.png',
  'computing':       '/electronics-icon.png',
  'gaming':          '/gaming-icon.png',
  'appliances':      '/appliances-icon.png',
  'health-beauty':   '/health-icon.png',
  'home-living':     '/home-icon.png',
  'sporting-goods':  '/sports-icon.png',
  'baby-kids':       '/baby-icon.png',
  'automobile':      '/auto-icon.png',
};

export default function CategorySidebar({ categories, activeSlug, onSelect }: Props) {
  return (
    <div className="w-[68px] sm:w-[88px] shrink-0 bg-background border-r border-border overflow-y-auto scrollbar-hide">
      {categories.map((cat) => {
        const isActive = cat.slug === activeSlug;
        const icon = iconMap[cat.slug] ?? '/hamburger.png';

        return (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={`w-full flex flex-col items-center py-3 sm:py-4 px-1 sm:px-2 border-l-[3px] transition-all duration-200 ${
              isActive
                ? 'border-primary bg-primary-light'
                : 'border-transparent hover:bg-border'
            }`}
          >
            <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}>
              <img
                src={icon}
                alt={cat.name}
                width={26}
                height={26}
                className="object-contain sm:w-8 sm:h-8"
              />
            </div>
            <span className={`text-[10px] sm:text-[11px] mt-1 sm:mt-1.5 text-center leading-tight ${
              isActive ? 'font-bold text-primary' : 'font-medium text-text-secondary'
            }`}>
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
