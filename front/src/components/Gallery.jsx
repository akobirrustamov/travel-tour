import React from 'react';
import bg from "../assets/images/bgNew.png";
import icon from "../assets/images/miniAture.jpg";
import {useTranslation} from "react-i18next";

function Gallery(props) {
    const { t, i18n } = useTranslation();

    return (

        <div>
            <section
                id="booking"
                className="relative py-20 bg-gradient-to-br from-gray-50 to-white"
            >
                <div className="max-w-6xl mx-auto px-6">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            {t("home.booking.title")}
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            {t("home.booking.subtitle")}
                        </p>
                    </div>




                </div>
            </section>
        </div>
    );
}

export default Gallery;