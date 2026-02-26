import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Image, Trophy, Shield, Users, Clock, Heart } from "lucide-react";

function WhyUs() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const features = [
    {
      icon: <Star className="w-6 h-6" />,
      title: t("home.features.list.1.title"),
      description: t("home.features.list.1.desc"),
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      delay: 0,
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: t("home.features.list.2.title"),
      description: t("home.features.list.2.desc"),
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      delay: 100,
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: t("home.features.list.3.title"),
      description: t("home.features.list.3.desc"),
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      delay: 200,
    },
  ];

  const benefits = [
    { icon: <Shield className="w-4 h-4" />, text: "100% Safe" },
    { icon: <Users className="w-4 h-4" />, text: "Expert Guides" },
    { icon: <Clock className="w-4 h-4" />, text: "24/7 Support" },
    { icon: <Heart className="w-4 h-4" />, text: "Best Service" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          className="text-center mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease-out",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t("home.features.title")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("home.features.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.6s ease-out ${index * 0.1}s`,
              }}
            >
              <div
                className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}
              >
                <div className={feature.color}>{feature.icon}</div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyUs;
