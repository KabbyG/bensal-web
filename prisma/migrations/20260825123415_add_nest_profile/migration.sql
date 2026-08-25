-- CreateTable
CREATE TABLE "NestProfile" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "pdfName" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NestProfile_pkey" PRIMARY KEY ("id")
);
