import type { Role } from '../../role/model/roleStore'
import imgBuyerIphone from '../../../assets/scenarios/buyer_iphone.jpeg'
import imgTenantFlat from '../../../assets/scenarios/tenant_flat.jpeg'
import imgSellerCard from '../../../assets/scenarios/seller_card.jpeg'
import imgSellerGpu from '../../../assets/scenarios/seller_gpu.jpeg'

export interface Scenario {
  id: string
  title: string
  role: Role
  productTitle: string
  price: string
  sellerName: string
  description: string
  image?: string
}

export const MOCK_SCENARIOS: Scenario[] = [
  {
    id: 'buyer_iphone',
    title: 'Покупка iPhone 14 Pro Max',
    role: 'buyer',
    productTitle: 'iPhone 14 Pro Max',
    price: '90 000 ₽',
    sellerName: 'Алексей М.',
    description: 'Продавец предлагает отправить телефон почтой и просит предоплату на карту',
    image: imgBuyerIphone,
  },
  {
    id: 'tenant_flat',
    title: 'Аренда квартиры посуточно',
    role: 'buyer',
    productTitle: 'Квартира посуточно',
    price: '3 500 ₽/сутки',
    sellerName: 'Марина',
    description: 'Арендодатель просит внести задаток за «бронь» квартиры до осмотра',
    image: imgTenantFlat,
  },
  {
    id: 'seller_card',
    title: 'Продажа зимней резины',
    role: 'seller',
    productTitle: 'Зимняя резина 17″',
    price: '24 000 ₽',
    sellerName: 'Дмитрий',
    description: '«Покупатель» просит данные карты для получения оплаты по ссылке',
    image: imgSellerCard,
  },
  {
    id: 'seller_gpu',
    title: 'Продажа RTX 4090',
    role: 'seller',
    productTitle: 'RTX 4090',
    price: '140 000 ₽',
    sellerName: 'Игорь',
    description: '«Покупатель» предлагает перейти в Telegram и оплатить по чужой ссылке',
    image: imgSellerGpu,
  },
]
