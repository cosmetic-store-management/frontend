import { z } from "zod";

export const replyReviewSchema = z.object({
  replyText: z.string().min(5, "Phản hồi phải có ít nhất 5 ký tự"),
});

export type ReplyReviewFormData = z.infer<typeof replyReviewSchema>;
