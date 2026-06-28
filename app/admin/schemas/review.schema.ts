import { z } from "zod";

export const replyReviewSchema = z.object({
  replyText: z.string().optional(),
});

export type ReplyReviewFormData = z.infer<typeof replyReviewSchema>;
