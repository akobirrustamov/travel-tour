import React from 'react';
import icon from "../assets/images/miniAture.jpg";
import { useTranslation } from "react-i18next";
import logo from "../assets/images/logo.png"
function About(props) {
    const { t } = useTranslation();

    return (
        <div>

            {/* ===== ABOUT SECTION ===== */}
            <section
                id="about"
                className="py-20 bg-gradient-to-br from-gray-50 to-white text-dark relative"
            >
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src={logo}
                                alt="Hotel Interior"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-3xl">⭐</span>
                        </div>
                    </div>

                    <div className="lg:pl-8">
                        <h2 className="text-5xl md:text-6xl font-bold mb-6">
                            <span className="text-yellow-400">{t("about.title")}</span>
                        </h2>

                        <p className="text-gray-900 leading-relaxed mb-2 text-lg">
                            {t("about.text")}
                        </p>
                        <p className="text-gray-900 leading-relaxed mb-2 text-lg">
                            {t("about.text1")}
                        </p>
                        <p className="text-gray-900 leading-relaxed mb-2 text-lg">
                            {t("about.text2")}
                        </p>

                        {/*<button*/}
                        {/*    onClick={() =>*/}
                        {/*        document*/}
                        {/*            .getElementById("booking")*/}
                        {/*            .scrollIntoView({ behavior: "smooth" })*/}
                        {/*    }*/}
                        {/*    className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"*/}
                        {/*>*/}
                        {/*    {t("about.button")}*/}
                        {/*</button>*/}
                    </div>
                </div>
            </section>

        </div>
    );
}

export default About;