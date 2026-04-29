import Stripe from 'stripe';

let stripeClient: Stripe | undefined;

export const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required to use Stripe.");
  }

  stripeClient ??= new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });

  return stripeClient;
};

export const stripe = new Proxy({} as Stripe, {
  get(_target, property, receiver) {
    return Reflect.get(getStripe(), property, receiver);
  },
});
