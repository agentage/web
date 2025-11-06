# Agentage - AI Agent Platform

An open-source platform for building, sharing, and deploying AI agents with simplicity.

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm 10 or higher
- Docker and Docker Compose (for deployment)

### Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/agentage/web.git
   cd web
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development servers:**

   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/health

## 📦 Project Structure

```
web/
├── packages/
│   ├── shared/           # Shared TypeScript types
│   ├── backend/          # Express.js API server
│   └── frontend/         # Next.js 14 web application
├── .github/
│   └── workflows/        # CI/CD pipelines
├── scripts/              # Development scripts
└── docs/                 # Documentation
```

## 🛠️ Available Commands

```bash
npm run dev          # Start development servers
npm run build        # Build all packages
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
npm run clean        # Clean build artifacts and dependencies
```

## 🐳 Docker Deployment

### Build Images

```bash
docker build --target backend -t agentage-backend .
docker build --target frontend -t agentage-frontend .
```

### Run with Docker Compose

```bash
docker compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](docs/)
- [Issues](https://github.com/agentage/web/issues)
- [Discussions](https://github.com/agentage/web/discussions)
