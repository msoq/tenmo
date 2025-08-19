<p align="center">
  <strong>Tenmo</strong> is a AI-powered language learning platform. Built with Next.js 15 and the AI SDK, it provides an interactive environment for both conversational AI and structured language practice.
</p>

<p align="center">
  <strong><a href="https://tenmo.vercel.app/" target="_blank">Try it Live</a></strong>
</p>

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (local or hosted)
- API keys for your preferred AI providers

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tenmo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Set up the database**
   ```bash
   pnpm db:migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

Your application will be available at [http://localhost:3000](http://localhost:3000).

## 📖 How to Use Tenmo

### Language Learning
1. **Configure Settings**: Go to `/phrases` and set up your language pair
2. **Choose Topics**: Select learning topics that interest you (business, travel, culture, etc.)
3. **Set Difficulty**: Choose your CEFR level (A1-C2) for appropriate content
4. **Practice**: Translate phrases and receive intelligent feedback
5. **Track Progress**: Monitor your accuracy and learning streaks

Based on <a href="https://chat.vercel.ai/" target="_blank">chat.vercel.ai<a/>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<p align="center">
  <strong>Built with ❤️ using Next.js, AI SDK, and modern web technologies</strong>
</p>
