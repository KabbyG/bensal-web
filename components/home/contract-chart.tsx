"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { Company } from "@/lib/generated/prisma/client";
import { Container, Section } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/fade-in";

type Point = {
  year: number;
  cleaning: number | null;
  fumigation: number | null;
  ictEquipment: number | null;
  buildingMaterials: number | null;
  cleaningProducts: number | null;
};

export function ContractChart({ company }: { company: Company }) {
  const data = company.contractHistory as unknown as Point[];

  return (
    <Section>
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            Track record
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-balance sm:text-4xl">
            Active contracts, {data[0]?.year}–{data[data.length - 1]?.year}
          </h2>
          <p className="mt-3 text-muted-foreground">
            Annual contract volume across our core service and supply lines.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-12 h-80 w-full rounded-2xl border border-border bg-card p-6 sm:p-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  fontSize: "0.8rem",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
              <Line
                type="monotone"
                dataKey="cleaning"
                name="Cleaning & Gardening"
                stroke="var(--chart-cleaning)"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="fumigation"
                name="Fumigation & Pest Control"
                stroke="var(--chart-fumigation)"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="ictEquipment"
                name="Supply of ICT Equipment"
                stroke="var(--chart-ict)"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="buildingMaterials"
                name="Supply of Building Materials"
                stroke="var(--chart-building-materials)"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="cleaningProducts"
                name="Supply of Cleaning Products"
                stroke="var(--chart-cleaning-products)"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </FadeIn>
      </Container>
    </Section>
  );
}
