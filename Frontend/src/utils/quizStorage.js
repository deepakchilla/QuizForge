const STORAGE_KEY = 'quizforge_quizzes';
const SCORES_KEY = 'quizforge_scores';

export const DEFAULT_QUIZZES = [
  {
    id: 'quiz-web-dev',
    pin: '102488',
    title: 'Web Dev & React Masterclass',
    category: 'Tech & Code',
    gameMode: 'Solo',
    createdAt: '2026-10-01T10:00:00.000Z',
    questions: [
      {
        id: 'q1',
        text: 'Which hook in React is primarily used to perform side effects like subscriptions or data fetching?',
        time: 20,
        points: 100,
        options: ['useEffect', 'useState', 'useContext', 'useMemo'],
        correctAnswer: 0,
      },
      {
        id: 'q2',
        text: 'What is the primary architectural purpose of React\'s Virtual DOM?',
        time: 20,
        points: 120,
        options: [
          'Directly manipulate the browser GPU',
          'Minimize expensive real DOM repaints through batched diffing',
          'Replace JavaScript with WebAssembly',
          'Provide persistent client-side database storage',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        text: 'In modern CSS, which layout module is best suited for two-dimensional row and column structures?',
        time: 15,
        points: 100,
        options: ['inline-block', 'CSS Flexbox', 'CSS Grid', 'Flow Root'],
        correctAnswer: 2,
      },
      {
        id: 'q4',
        text: 'What does the acronym JSX stand for in the React ecosystem?',
        time: 15,
        points: 100,
        options: [
          'Java Syntax eXtension',
          'JavaScript XML',
          'JSON Schema eXchange',
          'Just-in-time Script X',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q5',
        text: 'Which React hook is designed to memoize computationally expensive calculation results between renders?',
        time: 20,
        points: 150,
        options: ['useRef', 'useCallback', 'useMemo', 'useReducer'],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 'quiz-science-space',
    pin: '774920',
    title: 'Science & Cosmos Odyssey',
    category: 'Science',
    gameMode: 'Team vs Team',
    createdAt: '2026-10-05T14:30:00.000Z',
    questions: [
      {
        id: 'q1',
        text: 'Which planet in our solar system features the most extensive and visible ring system?',
        time: 15,
        points: 100,
        options: ['Jupiter', 'Saturn', 'Neptune', 'Uranus'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        text: 'What subatomic particle with a negative electrical charge orbits the atomic nucleus?',
        time: 15,
        points: 100,
        options: ['Neutron', 'Proton', 'Positron', 'Electron'],
        correctAnswer: 3,
      },
      {
        id: 'q3',
        text: 'What is the approximate speed of light in a vacuum?',
        time: 20,
        points: 120,
        options: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '30,000 km/s'],
        correctAnswer: 0,
      },
      {
        id: 'q4',
        text: 'Which gas accounts for roughly 78% of the volume of Earth\'s atmosphere?',
        time: 15,
        points: 100,
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 'quiz-world-trivia',
    pin: '319452',
    title: 'World Geography & Wonders',
    category: 'General Knowledge',
    gameMode: 'Survival',
    createdAt: '2026-10-10T09:15:00.000Z',
    questions: [
      {
        id: 'q1',
        text: 'Which country is home to the iconic 15th-century Inca citadel of Machu Picchu?',
        time: 15,
        points: 100,
        options: ['Chile', 'Peru', 'Colombia', 'Bolivia'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        text: 'Which river is traditionally recognized as the longest in the world?',
        time: 15,
        points: 100,
        options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        text: 'How many officially confirmed elements are currently catalogued on the standard Periodic Table?',
        time: 20,
        points: 150,
        options: ['118', '112', '124', '108'],
        correctAnswer: 0,
      },
    ],
  },
];

/**
 * Initializes and returns all quizzes from localStorage, seeding defaults if empty.
 */
export function getQuizzes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUIZZES));
      return DEFAULT_QUIZZES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUIZZES));
      return DEFAULT_QUIZZES;
    }
    return parsed;
  } catch (error) {
    console.error('Error reading quizzes from localStorage:', error);
    return DEFAULT_QUIZZES;
  }
}

/**
 * Generates a unique 6-digit numeric PIN not already used.
 */
export function generateUniquePin() {
  const existingQuizzes = getQuizzes();
  const existingPins = new Set(existingQuizzes.map((q) => String(q.pin)));
  
  let attempts = 0;
  while (attempts < 1000) {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    if (!existingPins.has(pin)) {
      return pin;
    }
    attempts++;
  }
  return String(Date.now()).slice(-6);
}

/**
 * Finds a quiz by 6-digit PIN.
 */
export function getQuizByPin(pin) {
  if (!pin) return null;
  const cleanPin = String(pin).trim();
  const quizzes = getQuizzes();
  return quizzes.find((q) => String(q.pin).trim() === cleanPin) || null;
}

/**
 * Finds a quiz by ID.
 */
export function getQuizById(id) {
  if (!id) return null;
  const quizzes = getQuizzes();
  return quizzes.find((q) => q.id === id) || null;
}

/**
 * Saves a new quiz or updates an existing quiz in localStorage.
 */
export function saveQuiz(quizData) {
  const quizzes = getQuizzes();
  const pin = quizData.pin || generateUniquePin();
  const id = quizData.id || `quiz-${Date.now()}`;
  const createdAt = quizData.createdAt || new Date().toISOString();

  const formattedQuiz = {
    ...quizData,
    id,
    pin,
    createdAt,
  };

  const existingIndex = quizzes.findIndex((q) => q.id === id || q.pin === pin);
  let updatedList;
  if (existingIndex >= 0) {
    updatedList = [...quizzes];
    updatedList[existingIndex] = formattedQuiz;
  } else {
    updatedList = [formattedQuiz, ...quizzes];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (error) {
    console.error('Error writing quiz to localStorage:', error);
  }

  return formattedQuiz;
}

/**
 * Saves a score record for a quiz.
 */
export function saveGameScore(pin, scoreRecord) {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const allScores = raw ? JSON.parse(raw) : {};
    const quizScores = allScores[pin] || [];

    const recordWithMeta = {
      ...scoreRecord,
      timestamp: new Date().toISOString(),
    };

    allScores[pin] = [recordWithMeta, ...quizScores].slice(0, 50); // keep last 50
    localStorage.setItem(SCORES_KEY, JSON.stringify(allScores));
    return recordWithMeta;
  } catch (err) {
    console.error('Failed to save score:', err);
    return null;
  }
}

/**
 * Gets high scores / leaderboard for a quiz PIN.
 */
export function getGameScores(pin) {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    const allScores = JSON.parse(raw);
    const list = allScores[pin] || [];
    return list.sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}
