import { z } from "zod";

export const validateTokenSchema = z.object({
  token: z.string().min(6).max(40),
});

export const submitBallotSchema = z.object({
  selections: z
    .array(
      z.object({
        positionId: z.string().min(1),
        candidateId: z.string().min(1),
      })
    )
    .min(1),
});
