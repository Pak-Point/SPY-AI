# SPY AI — ابتدائی پروجیکٹ

یہ ایک ابتدائی Web/PWA + Android Capacitor پروجیکٹ ہے۔ یہ ابھی تیار APK نہیں ہے۔ اصل ویڈیو بنانے کے لیے xAI API key اور Cloudflare Worker deployment ضروری ہے۔

## اہم سکیورٹی
- API key کبھی بھی `app.js` یا GitHub repository میں نہ لکھیں۔
- Cloudflare Worker میں `XAI_API_KEY` secret کے طور پر محفوظ کریں۔
- ویڈیو بنانا مفت نہیں؛ xAI کی موجودہ قیمت اور اکاؤنٹ کی دستیابی پہلے چیک کریں۔

## 1) Cloudflare Worker
1. Cloudflare Dashboard میں Workers & Pages کھولیں۔
2. نیا Worker بنائیں اور `worker/index.js` کا کوڈ ڈالیں۔
3. Settings → Variables and Secrets میں `XAI_API_KEY` نام کا Secret بنائیں۔
4. `worker/wrangler.toml` کے مطابق deploy کریں۔
5. Worker کا URL نوٹ کریں۔

## 2) ویب ایپ
`app.js` میں پہلی لائن پر `API_BASE` کو اپنے Worker URL سے بدلیں۔ پھر GitHub Pages یا کسی static hosting پر root files deploy کریں۔

## 3) Android APK
Node.js اور Android Studio والے کمپیوٹر پر:
```
npm install
mkdir www
cp index.html style.css app.js manifest.webmanifest sw.js www/
npx cap add android
npx cap sync android
npx cap open android
```
Android Studio میں Build → Build Bundle(s) / APK(s) → Build APK(s) منتخب کریں۔

## نوٹ
یہ MVP starter ہے۔ اگلے مرحلے میں محفوظ image upload، بہتر job history، user login، quota اور Android permissions شامل کیے جا سکتے ہیں۔
