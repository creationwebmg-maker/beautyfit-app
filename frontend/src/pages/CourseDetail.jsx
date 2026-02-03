import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api, formatPrice, formatDuration, getLevelColor } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Play, 
  Clock, 
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Loader2,
  Lock,
  Star
} from "lucide-react";
import Layout from "@/components/Layout";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId, token]);

  const fetchCourse = async () => {
    try {
      const courseData = await api.get(`/courses/${courseId}`);
      setCourse(courseData);
      
      if (token) {
        const accessData = await api.get(`/courses/${courseId}/access`, token);
        setHasAccess(accessData.has_access);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Cours non trouvé");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (method) => {
    if (!isAuthenticated) {
      toast.error("Connecte-toi pour acheter ce cours");
      navigate("/login");
      return;
    }

    setPurchasing(true);
    try {
      if (method === "stripe") {
        const response = await api.post("/payments/stripe/checkout", {
          course_id: courseId,
          payment_method: "stripe",
          origin_url: window.location.origin
        }, token);
        
        window.location.href = response.checkout_url;
      } else {
        toast.info("PayPal sera bientôt disponible");
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors du paiement");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="course-detail">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/courses")}
          className="hover:bg-secondary"
          data-testid="back-to-courses-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux cours
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
              {course.teaser_url ? (
                <video
                  src={course.teaser_url}
                  poster={course.thumbnail_url}
                  controls={hasAccess}
                  className="w-full h-full object-cover"
                  data-testid="course-video"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              )}
              
              {!hasAccess && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-white text-lg font-medium">Aperçu gratuit</p>
                  <p className="text-white/70 text-sm">Achète le cours pour accéder à la vidéo complète</p>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-accent/30 text-foreground text-sm font-medium">
                  {course.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>

              <h1 
                className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
                data-testid="course-title"
              >
                {course.title}
              </h1>

              <div className="flex items-center gap-6 text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {formatDuration(course.duration_minutes)}
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  4.9
                </span>
              </div>

              <p className="text-lg text-foreground/80 leading-relaxed" data-testid="course-description">
                {course.description}
              </p>
            </div>

            {/* What you'll learn */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 
                  className="text-xl font-semibold text-foreground mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Ce que tu vas apprendre
                </h3>
                <ul className="space-y-3">
                  {[
                    "Techniques de respiration adaptées",
                    "Mouvements progressifs et sécurisés",
                    "Conseils personnalisés d'Amel",
                    "Routine à intégrer au quotidien"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-border/50 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  {hasAccess ? (
                    <>
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 
                          className="text-xl font-semibold text-foreground mb-2"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          Cours débloqué !
                        </h3>
                        <p className="text-muted-foreground">
                          Tu as accès illimité à ce cours
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/watch/${course.id}`)}
                        className="w-full h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 text-lg"
                        data-testid="watch-course-btn"
                      >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Regarder le cours
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-foreground mb-1" data-testid="course-price">
                          {formatPrice(course.price)}
                        </p>
                        <p className="text-muted-foreground">Accès illimité</p>
                      </div>

                      <div className="space-y-3">
                        <Button
                          onClick={() => handlePurchase("stripe")}
                          disabled={purchasing}
                          className="w-full h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 text-lg"
                          data-testid="buy-stripe-btn"
                        >
                          {purchasing ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Chargement...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              Payer par carte
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handlePurchase("paypal")}
                          disabled={purchasing}
                          variant="outline"
                          className="w-full h-14 rounded-full text-lg"
                          data-testid="buy-paypal-btn"
                        >
                          <img 
                            src="https://www.paypalobjects.com/webstatic/icon/pp258.png" 
                            alt="PayPal" 
                            className="w-5 h-5 mr-2"
                          />
                          Payer avec PayPal
                        </Button>
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Accès illimité au cours
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Paiement sécurisé
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Support inclus
                          </li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;
