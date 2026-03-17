import MockAdapter from 'axios-mock-adapter';
import api from './axios';

// Create a mock adapter instance with a slight delay simulating network latency
const mock = new MockAdapter(api, { delayResponse: 500 });

// ------------- MOCK DB STATE -------------
let currentUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  bio: 'I am a passionate developer looking to learn and share skills. Feel free to connect!',
  rating: 4.8,
  totalReviews: 12,
  skillsOffered: ['React', 'JavaScript', 'Tailwind CSS'],
  skillsWanted: ['Python', 'Node.js', 'AWS'],
};

const mockMatches = [
  {
    _id: '2',
    name: 'Alice Smith',
    bio: 'Backend engineer wanting to learn more frontend.',
    rating: 4.9,
    totalReviews: 24,
    skillsOffered: ['Python', 'Django', 'SQL'],
    skillsWanted: ['React', 'Tailwind CSS'],
    score: 85
  },
  {
    _id: '3',
    name: 'Bob Jones',
    bio: 'Product manager and UX enthusiast exploring code.',
    rating: 4.2,
    totalReviews: 5,
    skillsOffered: ['Product Management', 'Figma'],
    skillsWanted: ['JavaScript', 'HTML/CSS'],
    score: 65
  },
  {
    _id: '4',
    name: 'Charlie Brown',
    bio: 'Aspiring data scientist looking for a mentor.',
    rating: 0,
    totalReviews: 0,
    skillsOffered: ['Math', 'Statistics'],
    skillsWanted: ['Python', 'Machine Learning'],
    score: 25
  }
];

let requestsIncoming = [
  {
    _id: 'req_1',
    from: { _id: '5', name: 'Diana Prince', avatar: '' },
    skillOffered: 'Node.js',
    skillWanted: 'React',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let requestsOutgoing = [
  {
    _id: 'req_2',
    to: { _id: '2', name: 'Alice Smith' },
    skillOffered: 'React',
    skillWanted: 'Python',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// ------------- AUTH ROUTES -------------
mock.onPost('/api/auth/login').reply((config) => {
  const { email, password } = JSON.parse(config.data);
  // Allow the requested test credentials
  if (email === 'test@example.com' && password === 'password123') {
    return [200, { token: 'mock-jwt-token-123', user: currentUser }];
  }
  return [401, { message: 'Invalid credentials. Please use test@example.com and password123' }];
});

mock.onPost('/api/auth/register').reply((config) => {
  const { name, email, password } = JSON.parse(config.data);
  currentUser = { ...currentUser, name, email };
  return [200, { token: 'mock-jwt-token-new', user: currentUser }];
});

// ------------- USER ROUTES -------------
mock.onGet('/api/users/me').reply((config) => {
  const token = config.headers.Authorization?.split(' ')[1];
  if (token) return [200, currentUser];
  return [401, { message: 'Unauthorized' }];
});

mock.onPut('/api/users/me').reply((config) => {
  const token = config.headers.Authorization?.split(' ')[1];
  if (token) {
    const data = JSON.parse(config.data);
    currentUser = { ...currentUser, ...data };
    return [200, currentUser];
  }
  return [401, { message: 'Unauthorized' }];
});

// ------------- MATCHES ROUTES -------------
mock.onGet('/api/matches').reply((config) => {
  const token = config.headers.Authorization?.split(' ')[1];
  if (token) return [200, mockMatches];
  return [401, { message: 'Unauthorized' }];
});

// ------------- REQUESTS ROUTES -------------
mock.onGet('/api/requests/incoming').reply((config) => {
  const token = config.headers.Authorization?.split(' ')[1];
  if (token) return [200, requestsIncoming];
  return [401, { message: 'Unauthorized' }];
});

mock.onGet('/api/requests/outgoing').reply((config) => {
  const token = config.headers.Authorization?.split(' ')[1];
  if (token) return [200, requestsOutgoing];
  return [401, { message: 'Unauthorized' }];
});

mock.onPost('/api/requests').reply((config) => {
  const token = config.headers.Authorization?.split(' ')[1];
  if (token) {
    const data = JSON.parse(config.data);
    const newReq = {
      _id: 'req_' + Math.random().toString(36).substr(2, 9),
      to: { _id: data.receiverId, name: 'Requested Match' },
      skillOffered: data.offeredSkill,
      skillWanted: data.wantedSkill,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    requestsOutgoing.push(newReq);
    return [201, newReq];
  }
  return [401, { message: 'Unauthorized' }];
});

// PATCH requests to accept/decline
mock.onPatch(/\/api\/requests\/.*\/accept/).reply((config) => {
  return [200, { message: 'Request accepted' }];
});

mock.onPatch(/\/api\/requests\/.*\/decline/).reply((config) => {
  return [200, { message: 'Request declined' }];
});

// ------------- SESSIONS ROUTES -------------
let mySessions = [
  {
    _id: 'session_1',
    partner: { _id: '5', name: 'Diana Prince' },
    role: 'offerer',
    skillExchanged: 'Node.js',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    reviewed: false
  },
  {
    _id: 'session_2',
    partner: { _id: '2', name: 'Alice Smith' },
    role: 'receiver',
    skillExchanged: 'Tailwind CSS',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    reviewed: false
  }
];

mock.onGet('/api/sessions/mine').reply((config) => {
  const token = config.headers.Authorization?.split(' ')[1];
  if (token) return [200, mySessions];
  return [401, { message: 'Unauthorized' }];
});

mock.onPatch(/\/api\/sessions\/.*\/schedule/).reply((config) => {
  return [200, { message: 'Session scheduled successfully' }];
});

mock.onPatch(/\/api\/sessions\/.*\/complete/).reply((config) => {
  const sessionId = config.url.split('/')[3];
  mySessions = mySessions.map((s) => s._id === sessionId ? { ...s, status: 'completed' } : s);
  return [200, { message: 'Session marked as complete' }];
});

mock.onPost('/api/reviews').reply((config) => {
  const token = config.headers.Authorization?.split(' ')[1];
  if (token) {
    const data = JSON.parse(config.data);
    mySessions = mySessions.map((s) => s._id === data.sessionId ? { ...s, reviewed: true } : s);
    return [201, { message: 'Review successfully added' }];
  }
  return [401, { message: 'Unauthorized' }];
});

export default mock;
