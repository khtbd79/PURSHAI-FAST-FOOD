import frenchFryImg from '../assets/images/french_fry_1790404965935.jpg';
import chickenNuggetImg from '../assets/images/chicken_nugget_1790404990865.jpg';
import chotpotiImg from '../assets/images/chotpoti_1790405006176.jpg';
import fuchkaImg from '../assets/images/fuchka_1790405021368.jpg';
import potatoMashImg from '../assets/images/potato_mash_1790405037262.jpg';
import potatoRingImg from '../assets/images/potato_ring_1790405055057.jpg';
import pastaImg from '../assets/images/pasta_1790405071998.jpg';
import chowmeinImg from '../assets/images/chowmein_1790405089333.jpg';
import chickenBurgerImg from '../assets/images/chicken_burger_1790405103234.jpg';
import singaraImg from '../assets/images/singara_1790405123512.jpg';

export const FOOD_IMAGES: Record<string, string> = {
  'item-1': frenchFryImg,
  'French Fry': frenchFryImg,

  'item-2': chickenNuggetImg,
  'Chicken Nugget': chickenNuggetImg,

  'item-3': chotpotiImg,
  'Chotpoti': chotpotiImg,

  'item-4': fuchkaImg,
  'Fuchka': fuchkaImg,

  'item-5': potatoMashImg,
  'Potato Mash': potatoMashImg,

  'item-6': potatoRingImg,
  'Potato Ring': potatoRingImg,

  'item-7': pastaImg,
  'Pasta': pastaImg,

  'item-8': chowmeinImg,
  'Chowmein': chowmeinImg,

  'item-9': chickenBurgerImg,
  'Basic Chicken Burger': chickenBurgerImg,

  'item-10': singaraImg,
  'Singara': singaraImg,
};

export function getFoodImage(nameOrId: string): string | undefined {
  if (!nameOrId) return undefined;
  return FOOD_IMAGES[nameOrId] || FOOD_IMAGES[nameOrId.trim()];
}
