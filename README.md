# RedInsight - Reddit Data Explorer

A beautiful, modern web application that explores Reddit data using the Reddit API. Built with vanilla HTML, CSS, and JavaScript, this application provides an intuitive interface for browsing posts, subreddits, users, and searching across Reddit content.

## Features

### Posts Section
- **Hot Posts**: View trending posts from all subreddits
- **Top Posts**: Browse top posts with time filters (day, week, month, year, all time)
- **New Posts**: Discover the latest posts
- **Rising Posts**: See posts gaining momentum
- **Real-time Search**: Filter posts by keywords
- **Post Details**: Click any post to view full content and comments

### Subreddits Section
- **Popular Subreddits**: Browse trending communities
- **New Subreddits**: Discover recently created communities
- **Top Subreddits**: View highest-rated communities
- **Subreddit Search**: Find specific communities
- **Community Stats**: View member counts and activity

### Search Section
- **Global Search**: Search across posts, subreddits, and users
- **Type-specific Results**: Filter search by content type
- **Real-time Results**: Instant search with debounced input

### Users Section
- **User Profiles**: View detailed user information
- **Karma Breakdown**: See post and comment karma
- **User Posts**: Browse posts by specific users
- **Member Since**: View account creation date

## Getting Started

### Prerequisites
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Running Locally

After installation, start the application:

```bash
# Install dependencies
cd redinsight && npm i
# Start the server
npm start
```

Then visit: **http://localhost:3000**

The application includes a backend proxy server that handles CORS issues and provides a secure way to access the Reddit API.

### Docker Deployment & Load Balancing

**Option 1: Simple Docker Pull and Run (Recommended)**
[Repo link: https://hub.docker.com/repositories/emacslad](https://hub.docker.com/u/emacslad)
```bash
# Pull the Docker images
docker pull emacslad/redinsight-web-01:latest
docker pull emacslad/redinsight-web-02:latest
docker pull emacslad/redinsight-lb-01:latest

# Run the containers
docker run -d -p 8080:3000 -p 2210:22 --name web-01 emacslad/redinsight-web-01
docker run -d -p 8081:3000 -p 2211:22 --name web-02 emacslad/redinsight-web-02
docker run -d -p 8082:3000 -p 2212:22 --name lb-01 emacslad/redinsight-lb-01

# Access the application
# Web: http://localhost:8082
# SSH: ssh ubuntu@localhost -p 2212 (password: pass123)
```

**Option 2: Docker Compose (Build locally)**
```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Nginx & Haproxy Setup

#### Nginx
I used echo with the redirection '>' to add the Nginx config within the Dockerfile responsible for setting up web-01 and web-02 containers
```
# Configure nginx
RUN echo 'server {\n\
    listen 80;\n\
    location / {\n\
        proxy_pass http://localhost:3000;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
}' > /etc/nginx/sites-available/default
```

#### Haproxy
I created a different Dockerfile for the loadbalancer as seen in the lb directory. I had used a heredoc(EOF) to add the config to haproxy.cfg within the Dockerfile
```
global
    maxconn 256
    log stdout format raw local0 info

defaults
    mode http
    timeout connect 5s
    timeout client  50s
    timeout server  50s
    option forwardfor
    option http-server-close

frontend http-in
    bind *:80
    default_backend servers
    http-response add-header X-Served-By %[srv_name]

backend servers
    balance roundrobin
    server web01 172.20.0.11:3000 check
    server web02 172.20.0.12:3000 check
```

<img width="1678" height="1035" alt="Image" src="https://github.com/user-attachments/assets/c05a9f8f-dd76-498e-bf57-87f75c38f2a2" />

##  Technical Architecture

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

## API Endpoints Used

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

## UI/UX Features

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

## Configuration

### Environment Variables
This application uses the public Reddit API, so no API keys are required. 

### Customization
You can customize the application by modifying:

- **Colors**: Update CSS custom properties in `styles.css`
- **API Limits**: Change the `limit` parameter in API calls
- **UI Elements**: Modify HTML structure and CSS classes
- **Features**: Add new functionality in `script.js`

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Internet Explorer (not supported)

## Rate Limiting & Best Practices

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

## Troubleshooting

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

## Credis
This project will not exist without the Reddit team. A huge thanks to Reddit for producing such a robust and useful API reference.
