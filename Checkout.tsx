import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/components/cart-context";
import { useCreatePaymentOrder, useVerifyPayment, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Loader2, IndianRupee } from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().min(2, "नाव भरणे आवश्यक आहे"),
  phone: z.string().min(10, "वैध फोन नंबर आवश्यक आहे"),
  email: z.string().email("वैध ईमेल आवश्यक आहे").optional().or(z.literal("")),
  address: z.string().min(5, "संपूर्ण पत्ता भरणे आवश्यक आहे"),
  city: z.string().min(2, "शहर भरणे आवश्यक आहे"),
  state: z.string().min(2, "राज्य भरणे आवश्यक आहे"),
  pincode: z.string().min(6, "वैध पिनकोड आवश्यक आहे"),
  paymentMethod: z.enum(["razorpay", "cod"])
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const createPaymentOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();
  const createOrder = useCreateOrder();

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "महाराष्ट्र",
      pincode: "",
      paymentMethod: "razorpay"
    }
  });

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="w-20 h-20 text-muted-foreground opacity-20 mb-6" />
        <h2 className="text-2xl font-bold mb-4">कार्ट रिकामी आहे</h2>
        <p className="text-muted-foreground mb-8">चेकआउट करण्यासाठी कार्टमध्ये काही उत्पादने जोडा.</p>
        <Button onClick={() => setLocation("/products")}>उत्पादने पहा</Button>
      </div>
    );
  }

  const handlePlaceOrder = async (values: CheckoutValues) => {
    setIsProcessing(true);

    const orderInput = {
      customerName: values.name,
      customerPhone: values.phone,
      customerEmail: values.email || "no-email@example.com",
      deliveryAddress: values.address,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      paymentMethod: values.paymentMethod,
      totalAmount: total,
      items: items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        price: i.price,
        quantity: i.quantity
      }))
    };

    try {
      if (values.paymentMethod === "razorpay") {
        // 1. Create Razorpay order
        const rzpOrder = await createPaymentOrder.mutateAsync({
          data: { amount: total, currency: "INR" }
        });

        // 2. Open Razorpay widget
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy", 
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "अवधूत चिंतन देवस्थान ट्रस्ट",
          description: "उत्पादने खरेदी",
          order_id: rzpOrder.id,
          handler: async function (response: any) {
            try {
              // 3. Verify payment
              const verifyRes = await verifyPayment.mutateAsync({
                data: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                }
              });

              if (verifyRes.verified) {
                // 4. Create actual order in DB
                const finalOrder = await createOrder.mutateAsync({
                  data: {
                    ...orderInput,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id
                  }
                });
                
                clearCart();
                toast({ title: "ऑर्डर यशस्वी", description: "तुमची ऑर्डर यशस्वीरित्या नोंदवली गेली आहे." });
                setLocation(`/order/${finalOrder.id}`);
              } else {
                toast({ variant: "destructive", title: "पेमेंट अपयशी", description: "पेमेंट पडताळणी अयशस्वी झाली." });
              }
            } catch (err) {
              toast({ variant: "destructive", title: "त्रुटी", description: "ऑर्डर जतन करताना त्रुटी आली." });
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: values.name,
            contact: values.phone,
            email: values.email || ""
          },
          theme: {
            color: "#FF6B00" // Saffron
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();

      } else {
        // Cash on Delivery
        const finalOrder = await createOrder.mutateAsync({
          data: orderInput
        });
        clearCart();
        toast({ title: "ऑर्डर यशस्वी", description: "तुमची ऑर्डर यशस्वीरित्या नोंदवली गेली आहे." });
        setLocation(`/order/${finalOrder.id}`);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "त्रुटी", description: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा." });
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center sm:text-left">चेकआउट</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border pb-4">
              <CardTitle className="text-xl">वितरणाचा पत्ता</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handlePlaceOrder)} className="space-y-6" id="checkout-form">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>पूर्ण नाव</FormLabel>
                        <FormControl><Input {...field} data-testid="input-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>मोबाईल नंबर</FormLabel>
                        <FormControl><Input {...field} type="tel" data-testid="input-phone" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ईमेल (ऐच्छिक)</FormLabel>
                      <FormControl><Input {...field} type="email" data-testid="input-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>संपूर्ण पत्ता</FormLabel>
                      <FormControl><Input {...field} data-testid="input-address" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>शहर / गाव</FormLabel>
                        <FormControl><Input {...field} data-testid="input-city" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel>राज्य</FormLabel>
                        <FormControl><Input {...field} data-testid="input-state" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="pincode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>पिनकोड</FormLabel>
                        <FormControl><Input {...field} data-testid="input-pincode" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="pt-6 border-t border-border mt-8">
                    <h3 className="text-lg font-semibold mb-4">पेमेंट पर्याय</h3>
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                              <FormControl><RadioGroupItem value="razorpay" data-testid="radio-razorpay" /></FormControl>
                              <FormLabel className="font-medium cursor-pointer flex items-center gap-2 m-0 flex-1">
                                <IndianRupee className="w-5 h-5 text-primary" />
                                ऑनलाइन पेमेंट (कार्ड, UPI, नेट बँकिंग)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                              <FormControl><RadioGroupItem value="cod" data-testid="radio-cod" /></FormControl>
                              <FormLabel className="font-medium cursor-pointer flex items-center gap-2 m-0 flex-1">
                                <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                                कॅश ऑन डिलिव्हरी (COD)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="border-border shadow-sm sticky top-24">
            <CardHeader className="bg-muted/30 border-b border-border pb-4">
              <CardTitle className="text-xl">ऑर्डर सारांश</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium text-sm line-clamp-2">{item.productName}</p>
                      <p className="text-sm text-muted-foreground mt-1">प्रमाण: {item.quantity}</p>
                    </div>
                    <p className="font-semibold whitespace-nowrap">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">उप-एकूण:</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">वितरण शुल्क:</span>
                  <span className="text-green-600 font-medium">मोफत</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-4 mt-2 border-t border-border border-dashed">
                  <span>एकूण रक्कम:</span>
                  <span className="text-primary text-xl">₹{total}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 pt-4 pb-6">
              <Button 
                type="submit" 
                form="checkout-form" 
                className="w-full h-14 text-lg font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground" 
                disabled={isProcessing}
                data-testid="button-place-order"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> प्रक्रिया सुरू आहे...</>
                ) : (
                  'ऑर्डर करा'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
