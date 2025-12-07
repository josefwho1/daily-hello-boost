import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Lock, Sparkles, Globe, Lightbulb, Heart, Briefcase } from "lucide-react";
import { onboardingChallenges } from "@/data/onboardingChallenges";
import { useUserProgress } from "@/hooks/useUserProgress";
import remiMascot from "@/assets/remi-waving.png";

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

const Vault = () => {
  const { progress } = useUserProgress();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Hide the 7-Day Challenge section if user hasn't completed onboarding
  const hasCompletedOnboarding = progress?.has_completed_onboarding || false;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Remi's Vault</h1>
            <p className="text-sm text-muted-foreground">Secrets to saying hello</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {/* Remi's Top Tips - FIRST */}
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

          {/* Hello in 50 Languages - SECOND */}
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

          {/* The Original 7-Day Challenge - THIRD */}
          {hasCompletedOnboarding ? (
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
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {challenge.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-4 rounded-2xl opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-muted-foreground">The Original 7-Day Challenge</h3>
                    <p className="text-xs text-muted-foreground">Complete all 7 days to unlock</p>
                  </div>
                </div>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          )}

          {/* More Packs Coming Soon - FOURTH */}
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
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Remi peeking from bottom */}
      <div className="fixed bottom-20 right-4 pointer-events-none">
        <div className="relative">
          <img 
            src={remiMascot} 
            alt="Remi" 
            className="w-16 h-auto max-h-16 drop-shadow-lg animate-bounce-soft object-contain"
          />
          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
