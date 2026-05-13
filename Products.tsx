import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { ShoppingBag, AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-context";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const { data: products, isLoading, isError } = useListProducts({
    query: { queryKey: getListProductsQueryKey() }
  });
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
    addToCart({
      productId: product.id,
      productName: product.nameMr,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast({
      title: "कार्टमध्ये जोडले",
      description: `${product.nameMr} कार्टमध्ये यशस्वीरित्या जोडले गेले.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">उत्पादने आणि प्रसाद</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          देवस्थानची पवित्र उत्पादने आणि प्रसाद ऑनलाइन खरेदी करा.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm p-4">
              <Skeleton className="w-full aspect-square rounded-xl mb-4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-9 w-1/3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>त्रुटी</AlertTitle>
          <AlertDescription>
            उत्पादने लोड करताना त्रुटी आली. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.
          </AlertDescription>
        </Alert>
      ) : products?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-foreground mb-2">सध्या कोणतीही उत्पादने उपलब्ध नाहीत</h3>
          <p className="text-muted-foreground">लवकरच नवीन उत्पादने येथे उपलब्ध होतील.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map(product => (
            <div key={product.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group" data-testid={`card-product-${product.id}`}>
              <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.nameMr} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                      अनुपलब्ध
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-lg text-card-foreground mb-1 line-clamp-1" title={product.nameMr}>
                  {product.nameMr}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1" title={product.descriptionMr}>
                  {product.descriptionMr}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <span className="text-xl font-bold text-primary">
                    ₹{product.price}
                  </span>
                  <Button 
                    size="sm" 
                    disabled={!product.inStock}
                    onClick={() => handleAddToCart(product)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
                    data-testid={`button-add-cart-${product.id}`}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    कार्टमध्ये
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
