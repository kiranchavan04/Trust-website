import { useListEvents, getListEventsQueryKey } from "@workspace/api-client-react";
import { CalendarDays, MapPin, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function Events() {
  const { data: events, isLoading, isError } = useListEvents({
    query: { queryKey: getListEventsQueryKey() }
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">आगामी कार्यक्रम</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          देवस्थानच्या विविध धार्मिक आणि सामाजिक कार्यक्रमांची माहिती. सर्वांनी अवश्य उपस्थित राहावे.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
              <Skeleton className="w-full h-48 rounded-none" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>त्रुटी</AlertTitle>
          <AlertDescription>
            कार्यक्रम लोड करताना त्रुटी आली. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.
          </AlertDescription>
        </Alert>
      ) : events?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
          <CalendarDays className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-foreground mb-2">सध्या कोणतेही कार्यक्रम नाहीत</h3>
          <p className="text-muted-foreground">लवकरच नवीन कार्यक्रमांची माहिती येथे अपडेट केली जाईल.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events?.map(event => (
            <div key={event.id} className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col" data-testid={`card-event-${event.id}`}>
              <div className="relative h-48 overflow-hidden bg-muted">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.titleMr} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <CalendarDays className="w-12 h-12 text-primary/30" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary shadow-sm border border-primary/20">
                  {format(new Date(event.eventDate), 'dd MMM yyyy')}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-card-foreground mb-3 line-clamp-2" title={event.titleMr}>
                  {event.titleMr}
                </h3>
                <p className="text-muted-foreground mb-6 line-clamp-3 flex-1" title={event.descriptionMr}>
                  {event.descriptionMr}
                </p>
                
                <div className="flex flex-col gap-3 text-sm text-card-foreground/80 mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <span>{format(new Date(event.eventDate), 'PPP p')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{event.locationMr}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
