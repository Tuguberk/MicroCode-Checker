<div align="center">



# MicroCode Checker

GitHub repository içeriklerinin popüler LLM’lerin context window’una sığıp sığmadığını hesaplayan minimalist bir web uygulaması.

Minimalist tasarım • Monokrom UI • Hızlı analiz

</div>

TR ve EN olmak üzere iki dilde dokümantasyon aşağıdadır.

## 🇹🇷 Türkçe

### Özellikler

- GitHub repo URL’i ile hızlı analiz
- Popüler LLM’lere göre karşılaştırma (GPT-4, Claude, Gemini vb.)
- Monokrom, keskin çizgilere sahip, responsive arayüz
- Token ≈ karakter hesabı (1 token ≈ 4 karakter)

### Teknolojiler

- React + TypeScript + Vite
- Tailwind CSS (v4)
- Vercel Serverless Functions (Production API)

### Kurulum

```bash
git clone https://github.com/Tuguberk/MicroCode-Checker.git
cd MicroCode-Checker
npm install
npm run dev
```

Tarayıcıda http://localhost:5173 adresini açın.

### Kullanım

1. Ana sayfadaki input’a bir GitHub repo adresi girin: `https://github.com/owner/repo`
2. Analizi başlatın; toplam karakter ve LLM uyumluluk oranlarını görün.

### Geliştirme

- Development modunda mock API kullanılır (src/mock/api.ts).
- Production’da Vercel function (api/analyze.ts) GitHub API ile gerçek içerik boyutunu hesaplar.

### Deploy (Vercel)

1. Repoyu Vercel’e bağlayın.
2. Deploy sonrası /api/analyze endpoint’i çalışır.

### Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Detaylar için LICENSE dosyasına bakın.

---

## 🇬🇧 English

### Overview

MicroCode Checker is a minimalist web app that calculates whether your GitHub repository content fits into the context windows of popular LLMs.

### Features

- Quick analysis via GitHub repo URL
- Comparison across popular LLMs (GPT-4, Claude, Gemini, etc.)
- Monochrome, sharp-edged, responsive UI
- Token ≈ character estimate (1 token ≈ 4 characters)

### Tech Stack

- React + TypeScript + Vite
- Tailwind CSS (v4)
- Vercel Serverless Functions (Production API)

### Setup

```bash
git clone https://github.com/Tuguberk/MicroCode-Checker.git
cd MicroCode-Checker
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Usage

1. Enter a GitHub repo URL on the home page: `https://github.com/owner/repo`
2. Start analysis; view total characters and LLM compatibility ratios.

### Development

- In development, a mock API is used (src/mock/api.ts).
- In production, the Vercel function (api/analyze.ts) calls GitHub API to compute real content size.

### Deploy (Vercel)

1. Connect the repo to Vercel.
2. After deployment, the /api/analyze endpoint is available.

### License

This project is licensed under the MIT License. See the LICENSE file for details.
