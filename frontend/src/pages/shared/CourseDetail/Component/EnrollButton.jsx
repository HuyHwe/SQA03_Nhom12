import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postEnrollCourse } from "../../../../api/enrollments.api";
import { isLoggedIn } from "../../../../utils/auth";
import { Primary } from "../../../../components/Buttons";
import PaymentModal from "../../../../components/PaymentModal";
import { http } from "../../../../utils/http";
import toast from "react-hot-toast";

const EnrollButton = ({courseId, isEnrolledState, coursePrice}) => {
    const navigate = useNavigate();
    const [showPayment, setShowPayment] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleEnroll = async () => {
        if(!isLoggedIn()){
            return navigate('/login');
        }

        // Nếu khóa học miễn phí, enroll trực tiếp
        if (!coursePrice || coursePrice === 0) {
            try {
                setLoading(true);
                await postEnrollCourse(courseId);
                toast.success("Ghi danh thành công!");
                window.location.reload();
            } catch (err) {
                toast.error(err.message || "Có lỗi xảy ra");
            } finally {
                setLoading(false);
            }
            return;
        }

        // Khóa học có phí, tạo order và hiển thị modal thanh toán
        try {
            setLoading(true);
            console.log('Creating order for course:', courseId, 'price:', coursePrice);
            
            const res = await http('/api/Orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderDetails: [{
                        courseId: courseId,
                        price: coursePrice
                    }]
                })
            });

            console.log('Order response status:', res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Order creation error:', errorText);
                throw new Error('Không thể tạo đơn hàng');
            }
            
            const data = await res.json();
            console.log('Order created:', data);
            
            if (!data.orderId) {
                throw new Error('OrderId not found in response');
            }
            
            setOrderId(data.orderId);
            setShowPayment(true);
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
        } finally {
            setLoading(false);
        }
    }

    const handlePaymentSuccess = () => {
        setShowPayment(false);
        toast.success('Thanh toán thành công! Bạn đã được ghi danh vào khóa học.');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    if (isEnrolledState === null) return null;
    if (isEnrolledState) return null;

    return (
        <>
            <Primary 
                className="w-full mt-4" 
                onClick={handleEnroll}
                disabled={loading}
            >
                {loading ? 'Đang xử lý...' : (coursePrice > 0 ? 'Mua khóa học' : 'Ghi danh ngay')}
            </Primary>

            {showPayment && orderId && (
                <PaymentModal
                    orderId={orderId}
                    onClose={() => setShowPayment(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </>
    );
}

export default EnrollButton;
