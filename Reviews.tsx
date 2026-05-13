import { useListReviews, getListReviewsQueryKey, useCreateReview } from "@workspace/api-client-react";
import { Star, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const reviewSchema = z.object({
  reviewerName: z.string().min(2, "नाव भरणे आवश्यक आहे"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "अभिप्राय किमान ५ अक्षरांचा असावा")
});

export default function Reviews() {
  const { data: reviews, isLoading } = useListReviews({
    query: { queryKey: getListReviewsQueryKey() }
  });
  
  const createReview = useCreateReview();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      reviewerName: "",
      rating: 5,
      comment: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof reviewSchema>) => {
    try {
      await createReview.mutateAsync({ data: values });
      queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey() });
      form.reset({ reviewerName: "", rating: 5, comment: "" });
      toast({
        title: "धन्यवाद!",
        description: "तुमचा अभिप्राय यशस्वीरित्या जतन केला आहे."
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "त्रुटी",
        description: "अभिप्राय जतन करताना त्रुटी आली."
      });
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${interactive ? "cursor-pointer transition-colors" : ""} ${
              star <= rating ? "fill-secondary text-secondary" : "fill-muted text-muted"
            }`}
            onClick={() => interactive && form.setValue("rating", star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">भाविकांचे अनुभव</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          देवस्थानला भेट दिलेल्या भाविकांचे अनुभव वाचा आणि तुमचाही अभिप्राय नोंदवा.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4 md:order-last">
          <Card className="border-border shadow-md sticky top-24 border-t-4 border-t-primary">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="text-primary w-5 h-5" /> तुमचा अनुभव सांगा
              </h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField control={form.control} name="rating" render={({ field }) => (
                    <FormItem>
                      <FormLabel>रेटिंग</FormLabel>
                      <FormControl>
                        {renderStars(field.value, true)}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="reviewerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>तुमचे नाव</FormLabel>
                      <FormControl>
                        <Input placeholder="नाव प्रविष्ट करा" {...field} data-testid="input-review-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="comment" render={({ field }) => (
                    <FormItem>
                      <FormLabel>अनुभव / अभिप्राय</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="तुमचा अनुभव येथे लिहा..." 
                          className="resize-none min-h-[120px]" 
                          {...field} 
                          data-testid="input-review-comment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                    disabled={createReview.isPending}
                    data-testid="button-submit-review"
                  >
                    {createReview.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    अभिप्राय पाठवा
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <div className="space-y-6">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <Card key={i} className="border-border">
                  <CardContent className="pt-6">
                    <div className="flex gap-4 mb-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="w-32 h-5" />
                        <Skeleton className="w-24 h-4" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-16" />
                  </CardContent>
                </Card>
              ))
            ) : reviews?.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">अद्याप कोणताही अभिप्राय नाही. पहिला अभिप्राय तुम्ही द्या!</p>
              </div>
            ) : (
              reviews?.map(review => (
                <Card key={review.id} className="border-border shadow-sm hover:shadow-md transition-shadow bg-card" data-testid={`card-review-${review.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                          <h4 className="font-bold text-lg text-card-foreground">{review.reviewerName}</h4>
                          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full whitespace-nowrap">
                            {format(new Date(review.createdAt), 'dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="mb-4">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-muted-foreground leading-relaxed italic text-lg">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
