"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Company } from "@/lib/generated/prisma/client";

export function Hero({ company }: { company: Company }) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-brand-gradient text-white">
      <div className="pointer-events-none absolute inset-0 bg-mesh" />

      <motion.div
        className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -left-16 bottom-1/4 h-64 w-64 rounded-full bg-brand-forest-light/40 blur-3xl"
        animate={{ y: [0, 24, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-5 pt-32 pb-20 sm:px-8 lg:grid-cols-2 lg:px-10 lg:pt-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent backdrop-blur"
          >
            Est. {company.foundedYear} · {company.country}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl font-extrabold leading-[1.08] text-balance sm:text-5xl lg:text-[3.4rem]"
          >
            Cleaning, Fumigation &amp; Supply —{" "}
            <span className="text-accent">done right</span>, across Tanzania.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          >
            {company.slogan}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Button asChild variant="accent" size="lg">
              <Link href="/contact">
                Get a Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link href="/services">Explore Services</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 flex items-center gap-8 text-white/70"
          >
            <div>
              <div className="font-display text-2xl font-bold text-white">{company.staffCount}</div>
              <div className="text-xs uppercase tracking-wider">Staff</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="font-display text-2xl font-bold text-white">{company.branches.length}</div>
              <div className="text-xs uppercase tracking-wider">Branches</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="font-display text-2xl font-bold text-white">
                {new Date().getFullYear() - company.foundedYear}+
              </div>
              <div className="text-xs uppercase tracking-wider">Years</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative hidden justify-self-end lg:block"
        >
          <div className="animate-float">
            <Image
              src="/brand/hero-runner.png"
              alt="Bensal Investment team member delivering a package"
              width={1000}
              height={1160}
              className="h-[26rem] w-auto drop-shadow-2xl"
              priority
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute inset-x-0 bottom-8 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
