import { useState, useRef } from "react";
import {
  useListOrders, getListOrdersQueryKey, useUpdateOrderStatus,
  useListProducts, getListProductsQueryKey, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListEvents, getListEventsQueryKey, useCreateEvent, useUpdateEvent, useDeleteEvent,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck, Search, Loader2, Plus, Pencil, Trash2,
  Package, CalendarDays, ShoppingCart, X, Save, ImagePlus, CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Tab = "orders" | "products" | "events";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-primary">प्रशासन पॅनेल</h1>
          <p className="text-muted-foreground text-sm">ऑर्डर, उत्पादने आणि कार्यक्रम व्यवस्थापित करा</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 border-b border-border pb-0">
        <TabButton active={activeTab === "orders"} onClick={() => setActiveTab("orders")} icon={<ShoppingCart className="w-4 h-4" />} label="ऑर्डर्स" />
        <TabButton active={activeTab === "products"} onClick={() => setActiveTab("products")} icon={<Package className="w-4 h-4" />} label="उत्पादने" />
        <TabButton active={activeTab === "events"} onClick={() => setActiveTab("events")} icon={<CalendarDays className="w-4 h-4" />} label="कार्यक्रम" />
      </div>

      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "events" && <EventsTab />}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all border-b-2 ${
        active
          ? "border-primary text-primary bg-primary/5"
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
      }`}
    >
      {icon}{label}
    </button>
  );
}

/* ───────────── IMAGE UPLOADER ───────────── */
function ImageUploadField({
  value,
  onChange,
  label = "फोटो",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploaded, setUploaded] = useState(false);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (res) => {
      const url = `/api/storage${res.objectPath}`;
      onChange(url);
      setUploaded(true);
      toast({ title: "फोटो upload झाला", description: "फोटो यशस्वीरित्या upload झाला." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "त्रुटी", description: "फोटो upload करताना त्रुटी आली." });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploaded(false);
    await uploadFile(file);
    e.target.value = "";
  };

  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => { setUploaded(false); fileInputRef.current?.click(); }}
          className="border-primary/40 text-primary hover:bg-primary/5"
          data-testid="button-upload-image"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : uploaded ? (
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
          ) : (
            <ImagePlus className="w-4 h-4 mr-2" />
          )}
          {isUploading ? "Upload होत आहे..." : uploaded ? "फोटो बदला" : "फोटो निवडा"}
        </Button>
        {value && !isUploading && (
          <img
            src={value}
            alt="preview"
            className="h-14 w-14 object-cover rounded-lg border border-border"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
      </div>
    </div>
  );
}

/* ───────────── ORDERS TAB ───────────── */
function OrdersTab() {
  const { data: orders, isLoading } = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, data: { orderStatus: newStatus } });
      queryClient.setQueryData(getListOrdersQueryKey(), (old: any) =>
        old?.map((o: any) => o.id === orderId ? { ...o, orderStatus: newStatus } : o)
      );
      toast({ title: "स्टेटस अपडेट", description: "ऑर्डर स्टेटस बदलले." });
    } catch {
      toast({ variant: "destructive", title: "त्रुटी", description: "स्टेटस बदलताना त्रुटी आली." });
    }
  };

  const filtered = orders?.filter(o =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const statusBadge = (s: string) => {
    if (s === "pending") return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100">प्रलंबित</Badge>;
    if (s === "dispatched") return <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100">पाठवले</Badge>;
    if (s === "delivered") return <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">वितरित</Badge>;
    return <Badge>{s}</Badge>;
  };

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">एकूण {filtered.length} ऑर्डर</p>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ऑर्डर क्र. किंवा नाव शोधा..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>ऑर्डर #</TableHead>
                <TableHead>तारीख</TableHead>
                <TableHead>ग्राहक</TableHead>
                <TableHead>उत्पादने</TableHead>
                <TableHead className="text-right">एकूण (₹)</TableHead>
                <TableHead>पेमेंट</TableHead>
                <TableHead>स्टेटस</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>)}
                </TableRow>
              )) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">कोणतीही ऑर्डर आढळली नाही</TableCell></TableRow>
              ) : filtered.map(order => (
                <TableRow key={order.id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs font-semibold">{order.orderNumber}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'dd MMM yy')}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                  </TableCell>
                  <TableCell><span className="text-xs bg-muted px-2 py-1 rounded">{order.items.length} आयटम</span></TableCell>
                  <TableCell className="text-right font-bold">₹{order.totalAmount}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px] uppercase">{order.paymentMethod}</Badge></TableCell>
                  <TableCell>
                    <Select defaultValue={order.orderStatus} onValueChange={val => handleStatusChange(order.id, val)}>
                      <SelectTrigger className="h-8 text-xs w-36">
                        <SelectValue>{statusBadge(order.orderStatus)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">प्रलंबित</SelectItem>
                        <SelectItem value="dispatched">पाठवले</SelectItem>
                        <SelectItem value="delivered">वितरित</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

/* ───────────── PRODUCTS TAB ───────────── */
type ProductForm = { nameMr: string; name: string; price: string; descriptionMr: string; description: string; imageUrl: string; inStock: boolean };
const emptyProduct: ProductForm = { nameMr: "", name: "", price: "", descriptionMr: "", description: "", imageUrl: "", inStock: true };

function ProductsTab() {
  const { data: products, isLoading } = useListProducts({ query: { queryKey: getListProductsQueryKey() } });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialog, setDialog] = useState<{ open: boolean; mode: "add" | "edit"; id?: number; form: ProductForm }>({
    open: false, mode: "add", form: emptyProduct,
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openAdd = () => setDialog({ open: true, mode: "add", form: emptyProduct });
  const openEdit = (p: any) => setDialog({
    open: true, mode: "edit", id: p.id,
    form: { nameMr: p.nameMr, name: p.name, price: String(p.price), descriptionMr: p.descriptionMr, description: p.description, imageUrl: p.imageUrl ?? "", inStock: p.inStock },
  });

  const handleSave = async () => {
    const { form, mode, id } = dialog;
    if (!form.nameMr || !form.price) {
      toast({ variant: "destructive", title: "त्रुटी", description: "मराठी नाव आणि किंमत आवश्यक आहे." });
      return;
    }
    const data = {
      nameMr: form.nameMr, name: form.name || form.nameMr,
      price: parseFloat(form.price),
      descriptionMr: form.descriptionMr, description: form.description || form.descriptionMr,
      imageUrl: form.imageUrl || null, inStock: form.inStock,
    };
    try {
      if (mode === "add") await createProduct.mutateAsync({ data });
      else if (id !== undefined) await updateProduct.mutateAsync({ id, data });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setDialog(d => ({ ...d, open: false }));
      toast({ title: mode === "add" ? "उत्पादन जोडले" : "उत्पादन अपडेट", description: "बदल यशस्वीरित्या सेव्ह झाले." });
    } catch {
      toast({ variant: "destructive", title: "त्रुटी", description: "बदल सेव्ह करताना त्रुटी आली." });
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteProduct.mutateAsync({ id: deleteId });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setDeleteId(null);
      toast({ title: "उत्पादन हटवले" });
    } catch {
      toast({ variant: "destructive", title: "त्रुटी", description: "उत्पादन हटवताना त्रुटी आली." });
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">एकूण {products?.length ?? 0} उत्पादने</p>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90" data-testid="button-add-product">
          <Plus className="w-4 h-4 mr-2" /> नवीन उत्पादन जोडा
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>फोटो</TableHead>
                <TableHead>उत्पादन</TableHead>
                <TableHead>किंमत</TableHead>
                <TableHead>स्टॉक</TableHead>
                <TableHead className="text-right">क्रिया</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">कोणतीही उत्पादने नाहीत. "नवीन उत्पादन जोडा" वर क्लिक करा.</TableCell></TableRow>
              ) : products?.map(p => (
                <TableRow key={p.id} className="hover:bg-muted/20">
                  <TableCell>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.nameMr} className="w-12 h-12 rounded-lg object-cover border border-border" />
                      : <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground/40" /></div>}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{p.nameMr}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{p.descriptionMr}</div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">₹{p.price}</TableCell>
                  <TableCell>
                    {p.inStock
                      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">उपलब्ध</Badge>
                      : <Badge className="bg-red-100 text-red-800 hover:bg-red-100">अनुपलब्ध</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)} data-testid={`button-edit-product-${p.id}`}>
                        <Pencil className="w-3.5 h-3.5 mr-1" /> बदला
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialog.mode === "add" ? "नवीन उत्पादन जोडा" : "उत्पादन बदला"}</DialogTitle>
            <DialogDescription>उत्पादनाची माहिती भरा आणि फोटो upload करा.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block text-xs">मराठी नाव *</Label>
                <Input placeholder="उदा. पंचामृत प्रसाद" value={dialog.form.nameMr} onChange={e => setDialog(d => ({ ...d, form: { ...d.form, nameMr: e.target.value } }))} />
              </div>
              <div>
                <Label className="mb-1 block text-xs">किंमत (₹) *</Label>
                <Input type="number" placeholder="150" value={dialog.form.price} onChange={e => setDialog(d => ({ ...d, form: { ...d.form, price: e.target.value } }))} />
              </div>
            </div>
            <div>
              <Label className="mb-1 block text-xs">वर्णन (मराठी)</Label>
              <Textarea rows={2} placeholder="उत्पादनाचे वर्णन..." value={dialog.form.descriptionMr} onChange={e => setDialog(d => ({ ...d, form: { ...d.form, descriptionMr: e.target.value } }))} />
            </div>
            <ImageUploadField
              label="उत्पादनाचा फोटो"
              value={dialog.form.imageUrl}
              onChange={url => setDialog(d => ({ ...d, form: { ...d.form, imageUrl: url } }))}
            />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="inStock" checked={dialog.form.inStock} onChange={e => setDialog(d => ({ ...d, form: { ...d.form, inStock: e.target.checked } }))} className="w-4 h-4 accent-primary" />
              <Label htmlFor="inStock" className="text-sm cursor-pointer">स्टॉकमध्ये उपलब्ध आहे</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(d => ({ ...d, open: false }))}><X className="w-4 h-4 mr-1" /> रद्द करा</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} सेव्ह करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>उत्पादन हटवायचे का?</DialogTitle>
            <DialogDescription>हे उत्पादन कायमचे हटवले जाईल.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>रद्द करा</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteProduct.isPending}>
              {deleteProduct.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "हटवा"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────── EVENTS TAB ───────────── */
type EventForm = { titleMr: string; title: string; descriptionMr: string; description: string; eventDate: string; locationMr: string; location: string; imageUrl: string };
const emptyEvent: EventForm = { titleMr: "", title: "", descriptionMr: "", description: "", eventDate: "", locationMr: "", location: "", imageUrl: "" };

function EventsTab() {
  const { data: events, isLoading } = useListEvents({ query: { queryKey: getListEventsQueryKey() } });
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialog, setDialog] = useState<{ open: boolean; mode: "add" | "edit"; id?: number; form: EventForm }>({
    open: false, mode: "add", form: emptyEvent,
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openAdd = () => setDialog({ open: true, mode: "add", form: emptyEvent });
  const openEdit = (e: any) => setDialog({
    open: true, mode: "edit", id: e.id,
    form: {
      titleMr: e.titleMr, title: e.title, descriptionMr: e.descriptionMr, description: e.description,
      eventDate: e.eventDate ? e.eventDate.slice(0, 16) : "",
      locationMr: e.locationMr, location: e.location, imageUrl: e.imageUrl ?? "",
    },
  });

  const handleSave = async () => {
    const { form, mode, id } = dialog;
    if (!form.titleMr || !form.eventDate) {
      toast({ variant: "destructive", title: "त्रुटी", description: "मराठी शीर्षक आणि तारीख आवश्यक आहे." });
      return;
    }
    const data = {
      titleMr: form.titleMr, title: form.title || form.titleMr,
      descriptionMr: form.descriptionMr, description: form.description || form.descriptionMr,
      eventDate: new Date(form.eventDate).toISOString(),
      locationMr: form.locationMr, location: form.location || form.locationMr,
      imageUrl: form.imageUrl || null,
    };
    try {
      if (mode === "add") await createEvent.mutateAsync({ data });
      else if (id !== undefined) await updateEvent.mutateAsync({ id, data });
      queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      setDialog(d => ({ ...d, open: false }));
      toast({ title: mode === "add" ? "कार्यक्रम जोडला" : "कार्यक्रम अपडेट", description: "बदल यशस्वीरित्या सेव्ह झाले." });
    } catch {
      toast({ variant: "destructive", title: "त्रुटी", description: "बदल सेव्ह करताना त्रुटी आली." });
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteEvent.mutateAsync({ id: deleteId });
      queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
      setDeleteId(null);
      toast({ title: "कार्यक्रम हटवला" });
    } catch {
      toast({ variant: "destructive", title: "त्रुटी", description: "कार्यक्रम हटवताना त्रुटी आली." });
    }
  };

  const isSaving = createEvent.isPending || updateEvent.isPending;

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">एकूण {events?.length ?? 0} कार्यक्रम</p>
        <Button onClick={openAdd} className="bg-primary hover:bg-primary/90" data-testid="button-add-event">
          <Plus className="w-4 h-4 mr-2" /> नवीन कार्यक्रम जोडा
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>फोटो</TableHead>
                <TableHead>कार्यक्रम</TableHead>
                <TableHead>तारीख</TableHead>
                <TableHead>ठिकाण</TableHead>
                <TableHead className="text-right">क्रिया</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">कोणतेही कार्यक्रम नाहीत.</TableCell></TableRow>
              ) : events?.map(e => (
                <TableRow key={e.id} className="hover:bg-muted/20">
                  <TableCell>
                    {e.imageUrl
                      ? <img src={e.imageUrl} alt={e.titleMr} className="w-12 h-12 rounded-lg object-cover border border-border" />
                      : <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><CalendarDays className="w-5 h-5 text-muted-foreground/40" /></div>}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{e.titleMr}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{e.descriptionMr}</div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{format(new Date(e.eventDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.locationMr}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(e)} data-testid={`button-edit-event-${e.id}`}>
                        <Pencil className="w-3.5 h-3.5 mr-1" /> बदला
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => setDeleteId(e.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialog.mode === "add" ? "नवीन कार्यक्रम जोडा" : "कार्यक्रम बदला"}</DialogTitle>
            <DialogDescription>कार्यक्रमाची माहिती भरा आणि फोटो upload करा.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block text-xs">मराठी शीर्षक *</Label>
                <Input placeholder="उदा. गणेश चतुर्थी उत्सव" value={dialog.form.titleMr} onChange={e => setDialog(d => ({ ...d, form: { ...d.form, titleMr: e.target.value } }))} />
              </div>
              <div>
                <Label className="mb-1 block text-xs">तारीख व वेळ *</Label>
                <Input type="datetime-local" value={dialog.form.eventDate} onChange={e => setDialog(d => ({ ...d, form: { ...d.form, eventDate: e.target.value } }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block text-xs">ठिकाण (मराठी)</Label>
                <Input placeholder="उदा. ट्रस्ट परिसर" value={dialog.form.locationMr} onChange={e => setDialog(d => ({ ...d, form: { ...d.form, locationMr: e.target.value } }))} />
              </div>
              <div>
                <Label className="mb-1 block text-xs">वर्णन</Label>
                <Input placeholder="कार्यक्रमाची थोडक्यात माहिती" value={dialog.form.descriptionMr} onChange={e => setDialog(d => ({ ...d, form: { ...d.form, descriptionMr: e.target.value } }))} />
              </div>
            </div>
            <ImageUploadField
              label="कार्यक्रमाचा फोटो"
              value={dialog.form.imageUrl}
              onChange={url => setDialog(d => ({ ...d, form: { ...d.form, imageUrl: url } }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(d => ({ ...d, open: false }))}><X className="w-4 h-4 mr-1" /> रद्द करा</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} सेव्ह करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>कार्यक्रम हटवायचा का?</DialogTitle>
            <DialogDescription>हा कार्यक्रम कायमचा हटवला जाईल.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>रद्द करा</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteEvent.isPending}>
              {deleteEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "हटवा"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
