export const contacts = {
  addressLines: ['МО, г. Пушкино', 'Московский просп., дом 59', 'ТЦ «Круиз», 3 этаж'],
  phone: {
    display: '+7 (999) 928-81-48',
    href: 'tel:+79999288148',
  },
  workingHours: ['Ежедневно с 11:00 до 20:00', 'Аренда зала — до 21:00'],
  mapUrl: 'https://yandex.ru/maps/org/minimishki/159053294923/?ll=37.862274%2C55.996747&z=17.09',
  socialLinks: [
    {
      href: 'https://vk.ru/minimishkimo',
      label: 'ВКонтакте',
    },
    {
      href: 'https://t.me/minimishkimo',
      label: 'Telegram',
    },
  ],
} as const;
