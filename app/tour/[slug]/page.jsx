'use client';

import { use } from 'react';

import Image from 'next/image';
import { Clock, MapPin, Calendar, TrendingUp, User, Star } from 'lucide-react';

import ReviewCard from '@/components/ReviewCard';
import TourMap from '@/components/TourMap';
import BookTourButton from '@/components/BookTourButton';

import { useGetTourBySlugQuery } from '@/features/tourSlice';


function srcFor(path, folder) {
  if (!path) return null;
  return path.startsWith('http') ? path : `/img/${folder}/${path}`;
}



export default function TourPage({ params }) {

  const { slug } = use(params);
  const { data, isLoading, error } = useGetTourBySlugQuery(slug);
  const tour = data?.data?.tour;
  const fetchError = error ? (error.data?.message || error.error || 'Failed to load tour') : null;
  
  
  if (isLoading) {
    return (
      <main className="bg-grey-100 min-h-[77vh] px-6 py-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="bg-grey-100 min-h-[60vh] px-6 py-20 flex items-center justify-center">
        <p className="text-grey-500 text-center max-w-md">
          Couldn&apos;t load this tour{fetchError ? ` (${fetchError})` : ''}. The tour may not exist or the API may be unavailable.
        </p>
      </main>
    );
  }


  const nextDate = tour.startDates?.[0]
    ? new Date(tour.startDates[0]).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const paragraphs = (tour.description || '').split('\n').filter(Boolean);
  const hasPictures = tour.images && tour.images.length > 0;

  return (
    <main>
      {/* HERO */}
      <section className="relative h-[60vh] md:h-[38vw] clip-hero">
        <div className="relative h-full w-full">
          {tour.imageCover && (
            <Image
              src={srcFor(tour.imageCover, 'tours')}
              alt={tour.name}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_25%]"
            />
          )}
        </div>

        <div className="absolute left-1/2 top-[40%] md:top-[35%] -translate-x-1/2 -translate-y-1/2 w-full px-6 text-center z-20">
          <h1 className="text-white uppercase font-light text-3xl sm:text-4xl md:text-5xl max-w-3xl mx-auto leading-[1.6]">
            <span className="heading-primary-span bg-gradient-primary-soft px-4 py-2">
              {tour.name} Tour
            </span>
          </h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-grey-100">
            <div className="flex items-center gap-2 font-bold uppercase text-sm [text-shadow:0_0.5rem_2rem_rgba(0,0,0,0.15)]">
              <Clock size={20} className="drop-shadow" />
              <span>{tour.duration} days</span>
            </div>
            <div className="flex items-center gap-2 font-bold uppercase text-sm [text-shadow:0_0.5rem_2rem_rgba(0,0,0,0.15)]">
              <MapPin size={20} className="drop-shadow" />
              <span>{tour.startLocation?.description}</span>
            </div>
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="bg-grey-50 pull-up flex flex-col lg:flex-row">
        <div className="flex-[0_0_50%] bg-grey-100 flex justify-center px-6 sm:px-10 lg:px-[8vw] pt-16 lg:pt-[14vw] pb-12 lg:pb-[10vw]">
          <div className="w-full md:flex md:justify-between md:max-w-none md:items-start lg:block lg:max-w-md space-y-12">
            <div className='md:mt-[55px] lg:mt-0'>
              <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-8">
                Quick facts
              </h2>
              <div className="space-y-5 text-sm font-normal">
                <div className="flex items-center gap-5">
                  <Calendar size={26} className="text-primary shrink-0" />
                  <span className="font-bold uppercase text-xs">Next date</span>
                  <span className="capitalize">{nextDate}</span>
                </div>
                <div className="flex items-center gap-5">
                  <TrendingUp size={26} className="text-primary shrink-0" />
                  <span className="font-bold uppercase text-xs">Difficulty</span>
                  <span className="capitalize">{tour.difficulty}</span>
                </div>
                <div className="flex items-center gap-5">
                  <User size={26} className="text-primary shrink-0" />
                  <span className="font-bold uppercase text-xs">Participants</span>
                  <span className="capitalize">{tour.maxGroupSize} people</span>
                </div>
                <div className="flex items-center gap-5">
                  <Star size={26} className="text-primary shrink-0" />
                  <span className="font-bold uppercase text-xs">Rating</span>
                  <span className="capitalize">{tour.ratingsAverage} / 5</span>
                </div>
              </div>
            </div>

            {tour.guides?.length > 0 && (
              <div>
                <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-8">
                  Your tour guides
                </h2>
                <div className="space-y-5">
                  {tour.guides.map((guide) => (
                    <div key={guide._id || guide.name} className="flex items-center gap-5">
                      <Image
                        src={srcFor(guide.photo, 'users')}
                        alt={guide.role}
                        width={56}
                        height={56}
                        className="rounded-full object-cover h-14 w-14"
                      />
                      <span className="font-bold uppercase text-xs">
                        {guide.role === 'lead-guide' ? 'Lead guide' : 'Tour guide'}
                      </span>
                      <span className="capitalize">{guide.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-[0_0_50%] px-6 sm:px-10 lg:px-[8vw] pt-16 lg:pt-[14vw] pb-12 lg:pb-[10vw]">
          <div className="max-w-xl lg:mr-10">
            <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-8">
              About {tour.name} Tour
            </h2>
            <div className="space-y-4 text-base">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PICTURES */}
      {hasPictures && (
        <section className="flex pull-up relative z-1000 clip-angled">
          {tour.images.map((image, index) => (
            <div key={index} className="flex-1 h-[55vw] md:h-[40vw] lg:h-[31vw]">
              <Image
                src={srcFor(image, 'tours')}
                alt={`${tour.name} ${index + 1}`}
                width={1000}
                height={1000}
                className={`block w-full h-[110%] object-cover ${
                  index === 0
                    ? 'pt-[15%]'
                    : index === 1
                    ? 'pb-[15%]'
                    : 'pb-[27%]'
                }`}
              />
            </div>
          ))}
        </section>
      )}

      {/* MAP */}
      <section className="relative h-100 md:h-120 lg:h-160 pull-up">
        <TourMap locations={tour.locations || []} />
      </section>

      {/* REVIEWS */}
      <section className="pull-up pt-20 md:pt-[14vw] pb-48 relative z-1000 bg-gradient-primary clip-angled">
        <div className="reviews-scroll flex gap-12 overflow-x-auto px-12 py-8">
          {(tour.reviews || []).map((review) => (
            <ReviewCard key={review._id || review.review} review={review} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pull-up bg-grey-100 px-6 sm:px-12 pt-32 md:pt-[24vw] lg:pt-60 pb-20">
        <div className="relative max-w-[105rem] mx-auto bg-white rounded-3xl shadow-cta overflow-hidden px-6 sm:pl-72 py-16 md:py-24">
          <div className="hidden sm:block absolute left-0 top-1/2 h-60 w-60 rounded-full bg-gradient-primary shadow-lg translate-x-[-10%] -translate-y-1/2 z-9 scale-[0.97]">
            {tour.images?.[1] && (
              <Image
                src={srcFor(tour.images[1], 'tours')}
                alt={tour.name}
                fill
                className="rounded-full object-cover"
              />
            )}
          </div>
          <div className="hidden sm:block absolute left-0 top-1/2 h-60 w-60 rounded-full bg-gradient-primary shadow-lg translate-x-[15%] -translate-y-1/2 z-8 scale-[0.94]">
            {tour.images?.[2] && (
              <Image
                src={srcFor(tour.images[2], 'tours')}
                alt={tour.name}
                fill
                className="rounded-full object-cover"
              />
            )}
          </div>
          <div className="hidden sm:flex absolute left-0 top-1/2 h-60 w-60 rounded-full bg-gradient-primary shadow-lg translate-x-[-35%] -translate-y-1/2 z-10 items-center justify-center p-8">
            <Image 
              src="/img/logo-white.png"
              width={130}
              height={76}
              alt="Logo"
            />
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-y-4 sm:gap-y-2 items-center text-center sm:text-left">
            <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide sm:col-span-2">
              What are you waiting for?
            </h2>
            <p className="text-lg text-grey-600 pr-3">
              {tour.duration} days. 1 adventure. Infinite memories. Make it yours today!
            </p>
            <div className="sm:row-span-2 sm:self-center justify-self-center sm:justify-self-end">
              <BookTourButton tourId={tour._id || tour.id} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
