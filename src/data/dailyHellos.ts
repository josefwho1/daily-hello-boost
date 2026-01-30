export interface DailyHello {
  id: number;
  title: string;
  description: string;
  suggestion?: string;
}

export const dailyHellos: DailyHello[] = [
  { id: 1, title: "Neighborino", description: "Introduce yourself to a neighbour you haven't met properly and get their name", suggestion: "Catch them while getting mail, taking out trash, or arriving home. Start with: I don't think we've officially met, I'm [Your Name]! Ask how long they've lived here." },
  { id: 2, title: "Name to the Face", description: "Introduce yourself to someone you've seen many times before but never got their name", suggestion: "Start with honesty: I see you here all the time but I don't think we've properly met. I'm [Name]! Works great at the gym, coffee shop, or dog park." },
  { id: 3, title: "Barista", description: "Trade names with your local barista", suggestion: "After they take your order, say: I'm here all the time but don't know your name, I'm [Name]! Use their name when you pick up your order: Thanks, [Name]!" },
  { id: 4, title: "Future Friend", description: "Get the contact info of someone new and suggest a meet-up (coffee, walk, activity)", suggestion: "After a good conversation: I'd love to continue this sometime, want to grab coffee next week? Exchange numbers or Instagram. Actually follow up." },
  { id: 5, title: "Forget & Forgive", description: "Ask for someone's name that you should already know (then log it so you don't forget again)", suggestion: "Be honest: I'm terrible with names and I'm embarrassed I don't remember yours. Can you remind me? People appreciate the honesty." },
  { id: 6, title: "Learn & Repeat", description: "Get the name of someone new and use it at least twice during your interaction", suggestion: "When they tell you their name, repeat it immediately: Nice to meet you, [Name]! Use it again when saying goodbye: Great talking to you, [Name]!" },
  { id: 7, title: "Old Timer", description: "Say hello and chat with an elderly person - grandfather/grandmother vibes", suggestion: "Elderly people are often lonely and love to talk. Ask about their life: Have you lived here long? What was it like back then? They'll share amazing stories." },
  { id: 8, title: "Lunch Date", description: "Ask if you can join someone's table. A complete stranger is ideal, a familiar face if not.", suggestion: "Look for someone eating alone. Approach with: Mind if I join you? or This place is packed, okay if I sit here?" },
  { id: 9, title: "Words of Wisdom", description: "Meet someone older than you and get advice from them", suggestion: "Find someone 15+ years older. Ask: Can I ask you something? What's one piece of advice you'd give someone my age? People love sharing wisdom." },
  { id: 10, title: "Grasshopper", description: "Ask to learn something new from a colleague, friend, or stranger", suggestion: "Spot someone doing something interesting (playing guitar, sketching, working on a laptop). Ask: I've always wanted to learn X, any tips?" },
  { id: 11, title: "Fresh Perspective", description: "Get a stranger's perspective on an idea, challenge, or situation you're experiencing", suggestion: "Frame it as genuine curiosity: Can I get your take on something? I'm deciding between [X and Y] - what would you do?" },
  { id: 12, title: "Reconnect", description: "Reach out to someone (friend, family, or colleague) you haven't spoken to in 30+ days", suggestion: "Send a simple text: Hey! It's been a while. How've you been? or call them out of the blue. Don't overthink it." },
  { id: 13, title: "Queue Chat", description: "Make waiting in line suck less by starting small talk", suggestion: "Make a relatable observation: This line is crazy, right? Must be good. or Have you been here before? What's good?" },
  { id: 14, title: "What Brings You Here?", description: "Ask someone what brought them to this place today", suggestion: "Works at coffee shops, parks, events. Simple opener: First time here? What brings you in? Genuine curiosity goes a long way." },
  { id: 15, title: "Book Chat", description: "Talk to someone about the book they're reading (or ask about it)", suggestion: "Approach with: Oh, I've heard of that book! What do you think of it so far? Even if you haven't heard of it, ask what it's about." },
  { id: 16, title: "What's Fun Around Here?", description: "Ask someone what they like to do for fun in the area", suggestion: "Great for new places. Ask: I'm new around here - what's fun to do on weekends? or Any hidden gems I should know about?" },
  { id: 17, title: "Awkward Elevator", description: "Break the awkward elevator silence and say hello", suggestion: "As doors close, smile and say: How's your day going? Don't overthink it. Elevators are short, just be friendly." },
  { id: 18, title: "Ask for a Recommendation", description: "Ask someone for a recommendation - cafe, lunch spot, anything", suggestion: "Spot someone with coffee/food and ask: That looks good, where'd you get it? or I'm looking for a good lunch spot, any favorites?" },
  { id: 19, title: "Cute dog", description: "Ask someone about their pet (if they have one)", suggestion: "Dogs are conversation magnets. Ask: What's their name? How old? People will talk about their pets forever." },
  { id: 20, title: "Staff Favorite", description: "When ordering from a store, ask the staff what their favorite item is", suggestion: "At checkout or ordering counter: What's YOUR favorite thing here? or if you're stuck between two items ask them which they think is better." },
  { id: 21, title: "Small Favor", description: "Ask someone for a small favor (napkin, directions, time)", suggestion: "People love being helpful, try Excuse me, do you have the time? or Could you watch my stuff for a sec?" },
  { id: 22, title: "Weekend Plans?", description: "Ask someone what their weekend plans are", suggestion: "Friday or Thursday afternoon: Any fun plans for the weekend? People love talking about upcoming activities." },
  { id: 23, title: "Ask for a Local Gem", description: "Ask if they know any good places to catch the sunset, grab coffee, etc.", suggestion: "Be specific: I'm trying to find the best sunset spot around here, know any good ones? Locals love sharing secrets." },
  { id: 24, title: "Silent Hello", description: "Give someone the smile and nod, no words, just acknowledgment", suggestion: "Make eye contact, smile genuinely, and nod. If they smile back, you can escalate to verbal hello next time." },
  { id: 25, title: "Ask for Directions", description: "Ask a stranger for directions", suggestion: "Classic opener. Even if you have GPS: Quick question, do you know where [place] is? If they help, thank them and introduce yourself." },
  { id: 26, title: "Eye Contact Challenge", description: "Make eye contact with someone, then approach and say hello", suggestion: "Hold eye contact for 2-3 seconds. If they don't look away, that's your green light. Walk over: Hey! You looked friendly so I thought I'd say hi." },
  { id: 27, title: "Weather Chat Upgrade", description: "Take a boring weather comment one step further", suggestion: "Start with weather: Beautiful day, right? Then add: Are you headed somewhere fun? or Any plans to enjoy it?" },
  { id: 28, title: "Shared Confusion", description: "Admit you're confused about something nearby and bond over it", suggestion: "Look confused (at a map, menu, sign). Turn to someone: Do you understand this? I'm totally lost. Laugh about it together." },
  { id: 29, title: "Help Me Decide", description: "Ask someone to help you decide something small", suggestion: "Hold up two items: Quick question, which one would you get? Works at stores, cafes, anywhere." },
  { id: 30, title: "Practice Makes Perfect", description: "Tell someone you're practicing talking to strangers", suggestion: "Be honest: This is random, but I'm trying to get better at meeting people. Mind if I practice by asking your name?" },
  { id: 31, title: "Would You Rather", description: "Ask someone a fun hypothetical question", suggestion: "Keep it light: Would you rather fight 10 horse sized ducks or 1 duck sized horse? Follow up with: which would you rather own?" },
  { id: 32, title: "Compliment", description: "Give a stranger a genuine compliment", suggestion: "Clothes and accessories work best. I love your shirt, where did you get it from? Nice shoes, are you into running?" },
  { id: 33, title: "What's Your Go-To?", description: "Ask someone what their default order is at this place", suggestion: "At a cafe/restaurant: You look like a regular, what's your go-to order here?" },
  { id: 34, title: "Parental guidance", description: "Call your mum or dad and ask them for advice on something", suggestion: "Pick up the phone and call (don't text). Ask: Hey, can I get your advice on something? They'll be thrilled you called instead of texted." },
  { id: 35, title: "Voice note", description: "Be that friend, send a voice to someone you're not in an active conversation with", suggestion: "Record a casual 30-second voice note: Hey! Just thinking of you, how've you been? No need for a reason, just reach out." },
  { id: 36, title: "Throwback", description: "Reach out to an old friend from school or work you haven't spoken to in 3+ months", suggestion: "Send a simple message: Hey [Name]! It's been forever. What have you been up to? Include a specific memory if you can." },
  { id: 37, title: "Extended Fam", description: "Reach out to someone in your extended family (cousin, uncle, aunt)", suggestion: "Text or call a family member you don't talk to regularly: Hey [Name], it's been too long! How are you doing? Ask about their life." },
  { id: 38, title: "The Organiser", description: "Take the lead and message friends or a group chat to organise a meetup", suggestion: "Don't wait for someone else. Send: Hey team, what are your thoughts on [activity] this weekend? Suggest a specific time and place." },
  { id: 39, title: "Shameless plug", description: "Use One Hello as an excuse to introduce yourself to someone new", suggestion: "Approach with: This is random, but I'm trying this app called One Hello to meet more people. Mind if I introduce myself? I'm [Name]." },
  { id: 40, title: "Phone a friend", description: "Give a friend a call out of the blue. No warning, just dial", suggestion: "Don't text first, just call. When they answer: Hey! Did I catch you at a good time? If voicemail, leave a friendly message." },
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
