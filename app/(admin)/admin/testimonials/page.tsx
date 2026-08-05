import { prisma } from "@/lib/prisma";
import { TestimonialManager } from "@/components/admin/testimonial-manager";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-xl font-semibold">Testimonials</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage client testimonials shown on the homepage.
      </p>
      <div className="mt-6">
        <TestimonialManager data={testimonials} />
      </div>
    </div>
  );
}
