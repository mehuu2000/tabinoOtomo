-- CreateTable
CREATE TABLE "ApiCount" (
    "id" SERIAL NOT NULL,
    "weather" INTEGER NOT NULL DEFAULT 0,
    "googleMap" INTEGER NOT NULL DEFAULT 0,
    "twitter" INTEGER NOT NULL DEFAULT 0,
    "gemini" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ApiCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT,
    "main" TEXT,
    "telenum" TEXT,
    "state" TEXT NOT NULL,
    "iCon" TEXT,
    "introdaction" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "fromWhen" INTEGER NOT NULL,
    "toTrabelId" INTEGER[],
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToTrabel" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "placeName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "memo" TEXT,
    "address" TEXT NOT NULL,

    CONSTRAINT "ToTrabel_pkey" PRIMARY KEY ("id")
);
