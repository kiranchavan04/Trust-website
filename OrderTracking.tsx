import { useRoute, Link } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Package, CheckCircle2, Clock, Truck, Home, AlertCircle, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OrderTracking() {
  const [, params] = useRoute("/order/:id");
  const orderId = params?.id ? parseInt(params.id) : null;

  const { data: order, isLoading, isError, refetch } = useGetOrder(orderId || 0, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId || 0) }
  });

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-4">ऑर्डर आयडी आढळला नाही</h2>
        <Button asChild><Link href="/">मुख्यपृष्ठावर जा</Link></Button>
      </div>
    );
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'dispatched': return 2;
      case 'delivered': return 3;
      default: return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.orderStatus) : 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">ऑर्डर ट्रॅकिंग</h1>
          {order && <p className="text-muted-foreground">ऑर्डर क्रमांक: <span className="font-mono font-bold text-foreground">#{order.orderNumber}</span></p>}
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} title="रिफ्रेश करा">
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      ) : isError || !order ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>त्रुटी</AlertTitle>
          <AlertDescription>
            ऑर्डरची माहिती लोड करताना त्रुटी आली. कृपया ऑर्डर आयडी तपासा.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-8">
          {/* Status Timeline */}
          <Card className="border-border shadow-sm overflow-hidden border-t-4 border-t-primary">
            <CardContent className="p-8">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 z-0 hidden sm:block rounded-full"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 hidden sm:block transition-all duration-500 rounded-full"
                  style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                ></div>

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8 sm:gap-0">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${currentStep >= 1 ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'bg-muted text-muted-foreground border-2 border-background'}`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className={`font-bold ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>प्रलंबित</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">ऑर्डर प्राप्त झाली आणि प्रक्रियेत आहे</p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${currentStep >= 2 ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'bg-muted text-muted-foreground border-2 border-background'}`}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <h3 className={`font-bold ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>पाठवले</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">ऑर्डर कुरिअरकडे दिली आहे</p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${currentStep >= 3 ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'bg-muted text-muted-foreground border-2 border-background'}`}>
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className={`font-bold ${currentStep >= 3 ? 'text-green-600' : 'text-muted-foreground'}`}>वितरित</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">ऑर्डर तुमच्या पत्त्यावर पोहोचली आहे</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Details */}
            <Card className="border-border shadow-sm h-full">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5 text-primary" /> ऑर्डर तपशील
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">उत्पादने</h4>
                  <ul className="space-y-3">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="font-medium">{item.productName} <span className="text-muted-foreground font-normal">x{item.quantity}</span></span>
                        <span className="font-bold">₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>एकूण रक्कम</span>
                    <span className="text-primary">₹{order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2 text-muted-foreground">
                    <span>पेमेंट पद्धत</span>
                    <span className="uppercase">{order.paymentMethod === 'cod' ? 'कॅश ऑन डिलिव्हरी' : 'ऑनलाइन (Razorpay)'}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1 text-muted-foreground">
                    <span>तारीख</span>
                    <span>{format(new Date(order.createdAt), 'dd MMM yyyy, p')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card className="border-border shadow-sm h-full">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="w-5 h-5 text-primary" /> वितरणाचा पत्ता
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-1">{order.customerName}</h4>
                  <p className="text-muted-foreground text-sm flex flex-col gap-1">
                    <span>{order.customerPhone}</span>
                    <span>{order.customerEmail !== 'no-email@example.com' && order.customerEmail}</span>
                  </p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <p className="text-sm leading-relaxed text-foreground">
                    {order.deliveryAddress}<br />
                    {order.city}, {order.state} - <span className="font-mono font-medium">{order.pincode}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
