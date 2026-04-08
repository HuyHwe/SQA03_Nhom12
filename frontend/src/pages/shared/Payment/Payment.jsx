// src/pages/shared/Payment/Payment.jsx
"use client";

import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { CART, OFFERS } from "./data/mockData";

import Section from "./Components/Section";
import CheckoutForm from "./Components/CheckoutForm";
import PriceSummary from "./Components/PriceSummary";
import OffersGrid from "./Components/OffersGrid";

function Payment() {
    return (
        <>
            <Header />

            <Section
                id="hero"
                title="Thanh toán"
                subtitle="Hoàn tất đơn hàng của bạn bằng một trong các phương thức bên dưới."
                action={<Link to="/courses" className="text-[#2563eb]">Tiếp tục xem khoá học</Link>}
            />

            <section className="w-screen overflow-x-hidden">
                <div className="w-screen px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <CheckoutForm onSubmit={() => alert("Demo: Thanh toán đã xác nhận!")} />
                    </div>
                    <div className="lg:col-span-1">
                        <PriceSummary items={CART} initialCoupon="" vatPct={10} />
                    </div>
                </div>
            </section>

            <Section
                id="offers"
                title="Ưu đãi hiện có"
                action={<Link to="#" className="text-[#2563eb]">Xem tất cả</Link>}
            >
                <OffersGrid offers={OFFERS} />
            </Section>

            <Footer />
        </>
    );
}

export default Payment;
