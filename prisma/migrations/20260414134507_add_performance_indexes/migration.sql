-- CreateIndex
CREATE INDEX "Attendance_teacherId_date_idx" ON "Attendance"("teacherId", "date");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");

-- CreateIndex
CREATE INDEX "Feedback_teacherId_createdAt_idx" ON "Feedback"("teacherId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Feedback_parentId_createdAt_idx" ON "Feedback"("parentId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Meal_date_idx" ON "Meal"("date");

-- CreateIndex
CREATE INDEX "Meal_status_date_idx" ON "Meal"("status", "date" DESC);

-- CreateIndex
CREATE INDEX "MealLog_mealId_studentId_idx" ON "MealLog"("mealId", "studentId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");

-- CreateIndex
CREATE INDEX "Report_adminId_createdAt_idx" ON "Report"("adminId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Report_adminId_type_idx" ON "Report"("adminId", "type");

-- CreateIndex
CREATE INDEX "Review_studentId_status_idx" ON "Review"("studentId", "status");

-- CreateIndex
CREATE INDEX "Review_teacherId_createdAt_idx" ON "Review"("teacherId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Student_status_createdAt_idx" ON "Student"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Student_groupId_idx" ON "Student"("groupId");

-- CreateIndex
CREATE INDEX "Student_parentId_idx" ON "Student"("parentId");

-- CreateIndex
CREATE INDEX "Teacher_isArchived_idx" ON "Teacher"("isArchived");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "WeeklyPlan_teacherId_weekStart_idx" ON "WeeklyPlan"("teacherId", "weekStart" DESC);
