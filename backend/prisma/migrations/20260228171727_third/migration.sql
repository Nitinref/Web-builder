-- CreateIndex
CREATE INDEX "Chat_projectId_idx" ON "Chat"("projectId");

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- CreateIndex
CREATE INDEX "Chat_projectId_userId_idx" ON "Chat"("projectId", "userId");

-- CreateIndex
CREATE INDEX "Chat_createdAt_idx" ON "Chat"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Message_chatId_role_idx" ON "Message"("chatId", "role");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_userId_status_idx" ON "Project"("userId", "status");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProjectFile_projectId_idx" ON "ProjectFile"("projectId");

-- CreateIndex
CREATE INDEX "ProjectFile_updatedAt_idx" ON "ProjectFile"("updatedAt" DESC);
