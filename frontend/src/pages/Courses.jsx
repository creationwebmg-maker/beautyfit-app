import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, formatPrice, formatDuration, getLevelColor } from "@/lib/utils";
import { 
  Search, 
  Clock, 
  Play,
  Filter,
  X
} from "lucide-react";
import Layout from "@/components/Layout";

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesData, categoriesData] = await Promise.all([
        api.get("/courses"),
        api.get("/courses/categories")
      ]);
      setCourses(coursesData);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryColors = {
    "Cardio": "bg-red-100 text-red-800 border-red-200",
    "Abdos": "bg-orange-100 text-orange-800 border-orange-200",
    "Full Body": "bg-blue-100 text-blue-800 border-blue-200",
    "Yoga": "bg-green-100 text-green-800 border-green-200",
    "Renforcement": "bg-purple-100 text-purple-800 border-purple-200",
  };

  return (
    <Layout>
      <div className="space-y-8" data-testid="courses-page">
        {/* Header */}
        <div className="space-y-4">
          <h1 
            className="text-4xl md:text-5xl font-bold text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-testid="courses-title"
          >
            Cours vidéo
          </h1>
          <p className="text-lg text-muted-foreground">
            Découvre tous les cours disponibles et choisis celui qui te convient
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 rounded-full"
              data-testid="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
              data-testid="filter-all"
            >
              Tous
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full ${selectedCategory !== category ? categoryColors[category] || '' : ''}`}
                data-testid={`filter-${category.toLowerCase().replace(' ', '-')}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-muted-foreground">
          {filteredCourses.length} cours {selectedCategory && `dans "${selectedCategory}"`}
        </p>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
            ))
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground">Aucun cours trouvé</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                }}
                className="mt-4 rounded-full"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <Card 
                key={course.id}
                className="group cursor-pointer border-border/50 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden"
                onClick={() => navigate(`/courses/${course.id}`)}
                data-testid={`course-card-${course.id}`}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-7 h-7 text-foreground fill-foreground ml-1" />
                      </div>
                    </div>

                    {/* Price badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1.5 rounded-full bg-white/95 text-foreground font-semibold text-sm shadow-sm">
                        {formatPrice(course.price)}
                      </span>
                    </div>

                    {/* Category badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[course.category] || 'bg-gray-100 text-gray-800'}`}>
                        {course.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 
                      className="text-lg font-semibold text-foreground mb-2 line-clamp-1"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(course.duration_minutes)}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Courses;
