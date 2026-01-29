export interface DailyHello {
  id: number;
  title: string;
  description: string;
  suggestion?: string;
}

export const dailyHellos: DailyHello[] = [
  { id: 1, title: "Future Friend", description: "Get the contact of someone new and suggest a meet-up (coffee, walk, activity etc)", suggestion: "You seem cool - want to grab a coffee sometime?" },
  { id: 2, title: "Forget & Forgive", description: "Ask for someone's name that you should already know", suggestion: "I'm so sorry, I've forgotten your name, I'm Remi" },
  { id: 3, title: "Free Coffee", description: "Buy a stranger a coffee", suggestion: "Pre-pay for the person behind you in line" },
  { id: 4, title: "Neighborino", description: "Introduce yourself to a neighbour you haven't met properly and get their name", suggestion: "Hey, I think we're neighbours, wanted to introduce myself..." },
  { id: 5, title: "Name to the Face", description: "Introduce yourself to someone you've seen many times before but never got their name", suggestion: "Hey I see you around all the time, I'm Remi" },
  { id: 6, title: "Words of Wisdom", description: "Meet someone older than you and get a bit of advice from them", suggestion: "Would love to get your thoughts, what do you think makes a happy life?" },
  { id: 7, title: "Lunch date", description: "Ask if you can join someone's table. A complete stranger is S-tier, a familiar face if not." },
  { id: 8, title: "Grasshopper", description: "Reach out and learn something new from a colleague, friend or stranger" },
  { id: 9, title: "Perspective", description: "Get a stranger's perspective on an idea, challenge or situation you are experiencing" },
  { id: 10, title: "Chest bump", description: "Not for the faint hearted. Befriend a stranger and get a chest bump. Film it and tag @onehelloapp" },
  { id: 11, title: "Jokester", description: "Make a stranger laugh by telling them a joke. Here's a couple you can try" },
  { id: 12, title: "Forgotten name", description: "Ask for someone's name that you should already know" },
  { id: 13, title: "Postcard", description: "These still exist, imagine the surprise when your friend or family receive one. Go make it happen", suggestion: "I was thinking about you at the shops, hope you are doing well." },
  { id: 14, title: "Can I have yo number", description: "Get someone's contact info" },
  { id: 15, title: "Check In", description: "Reach out to someone (friend, family or colleague) that you haven't spoken to in a while.", suggestion: "Hey X, it's been a while - how have you been?" },
  { id: 16, title: "Old timer", description: "Say hello to an elderly person, grandfather/grandmother vibes", suggestion: "Hello (you old fart) jk please don't say that 🦝" },
  { id: 17, title: "Long lines suckkk", description: "Make them suck less by starting some small talk in a queue", suggestion: "Hey, have you been here before? What are you going to get?" },
  { id: 18, title: "Super random", description: "Start with: \"Mind if I say something random?\" then something random???", suggestion: "I like your shoes, Crocodiles are pretty much birds" },
  { id: 19, title: "Appreciation", description: "Tell someone you appreciate them", suggestion: "Thanks, appreciate you!" },
  { id: 20, title: "Love your energy", description: "Tell someone they have great energy", suggestion: "Love your energy 🔥" },
  { id: 21, title: "Happy Monday!", description: "Wish someone \"Happy [day of the week]!\"", suggestion: "Happy Tuesday" },
  { id: 22, title: "Fit Checkkkk", description: "Ask for an opinion on your outfit", suggestion: "Hey, can I get your opinion? What do you think of my outfit?" },
  { id: 23, title: "Learn & Repeat", description: "Get the name of someone new and use it during your interaction.", suggestion: "Nice to meet you, Caleb." },
  { id: 24, title: "Shameless plug", description: "Name drop One Hello and use it as an excuse to meet someone.", suggestion: "\"Hey I'm trying this app out to meet more strangers, it's called One Hello\"" },
  { id: 25, title: "Opposites attract", description: "Meet someone new from the opposite gender", suggestion: "Heyyyyyyyyyyy" },
  { id: 26, title: "Influenceerrrrr", description: "Ask someone to take a photo of you. Post & tag @onehelloapp if you dare 🦝", suggestion: "Hey, could you please take a photo of me?" },
  { id: 27, title: "High Five", description: "Get a high five from a stranger", suggestion: "Highfive???" },
  { id: 28, title: "Bump it 🤜🤛", description: "Get a fist bump from a stranger", suggestion: "Bump it" },
  { id: 29, title: "Recommendation", description: "Ask someone for a recommendation, cafe, lunch spot, anything", suggestion: "\"Hey I'm looking for a good coffee spot, wondering if you know any?\"" },
  { id: 30, title: "Cute dog", description: "Ask someone about their pet (if they have one)", suggestion: "Cute Dog, what's their name?" },
  { id: 31, title: "Staff favourite", description: "When ordering something from a store, ask the staff what is their favourite item?", suggestion: "\"Hmm, which one is your favourite?" },
  { id: 32, title: "Small favour", description: "Ask someone for a small favour (napkin, direction, time)", suggestion: "Hey, do you happen to know the time my phone is dead?" },
  { id: 33, title: "Weekendddd", description: "Ask someone what their weekend plans are", suggestion: "Much planned for the weekend?" },
  { id: 34, title: "Mondays am I right?!", description: "Make a comment on the day of the week", suggestion: "Sesh, Monday's am I right?" },
  { id: 35, title: "Good morning?", description: "Ask someone how their morning has been", suggestion: "How's your morning going?" },
  { id: 36, title: "Local or nah", description: "Ask someone if they're from around here", suggestion: "Are you from around here? You from here?" },
  { id: 37, title: "Book Club", description: "Talk to someone about the book they are reading (or simply ask about it)", suggestion: "Hey, what are you reading?" },
  { id: 38, title: "What brings?", description: "Ask someone what brings them here", suggestion: "What brings you to *your location/city*?" },
  { id: 39, title: "Orange obviously", description: "Ask someone what their favourite colour is", suggestion: "Hey, random question, what is your favourite colour?" },
  { id: 40, title: "Raccoons obviously", description: "Ask someone what their favourite animal is", suggestion: "Hey, random question, what is your favourite animal?" },
  { id: 41, title: "Feeling snacky", description: "Ask someone what they're eating/drinking & where they got it from", suggestion: "Hey that looks good, where did you get it from?" },
  { id: 42, title: "Keyboard warrior", description: "Ask someone what they're working on (if they're on a laptop)", suggestion: "Hey, what are you working on?" },
  { id: 43, title: "I want a Remi Tee", description: "Ask someone where they got their shirt from", suggestion: "Hey, I like your shirt, where did you get it from?" },
  { id: 44, title: "Style points", description: "Compliment someone's style", suggestion: "Hey, I really like your style" },
  { id: 45, title: "Lone wolf", description: "Greet someone sitting alone", suggestion: "Hey, how's your day going?" },
  { id: 46, title: "Four Eyes", description: "Compliment someone's glasses (or sunglasses)", suggestion: "I like your glasses" },
  { id: 47, title: "Awkward Elevator", description: "Break the silence & say hello to someone in an elevator", suggestion: "Love an awkward elevator ride hahahaha" },
  { id: 48, title: "For funsies", description: "Find out what someone likes to do for fun around here", suggestion: "What do you like to get up to for fun?" },
  { id: 49, title: "Phone a friend", description: "Give a friend a call, no warning, just call and try. If they answer great, if not, no stress.", suggestion: "Hey mate how have you been, did I catch you at an alright time?" },
  { id: 50, title: "Voice note", description: "Be that friend, send a voice note to someone you're not in an active conversation with", suggestion: "Yo yoooo it's Remi here, how have you beennnn?" },
  { id: 51, title: "Coffee catch up", description: "Reach out to someone to organise a coffee catch up", suggestion: "Hey, what are you up to this week, want to grab a coffee?" },
  { id: 52, title: "Rememe", description: "Send a Remi meme to someone who doesn't use One Hello you can find them @onehelloapp" },
  { id: 53, title: "Darn Timezones", description: "Set up a call with someone who is in another timezone" },
  { id: 54, title: "Calendar Invite", description: "We all have that one friend who operates out of a google calendar, send them an invite to catch up" },
  { id: 55, title: "Email 📧", description: "Throwback, no prompt, send an email to your dad, a friend or family member and see if they notice" },
  { id: 56, title: "Silent Hello", description: "Give someone the ole smile and nod - no words, just acknowledgement" },
  { id: 57, title: "Nice Moustache", description: "Compliment someone on their facial hair" },
  { id: 58, title: "Hugs", description: "Make friends with someone and ask for a hug" },
  { id: 59, title: "Selfieeeee", description: "Get a selfie with someone new" },
  { id: 60, title: "Google Maps", description: "Ask a stranger for directions" },
  { id: 61, title: "Worcester Sauce", description: "Ask someone how to pronounce something", suggestion: "Worcester?" },
  { id: 62, title: "Awkwarddd 👀", description: "Make eye contact with someone, then go approach and say hello", suggestion: "Hey sorry I was making awkward eye contact so I thought to just come say hello" },
  { id: 63, title: "That's trippy", description: "Start a conversation and somehow weave in the word Kaleidoscope in the conversation" },
  { id: 64, title: "Elephant in the room", description: "Address the proverbial elephant in the room by mentioning elephants in your conversation" },
  { id: 65, title: "How have you been?", description: "Message an old friend, colleague or acquaintance you haven't spoken to in over 3 months", suggestion: "\"Hey, how have you been?\"" },
  { id: 66, title: "Weather Upgrade", description: "Take a boring weather comment one step further", suggestion: "\"Perfect weather for a nap, hey?\" \"It's raining cats & dogs today\"" },
  { id: 67, title: "Shared Confusion", description: "Admit you're confused about something nearby", suggestion: "\"I have no idea what's going on, do you?\"" },
  { id: 68, title: "Indecisive", description: "Ask someone to help you decide something small", suggestion: "\"I can't decide whether to get the chicken or fish\"" },
  { id: 69, title: "Name Guess", description: "Take a stab at guessing someone's name", suggestion: "\"You look like a [name]… am I close?\"" },
  { id: 70, title: "Country Guess", description: "Take a stab at guessing where someone is from", suggestion: "\"You look like you're from... am I close?\"" },
  { id: 71, title: "NPC", description: "Say something oddly formal", suggestion: "\"Greetings, fellow human\"" },
  { id: 72, title: "Soundtrack Moment", description: "Comment on background music or noise" },
  { id: 73, title: "Default Order", description: "Ask someone what their go to order is", suggestion: "\"What's your go-to order?\"" },
  { id: 74, title: "Secret Share", description: "Tell a stranger one harmless secret (\"I'm terrified of elevators\")", suggestion: "Can I tell you a secret?" },
  { id: 75, title: "Practice makes perfect", description: "Tell someone you are practicing talking to strangers to break the ice", suggestion: "\"I'm practising talking to strangers\"" },
  { id: 76, title: "Throwback", description: "Reach out to an old friend from school" },
  { id: 77, title: "Extended Fam", description: "Reach out someone in your extended family (cousin, uncle, etc)" },
  { id: 78, title: "Coffee recommendation", description: "Ask someone about their favourite coffee spot (helps if they are holding one)" },
  { id: 79, title: "Next destination", description: "Ask someone what their next travel destination is" },
  { id: 80, title: "New here", description: "Express you are new to the area and looking to meet more people", suggestion: "\"Hey I'm new here, mind if I say hello?\"" },
  { id: 81, title: "Dating advice", description: "Ask someone for some dating advice", suggestion: "Gift advice if you have a partner, first date advice if you're single" },
  { id: 82, title: "Top 3", description: "Ask someone what their top 3 is", suggestion: "Top 3 favourite fruits, ice cream flavours," },
  { id: 83, title: "Hypothetical", description: "Ask someone a hypothetical here's a couple to choose from", suggestion: "10 horse sized ducks or 1 duck sized horse?" },
  { id: 84, title: "Biceps.", description: "Get the name of someone at your local gym or training area", suggestion: "Hey, what are you training today?" },
];

// Seeded random shuffle - same seed = same order for all users
const seededShuffle = (array: DailyHello[], seed: number): DailyHello[] => {
  const shuffled = [...array];
  let currentSeed = seed;
  
  // Simple seeded random number generator (mulberry32)
  const random = () => {
    currentSeed = (currentSeed + 0x6D2B79F5) | 0;
    let t = currentSeed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  
  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Get today's hello - same for all users on the same day
export const getTodaysHello = (): DailyHello => {
  const now = new Date();
  
  // Use year as seed for consistent yearly shuffle
  const yearSeed = now.getFullYear();
  const shuffledHellos = seededShuffle(dailyHellos, yearSeed);
  
  // Get day of year (1-365/366)
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Cycle through shuffled list
  const index = dayOfYear % shuffledHellos.length;
  return shuffledHellos[index];
};
