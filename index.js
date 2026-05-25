require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Хранилище языка
const userLang = {};

// Тексты
const t = {
  ru: { welcome: "👋 Добро пожаловать в <b>Luxury Time</b>!", catalog: "🛍 Каталог", cart: "🛒 Корзина", profile: "👤 Профиль", language: "🌐 Сменить язык", chooseLang: "Выберите язык:", langChanged: "✅ Язык изменён на Русский" },
  en: { welcome: "👋 Welcome to <b>Luxury Time</b>!", catalog: "🛍 Catalog", cart: "🛒 Cart", profile: "👤 Profile", language: "🌐 Change Language", chooseLang: "Choose language:", langChanged: "✅ Language changed to English" },
  uz: { welcome: "👋 <b>Luxury Time</b> ga xush kelibsiz!", catalog: "🛍 Katalog", cart: "🛒 Savat", profile: "👤 Profil", language: "🌐 Tilni o'zgartirish", chooseLang: "Tilni tanlang:", langChanged: "✅ Til o'zgartirildi" }
};

const getText = (id, key) => t[userLang[id] || 'ru'][key];
const getKeyboard = (id) => Markup.keyboard([
  [getText(id, 'catalog')],
  [getText(id, 'cart'), getText(id, 'profile')],
  [getText(id, 'language')]
]).resize();

bot.start(async (ctx) => {
  const id = ctx.from.id;
  userLang[id] = userLang[id] || 'ru';
  await ctx.replyWithHTML(getText(id, 'welcome') + "\n\nВыберите:", getKeyboard(id));
});

bot.hears(/🌐/, async (ctx) => {
  await ctx.reply(getText(ctx.from.id, 'chooseLang'), Markup.inlineKeyboard([
    [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
    [Markup.button.callback('🇬🇧 English', 'lang_en')],
    [Markup.button.callback('🇺🇿 O\'zbek', 'lang_uz')]
  ]));
});

bot.action(['lang_ru','lang_en','lang_uz'], async (ctx) => {
  userLang[ctx.from.id] = ctx.match[0].replace('lang_', '');
  await ctx.answerCbQuery();
  await ctx.reply(t[userLang[ctx.from.id]].langChanged, getKeyboard(ctx.from.id));
});

bot.hears(['🛍 Каталог', '🛍 Catalog', '🛍 Katalog'], (ctx) => ctx.reply('Каталог скоро будет...'));
bot.hears(['🛒 Корзина', '🛒 Cart', '🛒 Savat'], (ctx) => ctx.reply('Корзина пуста'));
bot.hears(['👤 Профиль', '👤 Profile', '👤 Profil'], (ctx) => ctx.reply(`ID: ${ctx.from.id}`));

bot.launch({ dropPendingUpdates: true })
  .then(() => console.log('✅ Бот запущен!'))
  .catch(err => console.error(err));
