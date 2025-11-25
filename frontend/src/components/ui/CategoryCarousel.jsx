import { useEffect, useRef } from 'react';
import { Box, alpha, Skeleton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Devices,
  Checkroom,
  Home,
  SportsBasketball,
  Spa,
  MenuBook,
  SportsEsports,
  DirectionsCar,
  Watch,
  IceSkating,
  Luggage,
  MusicNote,
  Movie,
  Computer,
  PhoneAndroid,
  Kitchen,
  Chair,
  Palette,
  Build,
  Pets,
} from '@mui/icons-material';

// Map des icônes par catégorie
const categoryIcons = {
  'Électronique': Devices,
  'Vêtements': Checkroom,
  'Maison & Jardin': Home,
  'Sports & Loisirs': SportsBasketball,
  'Beauté & Santé': Spa,
  'Livres': MenuBook,
  'Jouets & Jeux': SportsEsports,
  'Automobile': DirectionsCar,
  'Bijoux & Montres': Watch,
  'Chaussures': IceSkating,
  'Bagages': Luggage,
  'Musique': MusicNote,
  'Films & TV': Movie,
  'Informatique': Computer,
  'Téléphonie': PhoneAndroid,
  'Électroménager': Kitchen,
  'Mobilier': Chair,
  'Décoration': Palette,
  'Bricolage': Build,
  'Animalerie': Pets,
};

// Couleurs de gradient pour chaque catégorie
const categoryGradients = [
  ['#6366F1', '#8B5CF6'],
  ['#EC4899', '#F472B6'],
  ['#10B981', '#34D399'],
  ['#F59E0B', '#FBBF24'],
  ['#EF4444', '#F87171'],
  ['#3B82F6', '#60A5FA'],
  ['#8B5CF6', '#A78BFA'],
  ['#14B8A6', '#2DD4BF'],
  ['#F97316', '#FB923C'],
  ['#06B6D4', '#22D3EE'],
  ['#84CC16', '#A3E635'],
  ['#D946EF', '#E879F9'],
  ['#0EA5E9', '#38BDF8'],
  ['#6366F1', '#818CF8'],
  ['#EC4899', '#F472B6'],
  ['#10B981', '#34D399'],
  ['#F59E0B', '#FBBF24'],
  ['#EF4444', '#F87171'],
  ['#3B82F6', '#60A5FA'],
  ['#8B5CF6', '#A78BFA'],
];

const CategoryCarousel = ({ categories, loading }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const animationRef = useRef(null);

  // Animation de défilement infini
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || loading || categories.length === 0) return;

    let scrollPosition = 0;
    const speed = 0.5;

    const animate = () => {
      scrollPosition += speed;
      
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleMouseEnter = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    const handleMouseLeave = () => {
      animationRef.current = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [loading, categories]);

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  // Dupliquer les catégories pour l'effet infini
  const duplicatedCategories = [...categories, ...categories];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 3, overflow: 'hidden', py: 2, justifyContent: 'center' }}>
        {[...Array(10)].map((_, i) => (
          <Skeleton
            key={i}
            variant="circular"
            width={64}
            height={64}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      ref={scrollRef}
      sx={{
        display: 'flex',
        gap: { xs: 2, sm: 3, md: 4 },
        overflow: 'hidden',
        py: 3,
        px: 1,
        scrollBehavior: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {duplicatedCategories.map((category, index) => {
        const IconComponent = categoryIcons[category.name] || Devices;
        const gradientIndex = index % categoryGradients.length;
        const [color1, color2] = categoryGradients[gradientIndex];

        return (
          <Tooltip 
            key={`${category.id}-${index}`} 
            title={category.name} 
            arrow
            placement="bottom"
          >
            <Box
              onClick={() => handleCategoryClick(category.name)}
              sx={{
                flexShrink: 0,
                width: { xs: 56, sm: 64, md: 72 },
                height: { xs: 56, sm: 64, md: 72 },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${alpha(color1, 0.4)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.15) translateY(-4px)',
                  boxShadow: `0 8px 30px ${alpha(color1, 0.5)}`,
                },
                '&:active': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <IconComponent
                sx={{
                  fontSize: { xs: 28, sm: 32, md: 36 },
                  color: 'white',
                }}
              />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default CategoryCarousel;