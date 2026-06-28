import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Lê Hà",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    role: "Khách hàng thân thiết",
    content:
      "Từ ngày chuyển sang dùng serum ở GlowUp, da mình cải thiện rõ rệt. Đóng gói rất cẩn thận, giao hàng nhanh và đặc biệt là check mã QR chính hãng 100%.",
    rating: 5,
  },
  {
    id: 2,
    name: "Trần Minh Tuyết",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    role: "Beauty Blogger",
    content:
      "Là một người làm nghề review, mình rất khắt khe trong việc chọn nguồn mua mỹ phẩm. GlowUp chưa bao giờ làm mình thất vọng về chất lượng dịch vụ.",
    rating: 5,
  },
  {
    id: 3,
    name: "Hoàng Thanh Mai",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    role: "Khách hàng mới",
    content:
      "Lần đầu mua hàng online mà ưng ý đến vậy. Nhân viên tư vấn siêu nhiệt tình, giúp mình chọn đúng loại kem dưỡng phù hợp với da nhạy cảm.",
    rating: 5,
  },
];

export function TestimonialCarousel() {
  return (
    <section className="bg-surface-muted py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-4">
            Khách hàng nói gì về <span className="text-brand">GlowUp</span>
          </h2>
          <p className="text-ink-muted">
            Hơn 10,000+ khách hàng đã trải nghiệm và hài lòng với chất lượng sản
            phẩm & dịch vụ của chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-surface p-8 rounded-sm shadow-ui-soft border border-border relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-brand/10" />

              <div className="flex gap-1 mb-6">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warning fill-warning" />
                ))}
              </div>

              <p className="text-ink leading-relaxed mb-8 italic relative z-10 text-sm sm:text-base">
                "{item.content}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-surface-soft"
                />
                <div>
                  <h4 className="font-bold text-ink text-sm">{item.name}</h4>
                  <span className="text-xs text-ink-muted">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
