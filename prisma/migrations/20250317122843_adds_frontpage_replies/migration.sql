-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FrontPageMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replyToId" TEXT,
    CONSTRAINT "FrontPageMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "FrontPageMessage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FrontPageMessage" ("createdAt", "id", "message") SELECT "createdAt", "id", "message" FROM "FrontPageMessage";
DROP TABLE "FrontPageMessage";
ALTER TABLE "new_FrontPageMessage" RENAME TO "FrontPageMessage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
