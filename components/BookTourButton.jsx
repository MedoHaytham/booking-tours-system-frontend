'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { useGetMeQuery } from '@/features/userSlice';
import { useLazyGetCheckoutSessionQuery } from '@/features/bookingSlice';

// Singleton Stripe instance — only created once, on demand
let stripePromise;
function getStripe() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
  if (!key) return null;
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}

export default function BookTourButton({ tourId }) {
  const { data: meData, isLoading: authLoading } = useGetMeQuery();
  const user = meData?.data?.data ?? null;

  const [triggerCheckout] = useLazyGetCheckoutSessionQuery();
  const [loading, setLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // While checking auth, show a neutral disabled button
  if (authLoading) {
    return (
      <button
        disabled
        className="bg-primary text-white uppercase text-base rounded-full px-10 py-4 opacity-60 cursor-not-allowed"
      >
        Book tour now!
      </button>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-block bg-primary text-white uppercase text-base rounded-full px-10 py-4 transition-transform hover:-translate-y-0.5"
      >
        Log in to book tour
      </Link>
    );
  }

  const handleBooking = async () => {
    setLoading(true);
    setBookingError(null);
    try {
      const result = await triggerCheckout(tourId);

      if (result.error) {
        throw new Error(result.error.data?.message || result.error.error || 'Could not create booking session.');
      }

      // Backend returns { status, session: { url, id, ... } }
      const session = result.data?.session ?? result.data;

      if (session?.url) {
        // Preferred: direct redirect to Stripe-hosted checkout page
        window.location.href = session.url;
        return;
      }

      // Fallback: use Stripe.js redirectToCheckout (older sessions)
      const stripe = await getStripe();
      if (stripe && session?.id) {
        const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
        if (error) throw new Error(error.message);
      } else {
        throw new Error('Stripe checkout session is missing a redirect URL.');
      }
    } catch (err) {
      setBookingError(err.message || 'Booking failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-end gap-2">
      <button
        type="button"
        onClick={handleBooking}
        disabled={loading}
        className="bg-primary text-white uppercase text-base rounded-full px-10 py-4 transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing…' : 'Book tour now!'}
      </button>
      {bookingError && (
        <p className="text-sm text-red-500 max-w-xs text-center sm:text-right">
          {bookingError}
        </p>
      )}
    </div>
  );
}
