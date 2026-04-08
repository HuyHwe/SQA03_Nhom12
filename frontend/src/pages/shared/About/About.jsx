// src/pages/shared/About/About.jsx
"use client";

import { useEffect } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

import AboutHero from "./Components/AboutHero";
import Section from "./Components/Section";
import IntroSection from "./Components/IntroSection";
import FeaturesGrid from "./Components/FeaturesGrid";
import MissionSection from "./Components/MissionSection";
import BusinessInfo from "./Components/BusinessInfo";
import ContactInfo from "./Components/ContactInfo";

function About() {
    useEffect(() => window.scrollTo(0, 0), []);

    return (
        <>
            <Header />

            <AboutHero />

            <Section
                id="intro"
                title="Phần mềm luyện thi chất lượng cao"
                subtitle="Thiết kế sát format thi thật, bám chuẩn CEFR (A1–C2) của Cambridge & Oxford."
            >
                <IntroSection />
            </Section>

            <Section id="features" title="Các tính năng chính">
                <FeaturesGrid />
            </Section>

            <Section id="mission" title="Sứ mệnh & giá trị">
                <MissionSection />
            </Section>

            <Section id="business" title="Thông tin doanh nghiệp">
                <BusinessInfo />
                <ContactInfo />
            </Section>

            <Footer />
        </>
    );
}

export default About;
