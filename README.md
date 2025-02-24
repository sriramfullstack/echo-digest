# EchoDigest

EchoDigest is a web application that helps users digest online content more effectively by crawling web pages and generating concise, easy-to-understand summaries. The project combines a Next.js frontend with a Python FastAPI backend for web crawling capabilities.

## Project Architecture

- **Frontend**: Next.js application with React 19
- **Backend**: Python FastAPI service for web crawling
- **Key Features**:
  - Web page crawling and content extraction
  - AI-powered content summarization
  - Modern, responsive user interface

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher
- npm or yarn package manager

### Installation

1. Clone the repository

2. Install frontend dependencies:
```bash
npm install
# or
yarn install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

1. Start the frontend development server:
```bash
npm run dev
# or
yarn dev
```

2. Start the backend server:
```bash
cd backend
python app.py
```

The frontend will be available at [http://localhost:3000](http://localhost:3000), and the backend API will run on [http://localhost:8000](http://localhost:8000).

## Development

### Frontend (Next.js)

The frontend is built with Next.js and uses:
- React 19 for UI components
- Tailwind CSS for styling
- TypeScript for type safety

Key frontend files:
- `src/app/page.tsx`: Main application page
- `src/app/components/`: React components
- `src/app/api/`: API route handlers

### Backend (FastAPI)

The Python backend handles web crawling and content processing:
- FastAPI for the REST API
- Beautiful Soup for web scraping
- AI models for content summarization

## Environment Configuration

Create a `.env` file in the root directory with the following variables:
```env
# Add your environment variables here
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
