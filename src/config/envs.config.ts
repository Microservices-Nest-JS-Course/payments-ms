import 'dotenv/config';
import * as joi from 'joi';

interface EnvsVars {
  PORT: number;
  STRIPE_SECRET: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().default(3000),
    STRIPE_SECRET: joi.string().required(),
  })
  .unknown(true);

const validationResult = envsSchema.validate(process.env);

if (validationResult.error)
  throw new Error(`Config validation error: ${validationResult.error.message}`);

const envVars: EnvsVars = validationResult.value as EnvsVars;

export const envs = {
  port: envVars.PORT,
  stripeSecret: envVars.STRIPE_SECRET,
};
