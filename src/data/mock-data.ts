export const INVENTORY_CATEGORIES = [// допустимые категории имущества
    'appliance',                     // бытовая техника
    'electronics',                   // электроника
    'furniture',                     // мебель
    'other'                          // другое
] as const;     
export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number]; // тип: одно из слов списка выше

export const MONEY_CATEGORIES = [// категории расходов и платежей
    'utilities',                 // коммунальные услуги
    'groceries',                 // продукты
    'repairs',                   // ремонт
    'internet',                  // интернет
    'insurance',                 // страховка
    'subscriptions',             // подписки
    'other'                      // другое
] as const; 
export type MoneyCategory = (typeof MONEY_CATEGORIES)[number]; // тип: одно из слов списка выше

export type TaskPriority = 'low' | 'normal' | 'high';          // важность задачи: низкая, обычная, высокая

export interface InventoryItem {  // описание одного предмета имущества
  id: string;                     // номер предмета, например item-1
  name: string;                   // название, например Холодильник Bosch
  category: InventoryCategory;    // категория предмета
  room: string;                   // комната, где он стоит
  purchaseDate: string;           // дата покупки в формате ГГГГ-ММ-ДД
  priceRub: number;               // цена в рублях
  nextServiceDate: string | null; // дата ближайшего обслуживания или null, если не нужно
}

export interface Expense {        // описание одного расхода
  id: string;                     // номер расхода
  date: string;                   // дата расхода ГГГГ-ММ-ДД
  category: MoneyCategory;        // категория расхода
  title: string;                  // на что потрачено
  amountRub: number;              // сумма в рублях
}

export interface Payment {        // описание одного предстоящего платежа
  id: string;                     // номер платежа
  title: string;                  // за что платить
  dueDate: string;                // срок оплаты ГГГГ-ММ-ДД
  amountRub: number;              // сумма в рублях
  category: MoneyCategory;        // категория платежа
}

export interface HouseholdTask {  // описание одной бытовой задачи
  id: string;                     // номер задачи, например task-1
  title: string;                  // короткое название задачи
  description: string;            // подробности, может быть пустой строкой
  dueDate: string | null;         // срок выполнения или null, если срока нет
  priority: TaskPriority;         // важность задачи
  status: 'open' | 'done';        // открыта или уже выполнена
  createdAt: string;              // дата создания ГГГГ-ММ-ДД
}

export const DEMO_TODAY = '2026-11-13'; // демо-дата «сегодня»: чтобы ответы не менялись со временем

export const household = {
  name: 'Демонстрационная квартира', // название домашнего пространства
  description: 'Квартира 54 м², все данные выдуманные', // короткое описание
  members: ['Анна', 'Пётр', 'Маша'], // вымышленные жильцы
};

export const inventory: InventoryItem[] = [ // имущество и техника
  { id: 'item-1', name: 'Холодильник Bosch', category: 'appliance', room: 'кухня', purchaseDate: '2021-03-12', priceRub: 62000, nextServiceDate: '2026-12-01' },
  { id: 'item-2', name: 'Стиральная машина LG', category: 'appliance', room: 'ванная', purchaseDate: '2020-08-05', priceRub: 41000, nextServiceDate: '2026-11-18' },
  { id: 'item-3', name: 'Телевизор Samsung 55', category: 'electronics', room: 'гостиная', purchaseDate: '2022-11-25', priceRub: 52000, nextServiceDate: null },
  { id: 'item-4', name: 'Диван угловой', category: 'furniture', room: 'гостиная', purchaseDate: '2019-05-14', priceRub: 78000, nextServiceDate: null },
  { id: 'item-5', name: 'Робот-пылесос Xiaomi', category: 'appliance', room: 'коридор', purchaseDate: '2023-02-10', priceRub: 24000, nextServiceDate: '2026-11-20' },
  { id: 'item-6', name: 'Ноутбук Lenovo', category: 'electronics', room: 'детская', purchaseDate: '2024-09-01', priceRub: 67000, nextServiceDate: null },
];

export const expenses: Expense[] = [ // расходы за сентябрь, октябрь и начало ноября 2026
  { id: 'exp-1', date: '2026-09-03', category: 'groceries', title: 'Продукты на неделю', amountRub: 5400 },
  { id: 'exp-2', date: '2026-09-12', category: 'utilities', title: 'Коммунальные услуги за август', amountRub: 5980 },
  { id: 'exp-3', date: '2026-09-20', category: 'repairs', title: 'Замена смесителя на кухне', amountRub: 3700 },
  { id: 'exp-4', date: '2026-10-02', category: 'groceries', title: 'Продукты', amountRub: 6100 },
  { id: 'exp-5', date: '2026-10-10', category: 'utilities', title: 'Коммунальные услуги за сентябрь', amountRub: 6020 },
  { id: 'exp-6', date: '2026-10-18', category: 'internet', title: 'Интернет и ТВ', amountRub: 890 },
  { id: 'exp-7', date: '2026-10-25', category: 'other', title: 'Подарок на день рождения', amountRub: 3500 },
  { id: 'exp-8', date: '2026-11-01', category: 'groceries', title: 'Продукты', amountRub: 4800 },
  { id: 'exp-9', date: '2026-11-05', category: 'utilities', title: 'Электроэнергия за октябрь', amountRub: 2380 },
  { id: 'exp-10', date: '2026-11-08', category: 'subscriptions', title: 'Онлайн-кинотеатр', amountRub: 399 },
  { id: 'exp-11', date: '2026-11-10', category: 'repairs', title: 'Фильтр для стиральной машины', amountRub: 1250 },
];

export const payments: Payment[] = [ // предстоящие платежи
  { id: 'pay-1', title: 'Электроэнергия', dueDate: '2026-11-15', amountRub: 2450, category: 'utilities' },
  { id: 'pay-2', title: 'Интернет и ТВ', dueDate: '2026-11-20', amountRub: 890, category: 'internet' },
  { id: 'pay-3', title: 'Коммунальные услуги', dueDate: '2026-11-25', amountRub: 6120, category: 'utilities' },
  { id: 'pay-4', title: 'Страховка квартиры', dueDate: '2026-12-05', amountRub: 4300, category: 'insurance' },
  { id: 'pay-5', title: 'Онлайн-кинотеатр', dueDate: '2026-12-10', amountRub: 399, category: 'subscriptions' },
];

export const tasks: HouseholdTask[] = [ // бытовые задачи; сюда же в Release 1 добавим новые
  { id: 'task-1', title: 'Заменить фильтр в стиральной машине', description: '', dueDate: '2026-11-18', priority: 'normal', status: 'open', createdAt: '2026-11-10' },
  { id: 'task-2', title: 'Купить лампочки для коридора', description: 'Тёплый свет, цоколь E27', dueDate: null, priority: 'low', status: 'open', createdAt: '2026-11-11' },
  { id: 'task-3', title: 'Вызвать мастера по кондиционеру', description: '', dueDate: '2026-11-05', priority: 'high', status: 'done', createdAt: '2026-11-01' },
];