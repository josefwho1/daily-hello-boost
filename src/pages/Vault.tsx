import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight, Sparkles, Globe, Lightbulb, MessageCircle, Image } from "lucide-react";
import { onboardingChallenges } from "@/data/onboardingChallenges";
import { wallpapers, type Wallpaper } from "@/data/wallpapers";
import { WallpaperPreviewDialog } from "@/components/WallpaperPreviewDialog";
import remiMascot from "@/assets/remi-waving.webp";
import vaultIcon from "@/assets/vault-icon.webp";

// Four types of hello for reference
const fourTypesOfHello = [
  {
    id: 1,
    title: "Greeting",
    description: "A simple hello to acknowledge someone",
    examples: ["Hello", "Hey", "Good morning"],
    tip: "A smile makes all the difference"
  },
  {
    id: 2,
    title: "Observation",
    description: "Comment on something you're both experiencing",
    examples: ["Nice weather today", "Long line, hey?", "Love the vibe here"],
    tip: "Great for waiting situations"
  },
  {
    id: 3,
    title: "Compliment",
    description: "Give someone a genuine compliment",
    examples: ["Love your jacket", "Nice shoes", "Cool shirt"],
    tip: "Clothing or accessories work great"
  },
  {
    id: 4,
    title: "Question",
    description: "Ask something to get to know them",
    examples: ["How's your day going?", "Where are you from?", "What brings you here?"],
    tip: "Open-ended questions lead to better conversations"
  }
];

// Hello in 50 languages
const helloLanguages = [
  { language: "English", hello: "Hello", flag: "🇬🇧" },
  { language: "Spanish", hello: "Hola", flag: "🇪🇸" },
  { language: "French", hello: "Bonjour", flag: "🇫🇷" },
  { language: "German", hello: "Hallo", flag: "🇩🇪" },
  { language: "Italian", hello: "Ciao", flag: "🇮🇹" },
  { language: "Portuguese", hello: "Olá", flag: "🇵🇹" },
  { language: "Japanese", hello: "こんにちは (Konnichiwa)", flag: "🇯🇵" },
  { language: "Korean", hello: "안녕하세요 (Annyeonghaseyo)", flag: "🇰🇷" },
  { language: "Mandarin", hello: "你好 (Nǐ hǎo)", flag: "🇨🇳" },
  { language: "Arabic", hello: "مرحبا (Marhaba)", flag: "🇸🇦" },
  { language: "Hindi", hello: "नमस्ते (Namaste)", flag: "🇮🇳" },
  { language: "Russian", hello: "Привет (Privet)", flag: "🇷🇺" },
  { language: "Dutch", hello: "Hallo", flag: "🇳🇱" },
  { language: "Swedish", hello: "Hej", flag: "🇸🇪" },
  { language: "Norwegian", hello: "Hei", flag: "🇳🇴" },
  { language: "Danish", hello: "Hej", flag: "🇩🇰" },
  { language: "Finnish", hello: "Hei", flag: "🇫🇮" },
  { language: "Polish", hello: "Cześć", flag: "🇵🇱" },
  { language: "Czech", hello: "Ahoj", flag: "🇨🇿" },
  { language: "Greek", hello: "Γειά σου (Yia sou)", flag: "🇬🇷" },
  { language: "Turkish", hello: "Merhaba", flag: "🇹🇷" },
  { language: "Hebrew", hello: "שלום (Shalom)", flag: "🇮🇱" },
  { language: "Thai", hello: "สวัสดี (Sawadee)", flag: "🇹🇭" },
  { language: "Vietnamese", hello: "Xin chào", flag: "🇻🇳" },
  { language: "Indonesian", hello: "Halo", flag: "🇮🇩" },
  { language: "Malay", hello: "Hai", flag: "🇲🇾" },
  { language: "Tagalog", hello: "Kamusta", flag: "🇵🇭" },
  { language: "Swahili", hello: "Jambo", flag: "🇰🇪" },
  { language: "Zulu", hello: "Sawubona", flag: "🇿🇦" },
  { language: "Afrikaans", hello: "Hallo", flag: "🇿🇦" },
  { language: "Romanian", hello: "Bună", flag: "🇷🇴" },
  { language: "Hungarian", hello: "Szia", flag: "🇭🇺" },
  { language: "Ukrainian", hello: "Привіт (Pryvit)", flag: "🇺🇦" },
  { language: "Bengali", hello: "হ্যালো (Hyālo)", flag: "🇧🇩" },
  { language: "Tamil", hello: "வணக்கம் (Vanakkam)", flag: "🇮🇳" },
  { language: "Persian", hello: "سلام (Salaam)", flag: "🇮🇷" },
  { language: "Urdu", hello: "السلام علیکم (Assalam u Alaikum)", flag: "🇵🇰" },
  { language: "Nepali", hello: "नमस्ते (Namaste)", flag: "🇳🇵" },
  { language: "Burmese", hello: "မင်္ဂလာပါ (Mingalaba)", flag: "🇲🇲" },
  { language: "Khmer", hello: "សួស្តី (Suostei)", flag: "🇰🇭" },
  { language: "Lao", hello: "ສະບາຍດີ (Sabaidee)", flag: "🇱🇦" },
  { language: "Mongolian", hello: "Сайн уу (Sain uu)", flag: "🇲🇳" },
  { language: "Georgian", hello: "გამარჯობა (Gamarjoba)", flag: "🇬🇪" },
  { language: "Armenian", hello: "Բdelays (Barev)", flag: "🇦🇲" },
  { language: "Icelandic", hello: "Halló", flag: "🇮🇸" },
  { language: "Irish", hello: "Dia duit", flag: "🇮🇪" },
  { language: "Welsh", hello: "Helo", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { language: "Scottish Gaelic", hello: "Halò", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { language: "Maltese", hello: "Ħello", flag: "🇲🇹" },
  { language: "Estonian", hello: "Tere", flag: "🇪🇪" },
];

// Remi's Top Tips
const remiTips = [
  { title: "A smile is the universal hello — it works in every language.", subtitle: "Simple. Friendly. Always welcome." },
  { title: "99% of people light up when a stranger is simply kind.", subtitle: "Pretty good odds if you ask me 🦝" },
  { title: "Some people are having a bad day, don't hear you, or don't speak your language — that's okay. Don't take it personally.", subtitle: "Can't win them all 🦝" },
  { title: "Most people want connection — they're just waiting for someone to go first.", subtitle: "Be the one who opens the door. If no one does, who will? 🦝" },
  { title: "Listen more than you talk — people love being heard.", subtitle: "Ask questions, be curious. Humans are pretty cool. (nearly as cool as raccoons) 🦝" },
  { title: "You don't need the perfect line — \"Hey, how's your day?\" is always enough.", subtitle: "Don't overthink it. 🦝" },
  { title: "Remember their name — it's the sweetest sound to anyone.", subtitle: "People feel seen when you say their name back. Write them down in here so you don't forget. 🦝" },
  { title: "Everyone feels awkward sometimes — even the confident ones.", subtitle: "Being social takes time & energy, it's okay to feel a little off sometimes (just make sure to use an Orb to save your streak) 🦝" },
  { title: "Courage comes before confidence. Every hello is practice. The more you do it, the braver you get.", subtitle: "Get those reps in. Trust me, it gets easier (and really fun) 🦝" },
  { title: "A hello costs nothing, but can change everything.", subtitle: "It could be the beginning of a new friendship, relationship, business opportunity, or maybe just a spark of brightness in someone's day." },
];

const REMI_MESSAGES = [
  "Hello!",
  "Hey!",
  "Yo yo yooo",
  "Okay that's enough...",
  null // Remi disappears
];

const Vault = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [remiTapCount, setRemiTapCount] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleRemiTap = () => {
    if (remiTapCount >= REMI_MESSAGES.length) return;
    
    setRemiTapCount(prev => prev + 1);
    setShowSpeechBubble(true);
    
    // Hide speech bubble after a delay (except for the final "scared away" message)
    if (remiTapCount < REMI_MESSAGES.length - 1) {
      setTimeout(() => setShowSpeechBubble(false), 2000);
    }
  };

  const remiMessage = remiTapCount > 0 ? REMI_MESSAGES[remiTapCount - 1] : null;
  const isRemiGone = remiTapCount >= REMI_MESSAGES.length;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Easter Egg Discovery Message */}
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-center animate-fade-in">
          <p className="text-sm font-medium text-primary">✨ You found Remi's Vault!</p>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src={vaultIcon} alt="Vault" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Remi's Vault</h1>
            <p className="text-sm text-muted-foreground">Secrets, extras & goodies</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {/* First Hellos - FIRST (Always unlocked) */}
          <Card 
            className="p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => toggleSection('4types')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">First Hellos</h3>
                  <p className="text-xs text-muted-foreground">Master the basics</p>
                </div>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                  expandedSection === '4types' ? 'rotate-90' : ''
                }`} 
              />
            </div>
            
            {expandedSection === '4types' && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {fourTypesOfHello.map((hello, index) => (
                  <div 
                    key={hello.id}
                    className="p-3 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">{hello.title}</p>
                        <p className="text-sm text-muted-foreground">{hello.description}</p>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground/70">Examples:</p>
                          <div className="flex flex-wrap gap-1">
                            {hello.examples.map((example, i) => (
                              <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                "{example}"
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground/80 italic">💡 {hello.tip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Remi's Top Tips - SECOND */}
          <Card 
            className="p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => toggleSection('tips')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Remi's Top Tips</h3>
                  <p className="text-xs text-muted-foreground">10 golden rules</p>
                </div>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                  expandedSection === 'tips' ? 'rotate-90' : ''
                }`} 
              />
            </div>
            
            {expandedSection === 'tips' && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {remiTips.map((tip, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-muted/50 rounded-xl"
                  >
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {index + 1}. {tip.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{tip.subtitle}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Hello in 50 Languages - THIRD */}
          <Card 
            className="p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => toggleSection('languages')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Hello in 50 Languages</h3>
                  <p className="text-xs text-muted-foreground">Say hello worldwide</p>
                </div>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                  expandedSection === 'languages' ? 'rotate-90' : ''
                }`} 
              />
            </div>
            
            {expandedSection === 'languages' && (
              <div className="mt-4 max-h-64 overflow-y-auto space-y-1 animate-fade-in">
                {helloLanguages.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg"
                  >
                    <span className="text-xl">{item.flag}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.language}</p>
                    </div>
                    <p className="text-sm text-primary font-medium">{item.hello}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* The Original 7-Day Challenge - FOURTH (Always unlocked) */}
          <Card 
            className="p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => toggleSection('7day')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">The Original 7-Day Challenge</h3>
                  <p className="text-xs text-muted-foreground">7 ways to break the ice</p>
                </div>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                  expandedSection === '7day' ? 'rotate-90' : ''
                }`} 
              />
            </div>
            
            {expandedSection === '7day' && (
              <div className="mt-4 space-y-2 animate-fade-in">
                {onboardingChallenges.map((challenge, index) => (
                  <div 
                    key={challenge.id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground text-sm">
                        {challenge.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      <p className="text-xs italic text-suggestion">💡 {challenge.suggestion}</p>
                      <p className="text-xs text-muted-foreground/80">📝 {challenge.tips}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Wallpapers Section (Always unlocked, easter-egg style) */}
          <Card 
            className="p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => toggleSection('wallpapers')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Image className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Wallpapers</h3>
                  <p className="text-xs text-muted-foreground">Free Remi phone backgrounds 🦝</p>
                </div>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                  expandedSection === 'wallpapers' ? 'rotate-90' : ''
                }`} 
              />
            </div>
            
            {expandedSection === 'wallpapers' && (
              <div className="mt-4 animate-fade-in">
                <div className="grid grid-cols-3 gap-2">
                  {wallpapers.map((wallpaper) => (
                    <button
                      key={wallpaper.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWallpaper(wallpaper);
                      }}
                      className="aspect-[9/16] rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <img
                        src={wallpaper.previewUrl}
                        alt={wallpaper.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Tap to preview & download
                </p>
              </div>
            )}
          </Card>

          {/* More Packs Coming Soon */}
          <Card className="p-4 rounded-2xl opacity-60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">More Packs</h3>
                  <p className="text-xs text-muted-foreground">Dating, Networking & more</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Coming Soon</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Remi peeking from bottom - Easter Egg */}
      <div className="fixed bottom-20 right-4">
        <div className="relative">
          {/* Speech bubble */}
          {showSpeechBubble && remiMessage && !isRemiGone && (
            <div className="absolute -top-12 right-0 bg-white dark:bg-card rounded-xl px-3 py-2 shadow-lg animate-scale-in whitespace-nowrap">
              <p className="text-sm font-medium text-foreground">{remiMessage}</p>
              <div className="absolute -bottom-1 right-4 w-3 h-3 bg-white dark:bg-card rotate-45 shadow-lg" />
            </div>
          )}
          
          {/* "Scared away" message */}
          {isRemiGone && (
            <div className="bg-muted/80 rounded-xl px-3 py-2 shadow-lg animate-fade-in whitespace-nowrap">
              <p className="text-xs text-muted-foreground">You scared Remi away...</p>
            </div>
          )}
          
          {/* Remi mascot */}
          {!isRemiGone && (
            <button
              onClick={handleRemiTap}
              className="focus:outline-none active:scale-95 transition-transform"
              aria-label="Tap Remi"
            >
              <img 
                src={remiMascot} 
                alt="Remi" 
                className="w-16 h-auto max-h-16 drop-shadow-lg animate-bounce-soft object-contain"
              />
              <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
            </button>
          )}
        </div>
      </div>


      {/* Wallpaper Preview Dialog */}
      <WallpaperPreviewDialog
        open={!!selectedWallpaper}
        onClose={() => setSelectedWallpaper(null)}
        wallpaper={selectedWallpaper}
      />
    </div>
  );
};

export default Vault;
