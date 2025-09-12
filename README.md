# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# MicroCode Checker

**"MicroCode Checker"** - GitHub repository'lerinin popüler LLM'lerin context window'larına sığıp sığmadığını kontrol eden bir web uygulaması.

## 🚀 Özellikler

- GitHub repository URL'i ile hızlı analiz
- Popüler LLM'ler için karşılaştırma (GPT-4, Claude, Gemini vb.)
- Modern ve responsive tasarım
- Gerçek zamanlı analiz sonuçları
- Token/karakter dönüşüm hesaplamaları

## 🛠️ Teknoloji Stack'i

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (v0.dev tabanlı)
- **API**: Vercel Serverless Functions
- **Deployment**: Vercel

## 📦 Kurulum

1. Repository'yi klonlayın:

```bash
git clone https://github.com/yourusername/microcode-checker.git
cd microcode-checker
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Development server'ı başlatın:

```bash
npm run dev
```

4. Browser'da `http://localhost:5173` adresini açın

## 🔧 Development

### Mock API

Development modunda mock API kullanılır. Test için şu URL'leri deneyebilirsiniz:

- `https://github.com/example/small-repo` - Küçük repo (15K karakter)
- `https://github.com/example/medium-repo` - Orta repo (150K karakter)
- `https://github.com/example/large-repo` - Büyük repo (1.5M karakter)

### Production API

Production'da GitHub API kullanarak gerçek analiz yapılır.

## 🚀 Deploy

Vercel'e deploy etmek için:

1. Vercel hesabınızla GitHub repository'sini bağlayın
2. Otomatik deploy işlemi başlayacaktır
3. API endpoint'leri Vercel Serverless Functions olarak çalışacaktır

## 📊 Desteklenen LLM'ler

- GPT-4 (8,192 token)
- GPT-4-32k (32,768 token)
- GPT-3.5-Turbo-16k (16,385 token)
- Claude 3 Sonnet (200,000 token)
- Gemini 1.5 Pro (1,000,000 token)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'e push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
