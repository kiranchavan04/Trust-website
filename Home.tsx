import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Calendar, ShoppingBag, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/60 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1601058268499-e5265898beb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-background/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-8 border-2 border-primary-foreground/30 shadow-xl">
            
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground mb-6 drop-shadow-lg tracking-tight">
            अवधुत चिंतन देवस्थान बहुउद्देशिय सेवाभावी संस्था तळेगाव (मळे)
          </h1>
          <p className="text-xl sm:text-2xl text-primary-foreground/90 font-medium mb-10 max-w-2xl mx-auto drop-shadow-md">
            आमच्या संस्थेमध्ये आपले स्वागत आहे...
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 text-lg font-semibold px-8 shadow-lg">
              <Link href="/events">
                आगामी कार्यक्रम <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-lg font-semibold px-8 backdrop-blur-sm">
              <Link href="/products">
                प्रसाद व उत्पादने
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Decorative bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-20" />
      </section>

      {/* Quick Navigation Tiles */}
      <section className="py-20 bg-background relative z-30 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            <Link href="/events" className="group" data-testid="tile-events">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 text-center flex flex-col items-center h-full">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Calendar className="w-8 h-8 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">कार्यक्रम</h3>
                <p className="text-muted-foreground leading-relaxed">
                  देवस्थानचे आगामी उत्सव, महापूजा आणि धार्मिक कार्यक्रमांची माहिती घ्या.
                </p>
              </div>
            </Link>

            <Link href="/products" className="group" data-testid="tile-products">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 text-center flex flex-col items-center h-full">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <ShoppingBag className="w-8 h-8 text-secondary group-hover:text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">उत्पादने</h3>
                <p className="text-muted-foreground leading-relaxed">
                  पवित्र प्रसाद, पूजेचे साहित्य आणि देवस्थानची इतर उत्पादने ऑनलाइन खरेदी करा.
                </p>
              </div>
            </Link>

            <Link href="/reviews" className="group" data-testid="tile-reviews">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 text-center flex flex-col items-center h-full">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Star className="w-8 h-8 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">अभिप्राय</h3>
                <p className="text-muted-foreground leading-relaxed">
                  भाविकांचे अनुभव वाचा आणि तुमचे स्वतःचे विचार व प्रतिक्रिया आमच्यासोबत शेअर करा.
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold text-card-foreground mb-8">आमच्याबद्दल</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            अवधूत चिंतन देवस्थान ट्रस्ट हे एक पवित्र आणि जागृत देवस्थान आहे. अनेक वर्षांपासून भाविक येथे दर्शनासाठी आणि शांतीसाठी येतात. आमचा उद्देश भक्तीचा प्रसार करणे आणि समाजाची आध्यात्मिक सेवा करणे हा आहे.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            आम्ही वर्षभर विविध धार्मिक व सामाजिक कार्यक्रम आयोजित करतो. सर्वांना भक्तीमार्गावर चालण्याची प्रेरणा मिळावी यासाठी हे देवस्थान सदैव प्रयत्नशील आहे.
          </p>
        </div>
      </section>
    </div>
  );
}
