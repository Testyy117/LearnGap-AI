"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Video, 
  FileText, 
  FileBox, 
  Book, 
  Star, 
  Download, 
  Filter,
  ExternalLink
} from "lucide-react";

const resources = [
  {
    title: "Quantum Physics Crash Course",
    type: "Video",
    icon: Video,
    subject: "Physics",
    rating: 4.8,
    reviews: 120,
    size: "15 min",
    image: "https://picsum.photos/seed/res1/400/225"
  },
  {
    title: "Molecular Biology Study Guide",
    type: "E-book",
    icon: Book,
    subject: "Biology",
    rating: 4.9,
    reviews: 85,
    size: "12.4 MB",
    image: "https://picsum.photos/seed/res2/400/225"
  },
  {
    title: "Organic Compounds Worksheet",
    type: "Worksheet",
    icon: FileBox,
    subject: "Chemistry",
    rating: 4.5,
    reviews: 42,
    size: "240 KB",
    image: "https://picsum.photos/seed/res3/400/225"
  },
  {
    title: "Classical Mechanics Notes",
    type: "Notes",
    icon: FileText,
    subject: "Physics",
    rating: 4.7,
    reviews: 67,
    size: "1.2 MB",
    image: "https://picsum.photos/seed/res4/400/225"
  },
  {
    title: "Ancient Civ Revision Pack",
    type: "Practice",
    icon: Book,
    subject: "History",
    rating: 4.6,
    reviews: 29,
    size: "5.8 MB",
    image: "https://picsum.photos/seed/res5/400/225"
  },
  {
    title: "Linear Algebra Video Series",
    type: "Video",
    icon: Video,
    subject: "Mathematics",
    rating: 4.9,
    reviews: 215,
    size: "4h total",
    image: "https://picsum.photos/seed/res6/400/225"
  }
];

export default function ResourcesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-headline font-bold">Discovery Vault</h1>
          <p className="text-muted-foreground">Curated study materials synced to your learning gaps.</p>
          <div className="relative max-w-md mt-4">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Search videos, worksheets, guides..." className="pl-10 h-11 bg-card/50" />
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <Filter className="h-3.5 w-3.5" /> All Resources
          </Button>
          <Button variant="secondary" size="sm" className="shrink-0">Videos</Button>
          <Button variant="ghost" size="sm" className="shrink-0">Guides</Button>
          <Button variant="ghost" size="sm" className="shrink-0">Worksheets</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res, i) => (
          <Card key={i} className="group overflow-hidden hover:border-primary/50 transition-all duration-300 bg-card/40 backdrop-blur-md">
            <div className="aspect-video relative overflow-hidden bg-secondary">
               <img src={res.image} alt={res.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute top-3 left-3 flex gap-2">
                 <Badge className="bg-background/80 text-foreground border-none backdrop-blur-md uppercase text-[9px] font-bold">
                    {res.subject}
                 </Badge>
                 <Badge variant="secondary" className="bg-primary/20 text-primary border-none backdrop-blur-md uppercase text-[9px] font-bold">
                    {res.type}
                 </Badge>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90 shadow-xl">
                    <ExternalLink className="h-5 w-5" />
                  </Button>
               </div>
            </div>
            <CardHeader className="p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-md font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{res.title}</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs font-bold">{res.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({res.reviews})</span>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{res.size}</div>
              </div>
            </CardHeader>
            <CardFooter className="px-4 pb-4 pt-0">
               <Button variant="ghost" size="sm" className="w-full gap-2 text-xs font-bold uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                 <Download className="h-3.5 w-3.5" /> Download Resource
               </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}