require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Хранилище языка
const userLang = {};

// Массив с товарами для каталога
const products = [
    {
        id: "rolex_sub",
        image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600",
        title: {
            ru: "Rolex Submariner Date",
            en: "Rolex Submariner Date",
            uz: "Rolex Submariner Date"
        },
        description: {
            ru: "Легендарные дайверские часы, сталь Oystersteel, черный циферблат.",
            en: "Legendary diving watch, Oystersteel, black dial.",
            uz: "Afsonaviy g'avvoslar soati, Oystersteel po'lati, qora siferblat."
        },
        price: "14,500 $"
    },
    {
        id: "patek_philippe",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
        title: {
            ru: "Patek Philippe Nautilus",
            en: "Patek Philippe Nautilus",
            uz: "Patek Philippe Nautilus"
        },
        description: {
            ru: "Премиальный дизайн, корпус из розового золота, автоподзавод.",
            en: "Premium design, rose gold case, self-winding.",
            uz: "Mukammal dizayn, pushti oltin korpus, avtopodzavod."
        },
        price: "85,000 $"
    }
];

// Тексты с переводами
const t = {
  ru: { 
    welcome: "👋 Добро пожаловать в <b>Luxury Time</b>!", 
    catalog: "🛍 Каталог", 
    cart: "🛒 Корзина", 
    profile: "👤 Профиль", 
    language: "🌐 Сменить язык", 
    chooseLang: "Выберите язык:", 
    langChanged: "✅ Язык изменён на Русский",
    addToCart: "📥 В корзину",
    added: "✅ Добавлено в корзину!"
  },
  en: { 
    welcome: "👋 Welcome to <b>Luxury Time</b>!", 
    catalog: "🛍 Catalog", 
    cart: "🛒 Cart", 
    profile: "👤 Profile", 
    language: "🌐 Change Language", 
    chooseLang: "Choose language:", 
    langChanged: "✅ Language changed to English",
    addToCart: "📥 Add to Cart",
    added: "✅ Added to cart!"
  },
  uz: { 
    welcome: "👋 <b>Luxury Time</b> ga xush kelibsiz!", 
    catalog: "🛍 Katalog", 
    cart: "🛒 Savat", 
    profile: "👤 Profil", 
    language: "🌐 Tilni o'zgartirish", 
    chooseLang: "Tilni tanlang:", 
    langChanged: "✅ Til o'zgartirildi",
    addToCart: "📥 Savatga qo'shish",
    added: "✅ Savatga qo'shildi!"
  }
};

const getText = (id, key) => t[userLang[id] || 'ru'][key];
const getKeyboard = (id) => Markup.keyboard([
  [getText(id, 'catalog')],
  [getText(id, 'cart'), getText(id, 'profile')],
  [getText(id, 'language')]
]).resize();

// Старт бота
bot.start(async (ctx) => {
  const id = ctx.from.id;
  userLang[id] = userLang[id] || 'ru';
  await ctx.replyWithHTML(getText(id, 'welcome') + "\n\nВыберите:", getKeyboard(id));
});

// Меню выбора языка
bot.hears(/🌐/, async (ctx) => {
  await ctx.reply(getText(ctx.from.id, 'chooseLang'), Markup.inlineKeyboard([
    [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
    [Markup.button.callback('🇬🇧 English', 'lang_en')],
    [Markup.button.callback('🇺🇿 O\'zbek', 'lang_uz')]
  ]));
});

// Переключение языков
bot.action(['lang_ru','lang_en','lang_uz'], async (ctx) => {
  userLang[ctx.from.id] = ctx.match[0].replace('lang_', '');
  await ctx.answerCbQuery();
  await ctx.reply(t[userLang[ctx.from.id]].langChanged, getKeyboard(ctx.from.id));
});

// Кнопка Каталога — циклом выводит каждый товар отдельным красивым блоком с фото
bot.hears(['🛍 Каталог', '🛍 Catalog', '🛍 Katalog'], async (ctx) => {
    const id = ctx.from.id;
    const lang = userLang[id] || 'ru';

    for (const product of products) {
        const title = product.title[lang];
        const desc = product.description[lang];
        const btnText = getText(id, 'addToCart');

        const caption = `<b>${title}</b>\n\n${desc}\n\n💰 <b>${product.price}</b>`;

        await ctx.replyWithPhoto(product.image, {
            caption: caption,
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.callback(btnText, `add_${product.id}`)]
            ])
        });
    }
});

// Обработка клика по кнопке «В корзину» (Ловит все callback-и, начинающиеся с add_)
bot.action(/^add_/, async (ctx) => {
    const id = ctx.from.id;
    // Всплывающее окошко в телеграме (alert) о том, что товар добавлен
    await ctx.answerCbQuery(getText(id, 'added'));
});

bot.hears(['🛒 Корзина', '🛒 Cart', '🛒 Savat'], (ctx) => ctx.reply('Корзина пуста'));
bot.hears(['👤 Профиль', '👤 Profile', '👤 Profil'], (ctx) => ctx.reply(`ID: ${ctx.from.id}`));

// Запуск
bot.launch({ dropPendingUpdates: true })
  .then(() => console.log('✅ Бот запущен!'))
  .catch(err => console.error(err));
