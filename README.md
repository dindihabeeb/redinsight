# RedInsight - Reddit Data Explorer

A beautiful, modern web application that explores Reddit data using the Reddit API. Built with vanilla HTML, CSS, and JavaScript, this application provides an intuitive interface for browsing posts, subreddits, users, and searching across Reddit content.

## 🌟 Features

### 📱 Posts Section
- **Hot Posts**: View trending posts from all subreddits
- **Top Posts**: Browse top posts with time filters (day, week, month, year, all time)
- **New Posts**: Discover the latest posts
- **Rising Posts**: See posts gaining momentum
- **Real-time Search**: Filter posts by keywords
- **Post Details**: Click any post to view full content and comments

### 🏷️ Subreddits Section
- **Popular Subreddits**: Browse trending communities
- **New Subreddits**: Discover recently created communities
- **Top Subreddits**: View highest-rated communities
- **Subreddit Search**: Find specific communities
- **Community Stats**: View member counts and activity

### 🔍 Search Section
- **Global Search**: Search across posts, subreddits, and users
- **Type-specific Results**: Filter search by content type
- **Real-time Results**: Instant search with debounced input

### 👤 Users Section
- **User Profiles**: View detailed user information
- **Karma Breakdown**: See post and comment karma
- **User Posts**: Browse posts by specific users
- **Member Since**: View account creation date

## 🚀 Getting Started

### Prerequisites
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

**Option 1: Automated Setup (Recommended)**
```bash
# On macOS/Linux
chmod +x setup.sh
./setup.sh

**Option 2: Manual Setup**
```bash
# Install dependencies
npm install

# Start the application
npm start
```

### Running Locally

After installation, start the application:

```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

Then visit: **http://localhost:3000**

The application includes a backend proxy server that handles CORS issues and provides a secure way to access the Reddit API.

### 🐳 Docker Deployment

**Option 1: Simple Docker Build**
```bash
# Build the Docker image
docker build -t redinsight .

# Run the container
docker run -d -p 3000:3000 -p 2222:22 --name redinsight-app redinsight

# Access the application
# Web: http://localhost:3000
# SSH: ssh ubuntu@localhost -p 2222 (password: pass123)
```

**Option 2: Docker Compose (Recommended)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Option 3: Production with Nginx**
```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d

# Access via nginx on port 80
# http://localhost
```

## 🛠️ Technical Architecture

### Frontend Technologies
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: ES6+ features and async/await
- **Font Awesome**: Icons for enhanced UI
- **Google Fonts**: Inter font family for typography

### Backend Technologies
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **CORS**: Cross-origin resource sharing handling
- **node-fetch**: HTTP client for API requests

### API Integration
- **Reddit JSON API**: Public API endpoints via proxy
- **CORS Handling**: Backend proxy eliminates CORS issues
- **Rate Limiting**: Respectful API usage with proper headers
- **Error Management**: Graceful error handling and user feedback

### Design Principles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Glassmorphism effects and smooth animations
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Optimized loading and efficient data handling

## 📊 API Endpoints Used

### Posts
- `GET /hot.json` - Hot posts
- `GET /top.json` - Top posts with time filters
- `GET /new.json` - New posts
- `GET /rising.json` - Rising posts
- `GET /r/{subreddit}/{filter}.json` - Subreddit-specific posts

### Subreddits
- `GET /subreddits/popular.json` - Popular subreddits
- `GET /subreddits/new.json` - New subreddits
- `GET /subreddits/top.json` - Top subreddits

### Search
- `GET /search.json` - Global search with type filters

### Users
- `GET /user/{username}/about.json` - User profile
- `GET /user/{username}/submitted.json` - User posts

## 🎨 UI/UX Features

### Visual Design
- **Gradient Backgrounds**: Beautiful color transitions
- **Glassmorphism**: Translucent cards with backdrop blur
- **Smooth Animations**: Hover effects and transitions
- **Modern Typography**: Clean, readable font hierarchy

### User Experience
- **Intuitive Navigation**: Tab-based interface
- **Real-time Feedback**: Loading states and error messages
- **Responsive Layout**: Adapts to all screen sizes
- **Keyboard Support**: Full keyboard navigation

### Interactive Elements
- **Hover Effects**: Visual feedback on interactive elements
- **Modal Dialogs**: Detailed post views
- **Search Suggestions**: Real-time search results
- **Filter Controls**: Easy data filtering and sorting

## 🔧 Configuration

### Environment Variables
This application uses the public Reddit API, so no API keys are required. However, if you want to add authentication later, you can create a `.env` file:

```env
# Optional: For authenticated requests
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=RedInsight/1.0
```

### Customization
You can customize the application by modifying:

- **Colors**: Update CSS custom properties in `styles.css`
- **API Limits**: Change the `limit` parameter in API calls
- **UI Elements**: Modify HTML structure and CSS classes
- **Features**: Add new functionality in `script.js`

## 📱 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ Internet Explorer (not supported)

## 🚨 Rate Limiting & Best Practices

### API Usage
- **Respectful Requests**: Built-in delays and proper headers
- **Error Handling**: Graceful degradation on API failures
- **Caching**: Client-side caching for better performance
- **User Agent**: Proper identification in requests

### Security Considerations
- **No Sensitive Data**: No API keys stored in client-side code
- **CORS Compliance**: Proper cross-origin request handling
- **Input Validation**: Sanitized user inputs
- **XSS Prevention**: Safe HTML rendering

## 🐛 Troubleshooting

### Common Issues

**Posts not loading:**
- Check internet connection
- Verify Reddit API is accessible
- Clear browser cache

**Search not working:**
- Ensure search query is not empty
- Check browser console for errors
- Verify API endpoint availability

**Styling issues:**
- Clear browser cache
- Check CSS file loading
- Verify Font Awesome CDN access

