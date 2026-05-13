import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "./cart-context";
import { ShoppingCart, Menu, X, Heart, Home as HomeIcon, CalendarDays, ShoppingBag, Star, PackageSearch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { items, total, updateQuantity, removeFromCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { href: "/", label: "मुख्यपृष्ठ", icon: <HomeIcon className="w-4 h-4 mr-2" /> },
    { href: "/events", label: "कार्यक्रम", icon: <CalendarDays className="w-4 h-4 mr-2" /> },
    { href: "/products", label: "उत्पादने", icon: <ShoppingBag className="w-4 h-4 mr-2" /> },
    { href: "/reviews", label: "अभिप्राय", icon: <Star className="w-4 h-4 mr-2" /> },
    { href: "/order/track", label: "ऑर्डर ट्रॅकिंग", icon: <PackageSearch className="w-4 h-4 mr-2" /> },
    { href: "/admin", label: "प्रशासन", icon: <ShieldCheck className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-primary" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-4" aria-describedby="mobile-menu-description">
                <DrawerTitle className="sr-only">Menu</DrawerTitle>
                <div id="mobile-menu-description" className="sr-only">Navigation menu</div>
                <div className="flex flex-col gap-4 py-4">
                  <div className="font-bold text-lg text-primary flex items-center gap-2 px-2">
                    <Heart className="h-5 w-5 fill-current" />
                    अवधूत चिंतन देवस्थान
                  </div>
                  <Separator />
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center px-4 py-3 rounded-md transition-colors ${location === link.href ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"}`} data-testid={`link-mobile-${link.href.replace("/", "") || "home"}`}>
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
            
            <Link href="/" className="flex items-center gap-2 font-bold text-xl sm:text-2xl text-primary tracking-tight" data-testid="link-logo">
              <Heart className="h-6 w-6 fill-primary" />
              <span className="hidden sm:inline-block">अवधूत चिंतन देवस्थान ट्रस्ट</span>
              <span className="sm:hidden">देवस्थान ट्रस्ट</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location === link.href ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted hover:text-foreground"}`} data-testid={`link-desktop-${link.href.replace("/", "") || "home"}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            <Drawer open={isCartOpen} onOpenChange={setIsCartOpen} direction="right">
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="relative border-primary/20 text-primary hover:bg-primary/10" data-testid="button-cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="w-full sm:w-[400px] mt-24 h-full p-0 flex flex-col rounded-none sm:rounded-l-xl" aria-describedby="cart-description">
                <DrawerTitle className="sr-only">Cart</DrawerTitle>
                <div id="cart-description" className="sr-only">Your shopping cart items</div>
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    तुमची कार्ट ({cartItemCount})
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground gap-4">
                      <ShoppingBag className="h-16 w-16 opacity-20" />
                      <p className="text-lg">कार्ट रिकामी आहे</p>
                      <Button variant="outline" onClick={() => { setIsCartOpen(false); }}>
                        <Link href="/products">उत्पादने पहा</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {items.map((item) => (
                        <div key={item.productId} className="flex gap-4 p-3 bg-card rounded-lg border border-border shadow-sm">
                          {item.imageUrl ? (
                            <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                              <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <ShoppingBag className="h-8 w-8 text-primary/40" />
                            </div>
                          )}
                          
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium text-sm line-clamp-2">{item.productName}</h3>
                              <p className="text-primary font-semibold mt-1">₹{item.price}</p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2 bg-muted rounded-md p-1">
                                <button className="w-6 h-6 flex items-center justify-center rounded bg-background shadow-sm text-sm" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                <button className="w-6 h-6 flex items-center justify-center rounded bg-background shadow-sm text-sm" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                              </div>
                              <Button variant="ghost" size="sm" className="h-8 text-destructive px-2" onClick={() => removeFromCart(item.productId)}>
                                काढून टाका
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {items.length > 0 && (
                  <div className="p-4 border-t border-border bg-card">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-muted-foreground">एकूण रक्कम:</span>
                      <span className="font-bold text-xl text-primary">₹{total}</span>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 shadow-md" onClick={() => setIsCartOpen(false)}>
                      <Link href="/checkout" className="w-full h-full flex items-center justify-center">
                        चेकआउट करा
                      </Link>
                    </Button>
                  </div>
                )}
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="bg-muted mt-auto border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-muted-foreground text-sm">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="font-semibold">अवधूत चिंतन देवस्थान ट्रस्ट</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-4">
            <Link href="/events" className="hover:text-primary transition-colors">कार्यक्रम</Link>
            <Link href="/products" className="hover:text-primary transition-colors">उत्पादने</Link>
            <Link href="/reviews" className="hover:text-primary transition-colors">अभिप्राय</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
